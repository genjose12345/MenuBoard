import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import {
  DISPLAY_LAYOUTS,
  LAYOUT_VARIANTS,
  displayLayoutUrl,
} from '../lib/display-layouts'
import { getMenuUrl } from '../lib/qr'
import {
  AnimatedStars,
  ClappingUtensils,
  LiveUpdateIcon,
  QrAnimatedIcon,
  RingingPhone,
  SpreadMonitorIcon,
} from '../components/home/AnimatedFeatureIcons'
import { QrScanDemoModal, ReviewsDemoModal } from '../components/home/FeatureDemoModals'
import {
  LayoutGrid,
  ListOrdered,
  MonitorPlay,
  Sparkles,
} from 'lucide-react'

const DEMO_SLUG = 'demo-burger'
const STARTER_SLUG = 'demo-taco'

type FeatureId = 'qr' | 'monitor' | 'live' | 'reviews'

const FEATURES: {
  id: FeatureId
  title: string
  desc: string
  href?: string
  demo?: 'qr' | 'reviews'
  cta: string
}[] = [
  {
    id: 'qr',
    title: 'QR mobile menu',
    desc: 'Nutrition, allergens, customer reviews.',
    demo: 'qr',
    cta: 'See scan demo →',
  },
  {
    id: 'monitor',
    title: 'Monitor display',
    desc: '5 layout styles for tablets & TVs.',
    href: displayLayoutUrl(DEMO_SLUG, 'combo-board', 'classic'),
    cta: 'Open combo board →',
  },
  {
    id: 'live',
    title: 'Live updates',
    desc: 'Change prices & sold-out in seconds.',
    href: `/admin/${DEMO_SLUG}`,
    cta: 'Try admin dashboard →',
  },
  {
    id: 'reviews',
    title: 'Item reviews',
    desc: 'Customers rate dishes — you approve first.',
    demo: 'reviews',
    cta: 'See review examples →',
  },
]

function FeatureIcon({ type }: { type: FeatureId }) {
  switch (type) {
    case 'qr':
      return <QrAnimatedIcon />
    case 'monitor':
      return <SpreadMonitorIcon />
    case 'live':
      return <LiveUpdateIcon />
    case 'reviews':
      return <AnimatedStars className="h-8 w-8" />
  }
}

