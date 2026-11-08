import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { sessionSchema } from '@/schemas/sessionSchema'
import { useSessionMutations } from '@/hooks/useSessions'

export function SessionFormModal({ open, onClose, classes = [], courses = [], teachers = [], onSaved }) {
  const { create } = useSessionMutations()
  const defaults = {
    classId: '',
    courseId: '',
    teacherId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '09:45',
    room: '',
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(sessionSchema), defaultValues: defaults })

  useEffect(() => {
    if (open) reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset])

  const selectedClass = watch('classId')
  const selectedCourse = watch('courseId')

  const availableCourses = selectedClass
    ? courses.filter((course) => course.classIds.includes(selectedClass))
    : courses

  useEffect(() => {
    if (!selectedClass) return
    const current = courses.find((course) => course.id === selectedCourse)
    if (current && !current.classIds.includes(selectedClass)) {
      setValue('courseId', '')
    }
    const cls = classes.find((entry) => entry.id === selectedClass)
    if (cls?.teacherId) setValue('teacherId', cls.teacherId)
    if (cls?.room) setValue('room', cls.room)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass])

  useEffect(() => {
    const course = courses.find((entry) => entry.id === selectedCourse)
    if (course?.teacherId) setValue('teacherId', course.teacherId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse])

  const onSubmit = async (values) => {
    try {
      await create.mutateAsync(values)
      toast.success('Session created successfully')
      onSaved?.()
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create attendance session"
      description="Schedule a session with a class, course, teacher, and time window."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="session-form" loading={create.isPending}>
            Create session
          </Button>
        </>
      }
    >
      <form id="session-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Class" required error={errors.classId?.message} {...register('classId')}>
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Select>
          <Select label="Course" required error={errors.courseId?.message} {...register('courseId')}>
            <option value="">Select a course</option>
            {availableCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Teacher" required error={errors.teacherId?.message} {...register('teacherId')}>
            <option value="">Assign a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName}
              </option>
            ))}
          </Select>
          <Input label="Room" placeholder="A-101" error={errors.room?.message} {...register('room')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Date"
            type="date"
            required
            error={errors.date?.message}
            {...register('date')}
          />
          <Input
            label="Start time"
            type="time"
            required
            error={errors.startTime?.message}
            {...register('startTime')}
          />
          <Input
            label="End time"
            type="time"
            required
            error={errors.endTime?.message}
            {...register('endTime')}
          />
        </div>
        <div className="rounded-lg border border-brand-100 bg-brand-50/60 px-3.5 py-2.5 text-[11px] leading-relaxed text-brand-700">
          Sessions start as <strong>scheduled</strong>. Use “Start” to open the detection window and
          “Stop” to close it. Stopping a session auto-marks undetected students as absent.
        </div>
      </form>
    </Modal>
  )
}
