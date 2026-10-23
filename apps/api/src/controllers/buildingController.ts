import { Request, Response } from 'express';
import { BuildingService } from '../services/buildingService';

const buildingService = new BuildingService();

export class BuildingController {
  async list(_req: Request, res: Response) {
    try {
      const buildings = await buildingService.list();
      res.json({ Data: buildings, Total: buildings.length, Message: 'Data gedung berhasil dimuat.' });
    } catch {
      res.status(500).json({ Message: 'Gagal memuat data gedung.' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { Name, Code, Description } = req.body;

      if (!Name || !Code) {
        res.status(400).json({ Message: 'Nama dan kode gedung wajib diisi.' });
        return;
      }

      const building = await buildingService.create({ Name, Code, Description });
      res.status(201).json({ Data: building, Message: 'Gedung berhasil ditambahkan.' });
    } catch {
      res.status(500).json({ Message: 'Gagal menambahkan gedung.' });
    }
  }
}
