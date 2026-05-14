import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../shared/middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// GET /api/dashboard (admin)
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [productCount, caseCount, newsCount, faqCount, inquiryTotal, inquiryUnread] = await Promise.all([
      prisma.product.count(),
      prisma.case.count(),
      prisma.news.count(),
      prisma.faq.count(),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { isRead: false } }),
    ]);

    res.json({
      products: productCount,
      cases: caseCount,
      news: newsCount,
      faqs: faqCount,
      inquiries: { total: inquiryTotal, unread: inquiryUnread },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/unread-inquiries-count (public for badge)
router.get('/unread-inquiries-count', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.inquiry.count({ where: { isRead: false } });
    res.json({ unread: count });
  } catch (err) { next(err); }
});

export default router;
