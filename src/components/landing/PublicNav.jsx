import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { cn } from '@/lib/cn'

const LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/signin', label: 'Sign In' },
]

export function PublicNav({ variant = 'overlay' }) {
  const overlay = variant === 'overlay'

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <div
        className={cn(
          'mx-auto flex max-w-[1440px] items-center justify-between gap-3 rounded-full border px-4 py-2.5 backdrop-blur-xl transition sm:px-5',
          overlay
            ? 'border-white/15 bg-white/[0.045] text-white shadow-[0_12px_40px_-20px_rgba(0,0,0,0.65)]'
            : 'border-line/80 bg-white/85 text-ink shadow-[0_12px_40px_-24px_rgba(16,16,20,0.28)]',
        )}
      >
        <Link to="/" className="min-w-0 rounded-full" aria-label="Smart Attendance home">
          <Logo dark={overlay} compact className="sm:hidden" />
          <Logo dark={overlay} className="hidden sm:flex" />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Public navigation">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-2.5 py-2 text-[11px] font-medium tracking-wide transition sm:px-3.5 sm:text-xs',
                  overlay
                    ? isActive
                      ? 'bg-white/12 text-white'
                      : 'text-white/65 hover:bg-white/8 hover:text-white'
                    : isActive
                      ? 'bg-brand-50 text-ink'
                      : 'text-smoke hover:bg-brand-50 hover:text-ink',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/signup"
            className={cn(
              'ml-0.5 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold transition sm:px-4 sm:text-xs',
              overlay
                ? 'bg-white text-ink hover:bg-white/85'
                : 'bg-ink text-white hover:bg-graphite',
            )}
          >
            Sign Up
            <ArrowUpRight className="hidden h-3.5 w-3.5 sm:block" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
