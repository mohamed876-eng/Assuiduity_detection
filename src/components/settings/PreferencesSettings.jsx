import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Select } from '@/components/common/Select'
import { Switch } from '@/components/common/Switch'
import { SettingsPanel } from './SettingsPanel'

export function PreferencesSettings({ settings }) {
  const { mutateAsync, isPending } = useSettingsMutations().saveSection
  const defaults = {
    language: settings?.preferences?.language ?? 'en',
    weekStart: settings?.preferences?.weekStart ?? 'monday',
    dateFormat: settings?.preferences?.dateFormat ?? 'MMM d, yyyy',
    emailDigest: settings?.preferences?.emailDigest ?? true,
    compactTables: settings?.preferences?.compactTables ?? false,
  }
  const { register, handleSubmit, control, reset } = useForm({ defaultValues: defaults })

  useEffect(() => {
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const onSubmit = async (values) => {
    try {
      await mutateAsync({ section: 'preferences', values })
      toast.success('Preferences saved')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <SettingsPanel
      title="Application preferences"
      description="Control formatting and default behavior across the dashboard."
      formId="preferences-settings"
      loading={isPending}
    >
      <form id="preferences-settings" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Language" {...register('language')}>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </Select>
          <Select label="Week starts on" {...register('weekStart')}>
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </Select>
        </div>
        <Select label="Date format" {...register('dateFormat')}>
          <option value="MMM d, yyyy">Jan 8, 2026</option>
          <option value="dd/MM/yyyy">08/01/2026</option>
          <option value="yyyy-MM-dd">2026-01-08</option>
        </Select>
        <div className="grid gap-2 sm:grid-cols-2">
          <Controller
            control={control}
            name="emailDigest"
            render={({ field }) => (
              <Switch
                label="Weekly email digest"
                description="Receive a weekly attendance summary by email."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="compactTables"
            render={({ field }) => (
              <Switch
                label="Compact tables"
                description="Reduce row height in data tables."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-slate-500">
          Language and formatting preferences are saved for this prototype only. Full localization is
          not enabled.
        </div>
      </form>
    </SettingsPanel>
  )
}
