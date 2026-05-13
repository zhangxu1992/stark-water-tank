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
import uploadRouter from './features/upload/upload.controller';

app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/upload', uploadRouter);

// --- Error Handler (must be last) ---
app.use(errorHandler);

export { app };
