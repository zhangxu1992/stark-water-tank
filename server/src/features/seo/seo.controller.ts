import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../shared/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// GET /api/seo?pagePath=/&language=en
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pagePath, language } = req.query;
    const where: any = {};
    if (pagePath) where.pagePath = pagePath as string;
    if (language) where.language = language as string;
    const items = await prisma.seoMeta.findMany({ where, orderBy: { pagePath: 'asc' } });
    res.json(items);
  } catch (err) { next(err); }
});

// PUT /api/seo (upsert)
router.put('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pagePath, language, ...data } = req.body;
    if (!pagePath || !language) return res.status(400).json({ detail: 'pagePath and language are required' });
    const item = await prisma.seoMeta.upsert({
      where: { pagePath_language: { pagePath, language } },
      update: data,
      create: { pagePath, language, ...data },
    });
    res.json(item);
  } catch (err) { next(err); }
});

// GET /api/seo/pages — list all known page paths
router.get('/pages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = [
      { path: '/', label: 'Home' },
      { path: '/products', label: 'Products' },
      { path: '/cases', label: 'Cases' },
      { path: '/news', label: 'News' },
      { path: '/about', label: 'About Us' },
      { path: '/contact', label: 'Contact' },
    ];
    res.json(pages);
  } catch (err) { next(err); }
});

// GET /api/seo/sitemap-config
router.get('/sitemap-config', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await prisma.sitemapConfig.findMany({ orderBy: { pagePath: 'asc' } });
    res.json(configs);
  } catch (err) { next(err); }
});

// PUT /api/seo/sitemap-config (upsert)
router.put('/sitemap-config', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pagePath, ...data } = req.body;
    if (!pagePath) return res.status(400).json({ detail: 'pagePath is required' });
    const item = await prisma.sitemapConfig.upsert({
      where: { pagePath },
      update: data,
      create: { pagePath, ...data },
    });
    res.json(item);
  } catch (err) { next(err); }
});

export default router;
