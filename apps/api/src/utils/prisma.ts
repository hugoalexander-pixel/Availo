import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('Koneksi Database PostgreSQL berhasil diverifikasi.');
    return true;
  } catch (error: any) {
    logger.error(`Kegagalan koneksi DB: ${error.message}`, {
      stack: error.stack,
    });
    return false;
  }
}

export default prisma;
