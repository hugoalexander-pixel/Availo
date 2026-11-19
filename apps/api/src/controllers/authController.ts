import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const { Name, Email, Password, Role } = req.body;

    try {
      if (!Name || !Email || !Password) {
        logger.warn('Registrasi gagal: field tidak lengkap', { requestId: req.requestId, email: Email });
        res.status(400).json({ Message: 'Nama, email, dan password wajib diisi.' });
        return;
      }
      if (Password.length < 8) {
        logger.warn('Registrasi gagal: password kurang dari 8 karakter', { requestId: req.requestId, email: Email });
        res.status(400).json({ Message: 'Password minimal 8 karakter.' });
        return;
      }

      const result = await authService.register(Name, Email, Password, Role);

      logger.info('Registrasi pengguna baru berhasil', {
        requestId: req.requestId,
        userId: result.User.Id,
        email: result.User.Email,
        role: result.User.Role,
      });

      res.status(201).json({ Data: result, Message: 'Registrasi berhasil.' });
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') {
        logger.warn('Registrasi gagal: email sudah terdaftar', { requestId: req.requestId, email: Email });
        res.status(409).json({ Message: 'Email sudah terdaftar. Gunakan email lain.' });
        return;
      }
      logger.error('Registrasi gagal karena kesalahan server', {
        requestId: req.requestId,
        email: Email,
        error: err.message,
      });
      res.status(500).json({ Message: 'Terjadi kesalahan saat registrasi.' });
    }
  }

  async login(req: Request, res: Response) {
    const { Email, Password } = req.body;

    try {
      if (!Email || !Password) {
        logger.warn('Login gagal: email/password kosong', { requestId: req.requestId });
        res.status(400).json({ Message: 'Email dan password wajib diisi.' });
        return;
      }

      const result = await authService.login(Email, Password);

      logger.info('Login pengguna berhasil', {
        requestId: req.requestId,
        userId: result.User.Id,
        email: result.User.Email,
        role: result.User.Role,
      });

      res.json({ Data: result, Message: 'Login berhasil.' });
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        logger.warn('Login gagal: kredensial tidak valid', { requestId: req.requestId, email: Email });
        res.status(401).json({ Message: 'Email atau password salah.' });
        return;
      }
      logger.error('Login gagal karena kesalahan server', {
        requestId: req.requestId,
        email: Email,
        error: err.message,
      });
      res.status(500).json({ Message: 'Terjadi kesalahan saat login.' });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const result = await authService.getMe(req.user!.UserId);
      res.json({ Data: result });
    } catch {
      res.status(404).json({ Message: 'Pengguna tidak ditemukan.' });
    }
  }
}
