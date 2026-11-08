import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { generateAvatarDataUrl } from '@/utils/avatar'

const SIZES = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-2xl',
  '2xl': 'h-24 w-24 text-3xl',
}

export function Avatar({ name = '', src = '', seed = '', size = 'md', className, ring = false }) {
  const fallback = useMemo(() => generateAvatarDataUrl(name, seed || name), [name, seed])
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-slate-100',
        ring && 'ring-2 ring-white',
        SIZES[size],
        className,
      )}
    >
      <img
        src={src || fallback}
        alt={name ? `${name} avatar` : 'Avatar'}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </span>
  )
}
