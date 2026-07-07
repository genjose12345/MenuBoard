import { Check, X } from 'lucide-react'
import type { ItemReview, MenuItem } from '../../types'
import { moderateReview } from '../../lib/api'
import { StarRating } from '../menu/StarRating'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ReviewModerationProps {
  reviews: ItemReview[]
  items: MenuItem[]
  onUpdated: () => void
}

function itemName(items: MenuItem[], itemId: string): string {
  return items.find((i) => i.id === itemId)?.name ?? itemId
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ReviewModeration({ reviews, items, onUpdated }: ReviewModerationProps) {
  const pending = reviews.filter((r) => r.status === 'pending')
  const others = reviews.filter((r) => r.status !== 'pending')

  async function handleModerate(id: string, status: 'approved' | 'rejected') {
    await moderateReview(id, status)
    onUpdated()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pending approval
            {pending.length > 0 && <Badge variant="warning">{pending.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500">No reviews waiting for approval.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((review) => (
                <li key={review.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{itemName(items, review.itemId)}</p>
                      <StarRating value={review.rating} size="sm" />
                      {review.customerName && (
                        <p className="mt-1 text-sm text-slate-600">{review.customerName}</p>
                      )}
                      <p className="mt-1 text-sm text-slate-700">{review.comment}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => handleModerate(review.id, 'approved')}>
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleModerate(review.id, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {others.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {others.slice(0, 10).map((review) => (
                <li
                  key={review.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{itemName(items, review.itemId)}</span>
                  <Badge variant={review.status === 'approved' ? 'success' : 'danger'}>{review.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
