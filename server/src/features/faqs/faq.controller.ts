import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { FaqService } from './faq.service';
import { FaqRepository } from './faq.repository';
import { createFaqSchema, updateFaqSchema } from './faq.dto';
import { authMiddleware } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const prisma = new PrismaClient();
const repo = new FaqRepository(prisma);
const service = new FaqService(repo);
const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.list()); } catch (err) { next(err); }
});

router.get('/admin', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.listAdmin()); } catch (err) { next(err); }
});

router.post('/', authMiddleware, validate(createFaqSchema), async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await service.create(req.body)); } catch (err) { next(err); }
});

router.put('/:id', authMiddleware, validate(updateFaqSchema), async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.update(req.params.id, req.body)); } catch (err) { next(err); }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try { await service.delete(req.params.id); res.json({ message: 'FAQ deleted' }); } catch (err) { next(err); }
});

router.put('/reorder/batch', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try { await service.reorder(req.body.items); res.json({ message: 'Reordered' }); } catch (err) { next(err); }
});

export default router;
