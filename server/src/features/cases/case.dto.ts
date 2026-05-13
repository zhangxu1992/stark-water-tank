import { z } from 'zod';

const caseTranslationSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  content: z.string().default(''),
});

export const createCaseSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+(-[a-z0-9-]+)*$/),
  translations: z.record(caseTranslationSchema).default({ en: { name: '', description: '', content: '' } }),
  images: z.array(z.string()).default([]),
  coverImage: z.string().nullable().default(null),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateCaseSchema = createCaseSchema.partial();

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
