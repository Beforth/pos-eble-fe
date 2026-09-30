import { useEffect, useState, type ReactNode } from 'react'
import { useChrome } from '../state/ChromeContext'
import {
  ChefHat,
  Clock3,
  HandPlatter,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { LiveOrdersBoard } from '../components/live-orders/LiveOrdersBoard'
import { LiveOrdersDetailModal } from '../components/live-orders/LiveOrdersDetailModal'
import { RunningTablesView } from '../components/live-orders/RunningTablesView'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import {
  liveOrdersApi,
  toLiveOrdersBoard,
  type LiveOrderChannelRow,
  type LiveOrdersSummary,
  type RunningTablesSummary,
} from '../services/orderService'
import { brand } from '../theme/brand'

type LiveTab = 'orders' | 'tables'

interface LiveDetail {
  board: 'running' | 'pending'
  row: LiveOrderChannelRow
}

const channelIcons: Record<string, ReactNode> = {
  dineIn: <UtensilsCrossed size={18} />,
  pickup: <HandPlatter size={18} />,
  delivery: <Truck size={18} />,
  prep: <ChefHat size={18} />,
  waiting: <ShoppingBag size={18} />,
  out: <Truck size={18} />,
}

export default function LiveOrders() {
  const { encryptedOutletId } = useAuth()
  const { collapsed, toggleCollapsed } = useChrome()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)
  const [tab, setTab] = useState<LiveTab>('orders')
  const [running, setRunning] = useState<LiveOrdersSummary | null>(null)
  const [pending, setPending] = useState<LiveOrdersSummary | null>(null)
  const [tables, setTables] = useState<RunningTablesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [detail, setDetail] = useState<LiveDetail | null>(null)

  useEffect(() => {
    if (!encryptedOutletId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    liveOrdersApi(encryptedOutletId)
      .then((dto) => {
        if (cancelled) return
        setRunning(toLiveOrdersBoard(dto.running))
        setPending(toLiveOrdersBoard(dto.pending))
        setTables({
          activeTables: dto.tables.activeTables,
          revenueEstimated: Number(dto.tables.revenueEstimated),
        })
        setError(false)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, reload])

  function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    setReload((key) => key + 1)
    window.setTimeout(() => setRefreshing(false), 800)
  }

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
        onToggleCollapse={toggleCollapsed}
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

          {tab === 'orders' ? (
            loading ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-line bg-card">
                <Loader2 size={22} className="animate-spin text-primary" />
              </div>
) : error || !running || !pending ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
              <p className="text-base font-semibold text-ink">
                Couldn't load live orders
              </p>
              <p className="mt-1 text-sm text-muted">
                Check your connection and retry.
              </p>
              <button
                type="button"
                onClick={() => setReload((key) => key + 1)}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
              >
                <RefreshCw size={15} className="text-muted" />
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <LiveOrdersBoard
                title="Running Orders"
                data={running}
                icons={channelIcons}
                onRowClick={(row) => setDetail({ board: 'running', row })}
              />
              <LiveOrdersBoard
                title="Pending Orders"
                data={pending}
                icons={channelIcons}
                onRowClick={(row) => setDetail({ board: 'pending', row })}
              />
            </div>
          )
          ) : loading ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-line bg-card">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          ) : error || !tables ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
              <p className="text-base font-semibold text-ink">
                Couldn't load live orders
              </p>
              <p className="mt-1 text-sm text-muted">
                Check your connection and retry.
              </p>
              <button
                type="button"
                onClick={() => setReload((key) => key + 1)}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
              >
                <RefreshCw size={15} className="text-muted" />
                Retry
              </button>
            </div>
          ) : (
            <RunningTablesView data={tables} />
          )}
        </main>

        {detail && encryptedOutletId && (
          <LiveOrdersDetailModal
            open
            outletId={encryptedOutletId}
            board={detail.board}
            rowId={detail.row.id}
            title={`${detail.row.label} · ${
              detail.board === 'running' ? 'Running' : 'Pending'
            } Orders`}
            icon={channelIcons[detail.row.icon]}
            onClose={() => setDetail(null)}
          />
        )}
      </div>
    </div>
  )
}