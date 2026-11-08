import { z } from 'zod'

export const courseSchema = z.object({
  name: z.string().trim().min(2, 'Course name is required'),
  code: z.string().trim().min(2, 'Course code is required'),
  teacherId: z.string().min(1, 'Assign a teacher'),
  classIds: z.array(z.string()).min(1, 'Select at least one class'),
  credits: z.coerce.number().min(1, 'Minimum 1 credit').max(10, 'Maximum 10 credits'),
  description: z.string().optional(),
  scheduleDays: z.array(z.string()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  color: z.string().optional(),
})
