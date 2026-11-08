import { useState } from 'react'
import { Menu, Radio, Search, X } from 'lucide-react'
import { GlobalSearch } from './GlobalSearch'
import { NotificationMenu } from './NotificationMenu'
import { ProfileMenu } from './ProfileMenu'
import { DETECTION_MODE } from '@/constants'
import { cn } from '@/lib/cn'

export function Topbar({ onMenuClick }) {
  const [mobileSearch, setMobileSearch] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-smoke transition hover:bg-fog hover:text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden w-full max-w-md md:block">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span
            className={cn(
              'hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex',
              'bg-fog text-graphite ring-1 ring-line ring-inset',
            )}
          >
            <Radio className="h-3 w-3" />
            {DETECTION_MODE === 'mock' ? 'Mock detection' : 'Live API'}
          </span>
          <button
            type="button"
            onClick={() => setMobileSearch((current) => !current)}
            className="rounded-lg p-2 text-smoke transition hover:bg-fog hover:text-ink md:hidden"
            aria-label="Toggle search"
          >
            {mobileSearch ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
          </button>
          <NotificationMenu />
          <div className="mx-1 h-6 w-px bg-line" />
          <ProfileMenu />
        </div>
      </div>
      {mobileSearch && (
        <div className="border-t border-line/70 px-4 py-2.5 md:hidden">
          <GlobalSearch autoFocus onNavigate={() => setMobileSearch(false)} />
        </div>
      )}
    </header>
  )
}
