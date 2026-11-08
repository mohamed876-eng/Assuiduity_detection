import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  School,
  Users,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { TeacherFormModal } from '@/components/teachers/TeacherFormModal'
import { useTeacher } from '@/hooks/useTeachers'
import { useClasses } from '@/hooks/useClasses'
import { useCourses } from '@/hooks/useCourses'
import { useAttendance } from '@/hooks/useAttendance'
import { formatDate, formatPercent } from '@/utils/format'

export function TeacherDetailPage() {
  const { id } = useParams()
  const { data: teacher, isLoading, isError, error, refetch } = useTeacher(id)
  const { data: classes = [] } = useClasses()
  const { data: courses = [] } = useCourses()
  const { data: attendance = [] } = useAttendance({})
  const [editOpen, setEditOpen] = useState(false)

  const teacherAttendance = useMemo(
    () => attendance.filter((record) => record.teacherId === id),
    [attendance, id],
  )
  const rate = useMemo(() => {
    if (!teacherAttendance.length) return 0
    const attended = teacherAttendance.filter(
      (record) => record.status === 'present' || record.status === 'late',
    ).length
    return (attended / teacherAttendance.length) * 100
  }, [teacherAttendance])

  if (isError) {
    return (
      <Card>
        <ErrorState title="Teacher not found" message={error?.message} onRetry={refetch} />
      </Card>
    )
  }

  if (isLoading || !teacher) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-32" />
        <Card className="p-6">
          <div className="flex gap-5">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const teacherClasses = classes.filter((cls) => teacher.classIds?.includes(cls.id))
  const teacherCourses = courses.filter((course) => course.teacherId === teacher.id)
  const totalStudents = teacherClasses.reduce((sum, cls) => sum + cls.studentCount, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/teachers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to teachers
        </Link>
        <Button size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
          Edit teacher
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-navy-900 via-navy-800 to-brand-800" />
        <div className="px-5 pb-5">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar name={teacher.fullName} src={teacher.profileImage} size="2xl" className="ring-4 ring-white" />
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{teacher.fullName}</h1>
                <StatusBadge status={teacher.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{teacher.subject}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" /> {teacher.email}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" /> {teacher.phone || '—'}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <School className="h-4 w-4 text-slate-400" /> {teacher.office || '—'}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <CalendarDays className="h-4 w-4 text-slate-400" /> Joined {formatDate(teacher.hireDate)}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <GraduationCap className="h-4 w-4 text-slate-400" /> {teacher.subject} department
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Assigned classes" value={teacherClasses.length} icon={School} tone="brand" />
        <StatCard label="Courses taught" value={teacherCourses.length} icon={BookOpen} tone="brand" />
        <StatCard label="Students reached" value={totalStudents} icon={Users} tone="green" />
        <StatCard
          label="Session attendance"
          value={formatPercent(rate)}
          icon={GraduationCap}
          tone="amber"
          helper={`${teacherAttendance.length} records`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned classes</CardTitle>
            <span className="text-[11px] text-slate-400">{teacherClasses.length} classes</span>
          </CardHeader>
          {teacherClasses.length === 0 ? (
            <EmptyState icon={School} title="No classes assigned" description="Edit this teacher to assign classes." />
          ) : (
            <div className="divide-y divide-slate-100">
              {teacherClasses.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/classes/${cls.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <School className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-800">{cls.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Room {cls.room} · {cls.studentCount} students
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">{cls.level}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses taught</CardTitle>
            <span className="text-[11px] text-slate-400">{teacherCourses.length} courses</span>
          </CardHeader>
          {teacherCourses.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses assigned" description="Assign this teacher to a course." />
          ) : (
            <div className="divide-y divide-slate-100">
              {teacherCourses.map((course) => (
                <div key={course.id} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-800">{course.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {course.code} · {course.credits} credits · {course.classNames.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <TeacherFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        teacher={teacher}
        classes={classes}
      />
    </div>
  )
}
