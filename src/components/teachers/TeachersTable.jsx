import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/common/Badge'
import { formatDate } from '@/utils/format'

export function TeachersTable({ teachers, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="table-th">Teacher</th>
            <th className="table-th">Subject</th>
            <th className="table-th">Assigned classes</th>
            <th className="table-th">Joined</th>
            <th className="table-th">Status</th>
            <th className="table-th text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {teachers.map((teacher) => (
            <tr key={teacher.id} className="transition hover:bg-slate-50/60">
              <td className="table-td">
                <div className="flex items-center gap-3">
                  <Avatar name={teacher.fullName} src={teacher.profileImage} size="md" />
                  <div className="min-w-0">
                    <Link
                      to={`/teachers/${teacher.id}`}
                      className="block truncate text-[13px] font-medium text-slate-800 hover:text-brand-600"
                    >
                      {teacher.fullName}
                    </Link>
                    <p className="truncate text-[11px] text-slate-400">{teacher.email}</p>
                  </div>
                </div>
              </td>
              <td className="table-td">
                <Badge tone="neutral">{teacher.subject}</Badge>
              </td>
              <td className="table-td">
                <div className="flex flex-wrap gap-1">
                  {teacher.classNameList?.slice(0, 2).map((name) => (
                    <span key={name} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {name}
                    </span>
                  ))}
                  {teacher.classNameList?.length > 2 && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      +{teacher.classNameList.length - 2}
                    </span>
                  )}
                  {!teacher.classNameList?.length && (
                    <span className="text-[11px] text-slate-400">Unassigned</span>
                  )}
                </div>
              </td>
              <td className="table-td whitespace-nowrap text-xs">{formatDate(teacher.hireDate)}</td>
              <td className="table-td">
                <StatusBadge status={teacher.status} />
              </td>
              <td className="table-td">
                <div className="flex items-center justify-end gap-0.5">
                  <Link
                    to={`/teachers/${teacher.id}`}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`View ${teacher.fullName}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit(teacher)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Edit ${teacher.fullName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(teacher)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Delete ${teacher.fullName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
