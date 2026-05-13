import { z } from 'zod';

export const createFaqSchema = z.object({
  translations: z.record(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).default({ en: { question: '', answer: '' } }),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateFaqSchema = createFaqSchema.partial();

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
