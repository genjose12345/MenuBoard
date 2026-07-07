const STORAGE_KEY = 'menuboard-owner'

export interface OwnerSession {
  email: string
  restaurantId: string
}

export function getOwnerSession(): OwnerSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OwnerSession) : null
  } catch {
    return null
  }
}

export function setOwnerSession(session: OwnerSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearOwnerSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}
