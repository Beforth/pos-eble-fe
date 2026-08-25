import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChefHat,
  Clock3,
  HandPlatter,
  RefreshCw,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { LiveOrdersBoard } from '../../components/live-orders/LiveOrdersBoard'
import { RunningTablesView } from '../../components/live-orders/RunningTablesView'
import {
  pendingOrders,
  runningOrders,
  runningTables,
} from '../../mocks/liveOrdersData'

type LiveTab = 'orders' | 'tables'

const channelIcons: Record<string, ReactNode> = {
  dineIn: <UtensilsCrossed size={18} />,
  pickup: <HandPlatter size={18} />,
  delivery: <Truck size={18} />,
  prep: <ChefHat size={18} />,
  waiting: <ShoppingBag size={18} />,
  out: <Truck size={18} />,
}

export default function BillingLiveOrders() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [tab, setTab] = useState<LiveTab>('orders')
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    setRefreshKey((key) => key + 1)
    window.setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => navigate('/table-view')}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
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
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh live orders"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted disabled:opacity-80"
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? 'animate-spin text-primary'
                  : 'text-muted transition-transform duration-300 hover:rotate-180'
              }
            />
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
  )
}
