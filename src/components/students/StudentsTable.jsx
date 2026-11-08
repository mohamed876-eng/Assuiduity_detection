import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/common/Badge'
import { formatDate, formatPercent } from '@/utils/format'

const FACE_TONES = {
  registered: 'success',
  pending: 'warning',
  not_registered: 'neutral',
  failed: 'danger',
}

export function StudentsTable({ students, summaries, canManage, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="table-th">Student</th>
            <th className="table-th">Student ID</th>
            <th className="table-th">Class</th>
            <th className="table-th">Enrolled</th>
            <th className="table-th">Attendance</th>
            <th className="table-th">Face</th>
            <th className="table-th">Status</th>
            <th className="table-th text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => {
            const summary = summaries?.[student.id]
            const rate = summary?.rate ?? 0
            return (
              <tr key={student.id} className="transition hover:bg-slate-50/60">
                <td className="table-td">
                  <div className="flex items-center gap-3">
                    <Avatar name={student.fullName} src={student.profileImage} size="md" />
                    <div className="min-w-0">
                      <Link
                        to={`/students/${student.id}`}
                        className="block truncate text-[13px] font-medium text-slate-800 hover:text-brand-600"
                      >
                        {student.fullName}
                      </Link>
                      <p className="truncate text-[11px] text-slate-400">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-td font-mono text-xs text-slate-500">{student.studentNumber}</td>
                <td className="table-td">
                  <span className="text-[13px] text-slate-600">{student.className}</span>
                </td>
                <td className="table-td whitespace-nowrap text-xs">{formatDate(student.enrollmentDate)}</td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          rate >= 90 ? 'bg-emerald-500' : rate >= 80 ? 'bg-brand-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, rate)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{formatPercent(rate, 0)}</span>
                  </div>
                </td>
                <td className="table-td">
                  <Badge tone={FACE_TONES[student.faceStatus] ?? 'neutral'}>
                    {student.faceStatus === 'not_registered'
                      ? 'Not set'
                      : student.faceStatus === 'pending'
                        ? 'Pending'
                        : student.faceStatus === 'failed'
                          ? 'Retry'
                          : 'Registered'}
                  </Badge>
                </td>
                <td className="table-td">
                  <StatusBadge status={student.status} />
                </td>
                <td className="table-td">
                  <div className="flex items-center justify-end gap-0.5">
                    <Link
                      to={`/students/${student.id}`}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`View ${student.fullName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(student)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Edit ${student.fullName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(student)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete ${student.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
