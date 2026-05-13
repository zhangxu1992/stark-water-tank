import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, superAdminOnly } from '../../shared/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// GET /api/settings (public - for frontend)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result: Record<string, string> = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (err) { next(err); }
});

// PUT /api/settings (admin)
router.put('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string, group: 'custom' },
      });
    }
    res.json({ message: 'Settings updated' });
  } catch (err) { next(err); }
});

// GET /api/languages
router.get('/languages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const langs = await prisma.language.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(langs);
  } catch (err) { next(err); }
});

// PUT /api/languages/:code (admin)
router.put('/languages/:code', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = await prisma.language.update({
      where: { code: req.params.code },
      data: { isActive: req.body.isActive },
    });
    res.json(lang);
  } catch (err) { next(err); }
});

// GET /api/seo (public)
router.get('/seo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page_path, language } = req.query;
    const where: any = {};
    if (page_path) where.pagePath = page_path;
    if (language) where.language = language;
    const items = await prisma.seoMeta.findMany({ where });
    res.json(items);
  } catch (err) { next(err); }
});

// PUT /api/seo (admin)
router.put('/seo', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pagePath, language, ...data } = req.body;
    const item = await prisma.seoMeta.upsert({
      where: { pagePath_language: { pagePath, language } },
      update: data,
      create: { pagePath, language, ...data },
    });
    res.json(item);
  } catch (err) { next(err); }
});

export default router;
