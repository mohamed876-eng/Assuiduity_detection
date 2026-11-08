import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Textarea'
import { studentSchema } from '@/schemas/studentSchema'
import { useStudentMutations } from '@/hooks/useStudents'

export function StudentFormModal({ open, onClose, student, classes = [], onSaved }) {
  const { create, update } = useStudentMutations()
  const editing = Boolean(student)

  const defaults = {
    fullName: student?.fullName ?? '',
    email: student?.email ?? '',
    studentNumber: student?.studentNumber ?? '',
    classId: student?.classId ?? '',
    enrollmentDate: student?.enrollmentDate ?? format(new Date(), 'yyyy-MM-dd'),
    status: student?.status ?? 'active',
    guardianName: student?.guardianName ?? '',
    phone: student?.phone ?? '',
    address: student?.address ?? '',
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(studentSchema), defaultValues: defaults })

  useEffect(() => {
    if (open) reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student?.id, reset])

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: student.id, payload: values })
        toast.success('Student updated successfully')
      } else {
        await create.mutateAsync(values)
        toast.success('Student added successfully')
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
      title={editing ? 'Edit student' : 'Add new student'}
      description={
        editing
          ? 'Update the student profile. Attendance history is preserved.'
          : 'Create a student profile. A face registration record will be prepared automatically.'
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="student-form" loading={pending}>
            {editing ? 'Save changes' : 'Add student'}
          </Button>
        </>
      }
    >
      <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            required
            placeholder="e.g. Ahmed Al-Farsi"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Student number"
            placeholder="Auto-generated if empty"
            hint={editing ? undefined : 'Leave blank to generate automatically'}
            error={errors.studentNumber?.message}
            {...register('studentNumber')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email address"
            type="email"
            required
            placeholder="student@school.edu"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+1 (415) 555-0100"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Class" required error={errors.classId?.message} {...register('classId')}>
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Select>
          <Input
            label="Enrollment date"
            type="date"
            required
            error={errors.enrollmentDate?.message}
            {...register('enrollmentDate')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Status" error={errors.status?.message} {...register('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </Select>
          <Input
            label="Guardian name"
            placeholder="Parent or guardian"
            error={errors.guardianName?.message}
            {...register('guardianName')}
          />
        </div>
        <Textarea
          label="Address"
          rows={2}
          placeholder="Street, city"
          error={errors.address?.message}
          {...register('address')}
        />
        <div className="rounded-lg border border-brand-100 bg-brand-50/60 px-3.5 py-2.5 text-[11px] leading-relaxed text-brand-700">
          Adding a student does not register their face. Use the Face Registry module to capture an
          image and submit it to the backend for biometric enrollment.
        </div>
      </form>
    </Modal>
  )
}
