import type { ItemReview, MenuItem } from '../../types'
import { getAverageRating, getReviewCount } from '../../lib/reviews'
import { formatPrice } from '../../lib/utils'
import { StarRating } from './StarRating'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'
import { MenuImage } from './MenuImage'

interface MenuItemCardProps {
  item: MenuItem
  reviews: ItemReview[]
  onClick: () => void
  size?: 'default' | 'large'
  accent?: string
  showReviews?: boolean
}

export function MenuItemCard({
  item,
  reviews,
  onClick,
  size = 'default',
  accent = '#ea580c',
  showReviews = true,
}: MenuItemCardProps) {
  const avg = getAverageRating(reviews, item.id)
  const count = getReviewCount(reviews, item.id)
  const large = size === 'large'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white text-left shadow-md transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-orange-200',
        !item.available && 'opacity-60',
        large && 'rounded-[1.5rem] border-2',
      )}
    >
      <div className={cn('relative overflow-hidden bg-slate-100', large ? 'aspect-[4/3]' : 'aspect-[5/4]')}>
        <MenuImage
          itemId={item.id}
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        {item.featured && (
          <Badge
            className="absolute left-3 top-3 shadow-md"
            style={{ backgroundColor: accent }}
          >
            Featured
          </Badge>
        )}
        {!item.available && (
          <Badge className="absolute right-3 top-3" variant="danger">
            Sold out
          </Badge>
        )}
        <span
          className="absolute bottom-3 right-3 rounded-xl px-3 py-1 text-sm font-black text-white shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: `${accent}dd` }}
        >
          {formatPrice(item.priceCents)}
        </span>
      </div>
      <div className={cn('p-4', large && 'p-5')}>
        <h3 className={cn('font-extrabold text-slate-900', large ? 'text-2xl' : 'text-base')}>{item.name}</h3>
        {!large && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
        )}
        {showReviews && avg !== null && (
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={avg} showValue size="md" />
            <span className={cn('text-slate-500', large ? 'text-sm' : 'text-xs')}>
              ({count})
            </span>
          </div>
        )}
        {item.nutrition?.calories && (
          <p className="mt-2 text-xs font-medium text-slate-400">{item.nutrition.calories} cal</p>
        )}
      </div>
    </button>
  )
}
