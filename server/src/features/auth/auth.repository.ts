import { PrismaClient, Admin } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({ where: { username } });
  }

  async findById(id: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({ where: { id } });
  }

  async create(data: { username: string; passwordHash: string; role: string }): Promise<Admin> {
    return this.prisma.admin.create({ data });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async findAll(): Promise<Admin[]> {
    return this.prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, role: true, createdAt: true, lastLoginAt: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.admin.delete({ where: { id } });
  }

  // Refresh token methods
  async saveRefreshToken(adminId: string, token: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { adminId, token, expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { admin: true },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteExpiredRefreshTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
