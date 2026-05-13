import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { createCategorySchema, updateCategorySchema } from './category.dto';
import { authMiddleware } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const prisma = new PrismaClient();
const repo = new CategoryRepository(prisma);
const service = new CategoryService(repo);

const router = Router();

// GET /api/categories?type=product|news
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = (req.query.type as string) || 'product';
    if (type !== 'product' && type !== 'news') {
      return res.status(400).json({ title: 'BAD_REQUEST', status: 400, detail: 'type must be "product" or "news"' });
    }
    const categories = await service.list(type);
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', authMiddleware, validate(createCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await service.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id
router.put('/:id', authMiddleware, validate(updateCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = (req.query.type as string) || 'product';
    if (type !== 'product' && type !== 'news') {
      return res.status(400).json({ title: 'BAD_REQUEST', status: 400, detail: 'type must be "product" or "news"' });
    }
    const category = await service.update(type, req.params.id, req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id?type=product|news
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = (req.query.type as string) || 'product';
    if (type !== 'product' && type !== 'news') {
      return res.status(400).json({ title: 'BAD_REQUEST', status: 400, detail: 'type must be "product" or "news"' });
    }
    await service.delete(type, req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
