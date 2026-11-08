import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Switch } from '@/components/common/Switch'
import { SettingsPanel } from './SettingsPanel'
import { useSettingsMutations } from '@/hooks/useSettings'

const OPTIONS = [
  ['recognition', 'Face recognized', 'Notify when a student is recognized in a live session.'],
  ['absence', 'Student absence alerts', 'Alert when a student is marked absent.'],
  ['late', 'Late arrival alerts', 'Alert when a student arrives after the late threshold.'],
  ['detectionErrors', 'Detection errors', 'Notify when a recognition event fails or is rejected.'],
  ['backendErrors', 'Backend connection errors', 'Alert when the detection backend disconnects.'],
  ['sessionChanges', 'Session status changes', 'Notify when sessions start or complete.'],
]

export function NotificationSettings({ settings }) {
  const { mutateAsync, isPending } = useSettingsMutations().saveSection
  const defaults = {
    recognition: settings?.notifications?.recognition ?? true,
    absence: settings?.notifications?.absence ?? true,
    late: settings?.notifications?.late ?? true,
    detectionErrors: settings?.notifications?.detectionErrors ?? true,
    backendErrors: settings?.notifications?.backendErrors ?? true,
    sessionChanges: settings?.notifications?.sessionChanges ?? true,
    inApp: settings?.notifications?.channels?.inApp ?? true,
    email: settings?.notifications?.channels?.email ?? true,
  }
  const { control, handleSubmit, reset } = useForm({ defaultValues: defaults })

  useEffect(() => {
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const onSubmit = async (values) => {
    const { inApp, email, ...toggles } = values
    try {
      await mutateAsync({
        section: 'notifications',
        values: { ...toggles, channels: { inApp, email } },
      })
      toast.success('Notification preferences saved')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <SettingsPanel
      title="Notification settings"
      description="Choose which events trigger alerts and how they are delivered."
      formId="notification-settings"
      loading={isPending}
    >
      <form id="notification-settings" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-700">Event notifications</p>
          <div className="space-y-2">
            {OPTIONS.map(([name, label, description]) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field }) => (
                  <Switch
                    label={label}
                    description={description}
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-700">Delivery channels</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Controller
              control={control}
              name="inApp"
              render={({ field }) => (
                <Switch
                  label="In-app notification center"
                  description="Show alerts in the bell menu and notification center."
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Switch
                  label="Email notifications"
                  description="Queue email alerts through the future backend."
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-slate-500">
          Notification delivery is simulated. Email alerts require a backend mail service in production.
        </div>
      </form>
    </SettingsPanel>
  )
}
