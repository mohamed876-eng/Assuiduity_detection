import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Textarea'
import { courseSchema } from '@/schemas/courseSchema'
import { useCourseMutations } from '@/hooks/useCourses'
import { DAYS_OF_WEEK } from '@/constants'
import { cn } from '@/lib/cn'

const COLORS = ['#343338', '#57565b', '#6e6d73', '#8a898f', '#29282d', '#4a494f', '#77767c', '#a09fa5']

export function CourseFormModal({ open, onClose, course, teachers = [], classes = [], onSaved }) {
  const { create, update } = useCourseMutations()
  const editing = Boolean(course)

  const firstSchedule = course?.schedule?.[0]
  const defaults = {
    name: course?.name ?? '',
    code: course?.code ?? '',
    teacherId: course?.teacherId ?? '',
    classIds: course?.classIds ?? [],
    credits: course?.credits ?? 3,
    description: course?.description ?? '',
    scheduleDays: [...new Set(course?.schedule?.map((entry) => entry.day) ?? [])],
    startTime: firstSchedule?.startTime ?? '08:30',
    endTime: firstSchedule?.endTime ?? '09:15',
    color: course?.color ?? COLORS[0],
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(courseSchema), defaultValues: defaults })

  useEffect(() => {
    if (open) reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, course?.id, reset])

  const selectedClasses = watch('classIds') ?? []
  const scheduleDays = watch('scheduleDays') ?? []
  const selectedColor = watch('color')

  const toggleClass = (classId) => {
    const next = selectedClasses.includes(classId)
      ? selectedClasses.filter((id) => id !== classId)
      : [...selectedClasses, classId]
    setValue('classIds', next, { shouldValidate: true })
  }

  const toggleDay = (day) => {
    const next = scheduleDays.includes(day)
      ? scheduleDays.filter((entry) => entry !== day)
      : [...scheduleDays, day]
    setValue('scheduleDays', next)
  }

  const onSubmit = async (values) => {
    const schedule = values.scheduleDays?.length
      ? values.scheduleDays.map((day) => ({
          day,
          startTime: values.startTime || '08:30',
          endTime: values.endTime || '09:15',
        }))
      : []
    const payload = { ...values, schedule }
    delete payload.scheduleDays
    delete payload.startTime
    delete payload.endTime
    try {
      if (editing) {
        await update.mutateAsync({ id: course.id, payload })
        toast.success('Course updated successfully')
      } else {
        await create.mutateAsync(payload)
        toast.success('Course created successfully')
      }
      onSaved?.()
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit course' : 'Create course'}
      description="Configure the course, teacher, classes, and weekly schedule."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="course-form" loading={pending}>
            {editing ? 'Save changes' : 'Create course'}
          </Button>
        </>
      }
    >
      <form id="course-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Course name"
            required
            placeholder="e.g. Advanced Mathematics"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Course code"
            required
            placeholder="e.g. MATH-301"
            error={errors.code?.message}
            {...register('code')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Teacher" required error={errors.teacherId?.message} {...register('teacherId')}>
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName} — {teacher.subject}
              </option>
            ))}
          </Select>
          <Input
            label="Credits"
            type="number"
            required
            min="1"
            max="10"
            error={errors.credits?.message}
            {...register('credits')}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700">
            Assigned classes <span className="text-rose-500">*</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {classes.map((cls) => {
              const active = selectedClasses.includes(cls.id)
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => toggleClass(cls.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] transition',
                    active
                      ? 'border-brand-300 bg-brand-50 text-brand-800'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border',
                      active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300',
                    )}
                  >
                    {active && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className="truncate">{cls.name}</span>
                </button>
              )
            })}
          </div>
          {errors.classIds?.message && <p className="text-xs text-rose-600">{errors.classIds.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-1">
            <p className="text-xs font-medium text-slate-700">Schedule days</p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'rounded-md border px-2 py-1 text-[10px] font-medium transition',
                    scheduleDays.includes(day)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300',
                  )}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <Input label="Start time" type="time" error={errors.startTime?.message} {...register('startTime')} />
          <Input label="End time" type="time" error={errors.endTime?.message} {...register('endTime')} />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-700">Course color</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={cn(
                  'h-7 w-7 rounded-full border-2 transition',
                  selectedColor === color ? 'border-slate-900 scale-110' : 'border-transparent',
                )}
                style={{ backgroundColor: color }}
                aria-label={`Choose color ${color}`}
              />
            ))}
          </div>
        </div>

        <Textarea
          label="Description"
          rows={2}
          placeholder="Optional course description"
          error={errors.description?.message}
          {...register('description')}
        />
      </form>
    </Modal>
  )
}
