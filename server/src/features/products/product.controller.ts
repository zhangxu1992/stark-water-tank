import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { createProductSchema, updateProductSchema } from './product.dto';
import { authMiddleware } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const prisma = new PrismaClient();
const repo = new ProductRepository(prisma);
const service = new ProductService(repo);

const router = Router();

// GET /api/products (public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.list({
      categoryId: req.query.categoryId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/admin (admin list - includes unpublished)
router.get('/admin', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.listAdmin({
      categoryId: req.query.categoryId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug (public detail)
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip if slug is "admin"
    if (req.params.slug === 'admin') return next();
    const product = await service.getBySlug(req.params.slug);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products (admin)
router.post('/', authMiddleware, validate(createProductSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await service.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', authMiddleware, validate(updateProductSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await service.update(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
