import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <UtensilsCrossed className="h-5 w-5 text-orange-600" />
            MenuBoard
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/menu/demo-burger" className="text-slate-600 hover:text-orange-600">
              Demo menu
            </Link>
            <Link to="/login" className="text-slate-600 hover:text-orange-600">
              Log in
            </Link>
            <Link
              to="/get-started"
              className="rounded-lg bg-orange-600 px-3 py-1.5 font-medium text-white hover:bg-orange-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
