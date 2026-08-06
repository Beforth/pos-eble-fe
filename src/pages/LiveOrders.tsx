import { useState, type ReactNode } from 'react'
import {
  ChefHat,
  Clock3,
  HandPlatter,
  RefreshCw,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'
import { LiveOrdersBoard } from '../components/live-orders/LiveOrdersBoard'
import { RunningTablesView } from '../components/live-orders/RunningTablesView'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import {
  pendingOrders,
  runningOrders,
  runningTables,
} from '../mocks/liveOrdersData'
import { brand } from '../theme/brand'

type LiveTab = 'orders' | 'tables'

const channelIcons: Record<string, ReactNode> = {
  dineIn: <UtensilsCrossed size={18} />,
  pickup: <HandPlatter size={18} />,
  delivery: <Truck size={18} />,
  prep: <ChefHat size={18} />,
  waiting: <ShoppingBag size={18} />,
  out: <Truck size={18} />,
}

export default function LiveOrders() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)
  const [tab, setTab] = useState<LiveTab>('orders')
  const [refreshKey, setRefreshKey] = useState(0)

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem="live-orders"
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

        <main className="px-4 py-4 sm:px-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <h1 className="flex items-center gap-2 text-lg font-bold text-ink sm:text-xl">
                <Clock3 size={20} className="text-primary" />
                Live Orders
              </h1>

              <div
                role="tablist"
                aria-label="Live orders views"
                className="flex items-center gap-4 border-b border-transparent"
              >
                {(
                  [
                    { value: 'orders', label: 'Running Orders' },
                    { value: 'tables', label: 'Running Tables' },
                  ] as const
                ).map((option) => {
                  const active = tab === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTab(option.value)}
                      className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors ${
                        active
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted hover:text-ink'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
            >
              <RefreshCw size={15} className="text-muted" />
              Refresh
            </button>
          </div>

          <div key={refreshKey}>
            {tab === 'orders' ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <LiveOrdersBoard
                  title="Running Orders"
                  data={runningOrders}
                  icons={channelIcons}
                />
                <LiveOrdersBoard
                  title="Pending Orders"
                  data={pendingOrders}
                  icons={channelIcons}
                />
              </div>
            ) : (
              <RunningTablesView data={runningTables} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
