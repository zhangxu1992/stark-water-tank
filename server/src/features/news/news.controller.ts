import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NewsService } from './news.service';
import { NewsRepository } from './news.repository';
import { createNewsSchema, updateNewsSchema } from './news.dto';
import { authMiddleware } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const prisma = new PrismaClient();
const repo = new NewsRepository(prisma);
const service = new NewsService(repo);
const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.list({
      categoryId: req.query.categoryId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/admin', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listAdmin({
      categoryId: req.query.categoryId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.params.slug === 'admin') return next();
    const item = await service.getBySlug(req.params.slug);
    res.json(item);
  } catch (err) { next(err); }
});

router.post('/', authMiddleware, validate(createNewsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.create(req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.put('/:id', authMiddleware, validate(updateNewsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.update(req.params.id, req.body);
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json({ message: 'News deleted' });
  } catch (err) { next(err); }
});

export default router;
