import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../shared/errors';
import { AuthRepository } from './auth.repository';
import { LoginInput, ChangePasswordInput, CreateAdminInput } from './auth.dto';

export class AuthService {
  constructor(private repo: AuthRepository) {}

  async login(input: LoginInput) {
    const admin = await this.repo.findByUsername(input.username);
    if (!admin) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const valid = await bcrypt.compare(input.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid username or password');
    }

    // Generate tokens
    const jwtPayload = { adminId: admin.id, username: admin.username, role: admin.role };
    const accessToken = jwt.sign(jwtPayload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    });

    const refreshToken = uuidv4();
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.repo.saveRefreshToken(admin.id, refreshToken, refreshExpires);

    // Update last login
    await this.repo.updateLastLogin(admin.id);

    return {
      accessToken,
      refreshToken,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    };
  }

  async refreshToken(token: string) {
    const stored = await this.repo.findRefreshToken(token);
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.repo.deleteRefreshToken(token);
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Delete old token
    await this.repo.deleteRefreshToken(token);

    // Generate new tokens
    const jwtPayload = {
      adminId: stored.admin.id,
      username: stored.admin.username,
      role: stored.admin.role,
    };

    const accessToken = jwt.sign(jwtPayload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    });

    const newRefreshToken = uuidv4();
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.repo.saveRefreshToken(stored.admin.id, newRefreshToken, refreshExpires);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async changePassword(adminId: string, input: ChangePasswordInput) {
    const admin = await this.repo.findById(adminId);
    if (!admin) throw new NotFoundError('Admin', adminId);

    const valid = await bcrypt.compare(input.currentPassword, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await this.repo.updatePassword(adminId, passwordHash);

    // Invalidate all refresh tokens for this admin
    // (done via cascade in schema)
  }

  async getMe(adminId: string) {
    const admin = await this.getAdminById(adminId);
    return { id: admin.id, username: admin.username, role: admin.role };
  }

  async createAdmin(input: CreateAdminInput) {
    const existing = await this.repo.findByUsername(input.username);
    if (existing) {
      throw new ConflictError(`Admin "${input.username}" already exists`);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const admin = await this.repo.create({
      username: input.username,
      passwordHash,
      role: input.role,
    });

    return { id: admin.id, username: admin.username, role: admin.role };
  }

  async listAdmins() {
    return this.repo.findAll();
  }

  async deleteAdmin(id: string, currentAdminId: string) {
    if (id === currentAdminId) {
      throw new ConflictError('Cannot delete yourself');
    }
    const admin = await this.getAdminById(id);
    await this.repo.delete(id);
  }

  async resetAdminPassword(adminId: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.repo.updatePassword(adminId, passwordHash);
  }

  async logout(refreshToken: string) {
    await this.repo.deleteRefreshToken(refreshToken);
  }

  private async getAdminById(id: string) {
    const admin = await this.repo.findById(id);
    if (!admin) throw new NotFoundError('Admin', id);
    return admin;
  }
}
