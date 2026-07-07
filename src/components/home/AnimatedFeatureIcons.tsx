import { Maximize2, Phone, QrCode, RefreshCw, Star, UtensilsCrossed } from 'lucide-react'
import { cn } from '../../lib/utils'

export function ClappingUtensils({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-10 w-10 items-center justify-center', className)}>
      <UtensilsCrossed className="h-8 w-8 text-orange-600 group-hover-utensil-wiggle" />
      <span className="group-hover-spark-pop absolute -right-0.5 -top-0.5 text-sm opacity-0">✨</span>
    </span>
  )
}

export function SpreadMonitorIcon({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex rounded-lg p-1', className)}>
      <Maximize2 className="h-8 w-8 text-orange-600 group-hover-monitor-spread" />
    </span>
  )
}

export function AnimatedStars({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className="h-5 w-5 text-amber-400 group-hover-star-cycle"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

export function RingingPhone({ className }: { className?: string }) {
  return <Phone className={cn('h-4 w-4 text-orange-600 group-hover-phone-ring', className)} />
}

export function LiveUpdateIcon({ className }: { className?: string }) {
  return <RefreshCw className={cn('h-8 w-8 text-orange-600 group-hover-spin-slow', className)} />
}

export function QrAnimatedIcon({ className }: { className?: string }) {
  return <QrCode className={cn('h-8 w-8 rounded-lg text-orange-600', className)} />
}
