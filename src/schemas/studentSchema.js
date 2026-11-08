import { z } from 'zod'

export const studentSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  studentNumber: z.string().trim().optional(),
  classId: z.string().min(1, 'Select a class'),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  status: z.enum(['active', 'inactive', 'suspended']),
  guardianName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})
