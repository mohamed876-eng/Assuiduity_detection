import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Camera,
  Clock3,
  GraduationCap,
  Play,
  Radio,
  RefreshCw,
  Square,
  Timer,
  Users,
  Video,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { CameraPreview } from '@/components/detection/CameraPreview'
import { RecognitionFeed } from '@/components/detection/RecognitionFeed'
import { RecognitionHistory } from '@/components/detection/RecognitionHistory'
import { DetectionStats } from '@/components/detection/DetectionStats'
import { useSessions } from '@/hooks/useSessions'
import { useStudents } from '@/hooks/useStudents'
import { useCamera } from '@/hooks/useCamera'
import { useDetection } from '@/hooks/useDetection'
import { attendanceService } from '@/services/api/attendanceService'
import { notificationService } from '@/services/api/notificationService'
import { DETECTION_MODE } from '@/constants'
import { cn } from '@/lib/cn'

function formatElapsed(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const base = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${base}` : base
}

function StatusPill({ label, tone, icon: Icon, dot = true }) {
  const tones = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    danger: 'bg-rose-50 text-rose-700 ring-rose-600/10',
    neutral: 'bg-slate-100 text-slate-600 ring-slate-500/10',
    info: 'bg-brand-50 text-brand-700 ring-brand-600/10',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ring-inset',
        tones[tone],
      )}
    >
      {Icon ? <Icon className="h-3 w-3" /> : dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {label}
    </span>
  )
}

export function LiveDetectionPage() {
  const queryClient = useQueryClient()
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions()
  const { data: students = [] } = useStudents()
  const { stream, status: cameraStatus, error: cameraError, devices, startCamera, stopCamera } = useCamera()
  const [sessionId, setSessionId] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const processedEvents = useRef(new Set())

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === sessionId) ?? null,
    [sessions, sessionId],
  )

  const todayKey = format(new Date(), 'yyyy-MM-dd')
  const sessionOptions = useMemo(() => {
    const priority = { active: 0, scheduled: 1, completed: 2 }
    return sessions
      .filter(
        (session) =>
          session.status === 'active' || session.status === 'scheduled' || session.date === todayKey,
      )
      .sort((a, b) => {
        const difference = (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
        if (difference !== 0) return difference
        return `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)
      })
      .slice(0, 25)
  }, [sessions, todayKey])

  useEffect(() => {
    if (!sessions.length) return
    if (sessionId && sessions.some((session) => session.id === sessionId)) return
    const preferred =
      sessions.find((session) => session.status === 'active') ||
      sessions.find((session) => session.date === todayKey && session.status === 'scheduled') ||
      sessions.find((session) => session.date === todayKey) ||
      sessions[0]
    if (preferred) setSessionId(preferred.id)
  }, [sessions, sessionId, todayKey])

  const pool = useMemo(
    () =>
      selectedSession
        ? students.filter(
            (student) => student.classId === selectedSession.classId && student.status === 'active',
          )
        : [],
    [students, selectedSession],
  )

  const getPool = useCallback(() => pool, [pool])

  const handleWarning = useCallback(
    (warning) => {
      toast.warning(warning.title, { description: warning.message })
      notificationService.add({
        type: warning.title?.toLowerCase().includes('backend') ? 'backend' : 'detection',
        severity: 'warning',
        title: warning.title,
        message: warning.message,
      })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    [queryClient],
  )

  const detection = useDetection({ getStudents: getPool, onWarning: handleWarning })
  const { status, events } = detection
  const detectionStatus = status.detection
  const isActive = detectionStatus === 'active'
  const isBusy = detectionStatus === 'starting' || detectionStatus === 'stopping'

  useEffect(() => {
    processedEvents.current.clear()
    detection.clearEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  useEffect(() => {
    if (detectionStatus === 'active') {
      setStartedAt((current) => current ?? Date.now())
    } else if (detectionStatus === 'idle') {
      setStartedAt(null)
      setElapsed(0)
    }
  }, [detectionStatus])

  useEffect(() => {
    if (!startedAt) return undefined
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startedAt])

  useEffect(() => {
    events.forEach((entry) => {
      if (processedEvents.current.has(entry.id)) return
      processedEvents.current.add(entry.id)
      if (!entry.accepted || !selectedSession) return
      const event = entry.event
      if (!['present', 'late', 'excused'].includes(event.status)) return
      attendanceService.markFromDetection({
        studentId: event.student_id,
        sessionId: selectedSession.id,
        classId: selectedSession.classId,
        courseId: selectedSession.courseId,
        teacherId: selectedSession.teacherId,
        date: selectedSession.date,
        timestamp: event.timestamp,
        status: event.status,
        confidence: event.confidence,
      })
      notificationService.add({
        type: 'recognition',
        severity: 'success',
        title: 'Face recognized',
        message: `${event.student_name} was marked ${event.status} in ${selectedSession.courseName}.`,
        studentId: event.student_id,
      })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })
  }, [events, selectedSession, queryClient])

  useEffect(() => () => stopCamera(), [stopCamera])

  const recognized = useMemo(() => {
    const map = new Map()
    events
      .filter((entry) => entry.accepted)
      .forEach((entry) => {
        if (!map.has(entry.event.student_id)) map.set(entry.event.student_id, entry.event)
      })
    return [...map.values()]
  }, [events])

  const stats = useMemo(() => {
    return {
      detected: recognized.length,
      present: recognized.filter((event) => event.status === 'present').length,
      late: recognized.filter((event) => event.status === 'late').length,
      absent: Math.max(0, pool.length - recognized.length),
    }
  }, [recognized, pool.length])

  const progress = pool.length ? (recognized.length / pool.length) * 100 : 0
  const lastAccepted = events.find((entry) => entry.accepted)

  const cameraTone =
    cameraStatus === 'connected'
      ? 'success'
      : cameraStatus === 'connecting'
        ? 'warning'
        : cameraStatus === 'denied' || cameraStatus === 'error' || cameraStatus === 'unavailable'
          ? 'danger'
          : 'neutral'
  const cameraLabel =
    cameraStatus === 'connected'
      ? 'Camera connected'
      : cameraStatus === 'connecting'
        ? 'Connecting camera'
        : cameraStatus === 'denied'
          ? 'Camera denied'
          : cameraStatus === 'error' || cameraStatus === 'unavailable'
            ? 'Camera error'
            : 'Camera disconnected'

  const detectionTone =
    detectionStatus === 'active'
      ? 'success'
      : detectionStatus === 'error'
        ? 'danger'
        : detectionStatus === 'starting' || detectionStatus === 'stopping'
          ? 'warning'
          : 'neutral'
  const detectionLabel = {
    idle: 'Detection stopped',
    starting: 'Starting detection',
    active: 'Detection active',
    stopping: 'Stopping detection',
    error: 'Detection error',
  }[detectionStatus]

  const backendTone =
    status.backend === 'connected'
      ? 'success'
      : status.backend === 'connecting'
        ? 'warning'
        : 'danger'

  const startDetection = () => {
    if (!selectedSession) {
      toast.error('Select a session before starting detection.')
      return
    }
    if (!pool.length) {
      toast.error('This class has no active students to detect.')
      return
    }
    if (status.backend === 'disconnected') {
      toast.error('Reconnect the detection backend before starting.')
      return
    }
    processedEvents.current.clear()
    detection.start()
    toast.success('Live detection started', {
      description:
        DETECTION_MODE === 'mock'
          ? 'Simulated recognition events will arrive every few seconds.'
          : 'Waiting for recognition events from the backend WebSocket.',
    })
  }

  const stopDetection = () => {
    detection.stop()
    toast.info('Detection stopped')
  }

  const enableCamera = async () => {
    const result = await startCamera(deviceId || undefined)
    if (result) toast.success('Camera connected')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live attendance detection"
        description="Monitor a live session, watch recognition events, and track attendance as it happens."
        actions={
          <>
            <Link to="/sessions">
              <Button variant="outline" leftIcon={<CalendarDays className="h-4 w-4" />}>
                Sessions
              </Button>
            </Link>
            <Link to="/attendance">
              <Button variant="soft" leftIcon={<ArrowRight className="h-4 w-4" />}>
                Attendance records
              </Button>
            </Link>
          </>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="w-full xl:max-w-sm">
            <Select
              label="Detection session"
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              disabled={isActive || isBusy || sessionsLoading}
              hint={
                sessionsLoading
                  ? 'Loading sessions…'
                  : sessionOptions.length === 0
                    ? 'No active or upcoming sessions. Create one in Sessions.'
                    : DETECTION_MODE === 'mock'
                      ? 'Simulated events are generated for the selected class.'
                      : 'Events are streamed from the backend WebSocket.'
              }
            >
              {sessionOptions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.status === 'active' ? '● ' : ''}
                  {session.courseName} — {session.className} · {session.startTime}
                </option>
              ))}
            </Select>
          </div>

          {selectedSession ? (
            <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" /> {selectedSession.className}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" /> {selectedSession.courseName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> {selectedSession.teacherName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-slate-400" /> {selectedSession.startTime}–
                {selectedSession.endTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> {selectedSession.date}
              </span>
              <Badge
                tone={selectedSession.status === 'active' ? 'success' : selectedSession.status === 'scheduled' ? 'info' : 'neutral'}
                dot
                className="ml-auto"
              >
                {selectedSession.status === 'active'
                  ? 'Live session'
                  : selectedSession.status === 'scheduled'
                    ? 'Scheduled'
                    : 'Completed'}
              </Badge>
            </div>
          ) : (
            <div className="flex-1 text-xs text-slate-400">
              Select or create a session to begin monitoring attendance.
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Live camera</CardTitle>
                <CardDescription>
                  {DETECTION_MODE === 'mock'
                    ? 'Camera preview is optional — simulated events run without hardware.'
                    : 'The backend consumes frames from the connected camera stream.'}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusPill
                  label={cameraLabel}
                  tone={cameraTone}
                  icon={cameraStatus === 'connected' ? Video : Camera}
                />
                <StatusPill label={detectionLabel} tone={detectionTone} icon={Radio} />
                <StatusPill
                  label={
                    status.backend === 'connected'
                      ? DETECTION_MODE === 'mock'
                        ? 'Mock backend ready'
                        : 'Backend connected'
                      : status.backend === 'connecting'
                        ? 'Backend connecting'
                        : 'Backend disconnected'
                  }
                  tone={backendTone}
                  icon={status.backend === 'disconnected' ? WifiOff : Wifi}
                />
              </div>
            </CardHeader>
            <div className="space-y-4 px-5 pb-5">
              <CameraPreview
                stream={stream}
                status={cameraStatus}
                error={cameraError}
                simulated={DETECTION_MODE === 'mock'}
                simulatedLabel="No camera connected — simulated detection available"
                onEnable={enableCamera}
                onDisable={stopCamera}
              >
                {isActive && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-semibold text-white shadow-lg backdrop-blur">
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    Detection active
                  </div>
                )}
                {lastAccepted && isActive && (
                  <div className="animate-in absolute bottom-3 left-3 max-w-[240px] rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-white backdrop-blur">
                    <p className="text-xs font-semibold">{lastAccepted.event.student_name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-300">
                      {lastAccepted.event.status} ·{' '}
                      {Math.round(lastAccepted.event.confidence * 100)}% confidence
                    </p>
                  </div>
                )}
              </CameraPreview>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {isActive ? (
                  <Button
                    variant="danger"
                    leftIcon={<Square className="h-4 w-4" />}
                    onClick={stopDetection}
                    loading={detectionStatus === 'stopping'}
                  >
                    Stop detection
                  </Button>
                ) : (
                  <Button
                    leftIcon={<Play className="h-4 w-4" />}
                    onClick={startDetection}
                    loading={detectionStatus === 'starting'}
                    disabled={!selectedSession || status.backend === 'disconnected'}
                  >
                    Start detection
                  </Button>
                )}

                <Select
                  value={deviceId}
                  onChange={(event) => {
                    setDeviceId(event.target.value)
                    if (cameraStatus === 'connected') startCamera(event.target.value)
                  }}
                  className="w-full sm:w-48"
                  disabled={cameraStatus === 'connected' || !devices.length}
                >
                  <option value="">{devices.length ? 'Default camera' : 'No camera detected'}</option>
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </Select>

                {cameraStatus === 'connected' ? (
                  <Button variant="outline" onClick={stopCamera} leftIcon={<Camera className="h-4 w-4" />}>
                    Disconnect camera
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={enableCamera}
                    loading={cameraStatus === 'connecting'}
                    leftIcon={<Video className="h-4 w-4" />}
                  >
                    Enable camera
                  </Button>
                )}

                <div className="flex items-center gap-2 sm:ml-auto">
                  <Timer className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-500">Session timer</span>
                  <span
                    className={cn(
                      'rounded-md px-2 py-1 font-mono text-xs font-semibold',
                      isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {formatElapsed(elapsed)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3.5 py-2.5">
                <span className="text-[11px] text-slate-500">{status.message || 'Detection service idle.'}</span>
                <div className="ml-auto flex items-center gap-2">
                  {status.backend === 'disconnected' ? (
                    <Button
                      size="xs"
                      variant="outline"
                      leftIcon={<RefreshCw className="h-3 w-3" />}
                      onClick={() => detection.reconnect()}
                    >
                      Reconnect backend
                    </Button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => detection.simulateDisconnect()}
                      className="text-[10px] font-medium text-rose-600 hover:text-rose-700"
                    >
                      Simulate backend drop
                    </button>
                  )}
                </div>
              </div>

              {isActive && cameraStatus !== 'connected' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11px] text-amber-800">
                  Detection is running on the simulated feed. Connect a camera to preview the physical
                  stream. No recognition runs in the browser.
                </div>
              )}
              <p className="text-[10px] leading-relaxed text-slate-400">
                Detections are simulated by <span className="font-mono">MockDetectionProvider</span>.
                Swap <span className="font-mono">VITE_DETECTION_MODE</span> to <span className="font-mono">api</span>{' '}
                to stream real events over WebSocket from the FastAPI backend.
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <RecognitionFeed events={events} detectionStatus={detectionStatus} />
          <Card className="p-4">
            <p className="text-xs font-semibold text-slate-800">Session snapshot</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-slate-400">Class students</p>
                <p className="mt-0.5 font-semibold text-slate-800">{pool.length}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-slate-400">Detected</p>
                <p className="mt-0.5 font-semibold text-slate-800">{stats.detected}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-slate-400">Events</p>
                <p className="mt-0.5 font-semibold text-slate-800">{events.length}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-slate-400">Rejected</p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {events.filter((entry) => !entry.accepted).length}
                </p>
              </div>
            </div>
            {!selectedSession && (
              <div className="mt-3">
                <EmptyState
                  className="py-6"
                  icon={CalendarDays}
                  title="No session selected"
                  action={
                    <Link to="/sessions">
                      <Button size="sm" variant="outline">
                        Go to sessions
                      </Button>
                    </Link>
                  }
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      <DetectionStats stats={stats} total={pool.length} progress={progress} />

      <RecognitionHistory events={events} onClear={detection.clearEvents} />
    </div>
  )
}
