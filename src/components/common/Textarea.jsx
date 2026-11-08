import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

export const Textarea = forwardRef(function Textarea(
  { className, label, error, hint, required, id, containerClassName, rows = 3, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          'input-base h-auto resize-none py-2.5',
          error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
})
