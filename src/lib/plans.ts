import type { DisplayLayoutId, PlanTier } from '../types'

export interface PlanFeatures {
  label: string
  starter: boolean | string
  pro: boolean | string
}

export const PLAN_FEATURES: PlanFeatures[] = [
  { label: 'QR mobile menu', starter: true, pro: true },
  { label: 'Menu items', starter: 'Up to 15', pro: 'Unlimited' },
  { label: 'Display board layouts', starter: 'Photo grid only', pro: 'All 5 layouts + variants' },
  { label: 'Customer reviews', starter: false, pro: true },
  { label: 'Nutrition & allergens', starter: 'Basic calories', pro: 'Full nutrition panel' },
  { label: 'Branding & logo', starter: 'Accent color', pro: 'Full branding' },
  { label: 'Live price updates', starter: true, pro: true },
]

export function planDisplayName(plan: PlanTier): string {
  return plan === 'pro' ? 'Pro / Business' : 'Starter'
}

export function planPrice(plan: PlanTier): string {
  return plan === 'pro' ? '$19/mo' : '$9/mo'
}

export function isLayoutAllowed(plan: PlanTier, layout: DisplayLayoutId): boolean {
  if (plan === 'pro') return true
  return layout === 'grid'
}

export function reviewsEnabled(plan: PlanTier): boolean {
  return plan === 'pro'
}
