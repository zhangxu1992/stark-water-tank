import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { loginSchema, changePasswordSchema, createAdminSchema, resetPasswordSchema } from './auth.dto';
import { authMiddleware, superAdminOnly } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { logger } from '../../shared/logger';

const prisma = new PrismaClient();
const repo = new AuthRepository(prisma);
const service = new AuthService(repo);

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.login(req.body);
    logger.info('Admin login', { username: req.body.username });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ title: 'BAD_REQUEST', status: 400, detail: 'refreshToken is required' });
    }
    const result = await service.refreshToken(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getMe(req.admin!.adminId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/password
router.put('/password', authMiddleware, validate(changePasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.changePassword(req.admin!.adminId, req.body);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await service.logout(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/admins (super_admin only)
router.get('/admins', authMiddleware, superAdminOnly, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await service.listAdmins();
    res.json(admins);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/admins (super_admin only)
router.post('/admins', authMiddleware, superAdminOnly, validate(createAdminSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await service.createAdmin(req.body);
    res.status(201).json(admin);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/admins/:id (super_admin only)
router.delete('/admins/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteAdmin(req.params.id, req.admin!.adminId);
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/admins/:id/password (super_admin only)
router.put('/admins/:id/password', authMiddleware, superAdminOnly, validate(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.resetAdminPassword(req.params.id, req.body.newPassword);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
