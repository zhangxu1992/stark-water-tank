import { z } from 'zod';

const translationSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
});

const parameterSchema = z.object({
  key_en: z.string().min(1),
  key_zh: z.string().default(''),
  value: z.string(),
});

export const createProductSchema = z.object({
  categoryId: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+(-[a-z0-9-]+)*$/, 'Invalid slug format'),
  translations: z.record(translationSchema).default({ en: { name: '', description: '' } }),
  parameters: z.array(parameterSchema).default([]),
  industries: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  coverImage: z.string().nullable().default(null),
  metaTitle: z.string().nullable().default(null),
  metaDescription: z.string().nullable().default(null),
  metaKeywords: z.string().nullable().default(null),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
