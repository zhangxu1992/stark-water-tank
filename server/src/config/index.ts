import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function intEnv(name: string, defaultVal: number): number {
  const value = process.env[name];
  if (!value) return defaultVal;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) throw new Error(`Invalid integer env var: ${name}=${value}`);
  return parsed;
}

export const config = {
  port: intEnv('PORT', 3001),
  database: {
    url: requiredEnv('DATABASE_URL'),
  },
  auth: {
    jwtSecret: requiredEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: intEnv('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: intEnv('SMTP_PORT', 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    notifyEmail: process.env.INQUIRY_NOTIFY_EMAIL || '',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
} as const;

export type Config = typeof config;
