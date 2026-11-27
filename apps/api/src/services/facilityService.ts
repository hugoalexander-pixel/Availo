import prisma from '../utils/prisma';
import { FacilityType, ReservationStatus } from '@prisma/client';
import { calculateFacilityStatus, FacilityStatus } from '../utils/statusCalculator';
import { buildReferenceDate, formatLocalDate } from '../utils/dateHelper';
import { parsePaginationParams, buildPaginationMeta, PaginationMeta } from '../utils/pagination';

export class CapacityConflictError extends Error {
  public readonly maxPartySize: number;
  public readonly newCapacity: number;

  constructor(maxPartySize: number, newCapacity: number) {
    super('CAPACITY_CONFLICT');
    this.name = 'CapacityConflictError';
    this.maxPartySize = maxPartySize;
    this.newCapacity = newCapacity;
  }
}

export interface FacilityListFilters {
  buildingId?: number;
  type?: FacilityType;
  minCapacity?: number;
  search?: string;
  date?: string;
  time?: string;
  page?: unknown;
  limit?: unknown;
}

export class FacilityService {
  private buildListWhere(filters: FacilityListFilters) {
    const where: any = {};

    if (filters.buildingId) where.BuildingId = filters.buildingId;
    if (filters.type) where.Type = filters.type;
    if (filters.minCapacity) where.Capacity = { gte: filters.minCapacity };
    if (filters.search) where.Name = { contains: filters.search, mode: 'insensitive' };

    return where;
  }

  private formatFacilityListItem(f: any, referenceDate: Date) {
    const status = calculateFacilityStatus(f.Reservations, referenceDate);
    return {
      Id: f.Id,
      Name: f.Name,
      Type: f.Type,
      Capacity: f.Capacity,
      Floor: f.Floor,
      Description: f.Description,
      ImageUrl: f.ImageUrl,
      Building: { Id: f.Building.Id, Name: f.Building.Name, Code: f.Building.Code },
      Amenities: f.Amenities.map((fa: any) => ({
        Id: fa.Amenity.Id,
        Name: fa.Amenity.Name,
        Icon: fa.Amenity.Icon,
      })),
      Status: status,
    };
  }

  async list(filters: FacilityListFilters) {
    const where = this.buildListWhere(filters);
    const now = new Date();
    const referenceDate = buildReferenceDate(filters.date, filters.time, now);

    const facilities = await prisma.facility.findMany({
      where,
      include: {
        Building: true,
        Amenities: { include: { Amenity: true } },
        Reservations: {
          where: {
            Status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
            Date: filters.date ? new Date(filters.date) : undefined,
          },
        },
      },
      orderBy: { Name: 'asc' },
    });

    return facilities.map((f) => this.formatFacilityListItem(f, referenceDate));
  }

  async listPaginated(filters: FacilityListFilters): Promise<{ items: any[]; pagination: PaginationMeta | null }> {
    const pagination = parsePaginationParams(filters.page, filters.limit);
    if (!pagination) {
      const items = await this.list(filters);
      return { items, pagination: null };
    }

    const where = this.buildListWhere(filters);
    const now = new Date();
    const referenceDate = buildReferenceDate(filters.date, filters.time, now);

    const [facilities, total] = await Promise.all([
      prisma.facility.findMany({
        where,
        include: {
          Building: true,
          Amenities: { include: { Amenity: true } },
          Reservations: {
            where: {
              Status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
              Date: filters.date ? new Date(filters.date) : undefined,
            },
          },
        },
        orderBy: { Name: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.facility.count({ where }),
    ]);

    return {
      items: facilities.map((f) => this.formatFacilityListItem(f, referenceDate)),
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async getById(id: number) {
    const facility = await prisma.facility.findUnique({
      where: { Id: id },
      include: {
        Building: true,
        Amenities: { include: { Amenity: true } },
        Reservations: {
          where: {
            Status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
          },
          include: { User: { select: { Id: true, Name: true } } },
          orderBy: { StartTime: 'asc' },
        },
      },
    });

    if (!facility) throw new Error('FACILITY_NOT_FOUND');

    const status = calculateFacilityStatus(facility.Reservations);

    return {
      Id: facility.Id,
      Name: facility.Name,
      Type: facility.Type,
      Capacity: facility.Capacity,
      Floor: facility.Floor,
      Description: facility.Description,
      ImageUrl: facility.ImageUrl,
      Building: { Id: facility.Building.Id, Name: facility.Building.Name, Code: facility.Building.Code },
      Amenities: facility.Amenities.map((fa) => ({
        Id: fa.Amenity.Id,
        Name: fa.Amenity.Name,
        Icon: fa.Amenity.Icon,
      })),
      Status: status,
      Reservations: facility.Reservations.map((r) => ({
        Id: r.Id,
        Date: r.Date,
        StartTime: r.StartTime,
        EndTime: r.EndTime,
        Status: r.Status,
        PartySize: r.PartySize,
        User: r.User,
      })),
    };
  }

  async create(data: {
    BuildingId: number;
    Name: string;
    Type: FacilityType;
    Capacity: number;
    Floor: number;
    Description?: string;
    ImageUrl?: string;
    AmenityIds?: number[];
  }) {
    const facility = await prisma.facility.create({
      data: {
        BuildingId: data.BuildingId,
        Name: data.Name,
        Type: data.Type,
        Capacity: data.Capacity,
        Floor: data.Floor,
        Description: data.Description,
        ImageUrl: data.ImageUrl,
      },
    });

    if (data.AmenityIds && data.AmenityIds.length > 0) {
      await prisma.facilityAmenity.createMany({
        data: data.AmenityIds.map((amenityId) => ({
          FacilityId: facility.Id,
          AmenityId: amenityId,
        })),
      });
    }

    return this.getById(facility.Id);
  }

  async update(id: number, data: {
    Name?: string;
    Type?: FacilityType;
    Capacity?: number;
    Floor?: number;
    Description?: string;
    ImageUrl?: string;
  }) {
    if (data.Capacity !== undefined) {
      if (typeof data.Capacity !== 'number' || !Number.isInteger(data.Capacity) || data.Capacity < 1) {
        throw new Error('INVALID_CAPACITY');
      }

      const existing = await prisma.facility.findUnique({ where: { Id: id } });
      if (!existing) {
        throw new Error('FACILITY_NOT_FOUND');
      }

      const todayStart = new Date(formatLocalDate(new Date()));
      const activeReservations = await prisma.reservation.findMany({
        where: {
          FacilityId: id,
          Status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
          Date: { gte: todayStart },
        },
        select: { Id: true, PartySize: true },
      });

      const maxPartySize = activeReservations.reduce(
        (max, r) => (r.PartySize > max ? r.PartySize : max),
        0
      );

      if (maxPartySize > data.Capacity) {
        throw new CapacityConflictError(maxPartySize, data.Capacity);
      }
    }

    await prisma.facility.update({ where: { Id: id }, data });
    return this.getById(id);
  }

  async delete(id: number) {
    await prisma.facility.delete({ where: { Id: id } });
  }
}
