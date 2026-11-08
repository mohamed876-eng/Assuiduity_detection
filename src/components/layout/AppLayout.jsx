import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Breadcrumbs } from './Breadcrumbs'

const CURRENT_YEAR = new Date().getFullYear()

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-fog">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px] space-y-5">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-line/80 px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-1 text-[11px] text-muted sm:flex-row">
            <span>© {CURRENT_YEAR} Smart Attendance. Frontend prototype.</span>
            <span>AI attendance · Backend-ready architecture</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
