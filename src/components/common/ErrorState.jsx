import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {message || 'We could not load this data. Please try again.'}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Retry
        </Button>
      )}
    </div>
  )
}
