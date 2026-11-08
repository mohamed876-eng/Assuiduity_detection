import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LottieSvg } from 'lottie-react'
import { ArrowDownRight, ArrowRight, ScanFace, ShieldCheck } from 'lucide-react'
import { PublicNav } from '@/components/landing/PublicNav'
import { FacialMesh } from '@/components/landing/FacialMesh'

export function LandingPage() {
  const [animationData, setAnimationData] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    import('@/assets/animations/Website-landing-page-with-blocs_cleaned.json')
      .then((module) => {
        if (active) setAnimationData(module.default)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        {failed || !animationData ? (
          <div className="mesh-surface flex h-full w-full items-center justify-center">
            <FacialMesh className={failed ? 'h-[82vmin] w-[82vmin] opacity-70' : 'h-[82vmin] w-[82vmin] animate-pulse opacity-30'} />
            {!failed && (
              <span className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.28em] text-white/30 uppercase">
                Loading facial scan
              </span>
            )}
          </div>
        ) : (
          <div className="landing-spotlight h-full w-full">
            <LottieSvg
              src={animationData}
              loop={false}
              segment={[0, 240]}
              autoplay
              rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
              subscriptions={{ error: () => setFailed(true) }}
              className="landing-animation h-full w-full max-sm:!w-[200%] max-sm:!-ml-[86%]"
              aria-label="Facial recognition scanning animation"
            />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,8,10,0.58),transparent_24%,transparent_56%,rgba(8,8,10,0.8))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink to-transparent" />

      <PublicNav />

      <main className="relative z-10 flex h-full flex-col justify-end px-5 pt-28 pb-6 sm:px-8 sm:pb-9 lg:px-12 lg:pb-11">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="animate-landing-in max-w-2xl">
            <div className="type-eyebrow flex items-center gap-2 text-white/45">
              <ScanFace className="h-3.5 w-3.5" />
              Computer vision attendance
            </div>
            <h1 className="mt-4 text-[clamp(2.65rem,7.4vw,5.9rem)] leading-[0.9] font-semibold tracking-[-0.06em] text-white">
              Presence,
              <br />
              <span className="text-white/42">recognized.</span>
            </h1>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/55 sm:text-sm">
              A facial-recognition attendance workspace. Live recognition, accurate records, and
              quiet clarity for every classroom.
            </p>

            <div className="animate-landing-late mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                to="/signin"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-semibold text-ink transition hover:bg-white/88"
              >
                Enter workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/18 bg-white/[0.04] px-5 text-xs font-medium text-white/80 backdrop-blur transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="animate-landing-late hidden shrink-0 items-end gap-7 border-l border-white/12 pl-6 pb-1 text-white/60 lg:flex">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-white">300</p>
              <p className="mt-0.5 max-w-24 text-[10px] leading-snug text-white/40">
                frames of facial mesh
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-white">98.2%</p>
              <p className="mt-0.5 max-w-24 text-[10px] leading-snug text-white/40">
                recognition accuracy
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-white">24/7</p>
              <p className="mt-0.5 max-w-24 text-[10px] leading-snug text-white/40">
                classroom monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[9px] tracking-[0.18em] text-white/28 uppercase sm:text-[10px]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" /> Privacy-first architecture
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <ArrowDownRight className="h-3.5 w-3.5" /> Motion: 300 frames · 60 fps · plays once
          </span>
          <span>Smart Attendance / 2026</span>
        </div>
      </main>
    </div>
  )
}
