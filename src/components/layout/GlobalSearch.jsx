import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, Loader2, School, Search, User } from 'lucide-react'
import { globalSearch } from '@/services/api/searchService'
import { useDebounce } from '@/hooks/useDebounce'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'

const GROUPS = [
  { key: 'students', label: 'Students', icon: User },
  { key: 'teachers', label: 'Teachers', icon: GraduationCap },
  { key: 'classes', label: 'Classes', icon: School },
  { key: 'courses', label: 'Courses', icon: BookOpen },
]

export function GlobalSearch({ autoFocus = false, onNavigate }) {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const debounced = useDebounce(term, 250)
  const containerRef = useRef(null)

  const { data, isFetching } = useQuery({
    queryKey: ['global-search', debounced],
    queryFn: () => globalSearch(debounced),
    enabled: debounced.trim().length >= 2,
    staleTime: 20000,
  })

  useClickOutside(containerRef, () => setOpen(false))

  useEffect(() => {
    if (autoFocus) containerRef.current?.querySelector('input')?.focus()
  }, [autoFocus])

  const hasResults =
    data &&
    GROUPS.some((group) => (data[group.key]?.length ?? 0) > 0)

  const go = (to) => {
    setOpen(false)
    setTerm('')
    navigate(to)
    onNavigate?.()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
        placeholder="Search students, teachers, classes…"
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-16 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-500/10 focus:outline-none"
      />
      <span className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center gap-1 sm:flex">
        {isFetching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
        ) : (
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            ⌘K
          </kbd>
        )}
      </span>

      {open && term.trim().length >= 2 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-pop">
          {isFetching && !data ? (
            <div className="flex items-center gap-2 px-3 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          ) : hasResults ? (
            GROUPS.map((group) => {
              const items = data?.[group.key] ?? []
              if (!items.length) return null
              const Icon = group.icon
              return (
                <div key={group.key} className="mb-1.5 last:mb-0">
                  <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    {group.label}
                  </p>
                  {items.map((item) => (
                    <button
                      key={`${group.key}-${item.id}`}
                      type="button"
                      onClick={() => go(item.to)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-50"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {item.title}
                        </span>
                        <span className="block truncate text-[11px] text-slate-400">
                          {item.subtitle}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )
            })
          ) : (
            <div className={cn('px-3 py-6 text-center text-sm text-slate-500')}>
              No matches for “{term.trim()}”
            </div>
          )}
        </div>
      )}
    </div>
  )
}
