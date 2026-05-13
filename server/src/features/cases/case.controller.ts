import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CaseService } from './case.service';
import { CaseRepository } from './case.repository';
import { createCaseSchema, updateCaseSchema } from './case.dto';
import { authMiddleware } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const prisma = new PrismaClient();
const repo = new CaseRepository(prisma);
const service = new CaseService(repo);

const router = Router();

// GET /api/cases (public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.list({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/admin (admin)
router.get('/admin', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listAdmin({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:slug (public)
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.params.slug === 'admin') return next();
    const item = await service.getBySlug(req.params.slug);
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/cases (admin)
router.post('/', authMiddleware, validate(createCaseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /api/cases/:id (admin)
router.put('/:id', authMiddleware, validate(updateCaseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cases/:id (admin)
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json({ message: 'Case deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
