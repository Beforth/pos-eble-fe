import { useState, type ReactNode } from 'react'
import { InventorySidebar } from './InventorySidebar'
import { ActionCenterDrawer } from './ActionCenterDrawer'
import { NotificationsDrawer } from './NotificationsDrawer'
import { SupportAgentDrawer } from './SupportAgentDrawer'
import { TopBar } from './TopBar'
import { useAuth } from '../../auth/AuthContext'
import {
  INV_STOCK_COUNT_READ_PERMISSIONS,
  hasAnyPermission,
} from '../../services/inventoryService'
import { brand } from '../../theme/brand'
import { useChrome } from '../../state/ChromeContext'

interface InventoryPageShellProps {
  activeItem?: string
  children: ReactNode
}

export function InventoryPageShell({
  activeItem = 'dashboard',
  children,
}: InventoryPageShellProps) {
  const { hasPermission } = useAuth()
  const { collapsed, toggleCollapsed } = useChrome()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  // Available and Closing are separate rights, so each Manage Stock leaf is
  // gated on its own permission rather than on "any stock-count right".
  const canCountStock = {
    available: hasAnyPermission(
      hasPermission,
      INV_STOCK_COUNT_READ_PERMISSIONS.available,
    ),
    closing: hasAnyPermission(
      hasPermission,
      INV_STOCK_COUNT_READ_PERMISSIONS.closing,
    ),
  }

  function closeOtherDrawers() {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  return (
    <div className="min-h-screen bg-page">
      <InventorySidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem={activeItem}
        canCountStock={canCountStock}
      />

      <SupportAgentDrawer
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <ActionCenterDrawer
        open={actionCenterOpen}
        onClose={() => setActionCenterOpen(false)}
      />

      <div
        className={`transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'}`}
      >
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          onSupportClick={() => {
            closeOtherDrawers()
            setSupportOpen(true)
          }}
          onNotificationsClick={() => {
            closeOtherDrawers()
            setNotificationsOpen(true)
          }}
          outletName={brand.outletName}
        />
        <main className="px-4 py-4 sm:px-5">{children}</main>
      </div>
    </div>
  )
}
