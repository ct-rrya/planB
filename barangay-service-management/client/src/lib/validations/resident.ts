import { z } from 'zod';

export const residentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  sex: z.enum(['Male', 'Female']),
  civilStatus: z.enum(['Single', 'Married', 'Widowed', 'Separated']),
  contactNumber: z.string().min(1, 'Contact number is required'),
  address: z.string().min(1, 'Address is required'),
  purok: z.string().min(1, 'Purok is required'),
  messengerPSID: z.string().optional(),
});

export type ResidentFormData = z.infer<typeof residentSchema>;
