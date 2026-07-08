import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Link2, Phone } from 'lucide-react'
import { Layout } from '../components/Layout'
import { createRestaurant } from '../lib/api'
import { useAuth } from '../lib/auth/AuthProvider'
import { getMenuUrl } from '../lib/qr'
import { slugify } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function GetStartedPage() {
  const navigate = useNavigate()
  const { user, restaurantId, refreshAccount } = useAuth()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [tagline, setTagline] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewSlug = slug.trim() || 'your-restaurant'
  const menuPreviewUrl = typeof window !== 'undefined' ? getMenuUrl(previewSlug) : `/menu/${previewSlug}`

  useEffect(() => {
    if (restaurantId) {
      navigate(`/admin/${restaurantId}`, { replace: true })
    }
  }, [restaurantId, navigate])

  function handleNameChange(value: string) {
    setName(value)
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const restaurant = await createRestaurant({
        name: name.trim(),
        slug: slug.trim(),
        tagline: tagline.trim() || undefined,
        phone: phone.trim() || undefined,
      })
      await refreshAccount()
      navigate(`/admin/${restaurant.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create restaurant.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-extrabold text-slate-900">Set up your menu</h1>
            <p className="mt-2 text-slate-600">
              {user?.email
                ? `Signed in as ${user.email}. Create your restaurant page below.`
                : 'Create your restaurant page — add categories, items, and display boards next.'}
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <Label htmlFor="name">Restaurant name</Label>
                <Input id="name" required value={name} onChange={(e) => handleNameChange(e.target.value)} className="mt-1" placeholder="Joe's Burger Shack" />
              </div>

              <div>
                <Label htmlFor="slug">Your menu link</Label>
                <div className="mt-2 overflow-hidden rounded-xl border-2 border-orange-200 bg-orange-50/50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200">
                  <div className="flex items-center gap-2 border-b border-orange-200 bg-white px-3 py-2 text-sm text-slate-500">
                    <Globe className="h-4 w-4 shrink-0 text-orange-600" />
                    <span className="truncate font-medium">{menuPreviewUrl}</span>
                  </div>
                  <div className="flex items-center gap-0 bg-white">
                    <span className="shrink-0 border-r border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                      /menu/
                    </span>
                    <Input
                      id="slug"
                      required
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      className="border-0 bg-transparent focus-visible:ring-0"
                      placeholder="joes-burger-shack"
                    />
                  </div>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                  <Link2 className="h-3 w-3" />
                  Customers scan a QR code to this URL
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" placeholder="(555) 123-4567" />
                </div>
              </div>

              <div>
                <Label htmlFor="tagline">Tagline (optional)</Label>
                <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1" placeholder="Fresh burgers daily" />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? 'Creating…' : 'Create menu'}
              </Button>
            </form>
          </div>

          <div className="animate-fade-in-up stagger-2 hidden lg:block">
            <div className="sticky top-8 overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=800&fit=crop"
                alt="Burger preview"
                className="h-64 w-full object-cover"
              />
              <div className="bg-slate-900 p-6 text-white">
                <p className="text-sm text-orange-400">Preview</p>
                <h3 className="mt-1 text-xl font-bold">{name.trim() || 'Your Restaurant'}</h3>
                <p className="mt-1 text-sm text-slate-400">{tagline.trim() || 'Your tagline appears here'}</p>
                {phone && (
                  <p className="mt-3 flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {phone}
                  </p>
                )}
                <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs">
                  <p className="font-mono text-orange-300">/menu/{previewSlug}</p>
                  <p className="mt-1 text-slate-400">+ display board at /display/{previewSlug}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
