import { Link } from 'react-router-dom'
import { ArrowLeft, ScanFace, ShieldCheck, Sparkles } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { FacialMesh } from '@/components/landing/FacialMesh'

const FEATURES = [
  ['01', 'Live facial recognition', 'Recognition events stream in without manual roll calls.'],
  ['02', 'Privacy-first by design', 'Biometric processing stays on the backend, never in the browser.'],
  ['03', 'A quieter workspace', 'Attendance, sessions, and analytics in one restrained interface.'],
]

export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-fog">
      <aside className="mesh-surface relative hidden w-[45%] flex-col justify-between overflow-hidden p-9 lg:flex xl:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <FacialMesh className="absolute top-1/2 left-1/2 h-[78vh] w-[78vh] -translate-x-1/2 -translate-y-[54%]" />
        </div>
        <div className="relative">
          <Link to="/" aria-label="Smart Attendance home">
            <Logo dark />
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="type-eyebrow flex items-center gap-2 text-white/40">
            <Sparkles className="h-3.5 w-3.5" /> Smart attendance
          </p>
          <h1 className="mt-4 text-[2.6rem] leading-[0.98] font-semibold tracking-[-0.055em] text-white xl:text-[3.15rem]">
            Attention,
            <br />
            <span className="text-white/40">automated.</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            A monochrome attendance workspace built around computer vision, accurate records, and
            less administrative noise.
          </p>

          <div className="mt-8 space-y-3">
            {FEATURES.map(([index, title, description]) => (
              <div key={index} className="flex gap-3 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                <span className="pt-0.5 font-mono text-[10px] text-white/30">{index}</span>
                <div>
                  <p className="text-xs font-medium text-white/85">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/38">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-[10px] text-white/28">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Privacy-first architecture
          </span>
          <span className="flex items-center gap-1.5">
            <ScanFace className="h-3.5 w-3.5" /> 300-frame facial mesh
          </span>
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-1 flex-col px-5 py-7 sm:px-9 lg:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden" aria-label="Smart Attendance home">
            <Logo />
          </Link>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[11px] font-medium text-smoke transition hover:border-brand-300 hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Landing page
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <p className="text-center text-[10px] tracking-wide text-slate-400">
          Smart Attendance prototype · Frontend only · Mock data & simulated detection
        </p>
      </div>
    </div>
  )
}
