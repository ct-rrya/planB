import { z } from 'zod';

export const documentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  fee: z.number().min(0, 'Fee cannot be negative'),
  processingDays: z.number().min(1, 'Processing days must be at least 1'),
  isActive: z.boolean().optional(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;
