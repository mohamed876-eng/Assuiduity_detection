import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BellRing,
  Cctv,
  Plug,
  ScanFace,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { PreferencesSettings } from '@/components/settings/PreferencesSettings'
import { CameraSettings } from '@/components/settings/CameraSettings'
import { DetectionSettings } from '@/components/settings/DetectionSettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { ApiSettings } from '@/components/settings/ApiSettings'
import { useSettings, useSettingsMutations } from '@/hooks/useSettings'
import { cn } from '@/lib/cn'

const SECTIONS = [
  { value: 'profile', label: 'Profile', icon: UserRound, description: 'Your personal details' },
  { value: 'preferences', label: 'Preferences', icon: SlidersHorizontal, description: 'Formatting defaults' },
  { value: 'camera', label: 'Camera', icon: Cctv, description: 'Capture device setup' },
  { value: 'detection', label: 'Detection', icon: ScanFace, description: 'Recognition thresholds' },
  { value: 'notifications', label: 'Notifications', icon: BellRing, description: 'Alerts and delivery' },
  { value: 'api', label: 'API', icon: Plug, description: 'Backend connection' },
]

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get('tab') || 'profile'
  const { data: settings, isLoading, isError, error, refetch } = useSettings()
  const { reset } = useSettingsMutations()
  const [confirmReset, setConfirmReset] = useState(false)

  const changeTab = (value) => {
    setSearchParams(value === 'profile' ? {} : { tab: value }, { replace: true })
  }

  const handleReset = async () => {
    try {
      await reset.mutateAsync()
      toast.success('Settings restored to defaults')
      setConfirmReset(false)
    } catch (error_) {
      toast.error(error_.message)
    }
  }

  const sectionProps = { settings }

  const renderSection = () => {
    switch (active) {
      case 'preferences':
        return <PreferencesSettings {...sectionProps} />
      case 'camera':
        return <CameraSettings {...sectionProps} />
      case 'detection':
        return <DetectionSettings {...sectionProps} />
      case 'notifications':
        return <NotificationSettings {...sectionProps} />
      case 'api':
        return <ApiSettings {...sectionProps} />
      case 'profile':
      default:
        return <ProfileSettings {...sectionProps} />
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Manage your profile, detection behavior, notifications, and backend integration."
        actions={
          <Button variant="outline" onClick={() => setConfirmReset(true)} disabled={!settings}>
            Restore defaults
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <Card className="h-72 animate-pulse bg-slate-100" />
          <Card className="p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-64" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          </Card>
        </div>
      ) : isError ? (
        <Card>
          <ErrorState message={error?.message} onRetry={refetch} />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <Card className="h-fit p-2 lg:sticky lg:top-20">
            <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Settings sections">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                const isActive = active === section.value
                return (
                  <button
                    key={section.value}
                    type="button"
                    onClick={() => changeTab(section.value)}
                    className={cn(
                      'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition lg:w-full',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-brand-600' : 'text-slate-400')} />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium">{section.label}</span>
                      <span className="hidden text-[10px] text-slate-400 lg:block">
                        {section.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </Card>

          <div className="min-w-0">{renderSection()}</div>
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        loading={reset.isPending}
        title="Restore default settings?"
        description="This resets profile, preferences, camera, detection, notification, and API settings to their seeded defaults. Your students, classes, and attendance data are not affected."
        confirmLabel="Restore defaults"
      />
    </div>
  )
}
