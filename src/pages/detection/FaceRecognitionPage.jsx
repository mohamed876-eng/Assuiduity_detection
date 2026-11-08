import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock3,
  ScanFace,
  SearchX,
  ShieldCheck,
  UserRoundX,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { SearchInput } from '@/components/common/SearchInput'
import { Select } from '@/components/common/Select'
import { StatCard } from '@/components/common/StatCard'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Progress } from '@/components/common/Progress'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { FaceRegistrationModal } from '@/components/detection/FaceRegistrationModal'
import { useFaces } from '@/hooks/useFaceRegistry'
import { useStudents } from '@/hooks/useStudents'
import { useClasses } from '@/hooks/useClasses'
import { formatDate, formatPercent } from '@/utils/format'

const ACTION_LABELS = {
  registered: 'Submit new image',
  pending: 'Re-submit image',
  not_registered: 'Register face',
  failed: 'Retry capture',
}

export function FaceRecognitionPage() {
  const [searchParams] = useSearchParams()
  const { data: faces = [], isLoading, isError, error, refetch } = useFaces()
  const { data: students = [] } = useStudents()
  const { data: classes = [] } = useClasses()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStudent, setModalStudent] = useState('')

  useEffect(() => {
    const studentParam = searchParams.get('student')
    if (studentParam) {
      setModalStudent(studentParam)
      setModalOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const counts = { registered: 0, pending: 0, not_registered: 0, failed: 0 }
    faces.forEach((face) => {
      counts[face.status] = (counts[face.status] ?? 0) + 1
    })
    return counts
  }, [faces])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return faces.filter((face) => {
      const matchesSearch =
        !term ||
        face.studentName.toLowerCase().includes(term) ||
        face.studentNumber.toLowerCase().includes(term)
      const matchesStatus = !statusFilter || face.status === statusFilter
      const matchesClass = !classFilter || face.classId === classFilter
      return matchesSearch && matchesStatus && matchesClass
    })
  }, [faces, search, statusFilter, classFilter])

  useEffect(() => setPage(1), [search, statusFilter, classFilter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / 12))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])
  const pageItems = filtered.slice((page - 1) * 12, page * 12)

  const openForStudent = (studentId = '') => {
    setModalStudent(studentId)
    setModalOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Face registry"
        description="Track biometric registration status and submit capture images for backend processing."
        actions={
          <Button leftIcon={<Camera className="h-4 w-4" />} onClick={() => openForStudent('')}>
            Register a face
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <div className="text-[11px] leading-relaxed text-brand-800">
          <p className="font-semibold">Capture happens here. Recognition happens on the backend.</p>
          <p className="mt-0.5 text-brand-700/80">
            This module never runs facial recognition in the browser. Images are only captured and
            submitted to a future FastAPI endpoint; templates and matching are handled by the backend.
            New submissions stay <strong>Pending review</strong> in this prototype.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Registered" value={stats.registered} icon={CheckCircle2} tone="green" helper="Backend templates on file" />
        <StatCard label="Pending review" value={stats.pending} icon={Clock3} tone="amber" helper="Awaiting backend processing" />
        <StatCard label="Not registered" value={stats.not_registered} icon={UserRoundX} tone="slate" helper="No biometric template" />
        <StatCard label="Needs retry" value={stats.failed} icon={AlertTriangle} tone="red" helper="Failed quality checks" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by student name or ID…"
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
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-44">
              <option value="">All statuses</option>
              <option value="registered">Registered</option>
              <option value="pending">Pending review</option>
              <option value="not_registered">Not registered</option>
              <option value="failed">Needs retry</option>
            </Select>
          </div>
        </div>
        <div className="px-4 py-2.5 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{filtered.length}</span> of {faces.length} students shown
        </div>

        {isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-2 w-full" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={faces.length ? SearchX : ScanFace}
            title={faces.length ? 'No face records match your filters' : 'No face records'}
            description={
              faces.length
                ? 'Try another student name, class, or status.'
                : 'Add students to begin building the face registry.'
            }
            action={
              faces.length ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('')
                    setClassFilter('')
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button leftIcon={<Camera className="h-4 w-4" />} onClick={() => openForStudent('')}>
                  Register a face
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((face) => (
              <Card
                key={face.id}
                className="flex flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar name={face.studentName} size="lg" />
                    <span className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand-600 shadow">
                      <ScanFace className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/students/${face.studentId}`}
                      className="block truncate text-[13px] font-semibold text-slate-800 hover:text-brand-600"
                    >
                      {face.studentName}
                    </Link>
                    <p className="truncate font-mono text-[10px] text-slate-400">{face.studentNumber}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">{face.className}</p>
                  </div>
                  <StatusBadge status={face.status} />
                </div>

                <div className="mt-4 space-y-2 rounded-lg bg-slate-50/80 px-3 py-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Template quality</span>
                    <span className="font-medium text-slate-700">
                      {face.quality ? formatPercent(face.quality * 100, 0) : '—'}
                    </span>
                  </div>
                  <Progress
                    value={(face.quality ?? 0) * 100}
                    tone={(face.quality ?? 0) >= 0.85 ? 'success' : (face.quality ?? 0) >= 0.6 ? 'warning' : 'danger'}
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Samples</span>
                    <span className="font-medium text-slate-700">{face.samples ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Registered</span>
                    <span className="font-medium text-slate-700">{formatDate(face.registeredAt)}</span>
                  </div>
                </div>

                <p className="mt-2.5 line-clamp-2 min-h-[2rem] text-[10px] leading-relaxed text-slate-400">
                  {face.notes || 'No notes.'}
                </p>

                <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <Link to={`/students/${face.studentId}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View profile
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant={face.status === 'registered' ? 'ghost' : 'soft'}
                    leftIcon={<Camera className="h-3.5 w-3.5" />}
                    onClick={() => openForStudent(face.studentId)}
                  >
                    {ACTION_LABELS[face.status] ?? 'Manage'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filtered.length > 12 && (
          <Pagination page={page} pageSize={12} total={filtered.length} onPageChange={setPage} />
        )}
      </Card>

      <FaceRegistrationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setModalStudent('')
        }}
        students={students}
        initialStudentId={modalStudent}
      />
    </div>
  )
}
