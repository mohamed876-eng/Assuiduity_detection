import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock3, Info, ScanFace, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Textarea'
import { attendanceCorrectionSchema } from '@/schemas/sessionSchema'
import { useAttendanceMutations } from '@/hooks/useAttendance'
import { formatConfidence, formatDate } from '@/utils/format'

export function AttendanceCorrectionModal({ open, onClose, record }) {
  const { updateStatus } = useAttendanceMutations()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceCorrectionSchema),
    defaultValues: { status: record?.status ?? 'present', note: record?.note ?? '' },
  })

  useEffect(() => {
    if (open && record) reset({ status: record.status, note: record.note ?? '' })
  }, [open, record, reset])

  const onSubmit = async (values) => {
    try {
      await updateStatus.mutateAsync({ id: record.id, status: values.status, note: values.note })
      toast.success('Attendance record updated')
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!record) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attendance details"
      description="Review the record and apply a manual correction if needed."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={updateStatus.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="attendance-correction" loading={updateStatus.isPending}>
            Save correction
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <Avatar name={record.studentName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{record.studentName}</p>
            <p className="text-[11px] text-slate-400">
              {record.studentNumber} · {record.className}
            </p>
          </div>
          <StatusBadge status={record.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-slate-100 px-3 py-2">
            <p className="text-[10px] text-slate-400">Course</p>
            <p className="mt-0.5 font-medium text-slate-700">{record.courseName}</p>
          </div>
          <div className="rounded-lg border border-slate-100 px-3 py-2">
            <p className="text-[10px] text-slate-400">Date</p>
            <p className="mt-0.5 font-medium text-slate-700">{formatDate(record.date)}</p>
          </div>
          <div className="rounded-lg border border-slate-100 px-3 py-2">
            <p className="text-[10px] text-slate-400">Recorded time</p>
            <p className="mt-0.5 flex items-center gap-1 font-medium text-slate-700">
              <Clock3 className="h-3 w-3 text-slate-400" /> {record.time ?? '—'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 px-3 py-2">
            <p className="text-[10px] text-slate-400">Confidence</p>
            <p className="mt-0.5 flex items-center gap-1 font-medium text-slate-700">
              <ScanFace className="h-3 w-3 text-slate-400" /> {formatConfidence(record.confidence)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px]">
          <span className="text-slate-500">Capture method</span>
          <span className="font-medium text-slate-700 capitalize">
            {record.method === 'face' ? 'Facial recognition' : record.method}
          </span>
        </div>

        <form id="attendance-correction" onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t border-slate-100 pt-4">
          <Select label="Attendance status" error={errors.status?.message} {...register('status')}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </Select>
          <Textarea
            label="Correction note"
            rows={2}
            placeholder="Reason for the manual correction"
            error={errors.note?.message}
            {...register('note')}
          />
          <div className="flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2.5 text-[11px] leading-relaxed text-brand-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Manual corrections set the capture method to <strong>manual</strong> and are written to
              the mock attendance store.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="h-3 w-3" /> Biometric data is never included in attendance
            records.
          </div>
        </form>
      </div>
    </Modal>
  )
}
