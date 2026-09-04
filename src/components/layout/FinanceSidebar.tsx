import { Fragment, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Home,
  LayoutGrid,
  Receipt,
  Store,
  Wallet,
  X,
} from 'lucide-react'
import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'

type IconType = typeof ArrowLeft

interface NavLeaf {
  id: string
  label: string
  icon: IconType
}

const FINANCE_ROUTES: Record<string, string> = {
  'back-billing': '/dashboard',
  dashboard: '/finance',
  transactions: '/finance/transactions',
  expenses: '/finance/expenses',
  marketplace: '/finance/marketplace',
}

const NAV_ITEMS: NavLeaf[] = [
  { id: 'back-billing', label: 'Back To Billing', icon: ArrowLeft },
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'expenses', label: 'Expenses', icon: Wallet },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
]

interface FinanceSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
  activeItem: string
}

export function FinanceSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  activeItem,
}: FinanceSidebarProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onCloseMobile])

  function go(id: string) {
    onCloseMobile()
    const path = FINANCE_ROUTES[id]
    if (path) navigate(path)
  }

  const widthClass = collapsed ? 'lg:w-[76px]' : 'lg:w-[240px]'

  return (
    <>
      {mobileOpen ? (
        <div
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-card transition-all duration-300 lg:z-30 lg:translate-x-0 ${widthClass} w-[240px] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-3">
          {collapsed ? (
            <div className="flex w-full justify-center">
              <BrandLogo size={36} />
            </div>
          ) : (
            <>
              <BrandLogo size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold leading-tight text-ink">
                  {brand.shortName}
                </p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Finance
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-page lg:hidden"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>

        <div
          className={`hidden border-b border-line lg:flex ${collapsed ? 'justify-center' : 'justify-end'}`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="m-1.5 cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {!collapsed ? (
          <div className="border-b border-line px-3 py-2.5">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-line bg-page px-2.5 py-2 text-left text-xs font-medium text-ink"
            >
              <LayoutGrid size={14} className="shrink-0 text-muted" />
              <span className="min-w-0 flex-1 truncate">{brand.outletName}</span>
              <ChevronRight size={14} className="shrink-0 text-muted" />
            </button>
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = activeItem === item.id
              return (
                <Fragment key={item.id}>
                  <li>
                    <button
                      type="button"
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => go(item.id)}
                      className={`relative flex w-full cursor-pointer items-center gap-2.5 text-sm transition-colors ${
                        collapsed
                          ? 'justify-center px-0 py-2.5'
                          : 'px-4 py-2.5 text-left'
                      } ${
                        active
                          ? 'bg-page font-semibold text-ink before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r before:bg-primary'
                          : item.id === 'back-billing'
                            ? 'font-medium text-ink hover:bg-page'
                            : 'text-ink hover:bg-page'
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.2 : 1.75}
                        className={`shrink-0 ${active ? 'text-primary' : 'text-muted'}`}
                      />
                      {!collapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : null}
                    </button>
                  </li>
                  {item.id === 'back-billing' ? (
                    <li
                      aria-hidden="true"
                      className="my-2 list-none border-t border-line"
                    />
                  ) : null}
                </Fragment>
              )
            })}
          </ul>
        </nav>

        {!collapsed ? (
          <div className="border-t border-line p-3 text-[11px] text-muted">
            <div className="flex items-center gap-1">
              <ChevronLeft size={12} />
              Finance Module
            </div>
          </div>
        ) : null}
      </aside>
    </>
  )
}
