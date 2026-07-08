import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Project URL only — NOT the /rest/v1/ endpoint. */
export function normalizeSupabaseUrl(raw: string): string {
  let base = raw.trim().replace(/\/+$/, '')
  base = base.replace(/\/rest\/v1$/i, '')
  return base
}

const url = rawUrl ? normalizeSupabaseUrl(rawUrl) : ''

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey)
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}
