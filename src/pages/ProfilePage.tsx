import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Lock, Mail, Phone, User } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../lib/auth/AuthProvider'
import { updateRestaurant } from '../lib/api'
import { PLAN_FEATURES, planDisplayName, planPrice } from '../lib/plans'

export function ProfilePage() {
  const navigate = useNavigate()
  const {
    configured,
    loading,
    user,
    profile,
    restaurant,
    restaurantId,
    updateProfile,
    updateEmail,
    updatePassword,
    signOut,
    refreshAccount,
  } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      setName(profile?.fullName ?? '')
      setEmail(user?.email ?? '')
      setPhone(profile?.phone ?? '')
      setBusinessPhone(restaurant?.phone ?? '')
    }
  }, [loading, profile, user, restaurant])

  function flash(section: string) {
    setSaved(section)
    setTimeout(() => setSaved(null), 2500)
  }

  async function saveGeneral() {
    setSubmitting('general')
    setError(null)
    try {
      if (configured) {
        await updateProfile({ fullName: name.trim() || null, phone: phone.trim() || null })
      }
      flash('General information')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.')
    } finally {
      setSubmitting(null)
    }
  }

  async function saveEmail() {
    setSubmitting('email')
    setError(null)
    try {
      if (!configured) {
        flash('Email')
        return
      }
      await updateEmail(email.trim())
      flash('Email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update email.')
    } finally {
      setSubmitting(null)
    }
  }

  async function savePassword() {
    setSubmitting('password')
    setError(null)
    try {
      if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.')
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match.')
      if (!configured) {
        flash('Password')
        setNewPassword('')
        setConfirmPassword('')
        return
      }
      await updatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
      flash('Password')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.')
    } finally {
      setSubmitting(null)
    }
  }

  async function saveBusinessPhone() {
    if (!restaurant) return
    setSubmitting('business-phone')
    setError(null)
    try {
      await updateRestaurant({ ...restaurant, phone: businessPhone.trim() || undefined })
      await refreshAccount()
      flash('Business phone')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save phone.')
    } finally {
      setSubmitting(null)
    }
  }

  async function handleSignOut() {
    if (configured) await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading profile…</div>
      </Layout>
    )
  }

  const plan = restaurant?.plan ?? 'starter'
  const displayEmail = user?.email ?? email
  const displayName = name || profile?.fullName || 'Account owner'
  const initial = displayEmail.charAt(0).toUpperCase()

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Profile &amp; account</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your login, contact info, and subscription.</p>
          </div>
          {restaurantId ? (
            <Button asChild variant="outline" size="sm">
              <Link to={`/admin/${restaurantId}`}>Back to admin</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/get-started">Create your menu</Link>
            </Button>
          )}
        </div>

        {saved && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {saved} saved successfully.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-xl font-bold text-white">
                {initial}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{displayName}</p>
                <p className="text-sm text-slate-500">{displayEmail}</p>
              </div>
            </div>
            <Badge variant={plan === 'pro' ? 'default' : 'secondary'} className="text-sm">
              {planDisplayName(plan)} · {planPrice(plan)}
            </Badge>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <User className="h-5 w-5 text-orange-600" />
            General information
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Restaurant</Label>
              <Input className="mt-1" readOnly value={restaurant?.name ?? 'Not created yet'} />
            </div>
          </div>
          <Button type="button" className="mt-4" onClick={() => void saveGeneral()} disabled={submitting === 'general'}>
            {submitting === 'general' ? 'Saving…' : 'Save general info'}
          </Button>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Mail className="h-5 w-5 text-orange-600" />
            Change email
          </h2>
          <div className="mt-4">
            <Label>Email address</Label>
            <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="button" className="mt-4" variant="outline" onClick={() => void saveEmail()} disabled={submitting === 'email'}>
            {submitting === 'email' ? 'Updating…' : 'Update email'}
          </Button>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Lock className="h-5 w-5 text-orange-600" />
            Change password
          </h2>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>New password</Label>
                <Input className="mt-1" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div>
                <Label>Confirm new password</Label>
                <Input className="mt-1" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>
            </div>
          </div>
          <Button type="button" className="mt-4" variant="outline" onClick={() => void savePassword()} disabled={submitting === 'password'}>
            {submitting === 'password' ? 'Updating…' : 'Update password'}
          </Button>
        </section>

        {restaurant && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <Phone className="h-5 w-5 text-orange-600" />
              Business phone
            </h2>
            <p className="mt-1 text-sm text-slate-500">Shown on your QR menu and display boards.</p>
            <div className="mt-4">
              <Label>Business phone</Label>
              <Input className="mt-1" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
            </div>
            <Button type="button" className="mt-4" variant="outline" onClick={() => void saveBusinessPhone()} disabled={submitting === 'business-phone'}>
              {submitting === 'business-phone' ? 'Saving…' : 'Save phone'}
            </Button>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <CreditCard className="h-5 w-5 text-orange-600" />
            Your plan — {planDisplayName(plan)}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            You&apos;re on the <strong>{planDisplayName(plan)}</strong> plan at {planPrice(plan)}.
            {plan === 'starter' && ' Upgrade to unlock all display layouts and customer reviews.'}
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Feature</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Starter</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Pro</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((f) => (
                  <tr key={f.label} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">{f.label}</td>
                    <td className="px-4 py-2 text-slate-600">{String(f.starter)}</td>
                    <td className="px-4 py-2 text-slate-600">{String(f.pro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Session</h2>
          <p className="mt-1 text-sm text-slate-500">Sign out on this device.</p>
          <Button type="button" variant="outline" className="mt-4 text-red-600 hover:bg-red-50" onClick={() => void handleSignOut()}>
            Log out
          </Button>
        </section>
      </div>
    </Layout>
  )
}
