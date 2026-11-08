import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTE_LABELS } from '@/constants/navigation'

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const crumbs = []

  segments.forEach((segment, index) => {
    const to = `/${segments.slice(0, index + 1).join('/')}`
    const known = ROUTE_LABELS[segment]
    if (known) {
      crumbs.push({ label: known, to: index === segments.length - 1 ? null : to })
    } else {
      crumbs.push({
        label: index === segments.length - 1 ? 'Details' : 'Section',
        to: null,
      })
    }
  })

  if (segments[0] !== 'dashboard') {
    crumbs.unshift({ label: 'Dashboard', to: '/dashboard' })
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
      <Link to="/dashboard" className="inline-flex items-center gap-1 transition hover:text-slate-700">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {crumbs.map((crumb) => (
        <span key={`${crumb.label}-${crumb.to}`} className="inline-flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {crumb.to ? (
            <Link to={crumb.to} className="transition hover:text-slate-700">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-600">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
