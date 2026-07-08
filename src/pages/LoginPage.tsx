import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../lib/auth/AuthProvider'
import { isEmailNotConfirmedError } from '../lib/auth/errors'
import { getUserRestaurantId } from '../lib/api'
import { setOwnerSession } from '../lib/auth/session'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { configured, signIn, resendConfirmationEmail, user, loading, restaurantId } = useAuth()
  const redirectTo = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  // After clicking the email confirmation link, Supabase redirects here with a session
  useEffect(() => {
    if (loading || !configured || !user) return
    if (redirectTo) {
      navigate(redirectTo, { replace: true })
    } else if (restaurantId) {
      navigate(`/admin/${restaurantId}`, { replace: true })
    } else {
      navigate('/get-started', { replace: true })
    }
  }, [loading, configured, user, restaurantId, redirectTo, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setNotice(null)
    setNeedsConfirmation(false)

    try {
      if (!configured) {
        setOwnerSession({ email: email.trim(), restaurantId: 'demo-burger' })
        navigate(redirectTo ?? '/admin/demo-burger')
        return
      }

      await signIn(email, password)
      const restaurantId = await getUserRestaurantId()
      if (redirectTo) {
        navigate(redirectTo)
      } else if (restaurantId) {
        navigate(`/admin/${restaurantId}`)
      } else {
        navigate('/get-started')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in.')
      setNeedsConfirmation(isEmailNotConfirmedError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendConfirmation() {
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }
    setResending(true)
    setError(null)
    try {
      await resendConfirmationEmail(email)
      setNotice('Confirmation email sent. Check your inbox and spam folder.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend confirmation email.')
    } finally {
      setResending(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-2 text-sm text-slate-600">
          {configured
            ? 'Sign in to manage your restaurant menu and account.'
            : 'Local demo mode: any email/password opens the demo restaurant admin.'}
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required autoComplete="current-password" minLength={configured ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-green-700">{notice}</p>}
          {needsConfirmation && (
            <Button type="button" variant="outline" className="w-full" disabled={resending} onClick={() => void handleResendConfirmation()}>
              {resending ? 'Sending…' : 'Resend confirmation email'}
            </Button>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log in'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          New here?{' '}
          <Link to="/signup" className="font-medium text-orange-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </Layout>
  )
}
