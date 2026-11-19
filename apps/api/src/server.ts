import app from './app';
import { logger } from './utils/logger';
import { checkDatabaseConnection } from './utils/prisma';

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, async () => {
  logger.info(`KelasKosong API berjalan di port ${PORT}`, { port: PORT, env: process.env.NODE_ENV || 'development' });
  await checkDatabaseConnection();
});
