import { useState, type ReactNode } from 'react'
import { FinanceSidebar } from './FinanceSidebar'
import { brand } from '../../theme/brand'

interface FinancePageShellProps {
  activeItem?: string
  children: ReactNode
  /** Hide the shared top bar (finance uses its own header in sidebar) */
  showOutletHeader?: boolean
}

export function FinancePageShell({
  activeItem = 'dashboard',
  children,
}: FinancePageShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-page">
      <FinanceSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem={activeItem}
      />

      <div
        className={`min-w-0 overflow-x-hidden transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[240px]'}`}
      >
        <div className="flex h-14 items-center justify-between gap-3 border-b border-line bg-card px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-line px-2.5 py-1.5 text-sm font-medium text-ink lg:hidden"
          >
            Menu
          </button>
          <p className="truncate text-sm font-semibold text-ink">
            {brand.outletName}
          </p>
          <span className="hidden text-xs text-muted sm:inline">
            Finance
          </span>
        </div>
        <main className="min-w-0 px-4 py-4 sm:px-5">{children}</main>
      </div>
    </div>
  )
}
