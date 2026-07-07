import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { getOwnerSession, setOwnerSession } from '../lib/auth/session'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const session = getOwnerSession()
    if (session) {
      navigate(`/admin/${session.restaurantId}`)
      return
    }
    setOwnerSession({ email: email.trim(), restaurantId: 'demo-burger' })
    navigate('/admin/demo-burger')
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Demo mode: any email/password opens the demo restaurant admin.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          New here?{' '}
          <Link to="/get-started" className="font-medium text-orange-600 hover:underline">
            Create your menu
          </Link>
        </p>
      </div>
    </Layout>
  )
}
