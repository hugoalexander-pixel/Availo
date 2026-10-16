import prisma from '../utils/prisma';

export class BuildingService {
  async list() {
    return prisma.building.findMany({ orderBy: { Name: 'asc' } });
  }

  async create(data: { Name: string; Code: string; Description?: string }) {
    return prisma.building.create({ data });
  }
}
