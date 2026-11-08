import { z } from 'zod'

export const classSchema = z.object({
  name: z.string().trim().min(2, 'Class name is required'),
  level: z.string().trim().min(1, 'Level is required'),
  room: z.string().trim().min(1, 'Room is required'),
  teacherId: z.string().optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(100, 'Capacity is too high'),
  description: z.string().optional(),
})
