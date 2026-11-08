import { UserCheck, UserX, Users, Clock3 } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Progress } from '@/components/common/Progress'

const ITEMS = [
  { key: 'detected', label: 'Total detected', icon: Users, tone: 'text-brand-600 bg-brand-50' },
  { key: 'present', label: 'Present', icon: UserCheck, tone: 'text-emerald-600 bg-emerald-50' },
  { key: 'absent', label: 'Absent', icon: UserX, tone: 'text-rose-600 bg-rose-50' },
  { key: 'late', label: 'Late', icon: Clock3, tone: 'text-amber-600 bg-amber-50' },
]

export function DetectionStats({ stats, total, progress }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.key} className="p-4">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {stats[item.key]}
            </p>
          </Card>
        )
      })}
      <Card className="p-4 sm:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">Attendance progress</p>
          <span className="text-xs font-semibold text-slate-800">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} tone={progress >= 90 ? 'success' : progress >= 60 ? 'brand' : 'warning'} className="mt-3" />
        <p className="mt-2 text-[10px] text-slate-400">
          {stats.detected} of {total} students in this class
        </p>
      </Card>
    </div>
  )
}
