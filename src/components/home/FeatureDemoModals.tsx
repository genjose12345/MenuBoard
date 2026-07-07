import { useEffect, useState } from 'react'
import { Check, QrCode, Smartphone, X } from 'lucide-react'
import { StarRating } from '../menu/StarRating'
import { Button } from '../ui/button'
import { getMenuUrl } from '../../lib/qr'

const DEMO_SLUG = 'demo-burger'

const EXAMPLE_REVIEWS = [
  {
    name: 'Alex R.',
    rating: 5,
    date: 'Jun 19, 2026',
    item: 'Bacon BBQ Burger',
    comment: 'The BBQ sauce and onion rings combo is insane. Worth every penny.',
  },
  {
    name: 'Jordan M.',
    rating: 5,
    date: 'Jun 20, 2026',
    item: 'Classic Cheeseburger',
    comment: 'Best cheeseburger in town — bun stays soft and the sauce is perfect.',
  },
  {
    name: 'Taylor K.',
    rating: 4,
    date: 'Jun 18, 2026',
    item: 'Crispy Chicken Sandwich',
    comment: 'Crunchy and juicy. Spicy mayo has a nice kick.',
  },
]

interface ModalShellProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="modal-enter max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function QrScanDemoModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const menuUrl = getMenuUrl(DEMO_SLUG)

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % 3), 2800)
    return () => clearInterval(timer)
  }, [])

  const steps = ['Scan QR code', 'Opens menu link', 'Browse on phone']

  return (
    <ModalShell title="QR mobile menu — how it works" onClose={onClose}>
      <div className="flex justify-center gap-2">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
              step === i ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {step > i ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
            {label}
          </div>
        ))}
      </div>

      <div className="relative mx-auto mt-6 flex h-72 max-w-xs items-center justify-center">
        {step === 0 && (
          <div className="animate-fade-in text-center">
            <div className="mx-auto flex h-48 w-36 flex-col items-center rounded-[2rem] border-4 border-slate-800 bg-slate-900 p-3 shadow-xl">
              <div className="mt-2 h-1.5 w-12 rounded-full bg-slate-700" />
              <div className="mt-4 flex flex-1 items-center justify-center rounded-xl bg-white p-3">
                <QrCode className="h-20 w-20 text-slate-900" />
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">Customer scans table tent QR</p>
          </div>
        )}
        {step === 1 && (
          <div className="animate-fade-in w-full text-center">
            <div className="mx-auto rounded-xl border border-orange-200 bg-orange-50 p-4">
              <Smartphone className="mx-auto h-8 w-8 text-orange-600" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-700">Opening link…</p>
              <p className="mt-2 break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-700">{menuUrl}</p>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="animate-fade-in w-full">
            <div className="mx-auto max-w-[220px] overflow-hidden rounded-[1.5rem] border-4 border-slate-800 bg-white shadow-xl">
              <div className="bg-orange-600 px-3 py-2 text-center text-xs font-bold text-white">Demo Burger Co.</div>
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=280&q=80"
                alt="Menu preview"
                className="h-28 w-full object-cover"
              />
              <div className="p-3">
                <p className="font-bold text-slate-900">Classic Cheeseburger</p>
                <p className="text-sm font-black text-orange-600">$8.99</p>
                <p className="mt-1 text-xs text-slate-500">Tap for nutrition &amp; reviews</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button asChild className="mt-4 w-full">
        <a href={menuUrl}>Open full demo menu</a>
      </Button>
    </ModalShell>
  )
}

export function ReviewsDemoModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Item reviews — customer examples" onClose={onClose}>
      <p className="text-sm text-slate-600">
        Customers rate dishes from the QR menu. You approve reviews before they appear publicly.
      </p>
      <ul className="mt-4 space-y-3">
        {EXAMPLE_REVIEWS.map((r) => (
          <li key={r.name + r.date} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <StarRating value={r.rating} size="md" />
              <span className="text-xs text-slate-400">{r.date}</span>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">{r.name}</p>
            <p className="text-xs font-medium text-orange-600">on {r.item}</p>
            <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Admin flow:</strong> New reviews land as pending → you approve or reject in the dashboard.
      </div>
    </ModalShell>
  )
}
