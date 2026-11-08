import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Camera,
  Check,
  Circle,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Progress } from '@/components/common/Progress'
import { CameraPreview } from './CameraPreview'
import { useCamera } from '@/hooks/useCamera'
import { useFaceMutations } from '@/hooks/useFaceRegistry'
import { delay } from '@/lib/delay'
import { FACE_STATUS_META } from '@/constants'

function simulatedFrame() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#101014"/><stop offset="1" stop-color="#343338"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#g)"/>
    <circle cx="320" cy="150" r="62" fill="none" stroke="#d9d9dd" stroke-width="3" opacity="0.7"/>
    <path d="M210 330c0-58 49-104 110-104s110 46 110 104" fill="none" stroke="#d9d9dd" stroke-width="3" opacity="0.5"/>
    <text x="320" y="188" fill="#f3f3f5" font-family="Inter, Arial" font-size="14" font-weight="600" text-anchor="middle">SIMULATED FRAME</text>
    <text x="320" y="208" fill="#909096" font-family="Inter, Arial" font-size="10" text-anchor="middle">Demo capture — no real biometric data</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const STEPS = [
  { key: 'capture', label: 'Image captured locally' },
  { key: 'upload', label: 'Send image to backend' },
  { key: 'queue', label: 'Backend biometric queue' },
  { key: 'review', label: 'Awaiting backend review' },
]

