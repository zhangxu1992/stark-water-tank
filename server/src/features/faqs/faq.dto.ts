import { z } from 'zod';

export const createFaqSchema = z.object({
  translations: z.record(z.object({
    question: z.string(),
    answer: z.string().default(''),
  })).refine(
    (translations) => Object.values(translations).some(t => t.question.trim().length > 0),
    { message: 'At least one language must have a question' }
  ),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateFaqSchema = z.object({
  translations: z.record(z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
  })).optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
