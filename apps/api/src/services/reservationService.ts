import prisma from '../utils/prisma';
import { ReservationStatus, NotificationType } from '@prisma/client';
import { isDateInPast } from '../utils/dateHelper';
import { parsePaginationParams, buildPaginationMeta, PaginationMeta } from '../utils/pagination';

export class ReservationService {
  async create(data: {
    UserId: number;
    FacilityId: number;
    Date: string;
    StartTime: string;
    EndTime: string;
    PartySize: number;
    Purpose?: string;
  }) {
    const facility = await prisma.facility.findUnique({ where: { Id: data.FacilityId } });
    if (!facility) throw new Error('FACILITY_NOT_FOUND');

    if (data.PartySize > facility.Capacity) {
      throw new Error('CAPACITY_EXCEEDED');
    }

    const date = new Date(data.Date);
    const startTime = new Date(`${data.Date}T${data.StartTime}`);
    const endTime = new Date(`${data.Date}T${data.EndTime}`);

    if (startTime >= endTime) {
      throw new Error('INVALID_TIME_RANGE');
    }

    if (isDateInPast(data.Date)) {
      throw new Error('DATE_IN_PAST');
    }

    const overlapping = await prisma.reservation.findFirst({
      where: {
        FacilityId: data.FacilityId,
        Date: date,
        Status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
        AND: [
          { StartTime: { lt: endTime } },
          { EndTime: { gt: startTime } },
        ],
      },
    });

    if (overlapping) {
      throw new Error('RESERVATION_CONFLICT');
    }

    const reservation = await prisma.reservation.create({
      data: {
        UserId: data.UserId,
        FacilityId: data.FacilityId,
        Date: date,
        StartTime: startTime,
        EndTime: endTime,
        PartySize: data.PartySize,
        Purpose: data.Purpose,
        Status: ReservationStatus.UPCOMING,
      },
      include: {
        Facility: { include: { Building: true } },
        User: { select: { Id: true, Name: true } },
      },
    });

    return this.formatReservation(reservation);
  }

  private buildMyReservationsWhere(userId: number, status?: string) {
    const where: any = { UserId: userId };

    if (status === 'active') {
      where.Status = { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] };
    } else if (status === 'history') {
      where.Status = { in: [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED, ReservationStatus.EARLY_ENDED] };
    }

    return where;
  }

  async getMyReservations(userId: number, status?: string) {
    const where = this.buildMyReservationsWhere(userId, status);

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        Facility: { include: { Building: true } },
        User: { select: { Id: true, Name: true } },
      },
      orderBy: { StartTime: 'desc' },
    });

    return reservations.map((r) => this.formatReservation(r));
  }

  async getMyReservationsPaginated(
    userId: number,
    status?: string,
    page?: unknown,
    limit?: unknown
  ): Promise<{ items: any[]; pagination: PaginationMeta | null }> {
    const pagination = parsePaginationParams(page, limit);
    if (!pagination) {
      const items = await this.getMyReservations(userId, status);
      return { items, pagination: null };
    }

    const where = this.buildMyReservationsWhere(userId, status);
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          Facility: { include: { Building: true } },
          User: { select: { Id: true, Name: true } },
        },
        orderBy: { StartTime: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.reservation.count({ where }),
    ]);

    return {
      items: reservations.map((r) => this.formatReservation(r)),
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async getById(id: number) {
    const reservation = await prisma.reservation.findUnique({
      where: { Id: id },
      include: {
        Facility: { include: { Building: true } },
        User: { select: { Id: true, Name: true } },
      },
    });

    if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
    return this.formatReservation(reservation);
  }

  async cancel(id: number, userId: number) {
    const reservation = await prisma.reservation.findUnique({ where: { Id: id } });
    if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
    if (reservation.UserId !== userId) throw new Error('NOT_OWNER');
    if (reservation.Status !== ReservationStatus.UPCOMING) throw new Error('CANNOT_CANCEL');

    const updated = await prisma.reservation.update({
      where: { Id: id },
      data: { Status: ReservationStatus.CANCELLED },
      include: {
        Facility: { include: { Building: true } },
        User: { select: { Id: true, Name: true } },
      },
    });

    return this.formatReservation(updated);
  }

  async update(id: number, userId: number, data: { PartySize?: number; Purpose?: string }) {
    const reservation = await prisma.reservation.findUnique({
      where: { Id: id },
      include: { Facility: true },
    });
    if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
    if (reservation.UserId !== userId) throw new Error('NOT_OWNER');
    if (reservation.Status !== ReservationStatus.UPCOMING) throw new Error('CANNOT_EDIT');

    if (data.PartySize !== undefined) {
      if (typeof data.PartySize !== 'number' || data.PartySize < 1) {
        throw new Error('INVALID_PARTY_SIZE');
      }
      if (data.PartySize > reservation.Facility.Capacity) {
        throw new Error('CAPACITY_EXCEEDED');
      }
    }

    const updated = await prisma.reservation.update({
      where: { Id: id },
      data: {
        ...(data.PartySize !== undefined ? { PartySize: data.PartySize } : {}),
        ...(data.Purpose !== undefined ? { Purpose: data.Purpose } : {}),
      },
      include: {
        Facility: { include: { Building: true } },
        User: { select: { Id: true, Name: true } },
      },
    });

    return this.formatReservation(updated);
  }

  async earlyEnd(id: number, userId: number) {
    const reservation = await prisma.reservation.findUnique({
      where: { Id: id },
      include: { Facility: true },
    });
    if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
    if (reservation.UserId !== userId) throw new Error('NOT_OWNER');
    if (reservation.Status !== ReservationStatus.ACTIVE && reservation.Status !== ReservationStatus.UPCOMING) {
      throw new Error('CANNOT_EARLY_END');
    }

    const now = new Date();
    const updated = await prisma.reservation.update({
      where: { Id: id },
      data: {
        Status: ReservationStatus.EARLY_ENDED,
        ActualEndTime: now,
      },
      include: {
        Facility: { include: { Building: true } },
        User: { select: { Id: true, Name: true } },
      },
    });

    const watchers = await prisma.facilityWatch.findMany({
      where: { FacilityId: reservation.FacilityId, UserId: { not: userId } },
    });

    for (const watcher of watchers) {
      await prisma.notification.create({
        data: {
          UserId: watcher.UserId,
          FacilityId: reservation.FacilityId,
          Message: `🔔 ${reservation.Facility.Name} sekarang tersedia!`,
          Type: NotificationType.FACILITY_AVAILABLE,
        },
      });
    }

    await prisma.facilityWatch.deleteMany({
      where: { FacilityId: reservation.FacilityId },
    });

    return this.formatReservation(updated);
  }

  async getFacilityReservations(facilityId: number, date?: string) {
    const where: any = {
      FacilityId: facilityId,
      Status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
    };

    if (date) {
      where.Date = new Date(date);
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        User: { select: { Id: true, Name: true } },
        Facility: { include: { Building: true } },
      },
      orderBy: { StartTime: 'asc' },
    });

    return reservations.map((r) => this.formatReservation(r));
  }

  private formatReservation(r: any) {
    return {
      Id: r.Id,
      FacilityId: r.FacilityId,
      FacilityName: r.Facility?.Name,
      BuildingName: r.Facility?.Building?.Name,
      Date: r.Date,
      StartTime: r.StartTime,
      EndTime: r.EndTime,
      ActualEndTime: r.ActualEndTime,
      PartySize: r.PartySize,
      Purpose: r.Purpose,
      Status: r.Status,
      User: r.User,
      CreatedAt: r.CreatedAt,
    };
  }
}
