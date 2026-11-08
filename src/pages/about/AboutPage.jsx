import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  Camera,
  Check,
  Cpu,
  Database,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { PublicNav } from '@/components/landing/PublicNav'
import { FacialMesh } from '@/components/landing/FacialMesh'
import { Logo } from '@/components/common/Logo'

const STEPS = [
  ['01', 'Capture', 'A classroom camera streams frames to the detection backend.'],
  ['02', 'Recognize', 'The facial mesh is matched against enrolled student profiles.'],
  ['03', 'Record', 'Accepted matches write attendance with a confidence score.'],
  ['04', 'Review', 'Teachers and administrators monitor sessions and correct records.'],
]

const FEATURES = [
  { icon: ScanFace, title: 'Face recognition', description: 'Recognition events with confidence scores and rejection reasons.' },
  { icon: Users, title: 'Student management', description: 'Profiles, class assignments, enrollment, and attendance history.' },
  { icon: CalendarClock, title: 'Live sessions', description: 'Start, stop, and finalize attendance windows with automatic absences.' },
  { icon: BarChart3, title: 'Reports & analytics', description: 'Attendance trends by student, class, course, and date range.' },
  { icon: Bell, title: 'Notification center', description: 'Recognition, absence, late, and detection alerts in one place.' },
  { icon: ShieldCheck, title: 'Privacy-first design', description: 'No browser-side biometric processing or long-lived capture storage.' },
]

export function AboutPage() {
  return (
    <div className="min-h-screen bg-fog">
      <PublicNav variant="light" />

      <main className="mx-auto w-full max-w-[1440px] px-5 pt-28 pb-14 sm:px-8 lg:px-12">
        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="animate-in">
            <p className="type-eyebrow flex items-center gap-2 text-brand-400">
              <Sparkles className="h-3.5 w-3.5" /> About us
            </p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.7rem,6vw,5.5rem)] leading-[0.94] font-semibold tracking-[-0.06em] text-ink">
              Attendance,
              <br />
              <span className="text-brand-300">without the ceremony.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
              Smart Attendance is an intelligent attendance management system powered by Computer
              Vision and Facial Recognition technologies.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                to="/signup"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-xs font-semibold text-white transition hover:bg-graphite"
              >
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/signin"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-xs font-medium text-ink transition hover:border-brand-300"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="mesh-surface relative aspect-[4/3.4] overflow-hidden rounded-[2rem] border border-white/8">
            <FacialMesh className="absolute top-1/2 left-1/2 h-[94%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-80" />
            <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[9px] tracking-[0.2em] text-white/35 uppercase">
              <span>Facial mesh / live</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" /> scanning
              </span>
            </div>
            <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-white/50">
              {[
                ['98.2%', 'accuracy'],
                ['1.2s', 'match time'],
                ['300', 'frames'],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-lg font-semibold text-white">{value}</p>
                  <p className="text-[9px] tracking-wide text-white/30 uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 border-t border-line pt-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="type-eyebrow text-brand-400">01 / The platform</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">
              What Smart Attendance does
            </h2>
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-smoke">
              Smart Attendance automates student attendance tracking through real-time face
              detection, providing accurate attendance records and reducing manual administrative
              tasks. The platform offers a centralized dashboard for managing students, monitoring
              attendance sessions, and analyzing attendance statistics.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                'Real-time recognition events',
                'Centralized attendance records',
                'Session monitoring and finalization',
                'Class, course, and student analytics',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-brand-700">
                  <Check className="h-3.5 w-3.5 text-brand-500" /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="mesh-surface relative overflow-hidden rounded-[1.75rem] p-7 sm:p-9">
            <FacialMesh className="absolute -right-16 -bottom-24 h-80 w-80 opacity-30" />
            <p className="type-eyebrow text-white/35">Our mission</p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.04em] text-white">
              Return time to teaching.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
              We believe attendance should be a quiet background process — accurate, transparent,
              and fast enough that it never interrupts a lesson.
            </p>
            <div className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.18em] text-white/30 uppercase">
              <ScanFace className="h-4 w-4" /> Presence, recognized
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-line bg-white p-7 sm:p-9">
            <p className="type-eyebrow text-brand-400">How it works</p>
            <div className="mt-4 divide-y divide-line">
              {STEPS.map(([index, title, description]) => (
                <div key={index} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="font-mono text-[10px] text-brand-300">{index}</span>
                  <div>
                    <p className="text-xs font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-smoke">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[1.75rem] border border-line bg-white p-6 sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="type-eyebrow text-brand-400">Computer vision</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">
                A mesh, not a roll call.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-smoke">
                Camera frames are converted into facial landmarks and compared by the detection
                backend. Only accepted matches become attendance records. The browser dashboard
                consumes events — it never performs recognition itself.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Camera, title: 'Frame capture', text: 'Camera stream with neutral scanning frame.' },
                { icon: Cpu, title: 'Backend inference', text: 'Facial embedding and confidence scoring.' },
                { icon: Database, title: 'Attendance write', text: 'Accepted events update the daily record.' },
                { icon: ShieldCheck, title: 'Review layer', text: 'Pending states and manual corrections.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-xl border border-line bg-fog px-4 py-3.5">
                    <Icon className="h-4 w-4 text-brand-500" />
                    <p className="mt-2.5 text-xs font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-smoke">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <p className="type-eyebrow text-brand-400">Main features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">
            Everything in one workspace
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="rounded-2xl border border-line bg-white p-5 transition hover:border-brand-300">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-smoke">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-line bg-white p-7 sm:p-9">
            <p className="type-eyebrow text-brand-400">Benefits</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">
              Less admin. Better records.
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ['98.2%', 'Recognition accuracy'],
                ['1.2s', 'Average match'],
                ['24/7', 'Session monitoring'],
              ].map(([value, label]) => (
                <div key={label} className="border-t border-line pt-3">
                  <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
                  <p className="mt-0.5 text-[10px] tracking-wide text-brand-400 uppercase">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Accurate by default', 'Designed for teachers', 'Backend-ready', 'Privacy-first'].map((benefit) => (
                <span key={benefit} className="rounded-full border border-line bg-fog px-3 py-1 text-[10px] font-medium text-brand-600">
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div className="mesh-surface rounded-[1.75rem] p-7 sm:p-9">
            <p className="type-eyebrow text-white/35">Contact</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              Talk to the team.
            </h2>
            <div className="mt-6 space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'hello@smartattendance.app' },
                { icon: Phone, label: 'Phone', value: '+1 (415) 555-0100' },
                { icon: MapPin, label: 'Office', value: 'San Francisco, California' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[9px] tracking-[0.14em] text-white/30 uppercase">{item.label}</p>
                      <p className="text-xs text-white/75">{item.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link
              to="/signin"
              className="mt-7 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[11px] font-semibold text-ink transition hover:bg-white/85"
            >
              Enter workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-4 px-5 py-7 sm:flex-row sm:px-8 lg:px-12">
          <Logo />
          <p className="text-[10px] tracking-wide text-brand-400">
            © {new Date().getFullYear()} Smart Attendance · AI attendance platform
          </p>
          <div className="flex items-center gap-4 text-[10px] text-brand-400">
            <Link to="/about" className="transition hover:text-ink">About</Link>
            <Link to="/signin" className="transition hover:text-ink">Sign in</Link>
            <Link to="/signup" className="transition hover:text-ink">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
