import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Restaurant, UserProfile } from '../../types'
import { getRestaurantById, getUserRestaurantId } from '../api'
import { getSupabase, isSupabaseConfigured } from '../supabase/client'
import { profileFromDb } from '../supabase/mappers'

interface AuthContextValue {
  configured: boolean
  loading: boolean
  user: User | null
  session: Session | null
  profile: UserProfile | null
  restaurantId: string | null
  restaurant: Restaurant | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  refreshAccount: () => Promise<void>
  updateProfile: (patch: Partial<Pick<UserProfile, 'fullName' | 'phone'>>) => Promise<void>
  updateEmail: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return profileFromDb(data)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [loading, setLoading] = useState(configured)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  const refreshAccount = useCallback(async () => {
    if (!configured) {
      setLoading(false)
      return
    }

    const { data: { user: currentUser } } = await getSupabase().auth.getUser()
    setUser(currentUser)

    if (!currentUser) {
      setProfile(null)
      setRestaurantId(null)
      setRestaurant(null)
      setLoading(false)
      return
    }

    const [nextProfile, nextRestaurantId] = await Promise.all([
      fetchProfile(currentUser.id),
      getUserRestaurantId(),
    ])

    setProfile(nextProfile)
    setRestaurantId(nextRestaurantId)

    if (nextRestaurantId) {
      const nextRestaurant = await getRestaurantById(nextRestaurantId)
      setRestaurant(nextRestaurant)
    } else {
      setRestaurant(null)
    }

    setLoading(false)
  }, [configured])

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    let mounted = true

    getSupabase()
      .auth.getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        return refreshAccount()
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })

    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      void refreshAccount()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [configured, refreshAccount])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw new Error(error.message)
    await refreshAccount()
  }, [refreshAccount])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    })
    if (error) throw new Error(error.message)
    await refreshAccount()
    return { needsEmailConfirmation: !data.session }
  }, [refreshAccount])

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut()
    if (error) throw new Error(error.message)
    setProfile(null)
    setRestaurantId(null)
    setRestaurant(null)
  }, [])

  const updateProfile = useCallback(async (patch: Partial<Pick<UserProfile, 'fullName' | 'phone'>>) => {
    if (!user) throw new Error('Not authenticated.')
    const update: Record<string, string | null> = {}
    if (patch.fullName !== undefined) update.full_name = patch.fullName
    if (patch.phone !== undefined) update.phone = patch.phone

    const { data, error } = await getSupabase()
      .from('profiles')
      .update(update)
      .eq('id', user.id)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    setProfile(profileFromDb(data))
  }, [user])

  const updateEmail = useCallback(async (email: string) => {
    const { error } = await getSupabase().auth.updateUser({ email: email.trim() })
    if (error) throw new Error(error.message)
    await refreshAccount()
  }, [refreshAccount])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) throw new Error(error.message)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      loading,
      user,
      session,
      profile,
      restaurantId,
      restaurant,
      signIn,
      signUp,
      signOut,
      refreshAccount,
      updateProfile,
      updateEmail,
      updatePassword,
    }),
    [
      configured,
      loading,
      user,
      session,
      profile,
      restaurantId,
      restaurant,
      signIn,
      signUp,
      signOut,
      refreshAccount,
      updateProfile,
      updateEmail,
      updatePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
