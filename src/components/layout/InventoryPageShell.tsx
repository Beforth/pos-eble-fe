import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate as useRouterNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { BillingHeader } from '../billing/BillingHeader'
import { isBillingInventoryPath } from '../../utils/inventoryRouter'
import { useNewOrder } from '../../state/useNewOrder'
import { InventorySidebar } from './InventorySidebar'
import { ActionCenterDrawer } from './ActionCenterDrawer'
import { NotificationsDrawer } from './NotificationsDrawer'
import { SupportAgentDrawer } from './SupportAgentDrawer'
import { TopBar } from './TopBar'
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
  const { collapsed, toggleCollapsed } = useChrome()
  const navigate = useRouterNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const billing = isBillingInventoryPath(useLocation().pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  function closeOtherDrawers() {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  // The counter's copy (`/billing/inventory/...`): the billing header instead of the
  // admin sidebar and top bar, with a way back to the Inventory Management hub.
  if (billing) {
    return (
      <div className="min-h-dvh bg-page">
        <BillingHeader
          billNo={billNo}
          onBillNoChange={setBillNo}
          onNewOrder={() => startNewOrder()}
          onViewKot={() => navigate('/billing?kot=1')}
        />
        <div className="border-b border-line bg-card px-5 py-2">
          <button
            type="button"
            onClick={() => navigate('/billing/inventory')}
            className="inline-flex h-8 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft size={14} />
            Inventory Management
          </button>
        </div>
        <main className="px-4 py-4 sm:px-5">{children}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      <InventorySidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem={activeItem}
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
