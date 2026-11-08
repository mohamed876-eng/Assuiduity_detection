import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/common/Button'

export function NotFoundPage() {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Compass className="h-7 w-7" />
      </div>
      <p className="mt-5 text-4xl font-semibold tracking-tight text-slate-900">404</p>
      <h1 className="mt-1 text-lg font-semibold text-slate-800">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
