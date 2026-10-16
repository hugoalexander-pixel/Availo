import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export class AuthService {
  async register(name: string, email: string, password: string, role: Role = Role.MAHASISWA) {
    const existing = await prisma.user.findUnique({ where: { Email: email } });
    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { Name: name, Email: email, Password: hashedPassword, Role: role },
    });

    const token = generateToken({ UserId: user.Id, Email: user.Email, Role: user.Role });
    return {
      Token: token,
      User: { Id: user.Id, Name: user.Name, Email: user.Email, Role: user.Role },
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { Email: email } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await comparePassword(password, user.Password);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = generateToken({ UserId: user.Id, Email: user.Email, Role: user.Role });
    return {
      Token: token,
      User: { Id: user.Id, Name: user.Name, Email: user.Email, Role: user.Role },
    };
  }

  async getMe(userId: number) {
    const user = await prisma.user.findUnique({ where: { Id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');
    return { Id: user.Id, Name: user.Name, Email: user.Email, Role: user.Role };
  }
}
