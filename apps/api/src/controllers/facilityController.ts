import { Request, Response } from 'express';
import { FacilityService, CapacityConflictError } from '../services/facilityService';
import { FacilityType } from '@prisma/client';

const facilityService = new FacilityService();

export class FacilityController {
  async list(req: Request, res: Response) {
    try {
      const filters = {
        buildingId: req.query.buildingId ? Number(req.query.buildingId) : undefined,
        type: req.query.type as FacilityType | undefined,
        minCapacity: req.query.minCapacity ? Number(req.query.minCapacity) : undefined,
        search: req.query.search as string | undefined,
        date: req.query.date as string | undefined,
        time: req.query.time as string | undefined,
        page: req.query.page,
        limit: req.query.limit,
      };

      const { items, pagination } = await facilityService.listPaginated(filters);
      if (pagination) {
        res.json({
          Data: items,
          Total: pagination.total,
          Pagination: pagination,
          Message: 'Data fasilitas berhasil dimuat.',
        });
        return;
      }

      res.json({ Data: items, Total: items.length, Message: 'Data fasilitas berhasil dimuat.' });
    } catch (err: any) {
      if (err?.message === 'INVALID_PAGINATION') {
        res.status(400).json({ Message: 'Parameter pagination (page/limit) harus berupa bilangan bulat positif.' });
        return;
      }
      res.status(500).json({ Message: 'Gagal memuat data fasilitas.' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.Id);
      const facility = await facilityService.getById(id);
      res.json({ Data: facility });
    } catch (err: any) {
      if (err.message === 'FACILITY_NOT_FOUND') {
        res.status(404).json({ Message: 'Fasilitas tidak ditemukan.' });
        return;
      }
      res.status(500).json({ Message: 'Gagal memuat detail fasilitas.' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const facility = await facilityService.create(req.body);
      res.status(201).json({ Data: facility, Message: 'Fasilitas berhasil ditambahkan.' });
    } catch {
      res.status(500).json({ Message: 'Gagal menambahkan fasilitas.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.Id);
      const facility = await facilityService.update(id, req.body);
      res.json({ Data: facility, Message: 'Fasilitas berhasil diperbarui.' });
    } catch (err: any) {
      if (err instanceof CapacityConflictError) {
        res.status(409).json({
          Message: `Tidak dapat menurunkan kapasitas menjadi ${err.newCapacity} karena terdapat reservasi aktif dengan ${err.maxPartySize} peserta.`,
        });
        return;
      }
      if (err?.message === 'INVALID_CAPACITY') {
        res.status(400).json({ Message: 'Kapasitas fasilitas harus berupa bilangan bulat minimal 1.' });
        return;
      }
      if (err?.message === 'FACILITY_NOT_FOUND') {
        res.status(404).json({ Message: 'Fasilitas tidak ditemukan.' });
        return;
      }
      res.status(500).json({ Message: 'Gagal memperbarui fasilitas.' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.Id);
      await facilityService.delete(id);
      res.status(204).send();
    } catch {
      res.status(500).json({ Message: 'Gagal menghapus fasilitas.' });
    }
  }
}
