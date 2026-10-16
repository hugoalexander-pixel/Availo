import prisma from '../utils/prisma';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  async getByUserId(userId: number) {
    const notifications = await prisma.notification.findMany({
      where: { UserId: userId },
      include: { Facility: { select: { Id: true, Name: true } } },
      orderBy: { CreatedAt: 'desc' },
      take: 50,
    });

    return notifications.map((n) => ({
      Id: n.Id,
      FacilityId: n.FacilityId,
      FacilityName: n.Facility.Name,
      Message: n.Message,
      Type: n.Type,
      IsRead: n.IsRead,
      CreatedAt: n.CreatedAt,
    }));
  }

  async markAsRead(id: number, userId: number) {
    const notification = await prisma.notification.findUnique({ where: { Id: id } });
    if (!notification) throw new Error('NOTIFICATION_NOT_FOUND');
    if (notification.UserId !== userId) throw new Error('NOT_OWNER');

    await prisma.notification.update({ where: { Id: id }, data: { IsRead: true } });
    return { Message: 'Notifikasi telah ditandai sebagai dibaca.' };
  }

  async watchFacility(userId: number, facilityId: number) {
    const facility = await prisma.facility.findUnique({ where: { Id: facilityId } });
    if (!facility) throw new Error('FACILITY_NOT_FOUND');

    const existing = await prisma.facilityWatch.findUnique({
      where: { UserId_FacilityId: { UserId: userId, FacilityId: facilityId } },
    });

    if (existing) {
      return { Message: `Anda sudah memantau ${facility.Name}.` };
    }

    await prisma.facilityWatch.create({
      data: { UserId: userId, FacilityId: facilityId },
    });

    return { Message: `Anda akan diberitahu saat ${facility.Name} tersedia.` };
  }

  async getUnreadCount(userId: number) {
    const count = await prisma.notification.count({
      where: { UserId: userId, IsRead: false },
    });
    return count;
  }
}
