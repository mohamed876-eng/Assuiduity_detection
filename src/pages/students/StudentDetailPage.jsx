import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ScanFace,
  UserRound,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/common/Badge'
import { StatCard } from '@/components/common/StatCard'
import { Progress } from '@/components/common/Progress'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton, TableSkeleton } from '@/components/common/Skeleton'
import { StudentFormModal } from '@/components/students/StudentFormModal'
import { useStudent } from '@/hooks/useStudents'
import { useStudentSummaries } from '@/hooks/useAnalytics'
import { useAttendance } from '@/hooks/useAttendance'
import { useStudentFace } from '@/hooks/useFaceRegistry'
import { useClasses } from '@/hooks/useClasses'
import { useCourses } from '@/hooks/useCourses'
import { useAuth } from '@/contexts/AuthContext'
import { formatConfidence, formatDate, formatPercent } from '@/utils/format'
import { FACE_STATUS_META } from '@/constants'

export function StudentDetailPage() {
  const { id } = useParams()
  const { role } = useAuth()
  const canManage = role === 'admin'
  const { data: student, isLoading, isError, error, refetch } = useStudent(id)
  const { data: summaries } = useStudentSummaries()
  const { data: records = [], isLoading: recordsLoading } = useAttendance({ studentId: id })
  const { data: face } = useStudentFace(id)
  const { data: classes = [] } = useClasses()
  const { data: courses = [] } = useCourses()
  const [editOpen, setEditOpen] = useState(false)

  if (isError) {
    return (
      <Card>
        <ErrorState title="Student not found" message={error?.message} onRetry={refetch} />
      </Card>
    )
  }

  if (isLoading || !student) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-40" />
        <Card className="p-6">
          <div className="flex gap-5">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </Card>
        <TableSkeleton rows={4} columns={4} />
      </div>
    )
  }

  const summary = summaries?.[student.id] ?? { rate: 0, present: 0, absent: 0, late: 0, excused: 0, total: 0 }
  const studentCourses = courses.filter((course) => course.classIds.includes(student.classId))
  const faceMeta = FACE_STATUS_META[face?.status ?? 'not_registered']

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to students
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link to={`/attendance?student=${student.id}`}>
            <Button variant="outline" size="sm" leftIcon={<ClipboardCheck className="h-4 w-4" />}>
              Attendance history
            </Button>
          </Link>
          {canManage && (
            <>
              <Link to={`/face-recognition?student=${student.id}`}>
                <Button variant="outline" size="sm" leftIcon={<ScanFace className="h-4 w-4" />}>
                  Face registry
                </Button>
              </Link>
              <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
                Edit profile
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-800" />
        <div className="px-5 pb-5">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar name={student.fullName} src={student.profileImage} size="2xl" className="ring-4 ring-white" />
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{student.fullName}</h1>
                <StatusBadge status={student.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500">{student.studentNumber}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pb-3">
              <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                Attendance rate
              </p>
              <p className="text-lg font-semibold text-slate-900">{formatPercent(summary.rate)}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" /> {student.email}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" /> {student.phone || '—'}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Users className="h-4 w-4 text-slate-400" /> {student.className}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <CalendarDays className="h-4 w-4 text-slate-400" /> Enrolled{' '}
              {formatDate(student.enrollmentDate)}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <UserRound className="h-4 w-4 text-slate-400" /> Guardian: {student.guardianName || '—'}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" /> {student.address || '—'}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Attendance rate" value={formatPercent(summary.rate)} icon={ClipboardCheck} tone="brand" helper={`${summary.total} records`} />
        <StatCard label="Present" value={summary.present} tone="green" helper="All recorded sessions" />
        <StatCard label="Absent" value={summary.absent} tone="red" helper="All recorded sessions" />
        <StatCard label="Late arrivals" value={summary.late} tone="amber" helper="All recorded sessions" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent attendance</CardTitle>
              <p className="mt-1 text-xs text-slate-500">Latest recognition and manual records</p>
            </div>
            <Link
              to={`/attendance?student=${student.id}`}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          </CardHeader>
          {recordsLoading ? (
            <TableSkeleton rows={4} columns={4} />
          ) : records.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No attendance records"
              description="Records will appear once this student is detected in a session."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="table-th">Date</th>
                    <th className="table-th">Course</th>
                    <th className="table-th">Time</th>
                    <th className="table-th">Confidence</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.slice(0, 8).map((record) => (
                    <tr key={record.id} className="transition hover:bg-slate-50/60">
                      <td className="table-td whitespace-nowrap text-xs">{formatDate(record.date)}</td>
                      <td className="table-td">
                        <p className="text-[13px] font-medium text-slate-700">{record.courseName}</p>
                        <p className="text-[11px] text-slate-400">{record.teacherName}</p>
                      </td>
                      <td className="table-td text-xs">{record.time ?? '—'}</td>
                      <td className="table-td text-xs">{formatConfidence(record.confidence)}</td>
                      <td className="table-td">
                        <StatusBadge status={record.status} />
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
              <CardTitle>Face registration</CardTitle>
              <Badge
                tone={faceMeta?.tone ?? 'neutral'}
                dot
              >
                {faceMeta?.label ?? 'Not registered'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Template quality</span>
                  <span className="font-medium text-slate-700">
                    {face?.quality ? formatPercent(face.quality * 100, 0) : '—'}
                  </span>
                </div>
                <Progress
                  value={(face?.quality ?? 0) * 100}
                  tone={(face?.quality ?? 0) > 0.8 ? 'success' : 'warning'}
                  className="mt-2"
                />
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Samples</span>
                  <span className="font-medium text-slate-700">{face?.samples ?? 0}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Registered</span>
                  <span className="font-medium text-slate-700">
                    {formatDate(face?.registeredAt)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Biometric templates are generated and stored by the recognition backend. This UI
                only displays registration status.
              </p>
              {canManage && (
                <Link to={`/face-recognition?student=${student.id}`}>
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<ScanFace className="h-4 w-4" />}>
                    Manage registration
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enrolled courses</CardTitle>
              <span className="text-[11px] text-slate-400">{studentCourses.length} courses</span>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {studentCourses.length === 0 ? (
                <p className="text-xs text-slate-400">No courses assigned to this class yet.</p>
              ) : (
                studentCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-2.5 text-xs">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-700">{course.name}</p>
                      <p className="truncate text-[11px] text-slate-400">
                        {course.code} · {course.teacherName}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <StudentFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        student={student}
        classes={classes}
      />
    </div>
  )
}
