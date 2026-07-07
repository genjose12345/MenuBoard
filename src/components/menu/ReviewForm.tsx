import { useState } from 'react'
import { submitReview } from '../../lib/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/input'
import { Label } from '../ui/label'
import { StarRating } from './StarRating'

interface ReviewFormProps {
  itemId: string
  restaurantId: string
  onSubmitted: () => void
}

export function ReviewForm({ itemId, restaurantId, onSubmitted }: ReviewFormProps) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (comment.trim().length < 5) {
      setError('Please write at least a few words in your review.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await submitReview({
        itemId,
        restaurantId,
        customerName: name.trim() || undefined,
        rating,
        comment: comment.trim(),
      })
      setSuccess(true)
      setComment('')
      setName('')
      setRating(5)
      onSubmitted()
    } catch {
      setError('Could not submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Thanks — your review is pending approval and will appear once the restaurant approves it.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="font-semibold text-slate-900">Leave a review</h4>
      <div>
        <Label>Your rating</Label>
        <div className="mt-1">
          <StarRating value={rating} interactive onChange={setRating} size="md" />
        </div>
      </div>
      <div>
        <Label htmlFor="review-name">Name (optional)</Label>
        <Input
          id="review-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan M."
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="review-comment">Your review</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think of this item?"
          maxLength={300}
          className="mt-1"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  )
}
