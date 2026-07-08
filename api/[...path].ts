import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  createRecord,
  deleteRecord,
  getById,
  isCollection,
  listCollection,
  patchRecord,
  replaceRecord,
  type CollectionName,
} from './lib/store'
import { parsePathParam, queryFilters, validateWrite } from './lib/validate'

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json').json(body)
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  try {
    res.setHeader('Cache-Control', 'no-store')

    const method = req.method ?? 'GET'
    if (!ALLOWED_METHODS.has(method)) {
      sendJson(res, 405, { error: 'Method not allowed' })
      return
    }

    const segments = parsePathParam(req.query.path)
    const collectionName = segments[0]
    const id = segments[1]

    if (!collectionName || !isCollection(collectionName)) {
      sendJson(res, 404, { error: 'Not found' })
      return
    }

    const collection = collectionName as CollectionName

    if (method === 'GET') {
      if (id) {
        const row = getById(collection, id)
        if (!row) {
          sendJson(res, 404, { error: 'Not found' })
          return
        }
        sendJson(res, 200, row)
        return
      }

      sendJson(res, 200, listCollection(collection, queryFilters(req.query)))
      return
    }

    const body = validateWrite(method, collection, req.body ?? {}, id)

    if (method === 'POST') {
      sendJson(res, 201, createRecord(collection, body))
      return
    }

    if (!id) {
      sendJson(res, 400, { error: 'Missing record id' })
      return
    }

    if (method === 'PUT') {
      sendJson(res, 200, replaceRecord(collection, id, body))
      return
    }

    if (method === 'PATCH') {
      sendJson(res, 200, patchRecord(collection, id, body))
      return
    }

    if (method === 'DELETE') {
      validateWrite(method, collection, {}, id)
      deleteRecord(collection, id)
      res.status(204).end()
      return
    }

    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed'
    const status =
      message === 'Not found' ? 404 : message === 'Record already exists' ? 409 : 400
    sendJson(res, status, { error: message })
  }
}
