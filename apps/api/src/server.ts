import app from './app';
import { logger } from './utils/logger';
import { checkDatabaseConnection } from './utils/prisma';

const PORT = Number(process.env.API_PORT) || 3000;

app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`KelasKosong API berjalan di port ${PORT} (0.0.0.0)`, { port: PORT, env: process.env.NODE_ENV || 'development' });
  await checkDatabaseConnection();
});
