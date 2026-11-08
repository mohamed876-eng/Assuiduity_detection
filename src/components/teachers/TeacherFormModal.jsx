import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { teacherSchema } from '@/schemas/teacherSchema'
import { useTeacherMutations } from '@/hooks/useTeachers'
import { cn } from '@/lib/cn'

export function TeacherFormModal({ open, onClose, teacher, classes = [], onSaved }) {
  const { create, update } = useTeacherMutations()
  const editing = Boolean(teacher)

  const defaults = {
    fullName: teacher?.fullName ?? '',
    email: teacher?.email ?? '',
    phone: teacher?.phone ?? '',
    subject: teacher?.subject ?? '',
    hireDate: teacher?.hireDate ?? format(new Date(), 'yyyy-MM-dd'),
    status: teacher?.status ?? 'active',
    office: teacher?.office ?? '',
    classIds: teacher?.classIds ?? [],
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(teacherSchema), defaultValues: defaults })

  useEffect(() => {
    if (open) reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, teacher?.id, reset])

  const selectedClasses = watch('classIds') ?? []

  const toggleClass = (classId) => {
    const next = selectedClasses.includes(classId)
      ? selectedClasses.filter((id) => id !== classId)
      : [...selectedClasses, classId]
    setValue('classIds', next, { shouldValidate: true })
  }

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: teacher.id, payload: values })
        toast.success('Teacher updated successfully')
      } else {
        await create.mutateAsync(values)
        toast.success('Teacher added successfully')
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
      title={editing ? 'Edit teacher' : 'Add new teacher'}
      description="Manage teacher details, subject expertise, and class assignments."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="teacher-form" loading={pending}>
            {editing ? 'Save changes' : 'Add teacher'}
          </Button>
        </>
      }
    >
      <form id="teacher-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            required
            placeholder="e.g. Dr. David Chen"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Subject"
            required
            placeholder="e.g. Mathematics"
            error={errors.subject?.message}
            {...register('subject')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email address"
            type="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Hire date"
            type="date"
            required
            error={errors.hireDate?.message}
            {...register('hireDate')}
          />
          <Select label="Status" error={errors.status?.message} {...register('status')}>
            <option value="active">Active</option>
            <option value="on-leave">On leave</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Input label="Office" placeholder="Staff Room A" error={errors.office?.message} {...register('office')} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700">Assign classes</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {classes.map((cls) => {
              const active = selectedClasses.includes(cls.id)
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => toggleClass(cls.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition',
                    active
                      ? 'border-brand-300 bg-brand-50 text-brand-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                      active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300',
                    )}
                  >
                    {active && <Check className="h-3 w-3" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{cls.name}</span>
                  <span className="text-[10px] text-slate-400">{cls.studentCount}</span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-400">
            Class assignments control which sessions this teacher can supervise.
          </p>
        </div>
      </form>
    </Modal>
  )
}
