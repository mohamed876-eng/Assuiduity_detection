import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, MailCheck, Send } from 'lucide-react'
import { forgotPasswordSchema } from '@/schemas/authSchemas'
import { authService } from '@/services/api/authService'
import { AuthShell } from './AuthShell'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

export function ForgotPasswordPage() {
  const [result, setResult] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  const onSubmit = async (values) => {
    const response = await authService.forgotPassword(values)
    setResult(response)
  }

  return (
    <AuthShell>
      {result ? (
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MailCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            Check your inbox
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{result.message}</p>
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-700">
            This is a prototype. No email is actually sent and no password reset endpoint is called.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button variant="outline" onClick={() => setResult(null)}>
              Try another email
            </Button>
            <Link to="/signin">
              <Button variant="ghost" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Reset password</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter the email linked to your account and we’ll send reset instructions.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@school.edu"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              rightIcon={<Send className="h-4 w-4" />}
            >
              Send reset link
            </Button>
          </form>
          <Link
            to="/signin"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      )}
    </AuthShell>
  )
}
