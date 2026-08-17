import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Home,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react'
import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'

type IconType = typeof Home

interface NavLeaf {
  id: string
  label: string
  icon: IconType
  chevron?: boolean
  children?: { id: string; label: string }[]
}

const AUDIT_ROUTES: Record<string, string> = {
  'back-dashboard': '/dashboard',
  overview: '/management/audit-trail',
  management: '/management/audit-trail',
  'order-modification': '/management/order-modification',
  report: '/management/audit-trail',
  'after-print-modification': '/report/after-print-modification',
  'after-print-payment': '/report/payment-changes',
  'kot-modification-report': '/report/kots',
}

const NAV_ITEMS: NavLeaf[] = [
  { id: 'back-dashboard', label: 'Back To Billing', icon: ArrowLeft },
  { id: 'overview', label: 'Overview', icon: Home },
  {
    id: 'management',
    label: 'Management',
    icon: Settings,
    chevron: true,
    children: [{ id: 'order-modification', label: 'Order Modification' }],
  },
  {
    id: 'report',
    label: 'Report',
    icon: Clock,
    chevron: true,
    children: [
      { id: 'after-print-modification', label: 'After Print Modification' },
      { id: 'after-print-payment', label: 'After Print Payment' },
      { id: 'kot-modification-report', label: 'KOT Modification Report' },
    ],
  },
]

interface AuditTrailSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
  activeItem: string
}

export function AuditTrailSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  activeItem,
}: AuditTrailSidebarProps) {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState(activeItem)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['management', 'report']),
  )

  useEffect(() => {
    setActiveCategory(activeItem)
  }, [activeItem])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onCloseMobile])

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function go(id: string) {
    onCloseMobile()
    setActiveCategory(id)

    const path = AUDIT_ROUTES[id]
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
                  Audit Trail
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-muted hover:bg-page lg:hidden"
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
            className="m-1.5 rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {!collapsed ? (
          <div className="border-b border-line px-3 py-2.5">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-line bg-page px-2.5 py-2 text-left text-xs font-medium text-ink"
            >
              <ShieldCheck size={14} className="shrink-0 text-muted" />
              <span className="min-w-0 flex-1 truncate">{brand.outletName}</span>
              <ChevronRight size={14} className="shrink-0 text-muted" />
            </button>
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = activeCategory === item.id
              const isExpanded = expandedIds.has(item.id)
              const hasChildren = item.children && item.children.length > 0

              return (
                <Fragment key={item.id}>
                  <li>
                    <button
                      type="button"
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => {
                        if (hasChildren) {
                          toggleExpand(item.id)
                        }
                        go(item.id)
                      }}
                      className={`relative flex w-full items-center gap-2.5 text-sm transition-colors ${
                        collapsed
                          ? 'justify-center px-0 py-2.5'
                          : 'px-4 py-2.5 text-left'
                      } ${
                        active
                          ? 'bg-page font-semibold text-ink before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r before:bg-primary'
                          : item.id === 'back-dashboard'
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
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {hasChildren ? (
                            <ChevronDown
                              size={15}
                              className={`shrink-0 text-muted transition-transform duration-200 ${
                                isExpanded ? 'rotate-0' : '-rotate-90'
                              }`}
                            />
                          ) : item.chevron ? (
                            <ChevronRight
                              size={15}
                              className="shrink-0 text-muted"
                            />
                          ) : null}
                        </>
                      ) : null}
                    </button>

                    {/* Expandable Sub-items */}
                    {!collapsed && hasChildren && isExpanded ? (
                      <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-line pl-3">
                        {item.children!.map((child) => {
                          const childActive = activeCategory === child.id
                          return (
                            <li key={child.id}>
                              <button
                                type="button"
                                onClick={() => go(child.id)}
                                className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                                  childActive
                                    ? 'bg-primary/10 font-semibold text-primary'
                                    : 'text-muted hover:bg-page hover:text-ink font-normal'
                                }`}
                              >
                                <span>{child.label}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    ) : null}
                  </li>

                  {item.id === 'back-dashboard' ? (
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
              Audit Trail Module
            </div>
          </div>
        ) : null}
      </aside>
    </>
  )
}
