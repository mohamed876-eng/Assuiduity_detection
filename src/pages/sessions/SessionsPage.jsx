import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  CalendarDays,
  CirclePlay,
  MonitorPlay,
  Plus,
  Radio,
  SearchX,
  Square,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/Select'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Progress } from '@/components/common/Progress'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { TableSkeleton } from '@/components/common/Skeleton'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SessionFormModal } from '@/components/sessions/SessionFormModal'
import { useSessions, useSessionMutations } from '@/hooks/useSessions'
import { useClasses } from '@/hooks/useClasses'
import { useCourses } from '@/hooks/useCourses'
import { useTeachers } from '@/hooks/useTeachers'
import { PAGE_SIZE } from '@/constants'
import { formatDate } from '@/utils/format'

export function SessionsPage() {
  const { data: sessions = [], isLoading, isError, error, refetch } = useSessions()
  const { data: classes = [] } = useClasses()
  const { data: courses = [] } = useCourses()
  const { data: teachers = [] } = useTeachers()
  const { start, stop } = useSessionMutations()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [stopTarget, setStopTarget] = useState(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sessions.filter((session) => {
      const matchesSearch =
        !term ||
        session.courseName.toLowerCase().includes(term) ||
        session.className.toLowerCase().includes(term) ||
        session.teacherName.toLowerCase().includes(term)
      const matchesStatus = !statusFilter || session.status === statusFilter
      const matchesClass = !classFilter || session.classId === classFilter
      return matchesSearch && matchesStatus && matchesClass
    })
  }, [sessions, search, statusFilter, classFilter])

  const counts = useMemo(() => {
    const base = { active: 0, scheduled: 0, completed: 0 }
    sessions.forEach((session) => {
      base[session.status] = (base[session.status] ?? 0) + 1
    })
    return base
  }, [sessions])

  const averageRate = useMemo(() => {
    const completed = sessions.filter((session) => session.status === 'completed' && session.recorded > 0)
    if (!completed.length) return 0
    return completed.reduce((sum, session) => sum + session.attendanceRate, 0) / completed.length
  }, [sessions])

  useEffect(() => setPage(1), [search, statusFilter, classFilter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleStart = async (session) => {
    try {
      await start.mutateAsync(session.id)
      toast.success(`Session started: ${session.courseName}`)
    } catch (error_) {
      toast.error(error_.message)
    }
  }

  const handleStop = async () => {
    try {
      await stop.mutateAsync(stopTarget.id)
      toast.success('Session completed and attendance finalized')
      setStopTarget(null)
    } catch (error_) {
      toast.error(error_.message)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sessions"
        description="Create attendance windows, control live sessions, and review final attendance results."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
            New session
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Live now" value={counts.active} icon={Radio} tone="green" helper="Detection windows open" />
        <StatCard label="Scheduled" value={counts.scheduled} icon={CalendarClock} tone="brand" />
        <StatCard label="Completed" value={counts.completed} icon={CalendarDays} tone="slate" />
        <StatCard label="Average attendance" value={`${averageRate.toFixed(1)}%`} icon={CirclePlay} tone="brand" helper="Completed sessions" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by course, class, or teacher…"
            className="w-full lg:max-w-sm"
          />
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="w-40">
              <option value="">All classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-36">
              <option value="">All statuses</option>
              <option value="active">Live</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={sessions.length ? SearchX : CalendarClock}
            title={sessions.length ? 'No sessions match your filters' : 'No sessions yet'}
            description={
              sessions.length
                ? 'Adjust the class or status filters to see more sessions.'
                : 'Create an attendance session to start tracking a class.'
            }
            action={
              sessions.length ? (
                <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter(''); setClassFilter('') }}>
                  Clear filters
                </Button>
              ) : (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                  New session
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="table-th">Session</th>
                    <th className="table-th">Class · Teacher</th>
                    <th className="table-th">Schedule</th>
                    <th className="table-th">Attendance</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((session) => (
                    <tr key={session.id} className="transition hover:bg-slate-50/60">
                      <td className="table-td">
                        <p className="text-[13px] font-medium text-slate-800">{session.courseName}</p>
                        <p className="font-mono text-[10px] text-slate-400">{session.courseCode}</p>
                      </td>
                      <td className="table-td">
                        <p className="text-xs text-slate-700">{session.className}</p>
                        <p className="text-[10px] text-slate-400">{session.teacherName}</p>
                      </td>
                      <td className="table-td whitespace-nowrap">
                        <p className="text-xs text-slate-700">{formatDate(session.date)}</p>
                        <p className="text-[10px] text-slate-400">
                          {session.startTime}–{session.endTime} · {session.room}
                        </p>
                      </td>
                      <td className="table-td">
                        {session.recorded ? (
                          <div className="w-32">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-500">
                                {session.counts.present + session.counts.late}/{session.studentCount}
                              </span>
                              <span className="font-semibold text-slate-700">{session.attendanceRate}%</span>
                            </div>
                            <Progress
                              value={session.attendanceRate}
                              tone={session.attendanceRate >= 90 ? 'success' : session.attendanceRate >= 75 ? 'brand' : 'warning'}
                              className="mt-1"
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No records</span>
                        )}
                      </td>
                      <td className="table-td">
                        <StatusBadge
                          status={session.status}
                          label={session.status === 'active' ? 'Live' : undefined}
                        />
                      </td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1">
                          {session.status === 'scheduled' && (
                            <Button
                              size="xs"
                              variant="success"
                              leftIcon={<CirclePlay className="h-3 w-3" />}
                              onClick={() => handleStart(session)}
                              loading={start.isPending && start.variables === session.id}
                            >
                              Start
                            </Button>
                          )}
                          {session.status === 'active' && (
                            <>
                              <Link to="/detection">
                                <Button size="xs" variant="soft" leftIcon={<MonitorPlay className="h-3 w-3" />}>
                                  Monitor
                                </Button>
                              </Link>
                              <Button
                                size="xs"
                                variant="danger"
                                leftIcon={<Square className="h-3 w-3" />}
                                onClick={() => setStopTarget(session)}
                              >
                                Stop
                              </Button>
                            </>
                          )}
                          <Link to={`/attendance?session=${session.id}`}>
                            <Button size="xs" variant="outline">
                              Results
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </Card>

      <SessionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        classes={classes}
        courses={courses}
        teachers={teachers}
      />

      <ConfirmDialog
        open={Boolean(stopTarget)}
        onClose={() => setStopTarget(null)}
        onConfirm={handleStop}
        loading={stop.isPending}
        title="Stop session"
        description={
          stopTarget
            ? `Stopping “${stopTarget.courseName} — ${stopTarget.className}” closes the detection window. Students without a recognition event will be automatically marked absent.`
            : ''
        }
        confirmLabel="Stop session"
        tone="danger"
      />
    </div>
  )
}
