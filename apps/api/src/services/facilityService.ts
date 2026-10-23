import prisma from '../utils/prisma';
import { FacilityType, ReservationStatus } from '@prisma/client';
import { calculateFacilityStatus, FacilityStatus } from '../utils/statusCalculator';

export class FacilityService {
  async list(filters: {
    buildingId?: number;
    type?: FacilityType;
    minCapacity?: number;
    search?: string;
    date?: string;
    time?: string;
  }) {
    const where: any = {};

    if (filters.buildingId) where.BuildingId = filters.buildingId;
    if (filters.type) where.Type = filters.type;
    if (filters.minCapacity) where.Capacity = { gte: filters.minCapacity };
    if (filters.search) where.Name = { contains: filters.search, mode: 'insensitive' };

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

    const now = new Date();
    const result = facilities.map((f) => {
      const status = calculateFacilityStatus(f.Reservations, now);
      return {
        Id: f.Id,
        Name: f.Name,
        Type: f.Type,
        Capacity: f.Capacity,
        Floor: f.Floor,
        Description: f.Description,
        ImageUrl: f.ImageUrl,
        Building: { Id: f.Building.Id, Name: f.Building.Name, Code: f.Building.Code },
        Amenities: f.Amenities.map((fa) => ({
          Id: fa.Amenity.Id,
          Name: fa.Amenity.Name,
          Icon: fa.Amenity.Icon,
        })),
        Status: status,
      };
    });

    return result;
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
    await prisma.facility.update({ where: { Id: id }, data });
    return this.getById(id);
  }

  async delete(id: number) {
    await prisma.facility.delete({ where: { Id: id } });
  }
}
