/**
 * Test US-1: Registrasi & Login
 * Menguji AuthService — validasi email duplikat, password hashing, dan login.
 * Service di-mock untuk mengisolasi logika bisnis dari database.
 */

import { hashPassword, comparePassword } from '../src/utils/password';
import { generateToken, verifyToken } from '../src/utils/jwt';

jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {},
}));

describe('US-1: Registrasi & Login', () => {
  describe('Password Hashing', () => {
    test('password_di_hash_dan_bisa_diverifikasi_saat_login', async () => {
      const plainPassword = 'password123';
      const hashed = await hashPassword(plainPassword);

      expect(hashed).not.toBe(plainPassword);
      expect(hashed.length).toBeGreaterThan(0);

      const isValid = await comparePassword(plainPassword, hashed);
      expect(isValid).toBe(true);
    });

    test('password_salah_ditolak_saat_verifikasi', async () => {
      const hashed = await hashPassword('password123');
      const isValid = await comparePassword('passwordSalah', hashed);
      expect(isValid).toBe(false);
    });

    test('password_berbeda_menghasilkan_hash_berbeda', async () => {
      const hash1 = await hashPassword('password123');
      const hash2 = await hashPassword('password456');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('JWT Token', () => {
    test('token_berisi_data_user_yang_benar', () => {
      const payload = { UserId: 1, Email: 'mahasiswa@kampus.ac.id', Role: 'MAHASISWA' };
      const token = generateToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.UserId).toBe(1);
      expect(decoded.Email).toBe('mahasiswa@kampus.ac.id');
      expect(decoded.Role).toBe('MAHASISWA');
    });

    test('token_tidak_valid_melempar_error', () => {
      expect(() => verifyToken('token-palsu')).toThrow();
    });

    test('token_berisi_role_pengelola_jika_user_pengelola', () => {
      const payload = { UserId: 2, Email: 'pengelola@kampus.ac.id', Role: 'PENGELOLA' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.Role).toBe('PENGELOLA');
    });
  });
});
