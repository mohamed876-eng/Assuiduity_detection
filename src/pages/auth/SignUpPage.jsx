import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { signupSchema } from '@/schemas/authSchemas'
import { useAuth } from '@/contexts/AuthContext'
import { AuthShell } from './AuthShell'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { cn } from '@/lib/cn'

const ROLES = [
  {
    value: 'teacher',
    title: 'Teacher',
    description: 'Manage classes and monitor sessions',
    icon: GraduationCap,
  },
  {
    value: 'admin',
    title: 'Administrator',
    description: 'Full access to people and settings',
    icon: BriefcaseBusiness,
  },
]

export function SignUpPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'teacher',
      terms: false,
    },
  })

  const role = watch('role')

  const onSubmit = async ({ fullName, email, password, role: accountRole }) => {
    setServerError('')
    try {
      const session = await signup({ fullName, email, password, role: accountRole })
      toast.success(`Account created. Welcome, ${session.user.name.split(' ')[0]}`)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <AuthShell>
      <div className="animate-in">
        <p className="type-eyebrow text-brand-400">Create account</p>
        <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.045em] text-ink">
          Join the workspace.
        </h2>
        <p className="mt-1.5 text-sm text-smoke">
          Set up your Smart Attendance account in under a minute.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <Input
            label="Full name"
            placeholder="Sarah Mitchell"
            required
            error={errors.fullName?.message}
            autoComplete="name"
            {...register('fullName')}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@school.edu"
            required
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                required
                error={errors.password?.message}
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 transition hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              required
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-700">
              Account role <span className="text-rose-500">*</span>
            </p>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  {ROLES.map((option) => {
                    const Icon = option.icon
                    const active = field.value === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition',
                          active
                            ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600/15'
                            : 'border-line bg-white hover:border-brand-300',
                        )}
                      >
                        <Icon className={cn('mt-0.5 h-4 w-4', active ? 'text-brand-700' : 'text-slate-400')} />
                        <span className="min-w-0">
                          <span className="block text-xs font-medium text-ink">{option.title}</span>
                          <span className="mt-0.5 block text-[10px] leading-snug text-slate-400">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white px-3.5 py-3">
              <input
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                {...register('terms')}
              />
              <span className="text-[11px] leading-relaxed text-smoke">
                I agree to the terms of service and privacy policy. I understand that this is a
                prototype with simulated biometric processing.
              </span>
            </label>
            {errors.terms && <p className="mt-1 text-xs text-rose-600">{errors.terms.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              {serverError}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting} rightIcon={<ArrowRight className="h-4 w-4" />}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-smoke">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