export function HomePage() {
  const [qrDemoOpen, setQrDemoOpen] = useState(false)
  const [reviewsDemoOpen, setReviewsDemoOpen] = useState(false)

  return (
    <Layout>
      {qrDemoOpen && <QrScanDemoModal onClose={() => setQrDemoOpen(false)} />}
      {reviewsDemoOpen && <ReviewsDemoModal onClose={() => setReviewsDemoOpen(false)} />}

      <section className="hero-gradient relative overflow-hidden border-b border-orange-100">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-in-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-orange-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Digital menus made simple
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              QR menus &amp; monitor display boards
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              Update prices online — no reprinting. Customers scan a QR code on their phone, or browse your
              full-screen menu on a counter monitor with rotating promos.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a href="tel:5551234567" className="group flex items-center gap-2 text-sm font-semibold text-slate-700">
                <RingingPhone />
                Demo: (555) 123-4567
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="animate-pulse-glow">
                <Link to="/get-started">Start free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={`/menu/${DEMO_SLUG}`}>View demo menu</Link>
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in-up stagger-2">
            <div className="animate-float overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&h=700&q=80"
                alt="Gourmet burger"
                className="h-64 w-full object-cover lg:h-80"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 animate-slide-in-right rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <QrAnimatedIcon className="h-8 w-8" />
              <p className="mt-1 text-sm font-bold">Scan &amp; browse</p>
              <p className="text-xs text-slate-500">/menu/your-restaurant</p>
            </div>
            <div className="absolute -right-2 top-8 hidden animate-fade-in-up stagger-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:block">
              <MonitorPlay className="h-6 w-6 text-orange-600" />
              <p className="text-xs font-bold">5 display layouts</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="mb-6 text-center text-sm text-slate-500">Hover a card to see the animation · Click to open a live example</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const inner = (
              <Card className="h-full transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
                <CardContent className="p-6">
                  {f.id === 'live' ? <ClappingUtensils /> : <FeatureIcon type={f.id} />}
                  <h3 className="mt-3 font-bold group-hover:text-orange-700">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                  <p className="mt-3 text-xs font-semibold text-orange-600 opacity-0 transition group-hover:opacity-100">
                    {f.cta}
                  </p>
                </CardContent>
              </Card>
            )

            if (f.demo === 'qr') {
              return (
                <button
                  key={f.title}
                  type="button"
                  onClick={() => setQrDemoOpen(true)}
                  className={`group block w-full animate-fade-in-up text-left stagger-${i + 1}`}
                >
                  {inner}
                </button>
              )
            }
            if (f.demo === 'reviews') {
              return (
                <button
                  key={f.title}
                  type="button"
                  onClick={() => setReviewsDemoOpen(true)}
                  className={`group block w-full animate-fade-in-up text-left stagger-${i + 1}`}
                >
                  {inner}
                </button>
              )
            }
            return (
              <Link key={f.title} to={f.href!} className={`group block animate-fade-in-up stagger-${i + 1}`}>
                {inner}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold">Monitor display layouts</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Pick a style for your in-store screen — combo boards, numbered menus, hero slideshows, and more.
            Each layout has multiple style variants. Tap items on any board to see nutrition &amp; reviews.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DISPLAY_LAYOUTS.map((layout, i) => (
              <div
                key={layout.id}
                className={`animate-fade-in-up rounded-2xl border border-white/10 bg-white/5 p-5 stagger-${(i % 4) + 1}`}
              >
                <div className="flex items-center gap-3">
                  {layout.id === 'numbered-list' ? (
                    <ListOrdered className="h-6 w-6 text-orange-400" />
                  ) : layout.id === 'grid' ? (
                    <LayoutGrid className="h-6 w-6 text-orange-400" />
                  ) : (
                    <MonitorPlay className="h-6 w-6 text-orange-400" />
                  )}
                  <h3 className="font-bold">{layout.name}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-400">{layout.description}</p>
                <p className="mt-2 text-xs font-medium text-orange-400/80">{layout.bestFor}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {LAYOUT_VARIANTS[layout.id].map((v) => (
                    <Link
                      key={v.id}
                      to={`/display/${DEMO_SLUG}?layout=${layout.id}&variant=${v.id}`}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium transition hover:border-orange-400 hover:bg-orange-500/20"
                      title={v.description}
                    >
                      {v.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Compare Starter vs Pro demos</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-600">
          See how plans differ — Starter is a simple QR menu; Pro unlocks reviews, nutrition, and all display boards.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Starter · $9/mo</span>
            <h3 className="mt-3 text-xl font-bold">Quick Taco Stand</h3>
            <p className="mt-1 text-sm text-slate-600">Simple menu, photo grid display only, calories only — no customer reviews.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/menu/${STARTER_SLUG}`}>QR menu</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={`/display/${STARTER_SLUG}?layout=grid`}>Display</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={`/admin/${STARTER_SLUG}`}>Admin</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">
            <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">Pro · $19/mo</span>
            <h3 className="mt-3 text-xl font-bold">Demo Burger Co.</h3>
            <p className="mt-1 text-sm text-slate-600">Full menu, all 5 display layouts, reviews, full nutrition &amp; allergens.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to={`/menu/${DEMO_SLUG}`}>QR menu</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={displayLayoutUrl(DEMO_SLUG, 'combo-board', 'classic')}>Combo board</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={`/admin/${DEMO_SLUG}`}>Admin</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Menu link: {getMenuUrl(DEMO_SLUG)}</p>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Starter $9/mo · Pro $19/mo · Display-only MVP (ordering coming later)</p>
          <p className="mt-1">
            Questions? Call{' '}
            <a href="tel:5551234567" className="group inline-flex items-center gap-1 font-semibold text-orange-600 hover:underline">
              <RingingPhone />
              (555) 123-4567
            </a>
          </p>
        </div>
      </section>
    </Layout>
  )
}
