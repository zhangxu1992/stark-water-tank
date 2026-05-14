import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createInquirySchema } from './inquiry.dto';
import { authMiddleware } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { sendInquiryNotification } from '../../shared/mailer';

const prisma = new PrismaClient();
const router = Router();

// POST /api/inquiries (public)
router.post('/', validate(createInquirySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inquiry = await prisma.inquiry.create({ data: req.body });
    // Send email notification (non-blocking)
    sendInquiryNotification(req.body).catch(() => {});
    res.status(201).json({ message: 'Inquiry submitted', id: inquiry.id });
  } catch (err) { next(err); }
});

// GET /api/inquiries (admin)
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const isRead = req.query.is_read as string;

    const where: any = {};
    if (isRead === 'true') where.isRead = true;
    if (isRead === 'false') where.isRead = false;

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.inquiry.count({ where }),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// PUT /api/inquiries/:id/read (admin)
router.put('/:id/read', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.inquiry.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ message: 'Marked as read' });
  } catch (err) { next(err); }
});

export default router;
