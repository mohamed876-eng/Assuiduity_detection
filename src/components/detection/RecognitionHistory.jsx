import { format } from 'date-fns'
import { ScanFace } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'

export function RecognitionHistory({ events, onClear }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recognition event history</CardTitle>
          <CardDescription>
            Raw simulated events emitted by the detection provider · {events.length} total
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={!events.length}>
          Clear history
        </Button>
      </CardHeader>

      {events.length === 0 ? (
        <EmptyState
          icon={ScanFace}
          title="No recognition events yet"
          description="Event history captures accepted and rejected matches from this detection session."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="table-th">Time</th>
                <th className="table-th">Student</th>
                <th className="table-th">Confidence</th>
                <th className="table-th">Result</th>
                <th className="table-th">Status</th>
                <th className="table-th">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.slice(0, 30).map((entry) => {
                const event = entry.event
                return (
                  <tr
                    key={entry.id}
                    className={entry.accepted ? 'transition hover:bg-slate-50/60' : 'bg-rose-50/30'}
                  >
                    <td className="table-td font-mono text-[11px] whitespace-nowrap text-slate-500">
                      {format(new Date(event.timestamp), 'HH:mm:ss')}
                    </td>
                    <td className="table-td">
                      <p className="text-[13px] font-medium text-slate-800">{event.student_name}</p>
                      <p className="text-[10px] text-slate-400">{event.student_number}</p>
                    </td>
                    <td className="table-td">
                      <span
                        className={`text-xs font-semibold ${
                          event.confidence >= 0.85 ? 'text-slate-700' : 'text-rose-600'
                        }`}
                      >
                        {Math.round(event.confidence * 100)}%
                      </span>
                    </td>
                    <td className="table-td">
                      {entry.accepted ? (
                        <Badge tone="success" dot>
                          Accepted
                        </Badge>
                      ) : (
                        <div>
                          <Badge tone="danger" dot>
                            Rejected
                          </Badge>
                          <p className="mt-0.5 max-w-[240px] text-[10px] leading-snug text-slate-400">
                            {entry.reason}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="table-td">
                      <span className="font-mono text-[10px] text-slate-400">
                        {event.event === 'face_recognized' ? 'mock.ws' : 'threshold'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
