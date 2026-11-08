import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Camera, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { ErrorState } from '@/components/common/ErrorState'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { WeeklyAttendanceChart } from '@/components/dashboard/WeeklyAttendanceChart'
import { DistributionChart } from '@/components/dashboard/DistributionChart'
import { MonthlyChart } from '@/components/dashboard/MonthlyChart'
import { ClassAttendanceChart } from '@/components/dashboard/ClassAttendanceChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { UpcomingSessions } from '@/components/dashboard/UpcomingSessions'
import { AttendanceAlerts } from '@/components/dashboard/AttendanceAlerts'
import { useDashboard } from '@/hooks/useAnalytics'
import { useAuth } from '@/contexts/AuthContext'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function todayLabel() {
  return format(new Date(), 'EEEE, MMMM d, yyyy')
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()

  if (isError) {
    return (
      <div className="card">
        <ErrorState
          title="Dashboard unavailable"
          message={error?.message}
          onRetry={refetch}
        />
      </div>
    )
  }

  const refresh = async () => {
    await refetch()
    toast.success('Dashboard refreshed')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={todayLabel()}
        title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Here’s what’s happening across your campus attendance today."
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />}
              onClick={refresh}
              disabled={isFetching}
            >
              Refresh
            </Button>
            <Link to="/detection">
              <Button leftIcon={<Camera className="h-4 w-4" />}>Start live detection</Button>
            </Link>
          </>
        }
      />

      <StatsGrid stats={data?.stats} loading={isLoading} />

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <WeeklyAttendanceChart data={data?.weekly} loading={isLoading} />
        </div>
        <DistributionChart distribution={data?.distribution} loading={isLoading} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MonthlyChart data={data?.monthly} loading={isLoading} />
        </div>
        <ClassAttendanceChart data={data?.byClass} loading={isLoading} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentActivity activity={data?.recentActivity} loading={isLoading} />
        </div>
        <div className="space-y-5">
          <UpcomingSessions sessions={data?.upcomingSessions} loading={isLoading} />
          <AttendanceAlerts alerts={data?.alerts} loading={isLoading} />
        </div>
      </div>
    </div>
  )
}
