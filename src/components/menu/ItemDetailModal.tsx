import { X } from 'lucide-react'
import type { ItemReview, MenuItem } from '../../types'
import { getApprovedReviews, getAverageRating, getReviewCount } from '../../lib/reviews'
import { formatPrice } from '../../lib/utils'
import { NutritionPanel } from './NutritionPanel'
import { ReviewForm } from './ReviewForm'
import { ReviewList } from './ReviewList'
import { StarRating } from './StarRating'
import { Badge } from '../ui/badge'

interface ItemDetailModalProps {
  item: MenuItem
  reviews: ItemReview[]
  accent?: string
  onClose: () => void
  onReviewSubmitted: () => void
  readOnly?: boolean
  variant?: 'menu' | 'display'
  allowReviews?: boolean
  fullNutrition?: boolean
}

export function ItemDetailModal({
  item,
  reviews,
  accent = '#ea580c',
  onClose,
  onReviewSubmitted,
  readOnly = false,
  variant = 'menu',
  allowReviews = true,
  fullNutrition = true,
}: ItemDetailModalProps) {
  const approved = getApprovedReviews(reviews, item.id)
  const avg = getAverageRating(reviews, item.id)
  const count = getReviewCount(reviews, item.id)
  const isDisplay = variant === 'display'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className={`modal-enter max-h-[94dvh] w-full overflow-hidden bg-white shadow-2xl ${
          isDisplay
            ? 'max-w-4xl rounded-[2rem] sm:rounded-[2.5rem]'
            : 'max-w-lg rounded-t-[2rem] sm:max-w-2xl sm:rounded-[2rem]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>

        <div className={`flex flex-col ${isDisplay ? 'lg:flex-row' : ''} max-h-[90dvh] overflow-y-auto lg:max-h-[85dvh] lg:overflow-hidden`}>
          {/* Image panel — ticket notch on desktop */}
          <div
            className={`relative shrink-0 overflow-hidden bg-slate-900 ${
              isDisplay ? 'lg:w-[45%]' : ''
            } ${isDisplay ? 'aspect-[16/10] lg:aspect-auto lg:min-h-[420px]' : 'aspect-[16/10]'}`}
          >
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {!item.available && (
              <Badge className="absolute left-4 top-4" variant="danger">
                Sold out
              </Badge>
            )}
            {isDisplay && (
              <div className="absolute bottom-4 left-4 hidden rounded-2xl bg-black/60 px-4 py-2 backdrop-blur lg:block">
                <p className="text-3xl font-black text-orange-400">{formatPrice(item.priceCents)}</p>
              </div>
            )}
          </div>

          {/* Content panel */}
          <div className={`flex flex-1 flex-col overflow-y-auto p-6 ${isDisplay ? 'lg:p-8' : 'p-5'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={`font-extrabold text-slate-900 ${isDisplay ? 'text-3xl' : 'text-2xl'}`}>
                  {item.name}
                </h2>
                {avg !== null && allowReviews && (
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating value={avg} showValue size="lg" />
                    <span className="text-sm text-slate-500">
                      ({count} review{count !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
              {!isDisplay && (
                <span className="text-2xl font-black" style={{ color: accent }}>
                  {formatPrice(item.priceCents)}
                </span>
              )}
              {isDisplay && (
                <span className="text-2xl font-black lg:hidden" style={{ color: accent }}>
                  {formatPrice(item.priceCents)}
                </span>
              )}
            </div>

            <p className={`mt-4 text-slate-600 ${isDisplay ? 'text-lg' : ''}`}>{item.description}</p>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {fullNutrition ? (
                <NutritionPanel nutrition={item.nutrition} />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">Nutrition</h4>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {item.nutrition?.calories ?? '—'} <span className="text-sm font-medium text-slate-500">cal</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Upgrade to Pro for full nutrition facts &amp; allergens.</p>
                </div>
              )}
              {allowReviews ? (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">Customer reviews</h3>
                  <ReviewList reviews={approved} />
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-semibold text-amber-900">Customer reviews</h3>
                  <p className="mt-2 text-sm text-amber-800">
                    Reviews are a Pro feature. Starter menus show calories only.
                  </p>
                </div>
              )}
            </div>

            {!readOnly && item.available && allowReviews && (
              <div className="mt-5">
                <ReviewForm itemId={item.id} restaurantId={item.restaurantId} onSubmitted={onReviewSubmitted} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
