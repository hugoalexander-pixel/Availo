import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];
  const requestId = (typeof incomingId === 'string' && incomingId.trim().length > 0)
    ? incomingId.trim()
    : randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const userId = req.user?.UserId;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const status = res.statusCode;

    const logData = {
      requestId,
      method,
      path,
      status,
      durationMs,
      ...(userId ? { userId } : {}),
    };

    if (status >= 500) {
      logger.error(`HTTP ${method} ${path} ${status} - ${durationMs}ms`, logData);
    } else if (status >= 400) {
      logger.warn(`HTTP ${method} ${path} ${status} - ${durationMs}ms`, logData);
    } else {
      logger.info(`HTTP ${method} ${path} ${status} - ${durationMs}ms`, logData);
    }
  });

  next();
}
