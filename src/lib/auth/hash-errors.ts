export interface AuthHashError {
  error: string
  errorCode: string
  description: string
}

export function parseAuthHashError(): AuthHashError | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return null

  const params = new URLSearchParams(hash)
  const error = params.get('error')
  if (!error) return null

  return {
    error,
    errorCode: params.get('error_code') ?? '',
    description: decodeURIComponent((params.get('error_description') ?? '').replace(/\+/g, ' ')),
  }
}

export function clearAuthHash(): void {
  if (typeof window === 'undefined') return
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export function formatAuthHashError(hashError: AuthHashError): string {
  if (hashError.errorCode === 'otp_expired') {
    return 'This confirmation link has expired. Request a new one below and use the latest email only.'
  }
  if (hashError.errorCode === 'access_denied') {
    return hashError.description || 'Email confirmation failed. Request a new confirmation email.'
  }
  return hashError.description || 'Authentication link failed. Please try again.'
}

export function isExpiredConfirmationError(hashError: AuthHashError): boolean {
  return hashError.errorCode === 'otp_expired' || hashError.error.includes('expired')
}
