import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgePercent,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  CloudUpload,
  Handshake,
  NotebookPen,
  Power,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'

interface MenuNavItem {
  id: string
  label: string
  icon: typeof ArrowLeft
}

const MENU_NAV: MenuNavItem[] = [
  { id: 'back-billing', label: 'Back To Billing', icon: ArrowLeft },
  { id: 'menu-discounts', label: 'Menu & Discounts', icon: BadgePercent },
  {
    id: 'menu-images-upload',
    label: 'Multi-Item Images Upload',
    icon: CloudUpload,
  },
  { id: 'menu-on-off', label: 'Menu on/off', icon: Power },
  { id: 'special-note', label: 'Special Note', icon: NotebookPen },
  { id: 'item-commission', label: 'Set Item Commission', icon: Handshake },
  { id: 'schedule-changes', label: 'Schedule Changes', icon: Clock3 },
  { id: 'physical-menu', label: 'Physical Menu', icon: UtensilsCrossed },
]

const MENU_ROUTES: Record<string, string> = {
  'back-billing': '/billing',
  'menu-discounts': '/menu',
  'menu-images-upload': '/menu/multi-item-images',
}

interface MenuSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
  activeItem: string
}

export function MenuSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  activeItem,
}: MenuSidebarProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onCloseMobile])

  function handleNavigate(id: string) {
    onCloseMobile()
    const path = MENU_ROUTES[id]
    if (path) {
      navigate(path)
      return
    }
    if (id !== activeItem) navigate('/menu')
  }

  const widthClass = collapsed ? 'lg:w-[76px]' : 'lg:w-[264px]'

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-card transition-all duration-300 lg:z-30 lg:translate-x-0 ${widthClass} w-[264px] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-2.5 px-3">
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
                  POS
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
          className={`hidden lg:flex ${collapsed ? 'justify-center' : 'justify-end'}`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="m-1.5 rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            {collapsed ? (
              <ChevronsRight size={16} />
            ) : (
              <ChevronsLeft size={16} />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          <ul className="space-y-0.5">
            {MENU_NAV.map((item) => {
              const Icon = item.icon
              const active = activeItem === item.id
              const isBack = item.id === 'back-billing'
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => handleNavigate(item.id)}
                    className={`relative flex w-full items-center gap-2.5 text-sm transition-colors ${
                      collapsed
                        ? 'justify-center px-0 py-2.5'
                        : 'px-4 py-2.5 text-left'
                    } ${
                      active
                        ? 'bg-primary/10 font-semibold text-primary before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r before:bg-primary'
                        : isBack
                          ? 'font-medium text-ink hover:bg-page'
                          : 'text-ink hover:bg-page'
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.2 : 1.75}
                      className={`shrink-0 ${active ? 'text-primary' : 'text-muted'}`}
                    />
                    {!collapsed && (
                      <span className="truncate text-left">{item.label}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
