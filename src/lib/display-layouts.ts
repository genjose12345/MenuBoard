import type { DisplayLayoutId } from '../types'

export interface DisplayLayoutOption {
  id: DisplayLayoutId
  name: string
  description: string
  bestFor: string
}

export interface LayoutVariantOption {
  id: string
  name: string
  description: string
}

export const DISPLAY_LAYOUTS: DisplayLayoutOption[] = [
  {
    id: 'grid',
    name: 'Photo grid',
    description: 'Large item cards with photos — great for tablets at the counter.',
    bestFor: 'Tablets & small screens',
  },
  {
    id: 'combo-board',
    name: 'Combo board',
    description: 'Drive-thru style columns: combos list, hero promos, sides & drinks.',
    bestFor: 'Wide monitors (McDonald\'s style)',
  },
  {
    id: 'hero-slideshow',
    name: 'Hero slideshow',
    description: 'Rotating featured items with Ken Burns animation + category list.',
    bestFor: 'Promotional screens',
  },
  {
    id: 'numbered-list',
    name: 'Numbered menu',
    description: 'Numbered items with thumbnails — easy for quick ordering.',
    bestFor: 'Counter displays & drive-thru',
  },
  {
    id: 'premium-detail',
    name: 'Premium detail',
    description: 'Dark board with hero item, ratings, calories, and full item list.',
    bestFor: 'Upscale fast-casual monitors',
  },
]

export const LAYOUT_VARIANTS: Record<DisplayLayoutId, LayoutVariantOption[]> = {
  grid: [
    { id: 'uniform', name: 'Uniform grid', description: 'Equal-height cards in a clean grid' },
    { id: 'compact', name: 'Compact grid', description: 'Smaller cards, more items visible' },
    { id: 'spotlight', name: 'Spotlight grid', description: 'Featured item spans two columns' },
  ],
  'combo-board': [
    { id: 'classic', name: 'Classic 3-column', description: 'List · hero promos · sides' },
    { id: 'dark', name: 'Dark drive-thru', description: 'Dark theme with bold headers' },
    { id: 'wide', name: 'Cinematic board', description: 'Full-width hero + 4-column price lists below' },
  ],
  'hero-slideshow': [
    { id: 'split', name: 'Split screen', description: 'Hero left, menu list right' },
    { id: 'banner', name: 'Top banner', description: 'Wide hero strip on top' },
    { id: 'stacked', name: 'Stacked cards', description: 'Smaller hero + scrollable menu' },
  ],
  'numbered-list': [
    { id: 'classic', name: 'Classic numbered', description: 'Single column with big numbers' },
    { id: 'columns', name: 'Two columns', description: 'Split categories side by side' },
    { id: 'chalkboard', name: 'Chalkboard', description: 'Handwritten chalk menu with dotted leaders' },
  ],
  'premium-detail': [
    { id: 'split', name: 'Split hero', description: 'Large hero with nutrition + sidebar list' },
    { id: 'compact', name: 'Mosaic grid', description: 'Featured tile + compact item grid' },
    { id: 'strip', name: 'Ticker strip', description: 'Hero strip + category pills + photo grid' },
  ],
}

export function parseDisplayLayout(value: string | null | undefined): DisplayLayoutId {
  const valid = DISPLAY_LAYOUTS.map((l) => l.id)
  if (value && valid.includes(value as DisplayLayoutId)) {
    return value as DisplayLayoutId
  }
  return 'grid'
}

export function parseLayoutVariant(
  layout: DisplayLayoutId,
  value: string | null | undefined,
): string {
  const variants = LAYOUT_VARIANTS[layout]
  if (value && variants.some((v) => v.id === value)) return value
  return variants[0]?.id ?? 'classic'
}

export function displayLayoutUrl(
  slug: string,
  layout: DisplayLayoutId,
  variant?: string,
): string {
  const params = new URLSearchParams({ layout })
  if (variant) params.set('variant', variant)
  return `${window.location.origin}/display/${slug}?${params.toString()}`
}

export function getVariantLabel(layout: DisplayLayoutId, variant: string): string {
  return LAYOUT_VARIANTS[layout].find((v) => v.id === variant)?.name ?? variant
}
