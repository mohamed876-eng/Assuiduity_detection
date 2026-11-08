import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Input } from '@/components/common/Input'
import { Switch } from '@/components/common/Switch'
import { SettingsPanel } from './SettingsPanel'
import { useSettingsMutations } from '@/hooks/useSettings'
import { DETECTION_MODE } from '@/constants'

export function DetectionSettings({ settings }) {
  const { mutateAsync, isPending } = useSettingsMutations().saveSection
  const defaults = {
    confidenceThreshold: settings?.detection?.confidenceThreshold ?? 0.85,
    autoMark: settings?.detection?.autoMark ?? true,
    cooldownSeconds: settings?.detection?.cooldownSeconds ?? 30,
    sessionMinutes: settings?.detection?.sessionMinutes ?? 60,
    markLateAfterMinutes: settings?.detection?.markLateAfterMinutes ?? 10,
    simulatedMode: settings?.detection?.simulatedMode ?? true,
  }
  const { register, handleSubmit, control, reset, watch } = useForm({ defaultValues: defaults })
  const threshold = watch('confidenceThreshold')

  useEffect(() => {
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const onSubmit = async (values) => {
    try {
      await mutateAsync({ section: 'detection', values })
      toast.success('Detection settings saved')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <SettingsPanel
      title="Detection settings"
      description="Tune recognition thresholds and session behavior. These values are consumed by the backend."
      formId="detection-settings"
      loading={isPending}
    >
      <form id="detection-settings" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <label htmlFor="confidence" className="text-sm font-medium text-slate-800">
              Confidence threshold
            </label>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {Math.round(Number(threshold) * 100)}%
            </span>
          </div>
          <input
            id="confidence"
            type="range"
            min="0.5"
            max="0.99"
            step="0.01"
            className="mt-3 w-full accent-brand-600"
            {...register('confidenceThreshold', { valueAsNumber: true })}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Matches below this score are rejected. The mock provider rejects events under 80%.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Cooldown (seconds)"
            type="number"
            min="5"
            max="600"
            hint="Duplicate window"
            {...register('cooldownSeconds', { valueAsNumber: true })}
          />
          <Input
            label="Session length (min)"
            type="number"
            min="10"
            max="240"
            {...register('sessionMinutes', { valueAsNumber: true })}
          />
          <Input
            label="Late after (min)"
            type="number"
            min="1"
            max="60"
            {...register('markLateAfterMinutes', { valueAsNumber: true })}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Controller
            control={control}
            name="autoMark"
            render={({ field }) => (
              <Switch
                label="Auto-mark attendance"
                description="Write recognition events to attendance records automatically."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="simulatedMode"
            render={({ field }) => (
              <Switch
                label="Prefer simulated detection"
                description="Use mock events when the environment is configured for mock mode."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-800">
          Active detection mode: <strong className="uppercase">{DETECTION_MODE}</strong>. Change{' '}
          <span className="font-mono">VITE_DETECTION_MODE</span> in your <span className="font-mono">.env</span>{' '}
          file and restart the dev server to switch providers.
        </div>
      </form>
    </SettingsPanel>
  )
}
