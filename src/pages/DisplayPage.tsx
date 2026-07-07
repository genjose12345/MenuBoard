import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Maximize2, Minimize2 } from 'lucide-react'
import { getRestaurantMenu } from '../lib/api'
import type { DisplayLayoutId, MenuItem, RestaurantMenu } from '../types'
import {
  DISPLAY_LAYOUTS,
  LAYOUT_VARIANTS,
  parseDisplayLayout,
  parseLayoutVariant,
} from '../lib/display-layouts'
import { isLayoutAllowed, planDisplayName } from '../lib/plans'
import { ItemDetailModal } from '../components/menu/ItemDetailModal'
import { Button } from '../components/ui/button'
import { RingingPhone } from '../components/home/AnimatedFeatureIcons'
import {
  ComboBoardLayout,
  GridLayout,
  HeroSlideshowLayout,
  NumberedListLayout,
  PremiumDetailLayout,
} from '../components/display/DisplayLayouts'

const POLL_MS = 30_000

export function DisplayPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [menu, setMenu] = useState<RestaurantMenu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const requestedLayout = parseDisplayLayout(
    searchParams.get('layout') ?? menu?.restaurant.branding.displayLayout,
  )
  const plan = menu?.restaurant.plan ?? 'pro'
  const layout =
    menu && !isLayoutAllowed(plan, requestedLayout) ? ('grid' as DisplayLayoutId) : requestedLayout
  const variant = parseLayoutVariant(layout, searchParams.get('variant'))
  const kiosk = fullscreen || searchParams.get('kiosk') === '1'

  const load = useCallback(async () => {
    if (!slug) return
    try {
      const data = await getRestaurantMenu(slug)
      if (!data) {
        setError('Menu not found.')
        return
      }
      setMenu(data)
    } catch {
      setError('Could not load menu.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
    const timer = setInterval(() => void load(), POLL_MS)
    return () => clearInterval(timer)
  }, [load])

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  function setLayout(next: DisplayLayoutId) {
    const nextVariant = parseLayoutVariant(next, null)
    setSearchParams({ layout: next, variant: nextVariant }, { replace: true })
  }

  function setVariant(next: string) {
    setSearchParams({ layout, variant: next }, { replace: true })
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  }

  const accent = menu?.restaurant.branding.primaryColor ?? '#ea580c'

  if (loading) {
    return (
      <div className="display-board flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-pulse text-lg">Loading menu board…</div>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="display-board flex flex-col items-center justify-center gap-3 bg-slate-900 px-4 text-center text-white">
        <p>{error ?? 'Menu not found.'}</p>
        <Link to="/" className="text-orange-400 hover:underline">
          Back home
        </Link>
      </div>
    )
  }

  const { restaurant } = menu
  const layoutProps = { menu, accent, variant, onItemClick: setSelectedItem }
  const variants = LAYOUT_VARIANTS[layout]
  const allowedLayouts = DISPLAY_LAYOUTS.filter((l) => isLayoutAllowed(restaurant.plan, l.id))
  const planLocked = restaurant.plan === 'starter'

  return (
    <div className={kiosk ? 'display-board display-kiosk flex min-h-[100dvh] flex-col bg-slate-100' : 'display-board flex min-h-[100dvh] flex-col bg-slate-100'}>
      <header className="display-chrome border-b-2 border-slate-200 bg-white px-4 py-4 shadow-sm lg:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {restaurant.logoUrl && (
              <img src={restaurant.logoUrl} alt="" className="h-14 w-14 rounded-2xl object-cover shadow-md lg:h-16 lg:w-16" />
            )}
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">{restaurant.name}</h1>
              {restaurant.tagline && <p className="text-sm text-slate-500 lg:text-base">{restaurant.tagline}</p>}
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone.replace(/\D/g, '')}`} className="group mt-1 flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline">
                  <RingingPhone />
                  {restaurant.phone}
                </a>
              )}
              {planLocked && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {planDisplayName(restaurant.plan)} plan
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as DisplayLayoutId)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            >
              {allowedLayouts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              title="Layout style variant"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" onClick={toggleFullscreen}>
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {fullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
          </div>
        </div>
      </header>

      {planLocked && !kiosk && (
        <div className="display-chrome border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          Starter plan: photo grid display only.{' '}
          <Link to="/get-started" className="font-semibold underline">
            Upgrade to Pro
          </Link>{' '}
          for combo boards, slideshows &amp; more.
        </div>
      )}

      <div className="display-content flex flex-1 flex-col overflow-hidden">
        {layout === 'grid' && <GridLayout {...layoutProps} />}
        {layout === 'combo-board' && <ComboBoardLayout {...layoutProps} />}
        {layout === 'hero-slideshow' && <HeroSlideshowLayout {...layoutProps} />}
        {layout === 'numbered-list' && <NumberedListLayout {...layoutProps} />}
        {layout === 'premium-detail' && <PremiumDetailLayout {...layoutProps} />}
      </div>

      <footer className="display-chrome border-t border-slate-200 bg-white py-2 text-center text-xs text-slate-400 lg:text-sm">
        Live menu · Tap any item for nutrition & reviews · Scan QR on your phone to order
      </footer>

      {kiosk && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-black/85"
        >
          <Minimize2 className="h-4 w-4" />
          Exit fullscreen
        </button>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          reviews={menu.reviews}
          accent={accent}
          onClose={() => setSelectedItem(null)}
          onReviewSubmitted={() => void load()}
          readOnly
          variant="display"
        />
      )}
    </div>
  )
}
