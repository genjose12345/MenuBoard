/**
 * Canonical site URL for auth email links (confirmation, password reset).
 * Set VITE_SITE_URL in production so emails always point to your live domain,
 * not a preview deployment URL.
 */
export function getAuthRedirectBase(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim()
  if (configured) {
    return configured.replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

export function getLoginRedirectUrl(): string {
  const base = getAuthRedirectBase()
  return base ? `${base}/login` : '/login'
}
