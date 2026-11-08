import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { RefreshCw, Video } from 'lucide-react'
import { Select } from '@/components/common/Select'
import { Switch } from '@/components/common/Switch'
import { Button } from '@/components/common/Button'
import { SettingsPanel } from './SettingsPanel'
import { useSettingsMutations } from '@/hooks/useSettings'
import { useCamera } from '@/hooks/useCamera'

export function CameraSettings({ settings }) {
  const { mutateAsync, isPending } = useSettingsMutations().saveSection
  const { devices, refreshDevices } = useCamera()
  const defaults = {
    deviceId: settings?.camera?.deviceId ?? '',
    facingMode: settings?.camera?.facingMode ?? 'user',
    mirrorPreview: settings?.camera?.mirrorPreview ?? true,
    resolution: settings?.camera?.resolution ?? '1280x720',
  }
  const { register, handleSubmit, control, reset } = useForm({ defaultValues: defaults })

  useEffect(() => {
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const onSubmit = async (values) => {
    try {
      await mutateAsync({ section: 'camera', values })
      toast.success('Camera settings saved')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const scan = async () => {
    const list = await refreshDevices()
    toast.success(list.length ? `${list.length} camera(s) detected` : 'No cameras detected')
  }

  return (
    <SettingsPanel
      title="Camera settings"
      description="Configure the preferred capture device and preview behavior."
      formId="camera-settings"
      loading={isPending}
    >
      <form id="camera-settings" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Select label="Preferred camera" containerClassName="flex-1" {...register('deviceId')}>
            <option value="">Default camera</option>
            {devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={scan}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="sm:mb-0"
          >
            Scan cameras
          </Button>
        </div>
        <p className="text-[11px] text-slate-400">
          Camera labels may be hidden until camera permission is granted on the detection page.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Facing mode" {...register('facingMode')}>
            <option value="user">Front-facing</option>
            <option value="environment">Rear-facing</option>
          </Select>
          <Select label="Preferred resolution" {...register('resolution')}>
            <option value="640x480">640 × 480</option>
            <option value="1280x720">1280 × 720 (HD)</option>
            <option value="1920x1080">1920 × 1080 (Full HD)</option>
          </Select>
        </div>
        <Controller
          control={control}
          name="mirrorPreview"
          render={({ field }) => (
            <Switch
              label="Mirror camera preview"
              description="Flip the preview horizontally for a natural selfie view. This does not affect submitted frames."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-slate-500">
          <Video className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Camera streams are only used for local preview and frame capture. The browser never performs
          facial recognition.
        </div>
      </form>
    </SettingsPanel>
  )
}
