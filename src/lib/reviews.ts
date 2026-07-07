import type { ItemReview } from '../types'

export function getApprovedReviews(reviews: ItemReview[], itemId: string): ItemReview[] {
  return reviews.filter((r) => r.itemId === itemId && r.status === 'approved')
}

export function getAverageRating(reviews: ItemReview[], itemId: string): number | null {
  const approved = getApprovedReviews(reviews, itemId)
  if (approved.length === 0) return null
  const sum = approved.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / approved.length) * 10) / 10
}

export function getReviewCount(reviews: ItemReview[], itemId: string): number {
  return getApprovedReviews(reviews, itemId).length
}

export function getPendingReviews(reviews: ItemReview[]): ItemReview[] {
  return reviews.filter((r) => r.status === 'pending')
}
