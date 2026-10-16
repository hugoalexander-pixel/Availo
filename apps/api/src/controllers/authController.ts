import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { Name, Email, Password, Role } = req.body;

      if (!Name || !Email || !Password) {
        res.status(400).json({ Message: 'Nama, email, dan password wajib diisi.' });
        return;
      }
      if (Password.length < 8) {
        res.status(400).json({ Message: 'Password minimal 8 karakter.' });
        return;
      }

      const result = await authService.register(Name, Email, Password, Role);
      res.status(201).json({ Data: result, Message: 'Registrasi berhasil.' });
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') {
        res.status(409).json({ Message: 'Email sudah terdaftar. Gunakan email lain.' });
        return;
      }
      res.status(500).json({ Message: 'Terjadi kesalahan saat registrasi.' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { Email, Password } = req.body;

      if (!Email || !Password) {
        res.status(400).json({ Message: 'Email dan password wajib diisi.' });
        return;
      }

      const result = await authService.login(Email, Password);
      res.json({ Data: result, Message: 'Login berhasil.' });
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ Message: 'Email atau password salah.' });
        return;
      }
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
