import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  translations: z.record(z.string()).default({}),
  sortOrder: z.number().int().default(0),
  type: z.enum(['product', 'news']),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ type: true });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
