import { Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';

const reservationService = new ReservationService();

export class ReservationController {
  async create(req: Request, res: Response) {
    try {
      const { FacilityId, Date, StartTime, EndTime, PartySize, Purpose } = req.body;

      if (!FacilityId || !Date || !StartTime || !EndTime || !PartySize) {
        res.status(400).json({ Message: 'FacilityId, Date, StartTime, EndTime, dan PartySize wajib diisi.' });
        return;
      }

      if (typeof PartySize !== 'number' || PartySize < 1) {
        res.status(400).json({ Message: 'Jumlah peserta harus minimal 1 orang.' });
        return;
      }

      const result = await reservationService.create({
        UserId: req.user!.UserId,
        FacilityId,
        Date,
        StartTime,
        EndTime,
        PartySize,
        Purpose,
      });

      res.status(201).json({ Data: result, Message: 'Reservasi berhasil dibuat.' });
    } catch (err: any) {
      const errorMap: Record<string, { status: number; message: string }> = {
        FACILITY_NOT_FOUND: { status: 404, message: 'Fasilitas tidak ditemukan.' },
        CAPACITY_EXCEEDED: { status: 400, message: 'Jumlah peserta melebihi kapasitas ruangan.' },
        INVALID_TIME_RANGE: { status: 400, message: 'Waktu selesai harus setelah waktu mulai.' },
        DATE_IN_PAST: { status: 400, message: 'Tanggal reservasi tidak boleh di masa lalu.' },
        RESERVATION_CONFLICT: { status: 409, message: 'Sudah ada reservasi lain di slot waktu tersebut.' },
      };

      const mapped = errorMap[err.message];
      if (mapped) {
        res.status(mapped.status).json({ Message: mapped.message });
        return;
      }
      res.status(500).json({ Message: 'Terjadi kesalahan saat membuat reservasi.' });
    }
  }

  async getMyReservations(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const reservations = await reservationService.getMyReservations(req.user!.UserId, status);
      res.json({ Data: reservations, Total: reservations.length, Message: 'Data reservasi berhasil dimuat.' });
    } catch {
      res.status(500).json({ Message: 'Gagal memuat data reservasi.' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.Id);
      const reservation = await reservationService.getById(id);
      res.json({ Data: reservation });
    } catch (err: any) {
      if (err.message === 'RESERVATION_NOT_FOUND') {
        res.status(404).json({ Message: 'Reservasi tidak ditemukan.' });
        return;
      }
      res.status(500).json({ Message: 'Gagal memuat detail reservasi.' });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const id = Number(req.params.Id);
      const result = await reservationService.cancel(id, req.user!.UserId);
      res.json({ Data: result, Message: 'Reservasi berhasil dibatalkan.' });
    } catch (err: any) {
      const errorMap: Record<string, { status: number; message: string }> = {
        RESERVATION_NOT_FOUND: { status: 404, message: 'Reservasi tidak ditemukan.' },
        NOT_OWNER: { status: 403, message: 'Anda tidak memiliki akses untuk membatalkan reservasi ini.' },
        CANNOT_CANCEL: { status: 400, message: 'Hanya reservasi berstatus UPCOMING yang dapat dibatalkan.' },
      };

      const mapped = errorMap[err.message];
      if (mapped) {
        res.status(mapped.status).json({ Message: mapped.message });
        return;
      }
      res.status(500).json({ Message: 'Terjadi kesalahan saat membatalkan reservasi.' });
    }
  }

  async earlyEnd(req: Request, res: Response) {
    try {
      const id = Number(req.params.Id);
      const result = await reservationService.earlyEnd(id, req.user!.UserId);
      res.json({ Data: result, Message: 'Ruangan telah dibebaskan. Terima kasih!' });
    } catch (err: any) {
      const errorMap: Record<string, { status: number; message: string }> = {
        RESERVATION_NOT_FOUND: { status: 404, message: 'Reservasi tidak ditemukan.' },
        NOT_OWNER: { status: 403, message: 'Anda tidak memiliki akses untuk mengakhiri reservasi ini.' },
        CANNOT_EARLY_END: { status: 400, message: 'Hanya reservasi berstatus ACTIVE yang dapat diakhiri lebih awal.' },
      };

      const mapped = errorMap[err.message];
      if (mapped) {
        res.status(mapped.status).json({ Message: mapped.message });
        return;
      }
      res.status(500).json({ Message: 'Terjadi kesalahan saat mengakhiri reservasi.' });
    }
  }

  async getFacilityReservations(req: Request, res: Response) {
    try {
      const facilityId = Number(req.params.Id);
      const date = req.query.date as string | undefined;
      const reservations = await reservationService.getFacilityReservations(facilityId, date);
      res.json({ Data: reservations, Total: reservations.length });
    } catch {
      res.status(500).json({ Message: 'Gagal memuat reservasi fasilitas.' });
    }
  }
}
