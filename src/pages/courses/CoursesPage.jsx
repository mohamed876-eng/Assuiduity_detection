import { useMemo, useState } from 'react'
import { BookOpen, Layers, Pencil, Plus, SearchX, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/Select'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { TableSkeleton } from '@/components/common/Skeleton'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CourseFormModal } from '@/components/courses/CourseFormModal'
import { useCourses, useCourseMutations } from '@/hooks/useCourses'
import { useTeachers } from '@/hooks/useTeachers'
import { useClasses } from '@/hooks/useClasses'
import { useAuth } from '@/contexts/AuthContext'

export function CoursesPage() {
  const { role } = useAuth()
  const canManage = role === 'admin'
  const { data: courses = [], isLoading, isError, error, refetch } = useCourses()
  const { data: teachers = [] } = useTeachers()
  const { data: classes = [] } = useClasses()
  const { remove } = useCourseMutations()

  const [search, setSearch] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return courses.filter((course) => {
      const matchesSearch =
        !term ||
        course.name.toLowerCase().includes(term) ||
        course.code.toLowerCase().includes(term) ||
        course.teacherName.toLowerCase().includes(term)
      const matchesTeacher = !teacherFilter || course.teacherId === teacherFilter
      return matchesSearch && matchesTeacher
    })
  }, [courses, search, teacherFilter])

  const totals = useMemo(
    () => ({
      courses: courses.length,
      credits: courses.reduce((sum, course) => sum + course.credits, 0),
      teachers: new Set(courses.map((course) => course.teacherId).filter(Boolean)).size,
      classes: new Set(courses.flatMap((course) => course.classIds)).size,
    }),
    [courses],
  )

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success(`${deleteTarget.name} was deleted`)
      setDeleteTarget(null)
    } catch (deleteError) {
      toast.error(deleteError.message)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Courses"
        description="Manage curriculum, teacher assignments, class coverage, and weekly schedules."
        actions={
          canManage && (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              Create course
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total courses" value={totals.courses} icon={BookOpen} tone="brand" />
        <StatCard label="Course credits" value={totals.credits} icon={Layers} tone="brand" />
        <StatCard label="Teachers assigned" value={totals.teachers} icon={UserRound} tone="green" />
        <StatCard label="Classes covered" value={totals.classes} icon={BookOpen} tone="amber" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search courses, codes, or teachers…"
            className="w-full sm:max-w-sm"
          />
          <Select
            value={teacherFilter}
            onChange={(event) => setTeacherFilter(event.target.value)}
            className="w-full sm:ml-auto sm:w-52"
          >
            <option value="">All teachers</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName}
              </option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={courses.length ? SearchX : BookOpen}
            title={courses.length ? 'No courses match your filters' : 'No courses yet'}
            description={
              courses.length
                ? 'Try a different course name, code, or teacher.'
                : 'Create a course to link teachers, classes, and schedules.'
            }
            action={
              courses.length ? (
                <Button variant="outline" onClick={() => { setSearch(''); setTeacherFilter('') }}>
                  Clear filters
                </Button>
              ) : canManage ? (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                  Create course
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="table-th">Course</th>
                  <th className="table-th">Teacher</th>
                  <th className="table-th">Classes</th>
                  <th className="table-th">Schedule</th>
                  <th className="table-th">Credits</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((course) => (
                  <tr key={course.id} className="transition hover:bg-slate-50/60">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: course.color }}
                        >
                          <BookOpen className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-slate-800">{course.name}</p>
                          <p className="font-mono text-[10px] text-slate-400">{course.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-[13px]">{course.teacherName}</td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1">
                        {course.classNames.slice(0, 3).map((name) => (
                          <span key={name} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                            {name}
                          </span>
                        ))}
                        {course.classNames.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{course.classNames.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="table-td">
                      {course.schedule?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {course.schedule.slice(0, 2).map((slot) => (
                            <Badge key={`${slot.day}-${slot.startTime}`} tone="neutral">
                              {slot.day.slice(0, 3)} {slot.startTime}
                            </Badge>
                          ))}
                          {course.schedule.length > 2 && (
                            <Badge tone="neutral">+{course.schedule.length - 2}</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="table-td">
                      <Badge tone="info">{course.credits} credits</Badge>
                    </td>
                    <td className="table-td">
                      {canManage ? (
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(course)
                              setFormOpen(true)
                            }}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Edit ${course.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(course)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${course.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="block text-right text-[11px] text-slate-400">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CourseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        course={editing}
        teachers={teachers}
        classes={classes}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete course"
        description={
          deleteTarget
            ? `Deleting ${deleteTarget.name} will remove it from ${deleteTarget.classNames.length} classes and any linked course schedules. Existing attendance history remains.`
            : ''
        }
        confirmLabel="Delete course"
      />
    </div>
  )
}
