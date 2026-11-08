import { z } from 'zod'

export const teacherSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().trim().min(2, 'Subject is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  status: z.enum(['active', 'on-leave', 'inactive']),
  office: z.string().optional(),
  classIds: z.array(z.string()).optional(),
})
