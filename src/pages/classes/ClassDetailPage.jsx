import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Pencil,
  School,
  UserRound,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StatCard } from '@/components/common/StatCard'
import { Progress } from '@/components/common/Progress'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton, TableSkeleton } from '@/components/common/Skeleton'
import { ClassFormModal } from '@/components/classes/ClassFormModal'
import { useClass } from '@/hooks/useClasses'
import { useTeachers } from '@/hooks/useTeachers'
import { useStudents } from '@/hooks/useStudents'
import { useCourses } from '@/hooks/useCourses'
import { useAttendance } from '@/hooks/useAttendance'
import { useStudentSummaries } from '@/hooks/useAnalytics'
import { summarize } from '@/services/api/analyticsService'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, formatPercent } from '@/utils/format'

export function ClassDetailPage() {
  const { id } = useParams()
  const { role } = useAuth()
  const canManage = role === 'admin'
  const { data: cls, isLoading, isError, error, refetch } = useClass(id)
  const { data: teachers = [] } = useTeachers()
  const { data: students = [] } = useStudents()
  const { data: courses = [] } = useCourses()
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance({ classId: id })
  const { data: summaries } = useStudentSummaries()
  const [editOpen, setEditOpen] = useState(false)

  const classStudents = useMemo(
    () => students.filter((student) => student.classId === id),
    [students, id],
  )
  const classCourses = useMemo(
    () => courses.filter((course) => course.classIds.includes(id)),
    [courses, id],
  )
  const summary = useMemo(() => summarize(attendance), [attendance])

  if (isError) {
    return (
      <Card>
        <ErrorState title="Class not found" message={error?.message} onRetry={refetch} />
      </Card>
    )
  }

  if (isLoading || !cls) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-28" />
        <Card className="p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-4 w-64" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/classes"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to classes
        </Link>
        {canManage && (
          <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Edit class
          </Button>
        )}
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <School className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{cls.name}</h1>
                <Badge tone="info">{cls.level}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Room {cls.room} · {cls.studentCount} students · {cls.courseCount} courses
              </p>
              <p className="mt-1 text-xs text-slate-400">{cls.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <Avatar name={cls.teacherName} size="sm" />
            <div>
              <p className="text-xs font-medium text-slate-800">{cls.teacherName}</p>
              <p className="text-[10px] text-slate-400">Supervising teacher</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Enrolled students"
          value={cls.studentCount}
          icon={Users}
          tone="brand"
          helper={`${cls.capacity} capacity`}
        />
        <StatCard label="Attendance rate" value={formatPercent(summary.rate)} icon={ClipboardCheck} tone="green" />
        <StatCard label="Courses" value={classCourses.length} icon={BookOpen} tone="brand" />
        <StatCard
          label="Absences recorded"
          value={summary.absent}
          icon={UserRound}
          tone="red"
          helper={`${summary.total} total records`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Students in this class</CardTitle>
              <p className="mt-1 text-xs text-slate-500">Attendance is calculated across all sessions.</p>
            </div>
            <Link to="/students" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Manage students
            </Link>
          </CardHeader>
          {classStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students assigned"
              description="Assign students to this class from the Students module."
            />
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full min-w-[520px]">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur">
                  <tr>
                    <th className="table-th">Student</th>
                    <th className="table-th">Student ID</th>
                    <th className="table-th">Attendance</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((student) => (
                    <tr key={student.id} className="transition hover:bg-slate-50/60">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={student.fullName} size="sm" />
                          <Link
                            to={`/students/${student.id}`}
                            className="truncate text-[13px] font-medium text-slate-800 hover:text-brand-600"
                          >
                            {student.fullName}
                          </Link>
                        </div>
                      </td>
                      <td className="table-td font-mono text-[11px] text-slate-500">
                        {student.studentNumber}
                      </td>
                      <td className="table-td text-xs font-medium">
                        {formatPercent(summaries?.[student.id]?.rate ?? 0, 0)}
                      </td>
                      <td className="table-td">
                        <StatusBadge status={student.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy</CardTitle>
              <span className="text-[11px] text-slate-400">{cls.capacity} seats</span>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-slate-900">{cls.studentCount}</p>
                <p className="text-xs text-slate-400">of {cls.capacity}</p>
              </div>
              <Progress
                value={(cls.studentCount / cls.capacity) * 100}
                tone={cls.studentCount / cls.capacity > 0.9 ? 'warning' : 'brand'}
                className="mt-2"
                showValue
              />
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                Capacity is used for occupancy warnings and session planning.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <span className="text-[11px] text-slate-400">{classCourses.length}</span>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {classCourses.length === 0 ? (
                <p className="text-xs text-slate-400">No courses linked to this class.</p>
              ) : (
                classCourses.map((course) => (
                  <div key={course.id} className="flex items-start gap-2.5">
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-700">{course.name}</p>
                      <p className="truncate text-[10px] text-slate-400">
                        {course.code} · {course.teacherName}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent records</CardTitle>
            </CardHeader>
            {attendanceLoading ? (
              <TableSkeleton rows={3} columns={3} />
            ) : attendance.length === 0 ? (
              <p className="px-5 pb-5 text-xs text-slate-400">No attendance records yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendance.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center gap-2 px-5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-slate-700">
                        {record.studentName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(record.date)} · {record.courseName}
                      </p>
                    </div>
                    <StatusBadge status={record.status} dot={false} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ClassFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        cls={cls}
        teachers={teachers}
      />
    </div>
  )
}
