import type { ItemReview } from '../../types'
import { StarRating } from './StarRating'

interface ReviewListProps {
  reviews: ItemReview[]
}

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-sm text-slate-500">No reviews yet — be the first!</p>
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <StarRating value={review.rating} size="md" />
            <span className="text-xs text-slate-400">{formatReviewDate(review.createdAt)}</span>
          </div>
          {review.customerName && (
            <p className="mt-1 text-sm font-medium text-slate-800">{review.customerName}</p>
          )}
          <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
        </li>
      ))}
    </ul>
  )
}
