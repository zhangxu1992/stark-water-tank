import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../shared/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// GET /api/pages — public list
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.page.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(items);
  } catch (err) { next(err); }
});

// GET /api/pages/admin — admin list
router.get('/admin', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.page.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(items);
  } catch (err) { next(err); }
});

// GET /api/pages/:slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.page.findUnique({ where: { slug: req.params.slug } });
    if (!item) return res.status(404).json({ detail: 'Page not found' });
    res.json(item);
  } catch (err) { next(err); }
});

// POST /api/pages
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug, translations, isPublished } = req.body;
    if (!slug) return res.status(400).json({ detail: 'slug is required' });
    const item = await prisma.page.create({
      data: { slug, translations: JSON.stringify(translations || {}), isPublished: isPublished ?? true },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// PUT /api/pages/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug, translations, isPublished } = req.body;
    const data: any = {};
    if (slug !== undefined) data.slug = slug;
    if (translations !== undefined) data.translations = JSON.stringify(translations);
    if (isPublished !== undefined) data.isPublished = isPublished;
    const item = await prisma.page.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) { next(err); }
});

// DELETE /api/pages/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.page.delete({ where: { id: req.params.id } });
    res.json({ message: 'Page deleted' });
  } catch (err) { next(err); }
});

export default router;
