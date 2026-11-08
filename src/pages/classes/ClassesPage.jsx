import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Pencil, Plus, School, SearchX, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { SearchInput } from '@/components/common/SearchInput'
import { StatCard } from '@/components/common/StatCard'
import { Avatar } from '@/components/common/Avatar'
import { Progress } from '@/components/common/Progress'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ClassFormModal } from '@/components/classes/ClassFormModal'
import { useClasses, useClassMutations } from '@/hooks/useClasses'
import { useTeachers } from '@/hooks/useTeachers'
import { useDashboard } from '@/hooks/useAnalytics'
import { useAuth } from '@/contexts/AuthContext'
import { formatPercent } from '@/utils/format'

export function ClassesPage() {
  const { role } = useAuth()
  const canManage = role === 'admin'
  const { data: classes = [], isLoading, isError, error, refetch } = useClasses()
  const { data: teachers = [] } = useTeachers()
  const { data: dashboard } = useDashboard()
  const { remove } = useClassMutations()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const classRates = useMemo(() => {
    const map = {}
    dashboard?.byClass?.forEach((entry) => {
      map[entry.id] = entry.rate
    })
    return map
  }, [dashboard])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return classes.filter(
      (cls) =>
        !term ||
        cls.name.toLowerCase().includes(term) ||
        cls.level.toLowerCase().includes(term) ||
        cls.room.toLowerCase().includes(term) ||
        cls.teacherName.toLowerCase().includes(term),
    )
  }, [classes, search])

  useEffect(() => {
    if (!formOpen) setEditing(null)
  }, [formOpen])

  const totals = useMemo(
    () => ({
      classes: classes.length,
      students: classes.reduce((sum, cls) => sum + cls.studentCount, 0),
      capacity: classes.reduce((sum, cls) => sum + cls.capacity, 0),
      courses: classes.reduce((sum, cls) => sum + cls.courseCount, 0),
    }),
    [classes],
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
        title="Classes"
        description="Organize cohorts, assign supervising teachers, and monitor class-level attendance."
        actions={
          canManage && (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              Create class
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total classes" value={totals.classes} icon={School} tone="brand" />
        <StatCard label="Students enrolled" value={totals.students} icon={Users} tone="green" />
        <StatCard
          label="Capacity utilization"
          value={formatPercent(totals.capacity ? (totals.students / totals.capacity) * 100 : 0, 0)}
          icon={Users}
          tone="brand"
          helper={`${totals.capacity} seats`}
        />
        <StatCard label="Active courses" value={totals.courses} icon={School} tone="amber" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search classes, rooms, or teachers…"
          className="w-full sm:max-w-sm"
        />
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">{filtered.length}</span> classes shown
        </p>
      </div>

      {isError ? (
        <Card>
          <ErrorState message={error?.message} onRetry={refetch} />
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-3 h-4 w-24" />
              <Skeleton className="mt-6 h-10 w-full" />
              <Skeleton className="mt-4 h-2 w-full" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={classes.length ? SearchX : School}
            title={classes.length ? 'No classes match your search' : 'No classes yet'}
            description={
              classes.length
                ? 'Try searching by class name, level, room, or teacher.'
                : 'Create a class to start organizing students and sessions.'
            }
            action={
              classes.length ? (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              ) : canManage ? (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                  Create class
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((cls) => {
            const rate = classRates[cls.id] ?? 0
            return (
              <Card
                key={cls.id}
                className="group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <div className="h-1 w-full bg-brand-600" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/classes/${cls.id}`}
                        className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-600"
                      >
                        {cls.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {cls.level} · Room {cls.room}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(cls)
                              setFormOpen(true)
                            }}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Edit ${cls.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(cls)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${cls.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      <Link
                        to={`/classes/${cls.id}`}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Open ${cls.name}`}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2.5">
                    <Avatar name={cls.teacherName} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-700">{cls.teacherName}</p>
                      <p className="text-[10px] text-slate-400">Supervising teacher</p>
                    </div>
                    <Badge tone="info" className="ml-auto">
                      {cls.courseCount} courses
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {cls.studentCount} / {cls.capacity} students
                      </span>
                      <span className="font-medium text-slate-600">
                        {formatPercent((cls.studentCount / cls.capacity) * 100, 0)} full
                      </span>
                    </div>
                    <Progress
                      value={(cls.studentCount / cls.capacity) * 100}
                      tone={cls.studentCount / cls.capacity > 0.9 ? 'warning' : 'brand'}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-[11px] text-slate-500">Class attendance</span>
                    <span className="text-xs font-semibold text-slate-800">{formatPercent(rate)}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <ClassFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        cls={editing}
        teachers={teachers}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete class"
        description={
          deleteTarget
            ? `Deleting ${deleteTarget.name} will unassign its ${deleteTarget.studentCount} students and remove it from courses. Attendance history is retained.`
            : ''
        }
        confirmLabel="Delete class"
      />
    </div>
  )
}
