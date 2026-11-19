import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId || (res.getHeader('X-Request-Id') as string) || 'unknown';

  logger.error(`[Unhandled Error] ${err.message}`, {
    requestId,
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.originalUrl || req.url,
    method: req.method,
    userId: req.user?.UserId,
  });

  res.status(500).json({
    Message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
    RequestId: requestId,
  });
}
