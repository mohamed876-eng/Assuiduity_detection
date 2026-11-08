import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { SettingsPanel } from './SettingsPanel'
import { profileSchema } from '@/schemas/authSchemas'
import { useAuth } from '@/contexts/AuthContext'
import { useSettingsMutations } from '@/hooks/useSettings'

const TIMEZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'Africa/Casablanca',
  'Asia/Dubai',
  'Asia/Tokyo',
]

export function ProfileSettings({ settings }) {
  const { user, updateUser } = useAuth()
  const { saveSection } = useSettingsMutations()

  const defaults = {
    fullName: settings?.profile?.fullName || user?.name || '',
    email: settings?.profile?.email || user?.email || '',
    phone: settings?.profile?.phone || '',
    title: settings?.profile?.title || user?.title || '',
    timezone: settings?.profile?.timezone || 'America/Los_Angeles',
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues: defaults })

  useEffect(() => {
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, user])

  const onSubmit = async (values) => {
    try {
      await saveSection.mutateAsync({ section: 'profile', values })
      updateUser({ name: values.fullName, email: values.email, title: values.title })
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <SettingsPanel
      title="User profile"
      description="Update the profile shown across your attendance workspace."
      formId="profile-settings"
      loading={saveSection.isPending}
    >
      <form id="profile-settings" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" required error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Email address" type="email" required error={errors.email?.message} {...register('email')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
          <Input label="Job title" placeholder="e.g. Attendance Administrator" error={errors.title?.message} {...register('title')} />
        </div>
        <Select label="Timezone" error={errors.timezone?.message} {...register('timezone')}>
          {TIMEZONES.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone.replace('_', ' ')}
            </option>
          ))}
        </Select>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[11px] text-slate-500">
          Signed in as <span className="font-medium text-slate-700">{user?.name}</span> with{' '}
          <span className="font-medium text-slate-700">{user?.role}</span> access. Role changes require
          an administrator account.
        </div>
      </form>
    </SettingsPanel>
  )
}
