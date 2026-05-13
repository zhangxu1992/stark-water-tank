import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).id || 'unknown';

  if (err instanceof AppError && err.isOperational) {
    logger.warn('Operational error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      requestId,
      path: req.path,
    });

    const body: Record<string, unknown> = {
      title: err.code,
      status: err.statusCode,
      detail: err.message,
      instance: req.originalUrl,
      request_id: requestId,
    };

    if ('errors' in err && Array.isArray((err as any).errors)) {
      body.errors = (err as any).errors;
    }

    return res.status(err.statusCode).json(body);
  }

  // Programming error — log full details, return generic 500
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    requestId,
    path: req.path,
  });

  res.status(500).json({
    title: 'Internal Server Error',
    status: 500,
    request_id: requestId,
  });
}
