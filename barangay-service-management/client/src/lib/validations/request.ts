import { z } from 'zod';

export const createRequestSchema = z.object({
  resident: z.string().min(1, 'Resident is required'),
  documentType: z.string().min(1, 'Document type is required'),
  purpose: z.string().min(1, 'Purpose is required').max(500, 'Purpose must not exceed 500 characters'),
  remarks: z.string().max(500, 'Remarks must not exceed 500 characters').optional(),
});

export const updateStatusSchema = z.object({
  remarks: z.string().max(500, 'Remarks must not exceed 500 characters').optional(),
});

export type CreateRequestFormData = z.infer<typeof createRequestSchema>;
export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;
