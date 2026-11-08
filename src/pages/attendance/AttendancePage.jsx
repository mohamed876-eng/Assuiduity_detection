import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ClipboardCheck,
  Download,
  Pencil,
  SearchX,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/Select'
import { Badge } from '@/components/common/Badge'
import { StatCard } from '@/components/common/StatCard'
import { Pagination } from '@/components/common/Pagination'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { TableSkeleton } from '@/components/common/Skeleton'
import { AttendanceCorrectionModal } from '@/components/attendance/AttendanceCorrectionModal'
import { useAttendance } from '@/hooks/useAttendance'
import { useClasses } from '@/hooks/useClasses'
import { useCourses } from '@/hooks/useCourses'
import { useSessions } from '@/hooks/useSessions'
import { useStudents } from '@/hooks/useStudents'
import { PAGE_SIZE } from '@/constants'
import { exportToCsv } from '@/utils/csv'
import { formatConfidence, formatDate } from '@/utils/format'

export function AttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const studentParam = searchParams.get('student') ?? ''
  const sessionParam = searchParams.get('session') ?? ''
  const classParam = searchParams.get('class') ?? ''

  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState(classParam)
  const [courseFilter, setCourseFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [studentFilter, setStudentFilter] = useState(studentParam)
  const [sessionFilter, setSessionFilter] = useState(sessionParam)
  const [page, setPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)

  const { data: classes = [] } = useClasses()
  const { data: courses = [] } = useCourses()
  const { data: sessions = [] } = useSessions()
  const { data: students = [] } = useStudents()

  const { data: records = [], isLoading, isError, error, refetch } = useAttendance({
    classId: classFilter || undefined,
    courseId: courseFilter || undefined,
    date: dateFilter || undefined,
    status: statusFilter || undefined,
    studentId: studentFilter || undefined,
    sessionId: sessionFilter || undefined,
  })

  useEffect(() => {
    setStudentFilter(studentParam)
    setSessionFilter(sessionParam)
    setClassFilter(classParam)
    setPage(1)
  }, [studentParam, sessionParam, classParam])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return records
    return records.filter(
      (record) =>
        record.studentName.toLowerCase().includes(term) ||
        record.studentNumber.toLowerCase().includes(term) ||
        record.courseName.toLowerCase().includes(term),
    )
  }, [records, search])

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0 }
    filtered.forEach((record) => {
      counts[record.status] = (counts[record.status] ?? 0) + 1
    })
    return { ...counts, total: filtered.length }
  }, [filtered])

  useEffect(() => setPage(1), [search, classFilter, courseFilter, dateFilter, statusFilter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeStudent = students.find((student) => student.id === studentFilter)
  const activeSession = sessions.find((session) => session.id === sessionFilter)

  const hasFilters =
    search || classFilter || courseFilter || dateFilter || statusFilter || studentFilter || sessionFilter

  const clearAll = () => {
    setSearch('')
    setClassFilter('')
    setCourseFilter('')
    setDateFilter('')
    setStatusFilter('')
    setStudentFilter('')
    setSessionFilter('')
    setSearchParams({})
  }

  const clearChip = (key) => {
    const next = new URLSearchParams(searchParams)
    next.delete(key)
    setSearchParams(next)
    if (key === 'student') setStudentFilter('')
    if (key === 'session') setSessionFilter('')
    if (key === 'class') setClassFilter('')
  }

  const exportRecords = () => {
    exportToCsv('smart-attendance-records', filtered, [
      { header: 'Student', value: (row) => row.studentName },
      { header: 'Student number', value: (row) => row.studentNumber },
      { header: 'Class', value: (row) => row.className },
      { header: 'Course', value: (row) => row.courseName },
      { header: 'Date', value: (row) => row.date },
      { header: 'Time', value: (row) => row.time ?? '' },
      { header: 'Status', value: (row) => row.status },
      { header: 'Confidence', value: (row) => row.confidence ?? '' },
      { header: 'Method', value: (row) => row.method },
      { header: 'Note', value: (row) => row.note ?? '' },
    ])
    toast.success(`${filtered.length} attendance records exported`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        description="Review, filter, correct, and export attendance records across all sessions."
        actions={
          <Button
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={exportRecords}
            disabled={!filtered.length}
          >
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Records" value={summary.total} icon={ClipboardCheck} tone="brand" helper="Matching filters" />
        <StatCard label="Present" value={summary.present} tone="green" helper="Including late arrivals" />
        <StatCard label="Absent" value={summary.absent} tone="red" />
        <StatCard label="Late" value={summary.late} tone="amber" />
      </div>

      <Card>
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by student, ID, or course…"
              className="w-full lg:max-w-sm"
            />
            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="w-36">
                <option value="">All classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </Select>
              <Select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="w-40">
                <option value="">All courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Select>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="input-base w-36"
                aria-label="Filter by date"
              />
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-32">
                <option value="">All statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </Select>
            </div>
          </div>

          {(activeStudent || activeSession || classParam) && (
            <div className="flex flex-wrap items-center gap-2">
              {activeStudent && (
                <Badge tone="info" className="gap-1.5">
                  <UserRound className="h-3 w-3" />
                  {activeStudent.fullName}
                  <button type="button" onClick={() => clearChip('student')} aria-label="Clear student filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeSession && (
                <Badge tone="neutral" className="gap-1.5">
                  Session: {activeSession.courseName} · {activeSession.className}
                  <button type="button" onClick={() => clearChip('session')} aria-label="Clear session filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {classParam && (
                <Badge tone="neutral" className="gap-1.5">
                  Class filter active
                  <button type="button" onClick={() => clearChip('class')} aria-label="Clear class filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              <span className="font-medium text-slate-700">{filtered.length}</span> records
            </span>
            {hasFilters && (
              <button type="button" onClick={clearAll} className="font-medium text-brand-600 hover:text-brand-700">
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={hasFilters ? SearchX : ClipboardCheck}
            title={hasFilters ? 'No attendance records match' : 'No attendance records'}
            description={
              hasFilters
                ? 'Try adjusting the filters or clear them to see all records.'
                : 'Records will appear after a detection session or manual entry.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearAll}>
                  Clear filters
                </Button>
              ) : (
                <Link to="/detection">
                  <Button>Start detection</Button>
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="table-th">Student</th>
                    <th className="table-th">Student ID</th>
                    <th className="table-th">Class</th>
                    <th className="table-th">Course</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Time</th>
                    <th className="table-th">Confidence</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((record) => (
                    <tr key={record.id} className="transition hover:bg-slate-50/60">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={record.studentName} size="sm" />
                          <Link
                            to={`/students/${record.studentId}`}
                            className="truncate text-[13px] font-medium text-slate-800 hover:text-brand-600"
                          >
                            {record.studentName}
                          </Link>
                        </div>
                      </td>
                      <td className="table-td font-mono text-[11px] text-slate-500">{record.studentNumber}</td>
                      <td className="table-td text-xs">{record.className}</td>
                      <td className="table-td">
                        <p className="text-[13px] text-slate-700">{record.courseName}</p>
                        <p className="text-[10px] text-slate-400">{record.teacherName}</p>
                      </td>
                      <td className="table-td whitespace-nowrap text-xs">{formatDate(record.date)}</td>
                      <td className="table-td font-mono text-[11px]">{record.time ?? '—'}</td>
                      <td className="table-td text-xs">{formatConfidence(record.confidence)}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={record.status} />
                          {record.method === 'manual' && (
                            <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-medium text-slate-500">
                              Manual
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Manage
                          </button>
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

      <AttendanceCorrectionModal
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />
    </div>
  )
}
