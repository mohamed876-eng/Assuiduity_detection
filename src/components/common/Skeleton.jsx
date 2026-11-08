import { cn } from '@/lib/cn'

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-100', className)} {...props} />
}

export function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn('h-3.5', columnIndex === 0 ? 'w-40' : 'w-20', columnIndex > 2 && 'hidden lg:block')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
