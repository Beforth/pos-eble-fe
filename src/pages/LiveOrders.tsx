import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChrome } from '../state/ChromeContext'
import {
  Clock3,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import {
  BILLING_RIGHT_CODENAME,
  CAPTAIN_ORDER_CODENAME,
} from '../auth/routePermissions'
import { LiveOrdersPanel } from '../components/live-orders/LiveOrdersPanel'
import {
  LIVE_BOARD_TITLES,
  LIVE_CHANNEL_ICONS,
  type LiveBoardKind,
} from '../components/live-orders/liveOrdersConfig'
import { LiveOrdersDetailModal } from '../components/live-orders/LiveOrdersDetailModal'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import {
  liveOrdersApi,
  toLiveOrdersBoard,
  toRunningTables,
  type LiveOrderChannelRow,
  type LiveOrdersSummary,
  type RunningTablesSummary,
} from '../services/orderService'
import {
  billingUrlForKotId,
  billingUrlForOrder,
} from '../utils/billingLinks'
import { LIVE_BOARD_REFRESH_EVENTS, subscribeToRail } from '../services/liveRailClient'
import { brand } from '../theme/brand'

interface LiveDetail {
  board: LiveBoardKind
  row: LiveOrderChannelRow
}

export default function LiveOrders() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission, token } = useAuth()
  // This standalone board is reachable by both roles, so the order-taking
  // target has to follow the rights the user actually holds: a captain (no
  // billing right) would be bounced off `/billing`.
  const billingBase = hasPermission(BILLING_RIGHT_CODENAME)
    ? '/billing'
    : hasPermission(CAPTAIN_ORDER_CODENAME)
      ? '/captain-orders'
      : '/billing'
  const { collapsed, toggleCollapsed } = useChrome()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)
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
        setTables(toRunningTables(dto.tables))
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

  // The board is a snapshot of several aggregates (running orders, orphan Ready
  // KOTs, pending kitchen counts, occupied tables), so there is nothing
  // meaningful to patch locally from a single event — refetch instead. Without
  // this the board only changed when it was opened or Refresh was pressed, so a
  // bill settled on another screen kept sitting on Running Orders.
  useEffect(() => {
    if (!encryptedOutletId || !token) return
    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event) => {
        if (LIVE_BOARD_REFRESH_EVENTS.has(event)) {
          setReload((key) => key + 1)
        }
      },
    })
  }, [encryptedOutletId, token])

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

          <LiveOrdersPanel
          loading={loading}
          error={error}
          running={running}
          pending={pending}
          tables={tables}
          onRetry={() => setReload((key) => key + 1)}
          onRowClick={(board, row) => setDetail({ board, row })}
        />
        </main>

        {detail && encryptedOutletId && (
          <LiveOrdersDetailModal
            open
            outletId={encryptedOutletId}
            board={detail.board}
            rowId={detail.row.id}
            title={`${detail.row.label} · ${LIVE_BOARD_TITLES[detail.board]}`}
            icon={LIVE_CHANNEL_ICONS[detail.row.icon]}
            onClose={() => setDetail(null)}
            onOpenOrder={(orderId) =>
              navigate(billingUrlForOrder(orderId, billingBase))
            }
            onOpenKot={(kotId) =>
              navigate(billingUrlForKotId(kotId, billingBase))
            }
          />
        )}
      </div>
    </div>
  )
}