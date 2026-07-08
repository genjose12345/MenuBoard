import type { AuthError } from '@supabase/supabase-js'

export function formatAuthError(error: AuthError | Error): string {
  const message = error.message.toLowerCase()

  if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
    return 'Please confirm your email before logging in. Check your inbox (and spam folder) for the confirmation link.'
  }
  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Incorrect email or password. If you just signed up, confirm your email first.'
  }
  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (message.includes('password') && message.includes('least')) {
    return 'Password must be at least 8 characters.'
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  return error.message
}

export function isEmailNotConfirmedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return msg.includes('email not confirmed') || msg.includes('email_not_confirmed')
}
