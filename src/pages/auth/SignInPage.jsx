import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { loginSchema } from '@/schemas/authSchemas'
import { useAuth } from '@/contexts/AuthContext'
import { AuthShell } from './AuthShell'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

export function SignInPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const session = await login(values)
      toast.success(`Welcome back, ${session.user.name.split(' ')[0]}`)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
    }
  }

  const fillDemo = (role) => {
    if (role === 'admin') {
      setValue('email', 'admin@smartattendance.app', { shouldValidate: true })
      setValue('password', 'admin123', { shouldValidate: true })
    } else {
      setValue('email', 'teacher@smartattendance.app', { shouldValidate: true })
      setValue('password', 'teacher123', { shouldValidate: true })
    }
  }

  return (
    <AuthShell>
      <div className="animate-in">
        <p className="type-eyebrow text-brand-400">Secure access</p>
        <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.045em] text-ink">
          Welcome back.
        </h2>
        <p className="mt-1.5 text-sm text-smoke">
          Sign in to your attendance workspace to continue.
        </p>

        <div className="mt-5 rounded-xl border border-line bg-white p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-brand-500 uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Demo accounts
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="rounded-md border border-line bg-fog px-2.5 py-1 text-[11px] font-medium text-brand-700 transition hover:border-brand-300 hover:bg-brand-100"
            >
              Administrator
            </button>
            <button
              type="button"
              onClick={() => fillDemo('teacher')}
              className="rounded-md border border-line bg-fog px-2.5 py-1 text-[11px] font-medium text-brand-700 transition hover:border-brand-300 hover:bg-brand-100"
            >
              Teacher
            </button>
            <span className="self-center text-[10px] text-slate-400">fills the form</span>
          </div>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-500">
            admin@smartattendance.app · admin123
            <br />
            teacher@smartattendance.app · teacher123
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@school.edu"
            required
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />
          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              required
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 transition hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-smoke">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                {...register('remember')}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-600 transition hover:text-ink"
            >
              Forgot password?
            </Link>
          </div>

          {serverError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              {serverError}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-smoke">
          New to Smart Attendance?{' '}
          <Link to="/signup" className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-ink">
            Create an account
          </Link>
        </p>

        <p className="mt-6 rounded-lg border border-line bg-white px-3 py-2.5 text-[10px] leading-relaxed text-slate-400">
          Authentication is mocked for this prototype. Credentials are validated in the browser and
          passwords are never stored in plain text.
        </p>
      </div>
    </AuthShell>
  )
}
