import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthProvider'

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { configured, loading, user } = useAuth()
  const location = useLocation()

  if (!configured) return children

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Checking your session…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
