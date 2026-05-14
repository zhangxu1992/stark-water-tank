import { z } from 'zod';

const newsTranslationSchema = z.object({
  title: z.string().min(1),
  summary: z.string().default(''),
  content: z.string().default(''),
});

export const createNewsSchema = z.object({
  categoryId: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+(-[a-z0-9-]+)*$/),
  translations: z.record(newsTranslationSchema).default({ en: { title: '', summary: '', content: '' } }),
  coverImage: z.string().nullable().default(null),
  metaTitle: z.string().nullable().default(null),
  metaDescription: z.string().nullable().default(null),
  metaKeywords: z.string().nullable().default(null),
  isPublished: z.boolean().default(true),
  publishedAt: z.string().nullable().default(null),
});

export const updateNewsSchema = createNewsSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
