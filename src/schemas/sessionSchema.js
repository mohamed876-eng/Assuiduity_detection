import { z } from 'zod'

export const sessionSchema = z
  .object({
    classId: z.string().min(1, 'Select a class'),
    courseId: z.string().min(1, 'Select a course'),
    teacherId: z.string().min(1, 'Assign a teacher'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    room: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export const attendanceCorrectionSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'excused']),
  note: z.string().max(180, 'Note is too long').optional(),
})
