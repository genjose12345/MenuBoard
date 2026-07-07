import type { CollectionName, DbRecord } from './store'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DEMO_RESTAURANT_IDS = new Set(['demo-burger', 'demo-taco'])

function isSafeHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function assertString(value: unknown, field: string, maxLen: number): string {
  if (typeof value !== 'string') throw new Error(`${field} must be a string`)
  const trimmed = value.trim()
  if (trimmed.length > maxLen) throw new Error(`${field} is too long`)
  return trimmed
}

export function validateWrite(
  method: string,
  collection: CollectionName,
  body: unknown,
  id?: string,
): DbRecord {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object')
  }

  const record = body as DbRecord

  if (collection === 'restaurants') {
    if (method === 'DELETE' && id && DEMO_RESTAURANT_IDS.has(id)) {
      throw new Error('Demo restaurants cannot be deleted')
    }

    if (typeof record.slug === 'string' && !SLUG_RE.test(record.slug)) {
      throw new Error('Invalid slug format')
    }
    if (typeof record.name === 'string' && record.name.trim().length > 120) {
      throw new Error('Restaurant name is too long')
    }
    if (!isSafeHttpUrl(record.logoUrl)) {
      throw new Error('Logo URL must use http or https')
    }
  }

  if (collection === 'menu_items') {
    if (!isSafeHttpUrl(record.imageUrl)) {
      throw new Error('Image URL must use http or https')
    }
    if (typeof record.name === 'string' && record.name.trim().length > 120) {
      throw new Error('Item name is too long')
    }
    if (typeof record.description === 'string' && record.description.length > 2000) {
      throw new Error('Description is too long')
    }
    if (typeof record.priceCents === 'number' && (record.priceCents < 0 || record.priceCents > 1_000_000)) {
      throw new Error('Invalid price')
    }
  }

  if (collection === 'menu_categories') {
    if (!isSafeHttpUrl(record.imageUrl)) {
      throw new Error('Image URL must use http or https')
    }
    if (typeof record.name === 'string' && record.name.trim().length > 80) {
      throw new Error('Category name is too long')
    }
  }

  if (collection === 'item_reviews') {
    const rating = record.rating
    if (typeof rating === 'number' && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      throw new Error('Rating must be an integer from 1 to 5')
    }
    if (typeof record.comment === 'string') {
      record.comment = assertString(record.comment, 'comment', 500)
      if (record.comment.length < 2) throw new Error('Comment is too short')
    }
    if (typeof record.customerName === 'string') {
      record.customerName = assertString(record.customerName, 'customerName', 80)
    }
    if (typeof record.status === 'string' && !['pending', 'approved', 'rejected'].includes(record.status)) {
      throw new Error('Invalid review status')
    }
  }

  return record
}

export function parsePathParam(path: string | string[] | undefined): string[] {
  if (!path) return []
  return Array.isArray(path) ? path : [path]
}

export function queryFilters(
  query: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const filters: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (key === 'path' || value === undefined) continue
    filters[key] = Array.isArray(value) ? value[0] : value
  }
  return filters
}