export function FaceRegistrationModal({ open, onClose, students = [], initialStudentId = '', onSubmitted }) {
  const { submit } = useFaceMutations()
  const { stream, status, error, devices, startCamera, stopCamera } = useCamera()
  const [studentId, setStudentId] = useState(initialStudentId)
  const [phase, setPhase] = useState('camera')
  const [captured, setCaptured] = useState(null)
  const [capturedIsSimulated, setCapturedIsSimulated] = useState(false)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [submitError, setSubmitError] = useState('')
  const [deviceId, setDeviceId] = useState('')

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === studentId),
    [students, studentId],
  )
  const faceMeta = selectedStudent?.faceStatus
    ? FACE_STATUS_META[selectedStudent.faceStatus]
    : FACE_STATUS_META.not_registered

  const videoRef = useRef(null)

  const reset = useCallback(() => {
    setPhase('camera')
    setCaptured(null)
    setCapturedIsSimulated(false)
    setStep(0)
    setProgress(0)
    setSubmitError('')
  }, [])

  useEffect(() => {
    if (open) {
      setStudentId(initialStudentId || '')
      reset()
    } else {
      stopCamera()
      reset()
    }
  }, [open, initialStudentId, reset, stopCamera])

  useEffect(() => () => stopCamera(), [stopCamera])

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    try {
      const canvas = document.createElement('canvas')
      const width = video.videoWidth || 1280
      const height = video.videoHeight || 720
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, width, height)
      setCaptured(canvas.toDataURL('image/jpeg', 0.82))
      setCapturedIsSimulated(false)
      setPhase('captured')
    } catch {
      toast.error('Unable to capture a frame from the camera.')
    }
  }

  const runSubmit = async () => {
    if (!selectedStudent) {
      toast.error('Select a student before submitting.')
      return
    }
    setPhase('submitting')
    setSubmitError('')
    setStep(1)
    setProgress(18)
    try {
      await delay(700)
      setStep(2)
      setProgress(48)
      await delay(800)
      setStep(3)
      setProgress(74)
      await submit.mutateAsync({
        studentId: selectedStudent.id,
        meta: { quality: 0.78, simulated: capturedIsSimulated },
      })
      setProgress(100)
      setPhase('success')
      toast.success('Image submitted to the simulated backend queue')
      onSubmitted?.()
    } catch (submitFailure) {
      setSubmitError(submitFailure.message)
      setPhase('captured')
      setProgress(0)
      setStep(0)
      toast.error(submitFailure.message)
    }
  }

  const handleClose = () => {
    if (phase === 'submitting') return
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Register a student face"
      description="Capture an image and submit it for backend biometric processing."
      size="lg"
      footer={
        phase === 'success' ? (
          <Button onClick={handleClose}>Done</Button>
        ) : phase === 'submitting' ? (
          <Button loading disabled>
            Submitting…
          </Button>
        ) : phase === 'captured' ? (
          <>
            <Button variant="outline" onClick={reset} disabled={submit.isPending}>
              Retake
            </Button>
            <Button
              onClick={runSubmit}
              loading={submit.isPending}
              leftIcon={<UploadCloud className="h-4 w-4" />}
            >
              Submit to backend (simulated)
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={capture}
              disabled={status !== 'connected'}
              leftIcon={<Camera className="h-4 w-4" />}
            >
              Capture image
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-3.5 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <div className="text-[11px] leading-relaxed text-brand-800">
            <p className="font-semibold">Image capture is not biometric registration.</p>
            <p className="mt-0.5 text-brand-700/80">
              The real system sends the image to FastAPI + OpenCV, where the recognition model
              creates a biometric template. This prototype simulates that request and never claims a
              face was recognized or registered by AI. Captured frames stay in memory and are not
              stored.
            </p>
          </div>
        </div>

        <Select
          label="Student"
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          disabled={phase !== 'camera'}
          hint="Only students without a completed backend template need registration."
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.fullName} — {student.studentNumber}
            </option>
          ))}
        </Select>

        {selectedStudent && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
            <Avatar name={selectedStudent.fullName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-800">{selectedStudent.fullName}</p>
              <p className="text-[10px] text-slate-400">
                {selectedStudent.className} · {selectedStudent.studentNumber}
              </p>
            </div>
            <span className="ml-auto">
              <StatusBadge status={selectedStudent.faceStatus} />
            </span>
          </div>
        )}

        {phase === 'camera' && (
          <>
            <CameraPreview
              stream={stream}
              status={status}
              error={error}
              videoRef={videoRef}
              onEnable={() => startCamera(deviceId || undefined)}
              onDisable={stopCamera}
            />
            <div className="flex flex-wrap items-center gap-2">
              {devices.length > 1 && (
                <Select
                  value={deviceId}
                  onChange={(event) => {
                    setDeviceId(event.target.value)
                    if (status === 'connected') startCamera(event.target.value)
                  }}
                  className="w-full sm:w-64"
                >
                  <option value="">Default camera</option>
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </Select>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCaptured(simulatedFrame())
                  setCapturedIsSimulated(true)
                  setPhase('captured')
                }}
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              >
                Use demo frame (no camera)
              </Button>
            </div>
            {status === 'connected' && (
              <p className="text-[11px] text-slate-400">
                Center the student’s face inside the frame, then capture. Camera access stops when
                this dialog closes.
              </p>
            )}
          </>
        )}

        {phase === 'captured' && (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={captured}
                alt="Captured frame preview"
                className="aspect-video w-full object-cover"
              />
              <span className="absolute top-3 left-3 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                {capturedIsSimulated ? 'Simulated frame — not biometric data' : 'Captured locally — not yet registered'}
              </span>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-800">
              <span className="font-semibold">Next step is a backend request.</span> The image preview
              is held in memory only. Submitting will simulate a request to
              <span className="font-mono"> POST /api/faces/register</span>. No recognition model runs in
              the browser.
            </div>
            {submitError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                {submitError}
              </p>
            )}
          </div>
        )}

        {phase === 'submitting' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              <p className="text-sm font-medium text-slate-800">Submitting image to backend…</p>
            </div>
            <Progress value={progress} tone="brand" showValue />
            <div className="mt-4 space-y-2.5">
              {STEPS.map((entry, index) => {
                const done = index < step
                const active = index === step
                return (
                  <div key={entry.key} className="flex items-center gap-2.5 text-xs">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        done
                          ? 'bg-emerald-100 text-emerald-600'
                          : active
                            ? 'bg-brand-100 text-brand-600'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {done ? (
                        <Check className="h-3 w-3" />
                      ) : active ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Circle className="h-2.5 w-2.5" />
                      )}
                    </span>
                    <span className={done || active ? 'text-slate-700' : 'text-slate-400'}>
                      {entry.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'success' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Image submitted for review</p>
                <p className="text-[11px] text-emerald-700">
                  Demo backend queue completed · biometric registration simulated
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-white/70 px-3 py-2.5 text-xs">
              <span className="text-slate-500">Registry status</span>
              <StatusBadge status="pending" />
            </div>
            <div className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-emerald-800">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                The record is marked <strong>Pending review</strong>, not registered. In production,
                the backend would return a template ID and update this status after quality checks.
              </p>
            </div>
            <div className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-emerald-800">
              <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>Image data was not written to local storage.</p>
            </div>
          </div>
        )}

        {phase === 'camera' && selectedStudent && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
            <RefreshCw className="h-3.5 w-3.5" />
            Current registry status:
            <StatusBadge status={selectedStudent.faceStatus} dot={false} />
            {faceMeta?.label}
          </div>
        )}
      </div>
    </Modal>
  )
}
