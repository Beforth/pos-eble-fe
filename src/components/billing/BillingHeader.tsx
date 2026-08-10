import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  ChefHat,
  Grid2x2,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Plus,
  Search,
  Settings,
  Store,
  User,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BrandLogo } from '../brand/BrandLogo'
import { brand } from '../../theme/brand'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/live-orders', label: 'Live Orders', icon: Monitor },
  { to: '/all-orders', label: 'All Orders', icon: BookOpen },
  { to: '/kot', label: 'KOT', icon: ChefHat },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
] as const

interface BillingHeaderProps {
  billNo: string
  onBillNoChange: (value: string) => void
  onNewOrder: () => void
}

export function BillingHeader({
  billNo,
  onBillNoChange,
  onNewOrder,
}: BillingHeaderProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-card px-2 sm:gap-3 sm:px-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <BrandLogo size={32} />
          <span className="hidden max-w-[140px] truncate text-xs font-bold text-ink sm:block md:max-w-[180px]">
            {brand.shortName}
          </span>
        </div>

        <button
          type="button"
          onClick={onNewOrder}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Order</span>
        </button>

        <div className="relative ml-1 hidden min-w-0 flex-1 md:block md:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={billNo}
            onChange={(event) => onBillNoChange(event.target.value)}
            placeholder="Bill No"
            className="h-9 w-full rounded-lg border border-line bg-page pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {[
            { icon: BookOpen, label: 'Digital menu' },
            { icon: Store, label: 'Store' },
            { icon: Monitor, label: 'Display' },
            { icon: Grid2x2, label: 'Grid' },
            { icon: ChefHat, label: 'Kitchen' },
            { icon: LayoutDashboard, label: 'Reports' },
            { icon: Bell, label: 'Notifications' },
            { icon: User, label: user?.name ?? 'Profile' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              className="hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink sm:inline-flex lg:size-9"
            >
              <Icon size={16} />
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-primary"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[260px] flex-col bg-card shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <div className="flex items-center gap-2">
                <BrandLogo size={32} />
                <span className="text-sm font-bold text-ink">{brand.shortName}</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-page"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-0.5">
                <li>
                  <Link
                    to="/billing"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary"
                  >
                    <UtensilsCrossed size={18} />
                    Billing
                  </Link>
                </li>
                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-page"
                    >
                      <Icon size={18} className="text-muted" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  )
}
