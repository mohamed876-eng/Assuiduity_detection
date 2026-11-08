import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Textarea'
import { classSchema } from '@/schemas/classSchema'
import { useClassMutations } from '@/hooks/useClasses'

export function ClassFormModal({ open, onClose, cls, teachers = [], onSaved }) {
  const { create, update } = useClassMutations()
  const editing = Boolean(cls)

  const defaults = {
    name: cls?.name ?? '',
    level: cls?.level ?? '',
    room: cls?.room ?? '',
    teacherId: cls?.teacherId ?? '',
    capacity: cls?.capacity ?? 30,
    description: cls?.description ?? '',
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(classSchema), defaultValues: defaults })

  useEffect(() => {
    if (open) reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cls?.id, reset])

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: cls.id, payload: values })
        toast.success('Class updated successfully')
      } else {
        await create.mutateAsync(values)
        toast.success('Class created successfully')
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
      title={editing ? 'Edit class' : 'Create class'}
      description="Define the cohort, room, capacity, and supervising teacher."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="class-form" loading={pending}>
            {editing ? 'Save changes' : 'Create class'}
          </Button>
        </>
      }
    >
      <form id="class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Class name"
          required
          placeholder="e.g. Grade 10 - A"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Level" required placeholder="Grade 10" error={errors.level?.message} {...register('level')} />
          <Input label="Room" required placeholder="A-101" error={errors.room?.message} {...register('room')} />
          <Input
            label="Capacity"
            type="number"
            min="1"
            max="100"
            required
            error={errors.capacity?.message}
            {...register('capacity')}
          />
        </div>
        <Select label="Assigned teacher" error={errors.teacherId?.message} {...register('teacherId')}>
          <option value="">Unassigned</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName} — {teacher.subject}
            </option>
          ))}
        </Select>
        <Textarea
          label="Description"
          rows={2}
          placeholder="Optional notes about this cohort"
          error={errors.description?.message}
          {...register('description')}
        />
      </form>
    </Modal>
  )
}
