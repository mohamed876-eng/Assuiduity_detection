import { useEffect, useMemo, useState } from 'react'
import { GraduationCap, Plus, SearchX } from 'lucide-react'
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
import { TeachersTable } from '@/components/teachers/TeachersTable'
import { TeacherFormModal } from '@/components/teachers/TeacherFormModal'
import { useTeachers, useTeacherMutations } from '@/hooks/useTeachers'
import { useClasses } from '@/hooks/useClasses'
import { PAGE_SIZE } from '@/constants'

export function TeachersPage() {
  const { data: teachers = [], isLoading, isError, error, refetch } = useTeachers()
  const { data: classes = [] } = useClasses()
  const { remove } = useTeacherMutations()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return teachers.filter((teacher) => {
      const matchesSearch =
        !term ||
        teacher.fullName.toLowerCase().includes(term) ||
        teacher.email.toLowerCase().includes(term) ||
        teacher.subject.toLowerCase().includes(term)
      const matchesStatus = !statusFilter || teacher.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [teachers, search, statusFilter])

  useEffect(() => setPage(1), [search, statusFilter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success(`${deleteTarget.fullName} was removed`)
      setDeleteTarget(null)
    } catch (deleteError) {
      toast.error(deleteError.message)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Teachers"
        description="Manage teaching staff, subject assignments, and class responsibilities."
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Add teacher
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, or subject…"
            className="w-full sm:max-w-sm"
          />
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-40 sm:ml-auto"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="on-leave">On leave</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <div className="px-4 py-2.5 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{filtered.length}</span> teacher
          {filtered.length === 1 ? '' : 's'}
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={teachers.length ? SearchX : GraduationCap}
            title={teachers.length ? 'No teachers match your filters' : 'No teachers yet'}
            description={
              teachers.length
                ? 'Try a different name, subject, or status filter.'
                : 'Add teaching staff to assign classes and courses.'
            }
            action={
              teachers.length ? (
                <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('') }}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    setEditing(null)
                    setFormOpen(true)
                  }}
                >
                  Add teacher
                </Button>
              )
            }
          />
        ) : (
          <>
            <TeachersTable
              teachers={pageItems}
              onEdit={(teacher) => {
                setEditing(teacher)
                setFormOpen(true)
              }}
              onDelete={setDeleteTarget}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </Card>

      <TeacherFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        teacher={editing}
        classes={classes}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete teacher"
        description={
          deleteTarget
            ? `This will remove ${deleteTarget.fullName}'s staff profile and unassign them from classes. Courses will need a new teacher.`
            : ''
        }
        confirmLabel="Delete teacher"
      />
    </div>
  )
}
