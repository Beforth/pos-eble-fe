import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  ChefHat,
  Grid2x2,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Monitor,
  Phone,
  Plus,
  Search,
  Settings,
  Store,
  TrendingUp,
  User,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BrandLogo } from '../brand/BrandLogo'
import { brand } from '../../theme/brand'
import {
  menuItems,
  baseMenuCategories,
} from '../../mocks/menuItemsData'
import { DAY_END_SUMMARY_ROWS } from '../../mocks/dayEndSummaryData'

const CAPTAIN_SIDEBAR_LINKS = [
  { to: '/captain-orders',            label: 'Captain Orders', icon: ChefHat },
  { to: '/captain-orders/live-orders', label: 'Live Orders',    icon: Monitor },
  { to: '/captain-orders/all-orders',  label: 'All Orders',     icon: BookOpen },
  { to: '/captain-orders/kot',         label: 'KOT',            icon: UtensilsCrossed },
  { to: '/captain-orders/day-end',     label: 'Day End',        icon: LayoutDashboard },
  { to: '/dashboard',                  label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/menu',                       label: 'Menu',           icon: Store },
] as const

interface CaptainOrdersHeaderProps {
  billNo: string
  onBillNoChange: (value: string) => void
  onNewOrder: () => void
  onViewKot?: () => void
}

export function CaptainOrdersHeader({
  billNo,
  onBillNoChange,
  onNewOrder,
  onViewKot,
}: CaptainOrdersHeaderProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { logout, user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuViewOpen, setMenuViewOpen] = useState(false)
  const [storeInfoOpen, setStoreInfoOpen] = useState(false)
  const [quickReportsOpen, setQuickReportsOpen] = useState(false)
  const [billingSettingsOpen, setBillingSettingsOpen] = useState(false)
  const [menuSearch, setMenuSearch] = useState('')

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  useEffect(() => {
    if (!profileOpen) return
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (
        !target.closest('[data-profile-popover]') &&
        !target.closest('[data-profile-trigger]')
      ) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen])

  const menuGrouped = useMemo(() => {
    const q = menuSearch.trim().toLowerCase()
    const filtered = q
      ? menuItems.filter(
          (item) =>
            item.available &&
            (item.name.toLowerCase().includes(q) ||
              item.shortCode.includes(q)),
        )
      : menuItems.filter((item) => item.available)
    const groups: Record<string, typeof menuItems> = {}
    for (const item of filtered) {
      const cat = baseMenuCategories.find((c) => c.id === item.categoryId)
      const catName = cat?.name ?? 'Other'
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(item)
    }
    return groups
  }, [menuSearch])

  const recentSummary = useMemo(() => {
    const rows = DAY_END_SUMMARY_ROWS.slice(0, 7)
    const today = rows[0]
    const weekOrders = rows.reduce((s, r) => s + r.orders, 0)
    const weekTotal = rows.reduce((s, r) => s + r.total, 0)
    return { today, weekOrders, weekTotal, rows }
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function closeDrawer() {
    setDrawerOpen(false)
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
            Captain Orders
          </span>
        </div>

        <button
          type="button"
          onClick={onNewOrder}
          title="New Order"
          aria-label="New Order"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Order</span>
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
          {(
            [
              { icon: BookOpen, label: 'Digital menu', onClick: () => setMenuViewOpen(true) },
              { icon: Store, label: 'Store', onClick: () => setStoreInfoOpen(true) },
              { icon: Monitor, label: 'Display', onClick: () => navigate('/customer-display') },
              { icon: Grid2x2, label: 'View KOT', onClick: onViewKot },
              { icon: ChefHat, label: 'Kitchen', onClick: () => navigate('/screens') },
              { icon: LayoutDashboard, label: 'Reports', onClick: () => setQuickReportsOpen(true) },
              { icon: Bell, label: 'Notifications', onClick: () => alert('Notifications — coming soon') },
              { icon: Settings, label: 'Settings', onClick: () => setBillingSettingsOpen(true) },
            ] as {
              icon: typeof BookOpen
              label: string
              onClick?: () => void
            }[]
          ).map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              onClick={onClick}
              className="hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink sm:inline-flex lg:size-9"
            >
              <Icon size={16} />
            </button>
          ))}

          <div className="relative">
            <button
              type="button"
              data-profile-trigger
              title={user?.name ?? 'Profile'}
              aria-label={user?.name ?? 'Profile'}
              onClick={() => setProfileOpen((p) => !p)}
              className={`hidden size-8 items-center justify-center rounded-lg sm:inline-flex lg:size-9 ${
                profileOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-page hover:text-ink'
              }`}
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="size-6 rounded-full object-cover"
                />
              ) : (
                <User size={16} />
              )}
            </button>

            {profileOpen ? (
              <div
                data-profile-popover
                className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-card shadow-lg"
              >
                <div className="border-b border-line bg-page/60 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {user?.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={user.name}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        (user?.name ?? 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">
                        {user?.name ?? 'Unknown'}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {user?.identifier ?? ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Outlet
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium text-ink">
                      {user?.outlet ?? '—'}
                    </p>
                  </div>
                  {user?.phone ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Phone
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-ink">
                        {user.phone}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-line px-2 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-page hover:text-primary"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
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
            onClick={closeDrawer}
          />
          <aside className="relative z-10 flex h-full w-[280px] flex-col bg-card shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <div className="flex items-center gap-2">
                <BrandLogo size={32} />
                <span className="text-sm font-bold text-ink">{brand.shortName}</span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-page"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-0.5">
                {CAPTAIN_SIDEBAR_LINKS.map(({ to, label, icon: Icon }) => {
                  const active =
                    to === '/captain-orders'
                      ? pathname === '/captain-orders'
                      : pathname.startsWith(to)
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={closeDrawer}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium ${
                          active
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-ink hover:bg-page'
                        }`}
                      >
                        <Icon
                          size={18}
                          className={active ? 'text-primary' : 'text-muted'}
                        />
                        {label}
                      </Link>
                    </li>
                  )
                })}

                <li className="my-2 border-t border-line" />

                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeDrawer()
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-page hover:text-primary"
                  >
                    <LogOut size={18} className="text-muted" />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}

      {/* ─── MODAL: Digital Menu ─── */}
      {menuViewOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close digital menu"
            onClick={() => {
              setMenuViewOpen(false)
              setMenuSearch('')
            }}
            className="absolute inset-0 bg-black/45"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Digital Menu"
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <BookOpen size={18} className="text-primary" />
                <h2 className="text-base font-bold text-ink">
                  Digital Menu
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuViewOpen(false)
                  setMenuSearch('')
                }}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
              >
                <X size={18} />
              </button>
            </header>

            <div className="border-b border-line px-5 py-3">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search items or short codes..."
                  className="h-9 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {Object.keys(menuGrouped).length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
                  <UtensilsCrossed size={32} className="text-line" />
                  <p className="text-sm text-muted">No items found</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(menuGrouped).map(([catName, items]) => (
                    <div key={catName}>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                        {catName}
                      </h3>
                      <div className="divide-y divide-line rounded-lg border border-line">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-ink">
                                {item.name}
                              </p>
                              <span className="mr-2 inline-block rounded bg-page px-1.5 py-0.5 text-[10px] font-bold text-muted">
                                {item.shortCode}
                              </span>
                            </div>
                            <span className="shrink-0 pl-3 text-sm font-semibold text-accent">
                              ₹
                              {item.price.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── MODAL: Store Info ─── */}
      {storeInfoOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close store info"
            onClick={() => setStoreInfoOpen(false)}
            className="absolute inset-0 bg-black/45"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Store Info"
            className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Store size={18} className="text-primary" />
                <h2 className="text-base font-bold text-ink">Store Info</h2>
              </div>
              <button
                type="button"
                onClick={() => setStoreInfoOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                <div className="rounded-lg border border-line bg-page/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    Shop Name
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">
                    {brand.shopName}
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-page/60 p-4">
                  <div className="flex items-start gap-2.5">
                    <Store size={14} className="mt-0.5 shrink-0 text-muted" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Outlet
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {brand.outletName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-line bg-page/60 p-4">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-muted" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Address
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {brand.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-line bg-page/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      PAN
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink">
                      {brand.panNumber}
                    </p>
                  </div>
                  <div className="rounded-lg border border-line bg-page/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      Currency
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink">
                      {brand.currency}
                    </p>
                  </div>
                </div>

                {user?.phone ? (
                  <div className="rounded-lg border border-line bg-page/60 p-4">
                    <div className="flex items-start gap-2.5">
                      <Phone size={14} className="mt-0.5 shrink-0 text-muted" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">
                          Contact
                        </p>
                        <p className="mt-1 text-sm font-medium text-ink">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-lg border border-line bg-page/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    App Version
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {brand.appVersion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── MODAL: Quick Reports ─── */}
      {quickReportsOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close reports"
            onClick={() => setQuickReportsOpen(false)}
            className="absolute inset-0 bg-black/45"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Quick Reports"
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={18} className="text-primary" />
                <h2 className="text-base font-bold text-ink">
                  Daily Summary
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setQuickReportsOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-line bg-page/60 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Today&apos;s Orders
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-ink">
                    {recentSummary.today?.orders ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border border-line bg-page/60 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Today&apos;s Revenue
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-accent">
                    ₹
                    {(recentSummary.today?.total ?? 0).toLocaleString(
                      'en-IN',
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-line bg-page/60 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    7-Day Revenue
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-ink">
                    ₹{recentSummary.weekTotal.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-line">
                <div className="grid grid-cols-3 border-b border-line bg-page/60 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                  <span>Date</span>
                  <span className="text-center">Orders</span>
                  <span className="text-right">Revenue</span>
                </div>
                <div className="divide-y divide-line">
                  {recentSummary.rows.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-3 items-center px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-ink">
                        {row.createdDate}
                      </span>
                      <span className="text-center tabular-nums text-ink">
                        {row.orders}
                      </span>
                      <span className="text-right font-semibold tabular-nums text-accent">
                        ₹{row.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-page/60 p-3">
                <TrendingUp size={16} className="shrink-0 text-success" />
                <p className="text-xs font-medium text-muted">
                  Average daily revenue:{' '}
                  <span className="font-bold text-ink">
                    ₹
                    {Math.round(
                      recentSummary.weekTotal / recentSummary.rows.length,
                    ).toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── MODAL: Billing Settings ─── */}
      {billingSettingsOpen ? (
        <BillingSettingsModal onClose={() => setBillingSettingsOpen(false)} />
      ) : null}
    </>
  )
}

function BillingSettingsModal({ onClose }: { onClose: () => void }) {
  const [defaultOrderType, setDefaultOrderType] = useState('dine-in')
  const [autoPrintKot, setAutoPrintKot] = useState(true)
  const [defaultPayment, setDefaultPayment] = useState('cash')
  const [taxRate, setTaxRate] = useState('5')
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    setShowSaved(true)
    window.setTimeout(() => setShowSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Billing Settings"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Settings size={18} className="text-primary" />
            <h2 className="text-base font-bold text-ink">
              Billing Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
              Default Order Type
            </label>
            <select
              value={defaultOrderType}
              onChange={(e) => setDefaultOrderType(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-page px-3 text-sm text-ink outline-none focus:border-primary"
            >
              <option value="dine-in">Dine In</option>
              <option value="delivery">Delivery</option>
              <option value="pick-up">Pick Up</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-line bg-page/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                Auto-print KOT
              </p>
              <p className="text-xs text-muted">
                Automatically print KOT when sent to kitchen
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoPrintKot}
              onClick={() => setAutoPrintKot((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                autoPrintKot ? 'bg-primary' : 'bg-line'
              }`}
            >
              <span
                className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                  autoPrintKot ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
              Default Payment Method
            </label>
            <select
              value={defaultPayment}
              onChange={(e) => setDefaultPayment(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-page px-3 text-sm text-ink outline-none focus:border-primary"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
              Tax Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-page pl-3 pr-8 text-sm text-ink outline-none focus:border-primary"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">
                %
              </span>
            </div>
          </div>

          {showSaved ? (
            <div className="rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-center text-xs font-bold text-success">
              Settings saved successfully
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line bg-page px-4 py-2 text-sm font-semibold text-ink hover:bg-card"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
