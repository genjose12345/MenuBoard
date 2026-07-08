import { Link, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { useAuth } from '../lib/auth/AuthProvider'

export function ConfirmEmailPage() {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''
  const { resendConfirmationEmail } = useAuth()
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleResend() {
    if (!email) {
      setError('No email on file. Go back to sign up and try again.')
      return
    }
    setResending(true)
    setError(null)
    setNotice(null)
    try {
      await resendConfirmationEmail(email)
      setNotice('Confirmation email sent. Check your inbox and spam folder.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend email.')
    } finally {
      setResending(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <Mail className="h-8 w-8 text-orange-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Check your email</h1>
        <p className="mt-3 text-sm text-slate-600">
          We sent a confirmation link to{' '}
          <strong className="text-slate-900">{email || 'your email address'}</strong>.
          Click the link in that email, then log in.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Didn&apos;t get it? Check spam, wait 2–3 minutes, or resend below.
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {notice && <p className="mt-4 text-sm text-green-700">{notice}</p>}

        <div className="mt-8 flex flex-col gap-3">
          <Button type="button" variant="outline" disabled={resending} onClick={() => void handleResend()}>
            {resending ? 'Sending…' : 'Resend confirmation email'}
          </Button>
          <Button asChild>
            <Link to="/login">Go to log in</Link>
          </Button>
          <Link to="/signup" className="text-sm text-orange-600 hover:underline">
            Use a different email
          </Link>
        </div>
      </div>
    </Layout>
  )
}
