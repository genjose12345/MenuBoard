import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Lock, Mail, Phone, User } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { getOwnerSession } from '../lib/auth/session'
import { PLAN_FEATURES, planDisplayName, planPrice } from '../lib/plans'

export function ProfilePage() {
  const session = getOwnerSession()
  const restaurantId = session?.restaurantId ?? 'demo-burger'
  const plan = restaurantId === 'demo-taco' ? 'starter' : 'pro'

  const [email, setEmail] = useState(session?.email ?? 'owner@demo.local')
  const [phone, setPhone] = useState('(555) 123-4567')
  const [name, setName] = useState('Demo Owner')
  const [saved, setSaved] = useState<string | null>(null)

  function save(section: string) {
    setSaved(section)
    setTimeout(() => setSaved(null), 2500)
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Profile &amp; account</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your login, contact info, and subscription.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/${restaurantId}`}>Back to admin</Link>
          </Button>
        </div>

        {saved && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {saved} saved successfully.
          </p>
        )}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-xl font-bold text-white">
                {email.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">{email}</p>
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
              <Input className="mt-1" readOnly value={restaurantId === 'demo-taco' ? 'Quick Taco Stand' : 'Demo Burger Co.'} />
            </div>
          </div>
          <Button type="button" className="mt-4" onClick={() => save('General information')}>
            Save general info
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
          <Button type="button" className="mt-4" variant="outline" onClick={() => save('Email')}>
            Update email
          </Button>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Lock className="h-5 w-5 text-orange-600" />
            Change password
          </h2>
          <div className="mt-4 grid gap-4">
            <div>
              <Label>Current password</Label>
              <Input className="mt-1" type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>New password</Label>
                <Input className="mt-1" type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label>Confirm new password</Label>
                <Input className="mt-1" type="password" placeholder="••••••••" />
              </div>
            </div>
          </div>
          <Button type="button" className="mt-4" variant="outline" onClick={() => save('Password')}>
            Update password
          </Button>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Phone className="h-5 w-5 text-orange-600" />
            Phone number
          </h2>
          <p className="mt-1 text-sm text-slate-500">Shown on your QR menu and display boards.</p>
          <div className="mt-4">
            <Label>Business phone</Label>
            <Input className="mt-1" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button type="button" className="mt-4" variant="outline" onClick={() => save('Phone number')}>
            Save phone
          </Button>
        </section>

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
          {plan === 'starter' ? (
            <Button asChild className="mt-4">
              <Link to="/get-started">Upgrade to Pro</Link>
            </Button>
          ) : (
            <p className="mt-4 text-xs text-slate-400">Manage billing in a future release — MVP demo only.</p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="font-bold text-slate-900">Compare demo restaurants</h2>
          <p className="mt-1 text-sm text-slate-600">See how Starter vs Pro plans look in practice.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/admin/demo-taco"
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-md"
            >
              <Badge variant="secondary">Starter</Badge>
              <p className="mt-2 font-bold">Quick Taco Stand</p>
              <p className="text-xs text-slate-500">Simple menu · grid display only · no reviews</p>
            </Link>
            <Link
              to="/admin/demo-burger"
              className="rounded-xl border border-orange-300 bg-white p-4 transition hover:shadow-md"
            >
              <Badge>Pro</Badge>
              <p className="mt-2 font-bold">Demo Burger Co.</p>
              <p className="text-xs text-slate-500">Full menu · all layouts · reviews &amp; nutrition</p>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
