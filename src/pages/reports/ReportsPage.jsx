import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import {
  ArrowUpRight,
  CalendarRange,
  Download,
  FileSpreadsheet,
  SearchX,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { StatCard } from '@/components/common/StatCard'
import { Tabs } from '@/components/common/Tabs'
import { SearchInput } from '@/components/common/SearchInput'
import { Progress } from '@/components/common/Progress'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton, TableSkeleton } from '@/components/common/Skeleton'
import { MonthlyChart } from '@/components/dashboard/MonthlyChart'
import { useReport, useDashboard } from '@/hooks/useAnalytics'
import { exportToCsv } from '@/utils/csv'
import { formatPercent } from '@/utils/format'

const TABS = [
  { value: 'students', label: 'By student' },
  { value: 'classes', label: 'By class' },
  { value: 'courses', label: 'By course' },
]

const PAGE_SIZE = 8
const DEFAULT_FROM = format(subDays(new Date(), 29), 'yyyy-MM-dd')
const DEFAULT_TO = format(new Date(), 'yyyy-MM-dd')

export function ReportsPage() {
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [tab, setTab] = useState('students')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard()
  const { data: report, isLoading, isError, error, refetch } = useReport({ from, to })

  const rangeInvalid = Boolean(from && to && from > to)

  useEffect(() => setPage(1), [tab, search, from, to])

  const tabRows = useMemo(() => {
    if (!report) return []
    if (tab === 'classes') return report.byClass
    if (tab === 'courses') return report.byCourse
    const term = search.trim().toLowerCase()
    if (!term) return report.byStudent
    return report.byStudent.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.studentNumber?.toLowerCase().includes(term) ||
        row.className?.toLowerCase().includes(term),
    )
  }, [report, tab, search])

  const totalPages = Math.max(1, Math.ceil(tabRows.length / PAGE_SIZE))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])
  const pageRows = tabRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const maxAbsent = Math.max(1, ...(report?.absenceStats?.map((row) => row.absent) ?? [1]))
  const maxLate = Math.max(1, ...(report?.lateStats?.map((row) => row.late) ?? [1]))

  const applyPreset = (days) => {
    setFrom(format(subDays(new Date(), days - 1), 'yyyy-MM-dd'))
    setTo(format(new Date(), 'yyyy-MM-dd'))
  }

  const exportRecords = () => {
    if (!report?.records?.length) return
    exportToCsv(`attendance-report-${from}-to-${to}`, report.records, [
      { header: 'Student', value: (row) => row.studentName },
      { header: 'Student number', value: (row) => row.studentNumber },
      { header: 'Class', value: (row) => row.className },
      { header: 'Course', value: (row) => row.courseName },
      { header: 'Date', value: (row) => row.date },
      { header: 'Time', value: (row) => row.time ?? '' },
      { header: 'Status', value: (row) => row.status },
      { header: 'Confidence', value: (row) => row.confidence ?? '' },
    ])
    toast.success('Detailed report exported')
  }

  const exportSummary = () => {
    if (!tabRows.length) return
    exportToCsv(`attendance-summary-${tab}-${from}-to-${to}`, tabRows, [
      { header: tab === 'students' ? 'Student' : tab === 'classes' ? 'Class' : 'Course', value: (row) => row.name },
      { header: 'Student number', value: (row) => row.studentNumber ?? '' },
      { header: 'Total records', value: (row) => row.total },
      { header: 'Present', value: (row) => row.present },
      { header: 'Absent', value: (row) => row.absent },
      { header: 'Late', value: (row) => row.late },
      { header: 'Excused', value: (row) => row.excused },
      { header: 'Rate', value: (row) => `${row.rate}%` },
    ])
    toast.success('Summary report exported')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports & analytics"
        description="Analyze attendance performance by student, class, and course, then export the results."
        actions={
          <Button
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={exportRecords}
            disabled={!report?.records?.length}
          >
            Export detailed CSV
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700" htmlFor="report-from">
                From
              </label>
              <input
                id="report-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
                className="input-base w-40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700" htmlFor="report-to">
                To
              </label>
              <input
                id="report-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
                className="input-base w-40"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pb-0.5">
              <Button size="sm" variant="outline" onClick={() => applyPreset(7)}>
                Last 7 days
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyPreset(30)}>
                Last 30 days
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyPreset(90)}>
                Last 90 days
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 xl:ml-auto">
            <CalendarRange className="h-3.5 w-3.5" />
            {report?.totals ? (
              <span>
                {report.totals.total} records · {report.totals.present + report.totals.late} attended
              </span>
            ) : (
              <span>Loading range…</span>
            )}
          </div>
        </div>
        {rangeInvalid && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            The start date must be before the end date.
          </p>
        )}
      </Card>

      {isError ? (
        <Card>
          <ErrorState message={error?.message} onRetry={refetch} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Overall attendance rate"
              value={formatPercent(report?.totals?.rate ?? 0)}
              icon={TrendingUp}
              tone="brand"
              helper={`${report?.totals?.total ?? 0} records`}
              loading={isLoading}
            />
            <StatCard
              label="Present"
              value={report?.totals?.present ?? 0}
              tone="green"
              helper={`${report?.totals?.late ?? 0} late arrivals`}
              loading={isLoading}
            />
            <StatCard
              label="Absences"
              value={report?.totals?.absent ?? 0}
              tone="red"
              helper={`${report?.totals?.excused ?? 0} excused`}
              loading={isLoading}
            />
            <StatCard
              label="Late arrivals"
              value={report?.totals?.late ?? 0}
              tone="amber"
              helper="Within selected range"
              loading={isLoading}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <MonthlyChart data={dashboard?.monthly} loading={dashboardLoading} />
            </div>
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Absence statistics</CardTitle>
                    <CardDescription>Students with the most absences</CardDescription>
                  </div>
                </CardHeader>
                <div className="space-y-2.5 px-5 pb-5">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-8 w-full" />)
                  ) : !report?.absenceStats?.length ? (
                    <p className="text-xs text-slate-400">No absences in this range.</p>
                  ) : (
                    report.absenceStats.slice(0, 5).map((row) => (
                      <Link
                        key={row.id}
                        to={`/attendance?student=${row.id}`}
                        className="block rounded-lg px-1 py-1 transition hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="truncate text-slate-600">{row.name}</span>
                          <span className="ml-2 font-semibold text-slate-800">{row.absent}</span>
                        </div>
                        <Progress
                          value={(row.absent / maxAbsent) * 100}
                          tone="danger"
                          className="mt-1"
                        />
                      </Link>
                    ))
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Late arrival statistics</CardTitle>
                    <CardDescription>Students with the most late records</CardDescription>
                  </div>
                </CardHeader>
                <div className="space-y-2.5 px-5 pb-5">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-8 w-full" />)
                  ) : !report?.lateStats?.length ? (
                    <p className="text-xs text-slate-400">No late arrivals in this range.</p>
                  ) : (
                    report.lateStats.slice(0, 5).map((row) => (
                      <Link
                        key={row.id}
                        to={`/attendance?student=${row.id}`}
                        className="block rounded-lg px-1 py-1 transition hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="truncate text-slate-600">{row.name}</span>
                          <span className="ml-2 font-semibold text-slate-800">{row.late}</span>
                        </div>
                        <Progress
                          value={(row.late / maxLate) * 100}
                          tone="warning"
                          className="mt-1"
                        />
                      </Link>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Attendance breakdown</CardTitle>
                <CardDescription>Aggregated from records in the selected range</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Tabs tabs={TABS} value={tab} onChange={setTab} />
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FileSpreadsheet className="h-3.5 w-3.5" />}
                  onClick={exportSummary}
                  disabled={!tabRows.length}
                >
                  Export summary
                </Button>
              </div>
            </CardHeader>

            {tab === 'students' && (
              <div className="px-5 pb-3">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search students in this report…"
                  className="w-full sm:max-w-xs"
                />
              </div>
            )}

            {isLoading ? (
              <TableSkeleton rows={6} columns={6} />
            ) : tabRows.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No data for this report"
                description={
                  rangeInvalid
                    ? 'Fix the date range to load report data.'
                    : 'There are no attendance records matching this range and filter.'
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px]">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="table-th">
                          {tab === 'students' ? 'Student' : tab === 'classes' ? 'Class' : 'Course'}
                        </th>
                        <th className="table-th">Records</th>
                        <th className="table-th">Present</th>
                        <th className="table-th">Absent</th>
                        <th className="table-th">Late</th>
                        <th className="table-th">Attendance rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pageRows.map((row) => (
                        <tr key={row.id} className="transition hover:bg-slate-50/60">
                          <td className="table-td">
                            {tab === 'students' ? (
                              <Link
                                to={`/students/${row.id}`}
                                className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-800 hover:text-brand-600"
                              >
                                {row.name}
                                <ArrowUpRight className="h-3 w-3 text-slate-300" />
                              </Link>
                            ) : (
                              <span className="text-[13px] font-medium text-slate-800">{row.name}</span>
                            )}
                            {tab === 'students' && (
                              <p className="text-[10px] text-slate-400">
                                {row.studentNumber} · {row.className}
                              </p>
                            )}
                          </td>
                          <td className="table-td text-xs">{row.total}</td>
                          <td className="table-td text-xs font-medium text-emerald-600">{row.present}</td>
                          <td className="table-td text-xs font-medium text-rose-600">{row.absent}</td>
                          <td className="table-td text-xs font-medium text-amber-600">{row.late}</td>
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    row.rate >= 90 ? 'bg-emerald-500' : row.rate >= 80 ? 'bg-brand-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(100, row.rate)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-700">
                                {formatPercent(row.rate)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={PAGE_SIZE} total={tabRows.length} onPageChange={setPage} />
              </>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
