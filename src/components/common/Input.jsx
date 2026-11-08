import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef(function Input(
  { className, label, error, hint, required, icon, id, containerClassName, ...props },
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
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('input-base', icon && 'pl-9', error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15', className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
})
