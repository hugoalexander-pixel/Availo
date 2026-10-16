import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ Message: 'Token tidak ditemukan. Silakan login terlebih dahulu.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ Message: 'Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.' });
  }
}

export function pengelolaOnly(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.Role !== 'PENGELOLA') {
    res.status(403).json({ Message: 'Akses ditolak. Hanya pengelola yang dapat melakukan aksi ini.' });
    return;
  }
  next();
}
