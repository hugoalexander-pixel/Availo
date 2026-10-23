import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

const notificationService = new NotificationService();

export class NotificationController {
  async list(req: Request, res: Response) {
    try {
      const notifications = await notificationService.getByUserId(req.user!.UserId);
      const unreadCount = await notificationService.getUnreadCount(req.user!.UserId);
      res.json({
        Data: notifications,
        Total: notifications.length,
        UnreadCount: unreadCount,
        Message: 'Data notifikasi berhasil dimuat.',
      });
    } catch {
      res.status(500).json({ Message: 'Gagal memuat notifikasi.' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const id = Number(req.params.Id);
      const result = await notificationService.markAsRead(id, req.user!.UserId);
      res.json({ Data: result });
    } catch (err: any) {
      const errorMap: Record<string, { status: number; message: string }> = {
        NOTIFICATION_NOT_FOUND: { status: 404, message: 'Notifikasi tidak ditemukan.' },
        NOT_OWNER: { status: 403, message: 'Anda tidak memiliki akses ke notifikasi ini.' },
      };

      const mapped = errorMap[err.message];
      if (mapped) {
        res.status(mapped.status).json({ Message: mapped.message });
        return;
      }
      res.status(500).json({ Message: 'Gagal memperbarui notifikasi.' });
    }
  }

  async watchFacility(req: Request, res: Response) {
    try {
      const { FacilityId } = req.body;
      if (!FacilityId) {
        res.status(400).json({ Message: 'FacilityId wajib diisi.' });
        return;
      }

      const result = await notificationService.watchFacility(req.user!.UserId, FacilityId);
      res.json({ Data: result });
    } catch (err: any) {
      if (err.message === 'FACILITY_NOT_FOUND') {
        res.status(404).json({ Message: 'Fasilitas tidak ditemukan.' });
        return;
      }
      res.status(500).json({ Message: 'Gagal memantau fasilitas.' });
    }
  }
}
