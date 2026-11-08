import { useEffect, useRef } from 'react'
import { Camera, CameraOff, Loader2, ShieldAlert, Video } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { cn } from '@/lib/cn'

export function CameraPreview({
  stream,
  status,
  error,
  onEnable,
  onDisable,
  overlay = true,
  videoRef: externalVideoRef,
  simulated = false,
  simulatedLabel = 'Simulated camera feed',
  className,
  children,
}) {
  const internalVideoRef = useRef(null)
  const videoRef = externalVideoRef ?? internalVideoRef

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (stream) {
      video.srcObject = stream
      video.play().catch(() => {})
    } else {
      video.srcObject = null
    }
  }, [stream, videoRef])

  const connected = status === 'connected' && stream

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-navy-950',
        className,
      )}
    >
      {connected ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_35%,#232329,#08080a)] px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
            {status === 'denied' ? (
              <ShieldAlert className="h-6 w-6" />
            ) : status === 'connecting' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <CameraOff className="h-6 w-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              {status === 'connecting'
                ? 'Connecting to camera…'
                : status === 'denied'
                  ? 'Camera permission denied'
                  : simulated
                    ? simulatedLabel
                    : 'Camera is not connected'}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
              {error ||
                (simulated
                  ? 'Simulated detection can still run while the physical camera is disconnected.'
                  : 'Enable the camera to preview the feed. Video never leaves this device in the prototype.')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {status !== 'connecting' && onEnable && (
              <Button size="sm" variant="soft" leftIcon={<Video className="h-4 w-4" />} onClick={onEnable} className="bg-white/10 text-white hover:bg-white/20">
                Enable camera
              </Button>
            )}
            {status === 'denied' && (
              <span className="text-[10px] text-slate-500">
                Use the lock icon in your browser to allow camera access.
              </span>
            )}
          </div>
        </div>
      )}

      {connected && overlay && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-[12%] rounded-lg border border-white/25">
            <span className="absolute -top-2 -left-2 h-5 w-5 rounded-tl border-t-2 border-l-2 border-white/70" />
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-tr border-t-2 border-r-2 border-white/70" />
            <span className="absolute -bottom-2 -left-2 h-5 w-5 rounded-bl border-b-2 border-l-2 border-white/70" />
            <span className="absolute -right-2 -bottom-2 h-5 w-5 rounded-br border-b-2 border-r-2 border-white/70" />
          </div>
        </div>
      )}

      {connected && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live camera
        </div>
      )}

      {connected && onDisable && (
        <button
          type="button"
          onClick={onDisable}
          className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur transition hover:bg-black/65"
        >
          <Camera className="h-3 w-3" /> Stop camera
        </button>
      )}

      {children}
    </div>
  )
}
