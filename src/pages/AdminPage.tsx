import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, Palette, QrCode, Star, UtensilsCrossed } from 'lucide-react'
import { getRestaurantById, getRestaurantMenu, updateRestaurant } from '../lib/api'
import type { DisplayLayoutId, RestaurantMenu } from '../types'
import { DISPLAY_LAYOUTS } from '../lib/display-layouts'
import { MenuEditor } from '../components/admin/MenuEditor'
import { QrDisplayPanel } from '../components/admin/QrDisplayPanel'
import { ReviewModeration } from '../components/admin/ReviewModeration'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { getPendingReviews } from '../lib/reviews'
import { getMenuUrl } from '../lib/qr'
import { AdminUserMenu } from '../components/admin/AdminUserMenu'
import { planDisplayName, reviewsEnabled } from '../lib/plans'
import { useAuth } from '../lib/auth/AuthProvider'
import { isDemoRestaurant } from '../lib/demo'

type Tab = 'menu' | 'reviews' | 'branding' | 'display'

export function AdminPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const { configured, loading: authLoading, restaurantId: ownedRestaurantId } = useAuth()
  const [tab, setTab] = useState<Tab>('menu')
  const [menu, setMenu] = useState<RestaurantMenu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [brandDraft, setBrandDraft] = useState({
    name: '',
    tagline: '',
    logoUrl: '',
    phone: '',
    primaryColor: '#ea580c',
    displayLayout: 'grid' as DisplayLayoutId,
  })

  const isDemo = restaurantId ? isDemoRestaurant(restaurantId) : false
  const isOwner = !configured || ownedRestaurantId === restaurantId
  const canEdit = isOwner && !isDemo
  const canView = !configured || isOwner || isDemo

  const load = useCallback(async () => {
    if (!restaurantId) return
    try {
      const restaurant = await getRestaurantById(restaurantId)
      if (!restaurant) {
        setError('Restaurant not found.')
        return
      }
      const data = await getRestaurantMenu(restaurant.slug)
      if (!data) {
        setError('Menu data not found.')
        return
      }
      setMenu(data)
      setBrandDraft({
        name: data.restaurant.name,
        tagline: data.restaurant.tagline ?? '',
        logoUrl: data.restaurant.logoUrl ?? '',
        phone: data.restaurant.phone ?? '',
        primaryColor: data.restaurant.branding.primaryColor,
        displayLayout: data.restaurant.branding.displayLayout ?? 'grid',
      })
    } catch {
      setError('Could not load admin. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSaveBranding() {
    if (!menu || !canEdit) return
    const updated = {
      ...menu.restaurant,
      name: brandDraft.name.trim(),
      tagline: brandDraft.tagline.trim() || undefined,
      logoUrl: brandDraft.logoUrl.trim() || undefined,
      phone: brandDraft.phone.trim() || undefined,
      branding: {
        primaryColor: brandDraft.primaryColor,
        displayLayout: brandDraft.displayLayout,
      },
    }
    await updateRestaurant(updated)
    setMessage('Branding saved.')
    void load()
  }

  if (loading || authLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading admin…</div>
  }

  if (!canView) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-red-600">You do not have permission to manage this restaurant.</p>
        <Link to="/login" className="text-orange-600 hover:underline">
          Log in with the owner account
        </Link>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-red-600">{error ?? 'Not found.'}</p>
        <Link to="/" className="text-orange-600 hover:underline">
          Back home
        </Link>
      </div>
    )
  }

  const pendingCount = getPendingReviews(menu.reviews).length
  const tabs: { id: Tab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'menu', label: 'Menu', icon: <UtensilsCrossed className="h-4 w-4" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" />, badge: pendingCount },
    { id: 'branding', label: 'Branding', icon: <Palette className="h-4 w-4" /> },
    { id: 'display', label: 'Display & QR', icon: <QrCode className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {isDemo && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          Demo restaurant — read-only preview.{' '}
          <Link to="/get-started" className="font-semibold underline">
            Create your own menu
          </Link>{' '}
          to get full admin access.
        </div>
      )}
      {!canEdit && !isDemo && configured && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-xs text-red-800">
          View-only — you are not the owner of this restaurant.
        </div>
      )}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link to="/" className="text-sm text-slate-500 hover:text-orange-600">
              ← MenuBoard
            </Link>
            <h1 className="text-xl font-bold text-slate-900">{menu.restaurant.name}</h1>
            <p className="text-sm text-slate-500">Admin dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={getMenuUrl(menu.restaurant.slug)} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                View menu
              </a>
            </Button>
            <Badge variant="secondary">{menu.restaurant.plan} plan</Badge>
            <AdminUserMenu restaurantName={menu.restaurant.name} />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge ? <Badge variant="warning">{t.badge}</Badge> : null}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {message && (
          <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        )}

        {tab === 'menu' && (
          <MenuEditor
            restaurant={menu.restaurant}
            categories={menu.categories}
            items={menu.items}
            onUpdated={() => void load()}
            readOnly={!canEdit}
          />
        )}

        {tab === 'reviews' && !reviewsEnabled(menu.restaurant.plan) && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-bold text-amber-900">Reviews require Pro</h2>
            <p className="mt-2 text-sm text-amber-800">
              The {planDisplayName(menu.restaurant.plan)} plan does not include customer reviews. Compare with{' '}
              <Link to="/admin/demo-burger" className="font-semibold underline">
                Demo Burger Co. (Pro)
              </Link>{' '}
              to see the full review workflow.
            </p>
          </div>
        )}

        {tab === 'reviews' && reviewsEnabled(menu.restaurant.plan) && (
          <ReviewModeration
            reviews={menu.reviews}
            items={menu.items}
            onUpdated={() => void load()}
            readOnly={!canEdit}
          />
        )}

        {tab === 'branding' && (
          <div className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold">Branding</h2>
            <div>
              <Label>Restaurant name</Label>
              <Input
                className="mt-1"
                value={brandDraft.name}
                onChange={(e) => setBrandDraft({ ...brandDraft, name: e.target.value })}
                readOnly={!canEdit}
              />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input
                className="mt-1"
                value={brandDraft.tagline}
                onChange={(e) => setBrandDraft({ ...brandDraft, tagline: e.target.value })}
                readOnly={!canEdit}
              />
            </div>
            <div>
              <Label>Phone number</Label>
              <Input
                className="mt-1"
                type="tel"
                value={brandDraft.phone}
                onChange={(e) => setBrandDraft({ ...brandDraft, phone: e.target.value })}
                placeholder="(555) 123-4567"
                readOnly={!canEdit}
              />
            </div>
            <div>
              <Label>Default display layout</Label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={brandDraft.displayLayout}
                onChange={(e) =>
                  setBrandDraft({ ...brandDraft, displayLayout: e.target.value as DisplayLayoutId })
                }
                disabled={!canEdit}
              >
                {DISPLAY_LAYOUTS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.bestFor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                className="mt-1"
                value={brandDraft.logoUrl}
                onChange={(e) => setBrandDraft({ ...brandDraft, logoUrl: e.target.value })}
                readOnly={!canEdit}
              />
            </div>
            <div>
              <Label>Accent color</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  type="color"
                  className="h-10 w-16 p-1"
                  value={brandDraft.primaryColor}
                  onChange={(e) => setBrandDraft({ ...brandDraft, primaryColor: e.target.value })}
                  disabled={!canEdit}
                />
                <Input
                  value={brandDraft.primaryColor}
                  onChange={(e) => setBrandDraft({ ...brandDraft, primaryColor: e.target.value })}
                  readOnly={!canEdit}
                />
              </div>
            </div>
            {canEdit && (
              <Button type="button" onClick={() => void handleSaveBranding()}>
                Save branding
              </Button>
            )}
          </div>
        )}

        {tab === 'display' && <QrDisplayPanel restaurant={menu.restaurant} />}
      </div>
    </div>
  )
}
