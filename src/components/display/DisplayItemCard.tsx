import type { ItemReview, MenuCategory, MenuItem } from '../../types'
import { formatPrice } from '../../lib/utils'
import { getAverageRating } from '../../lib/reviews'
import { StarRating } from '../menu/StarRating'
import { MenuImage } from '../menu/MenuImage'
import { cn } from '../../lib/utils'

interface DisplayItemCardProps {
  item: MenuItem
  reviews: ItemReview[]
  accent: string
  onClick: () => void
  variant?: 'grid' | 'compact' | 'mini' | 'hero'
  index?: number
  className?: string
  showNutrition?: boolean
}

export function DisplayItemCard({
  item,
  reviews,
  accent,
  onClick,
  variant = 'grid',
  index,
  className,
  showNutrition = false,
}: DisplayItemCardProps) {
  const avg = getAverageRating(reviews, item.id)

  if (variant === 'mini') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
          !item.available && 'opacity-55 grayscale',
          className,
        )}
      >
        <div className="relative aspect-[5/4] shrink-0 overflow-hidden bg-slate-100">
          <MenuImage itemId={item.id} src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          {!item.available && (
            <span className="absolute right-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Out</span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-2">
          <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.name}</p>
          <p className="text-sm font-black text-orange-600">{formatPrice(item.priceCents)}</p>
          {item.nutrition?.calories && (
            <p className="mt-auto pt-1 text-[10px] text-slate-400">{item.nutrition.calories} cal</p>
          )}
        </div>
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!item.available}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 text-left transition hover:bg-white/10',
          !item.available && 'opacity-50',
          className,
        )}
      >
        <MenuImage itemId={item.id} src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover bg-slate-700" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white">{item.name}</p>
          <p className="text-sm font-semibold" style={{ color: accent }}>
            {formatPrice(item.priceCents)}
          </p>
        </div>
      </button>
    )
  }

  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn('group relative h-full w-full overflow-hidden rounded-3xl text-left', className)}
      >
        <div className="absolute inset-0 overflow-hidden">
          <MenuImage
            itemId={item.id}
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105 animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80 lg:text-sm">Featured</p>
          <h3 className="mt-1 text-2xl font-extrabold text-white lg:text-3xl">{item.name}</h3>
          <p className="mt-1 line-clamp-2 max-w-xl text-sm text-white/90 lg:text-base">{item.description}</p>
          <p className="mt-2 text-2xl font-black lg:mt-3 lg:text-3xl" style={{ color: accent }}>
            {formatPrice(item.priceCents)}
          </p>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl',
        !item.available && 'opacity-55 grayscale',
        className,
      )}
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-slate-100">
        <MenuImage
          itemId={item.id}
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        {item.featured && (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            Featured
          </span>
        )}
        {!item.available && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            Sold out
          </span>
        )}
        {index != null && (
          <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-lg font-black text-white">
            {index}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-extrabold text-slate-900 lg:text-xl">{item.name}</h3>
          <span className="shrink-0 text-lg font-black lg:text-xl" style={{ color: accent }}>
            {formatPrice(item.priceCents)}
          </span>
        </div>
        {avg !== null && (
          <div className="mt-2">
            <StarRating value={avg} showValue size="md" />
          </div>
        )}
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{item.description}</p>
        {showNutrition && item.nutrition ? (
          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
            <p className="font-bold uppercase tracking-wide text-slate-500">Nutrition</p>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600">
              {item.nutrition.calories != null && <span>{item.nutrition.calories} cal</span>}
              {item.nutrition.proteinG != null && <span>{item.nutrition.proteinG}g protein</span>}
              {item.nutrition.carbsG != null && <span>{item.nutrition.carbsG}g carbs</span>}
              {item.nutrition.fatG != null && <span>{item.nutrition.fatG}g fat</span>}
            </div>
            {item.nutrition.allergens && item.nutrition.allergens.length > 0 && (
              <p className="mt-1.5 text-[10px] font-medium text-amber-700">
                Allergens: {item.nutrition.allergens.join(', ')}
              </p>
            )}
          </div>
        ) : item.nutrition?.calories ? (
          <p className="mt-2 text-xs font-medium text-slate-400">{item.nutrition.calories} cal</p>
        ) : null}
      </div>
    </button>
  )
}

export function categoryName(categories: MenuCategory[], categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.name ?? ''
}
