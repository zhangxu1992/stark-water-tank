import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { requestIdMiddleware } from './shared/middleware/requestId';
import { errorHandler } from './shared/middleware/errorHandler';
import { logger } from './shared/logger';

const app = express();

// --- Middleware Chain ---
app.use(requestIdMiddleware);
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(config.upload.dir)));

// --- Request Logger ---
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, { requestId: (req as any).id });
  next();
});

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
import authRouter from './features/auth/auth.controller';
import categoryRouter from './features/categories/category.controller';
import productRouter from './features/products/product.controller';
import caseRouter from './features/cases/case.controller';
import newsRouter from './features/news/news.controller';
import faqRouter from './features/faqs/faq.controller';
import inquiryRouter from './features/inquiries/inquiry.controller';
import settingsRouter from './features/settings/settings.controller';
import seoRouter from './features/seo/seo.controller';
import dashboardRouter from './features/dashboard/dashboard.controller';
import pagesRouter from './features/pages/pages.controller';
import uploadRouter from './features/upload/upload.controller';

app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/cases', caseRouter);
app.use('/api/news', newsRouter);
app.use('/api/faqs', faqRouter);
app.use('/api/inquiries', inquiryRouter);
app.use('/api', settingsRouter);
app.use('/api/seo', seoRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/upload', uploadRouter);

// --- Error Handler (must be last) ---
app.use(errorHandler);

export { app };
