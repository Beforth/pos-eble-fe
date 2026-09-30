import { useState, type ReactNode } from 'react'
import { FinanceSidebar } from './FinanceSidebar'
import { UniversalSearchBar } from './UniversalSearchBar'
import { brand } from '../../theme/brand'
import { useChrome } from '../../state/ChromeContext'

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
  const { collapsed, toggleCollapsed } = useChrome()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-page">
      <FinanceSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem={activeItem}
      />

      <div
        className={`min-w-0 overflow-x-hidden transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[240px]'}`}
      >
        <div className="flex h-14 items-center gap-3 border-b border-line bg-card px-4">
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
          <UniversalSearchBar compact className="ml-auto w-52 sm:w-64 lg:w-80" />
          <span className="hidden text-xs text-muted lg:inline">
            Finance
          </span>
        </div>
        <main className="min-w-0 px-4 py-4 sm:px-5">{children}</main>
      </div>
    </div>
  )
}
