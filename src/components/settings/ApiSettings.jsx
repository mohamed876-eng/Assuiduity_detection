import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, PlugZap, Server } from 'lucide-react'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { SettingsPanel } from './SettingsPanel'
import { useSettingsMutations } from '@/hooks/useSettings'
import { DETECTION_MODE } from '@/constants'

export function ApiSettings({ settings }) {
  const { mutateAsync, isPending } = useSettingsMutations().saveSection
  const [testing, setTesting] = useState(false)
  const defaults = {
    baseUrl: settings?.api?.baseUrl ?? 'http://localhost:8000/api',
    websocketUrl: settings?.api?.websocketUrl ?? 'ws://localhost:8000/ws/detection',
    timeout: settings?.api?.timeout ?? 15000,
  }
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: defaults })
  const baseUrl = watch('baseUrl')

  useEffect(() => {
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const onSubmit = async (values) => {
    try {
      await mutateAsync({ section: 'api', values: { ...values, detectionMode: DETECTION_MODE } })
      toast.success('API configuration saved')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`Backend responded with ${response.status}`)
      toast.success('Backend API reachable')
    } catch (error) {
      toast.error('Backend API not reachable', {
        description:
          error.name === 'AbortError'
            ? 'Connection timed out after 3 seconds.'
            : 'This is expected in the frontend-only prototype. Start the FastAPI service to connect.',
      })
    } finally {
      clearTimeout(timeout)
      setTesting(false)
    }
  }

  return (
    <SettingsPanel
      title="Backend API configuration"
      description="Point the frontend at the FastAPI recognition service when it becomes available."
      formId="api-settings"
      loading={isPending}
    >
      <form id="api-settings" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="API base URL"
          placeholder="http://localhost:8000/api"
          hint="Used by Axios services for authentication, students, attendance, and sessions."
          {...register('baseUrl')}
        />
        <Input
          label="Detection WebSocket URL"
          placeholder="ws://localhost:8000/ws/detection"
          hint="Used by ApiDetectionProvider when VITE_DETECTION_MODE=api."
          {...register('websocketUrl')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Request timeout (ms)" type="number" {...register('timeout', { valueAsNumber: true })} />
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-700">Active detection mode</p>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Badge tone={DETECTION_MODE === 'mock' ? 'warning' : 'success'} dot>
                {DETECTION_MODE.toUpperCase()}
              </Badge>
              <span className="text-[11px] text-slate-400">Set via environment variable</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={testing}
            leftIcon={testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
          >
            Test connection
          </Button>
          <span className="text-[11px] text-slate-400">Sends GET /health with a 3 second timeout.</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Server className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="text-[11px] leading-relaxed text-slate-500">
              <p className="font-medium text-slate-700">Ready for backend integration</p>
              <p className="mt-1">
                Services in <span className="font-mono">src/services/api</span> expose the Auth, Students,
                Teachers, Classes, Courses, Attendance, Sessions, Faces, and Detection endpoints. Switch{' '}
                <span className="font-mono">VITE_DETECTION_MODE</span> to <span className="font-mono">api</span>{' '}
                to stream events from <span className="font-mono">ws://localhost:8000/ws/detection</span>.
              </p>
            </div>
          </div>
        </div>
      </form>
    </SettingsPanel>
  )
}
