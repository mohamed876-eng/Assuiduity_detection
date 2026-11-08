import { Clock3, TrendingUp, UserCheck, UserX, Users } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard'

export function StatsGrid({ stats, loading }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatCard key={index} label="Loading" value="" loading />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Total students"
        value={stats.totalStudents}
        icon={Users}
        tone="brand"
        helper={`${stats.activeStudents} active · ${stats.totalTeachers} teachers`}
        loading={loading}
      />
      <StatCard
        label="Present today"
        value={stats.presentToday}
        icon={UserCheck}
        tone="green"
        trend={stats.presentDelta}
        trendLabel="vs yesterday"
        loading={loading}
      />
      <StatCard
        label="Absent today"
        value={stats.absentToday}
        icon={UserX}
        tone="red"
        trend={stats.absentDelta}
        trendLabel="vs yesterday"
        loading={loading}
      />
      <StatCard
        label="Late arrivals"
        value={stats.lateToday}
        icon={Clock3}
        tone="amber"
        trend={stats.lateDelta}
        trendLabel="vs yesterday"
        loading={loading}
      />
      <StatCard
        label="Attendance rate"
        value={`${stats.attendanceRate.toFixed(1)}%`}
        icon={TrendingUp}
        tone="brand"
        trend={stats.rateDelta}
        trendSuffix="%"
        trendLabel="vs yesterday"
        loading={loading}
      />
    </div>
  )
}
