import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { getOwnerSession, clearOwnerSession } from '../../lib/auth/session'
import { Button } from '../ui/button'

interface AdminUserMenuProps {
  restaurantName?: string
}

export function AdminUserMenu({ restaurantName }: AdminUserMenuProps) {
  const session = getOwnerSession()
  const [open, setOpen] = useState(false)
  const email = session?.email ?? 'owner@demo.local'
  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm transition hover:border-orange-200 hover:shadow-md"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
          {initial}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-[120px] truncate text-xs font-semibold text-slate-900">{email}</span>
          <span className="block text-[10px] text-slate-500">Owner</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{restaurantName ?? 'Your restaurant'}</p>
              <p className="truncate text-xs text-slate-500">{email}</p>
            </div>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile &amp; account
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                clearOwnerSession()
                window.location.href = '/login'
              }}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function AdminUserMenuPlaceholder() {
  return (
    <Button asChild variant="outline" size="sm">
      <Link to="/login">
        <User className="h-4 w-4" />
        Log in
      </Link>
    </Button>
  )
}
