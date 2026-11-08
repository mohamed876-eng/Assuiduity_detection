import { useEffect, useMemo, useState } from 'react'
import { Download, Plus, SearchX, Users } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/Select'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { TableSkeleton } from '@/components/common/Skeleton'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { StudentsTable } from '@/components/students/StudentsTable'
import { StudentFormModal } from '@/components/students/StudentFormModal'
import { useStudents, useStudentMutations } from '@/hooks/useStudents'
import { useClasses } from '@/hooks/useClasses'
import { useStudentSummaries } from '@/hooks/useAnalytics'
import { useAuth } from '@/contexts/AuthContext'
import { PAGE_SIZE } from '@/constants'
import { exportToCsv } from '@/utils/csv'
import { formatDate } from '@/utils/format'

export function StudentsPage() {
  const { role } = useAuth()
  const canManage = role === 'admin'
  const { data: students = [], isLoading, isError, error, refetch } = useStudents()
  const { data: classes = [] } = useClasses()
  const { data: summaries } = useStudentSummaries()
  const { remove } = useStudentMutations()

  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return students.filter((student) => {
      const matchesSearch =
        !term ||
        student.fullName.toLowerCase().includes(term) ||
        student.studentNumber.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
      const matchesClass = !classFilter || student.classId === classFilter
      const matchesStatus = !statusFilter || student.status === statusFilter
      return matchesSearch && matchesClass && matchesStatus
    })
  }, [students, search, classFilter, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, classFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (student) => {
    setEditing(student)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success(`${deleteTarget.fullName} was removed`)
      setDeleteTarget(null)
    } catch (deleteError) {
      toast.error(deleteError.message)
    }
  }

  const exportList = () => {
    exportToCsv(
      'smart-attendance-students',
      filtered,
      [
        { header: 'Student number', value: (row) => row.studentNumber },
        { header: 'Full name', value: (row) => row.fullName },
        { header: 'Email', value: (row) => row.email },
        { header: 'Class', value: (row) => row.className },
        { header: 'Enrollment date', value: (row) => formatDate(row.enrollmentDate) },
        { header: 'Status', value: (row) => row.status },
        { header: 'Attendance rate', value: (row) => `${summaries?.[row.id]?.rate ?? 0}%` },
        { header: 'Face status', value: (row) => row.faceStatus },
      ],
    )
    toast.success('Student list exported')
  }

  const clearFilters = () => {
    setSearch('')
    setClassFilter('')
    setStatusFilter('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Students"
        description="Manage student profiles, class assignments, and attendance performance."
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={exportList}
              disabled={!filtered.length}
            >
              Export CSV
            </Button>
            {canManage && (
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                Add student
              </Button>
            )}
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, student ID, or email…"
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-500">
          <span>
            <span className="font-medium text-slate-700">{filtered.length}</span> student
            {filtered.length === 1 ? '' : 's'}
            {students.length !== filtered.length ? ` of ${students.length}` : ''}
          </span>
          {!canManage && <span className="text-[11px] text-slate-400">Read-only teacher access</span>}
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={students.length ? SearchX : Users}
            title={students.length ? 'No students match your filters' : 'No students yet'}
            description={
              students.length
                ? 'Try a different search term or clear the class and status filters.'
                : 'Add your first student to start tracking attendance.'
            }
            action={
              students.length ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : canManage ? (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                  Add student
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <StudentsTable
              students={pageItems}
              summaries={summaries}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </Card>

      <StudentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        student={editing}
        classes={classes}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete student"
        description={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.fullName} (${deleteTarget.studentNumber}), their face registry entry, and attendance records. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete student"
      />
    </div>
  )
}
