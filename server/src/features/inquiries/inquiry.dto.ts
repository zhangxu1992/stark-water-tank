import { z } from 'zod';

export const createInquirySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  country: z.string().optional().default(''),
  company: z.string().optional().default(''),
  message: z.string().min(1),
  sourcePage: z.string().optional().default(''),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
