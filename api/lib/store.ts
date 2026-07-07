import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type CollectionName = 'restaurants' | 'menu_categories' | 'menu_items' | 'item_reviews'

export type DbRecord = Record<string, unknown>

export interface Db {
  restaurants: DbRecord[]
  menu_categories: DbRecord[]
  menu_items: DbRecord[]
  item_reviews: DbRecord[]
}

const COLLECTIONS: CollectionName[] = [
  'restaurants',
  'menu_categories',
  'menu_items',
  'item_reviews',
]

let db: Db | null = null

function loadSeed(): Db {
  const path = join(process.cwd(), 'server', 'db.json')
  return JSON.parse(readFileSync(path, 'utf-8')) as Db
}

export function getDb(): Db {
  if (!db) {
    db = loadSeed()
  }
  return db
}

export function isCollection(name: string): name is CollectionName {
  return (COLLECTIONS as string[]).includes(name)
}

export function listCollection(
  collection: CollectionName,
  filters: Record<string, string>,
): DbRecord[] {
  const rows = getDb()[collection]
  const keys = Object.keys(filters)
  if (keys.length === 0) return [...rows]

  return rows.filter((row) =>
    keys.every((key) => String(row[key] ?? '') === filters[key]),
  )
}

export function getById(collection: CollectionName, id: string): DbRecord | null {
  return getDb()[collection].find((row) => row.id === id) ?? null
}

export function createRecord(collection: CollectionName, record: DbRecord): DbRecord {
  const rows = getDb()[collection]
  if (typeof record.id === 'string' && rows.some((row) => row.id === record.id)) {
    throw new Error('Record already exists')
  }
  rows.push(record)
  return record
}

export function replaceRecord(
  collection: CollectionName,
  id: string,
  record: DbRecord,
): DbRecord {
  const rows = getDb()[collection]
  const index = rows.findIndex((row) => row.id === id)
  if (index === -1) throw new Error('Not found')
  const next = { ...record, id }
  rows[index] = next
  return next
}

export function patchRecord(
  collection: CollectionName,
  id: string,
  partial: DbRecord,
): DbRecord {
  const existing = getById(collection, id)
  if (!existing) throw new Error('Not found')
  const next = { ...existing, ...partial, id }
  replaceRecord(collection, id, next)
  return next
}

export function deleteRecord(collection: CollectionName, id: string): void {
  const rows = getDb()[collection]
  const index = rows.findIndex((row) => row.id === id)
  if (index === -1) throw new Error('Not found')
  rows.splice(index, 1)
}
