import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock3,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { CaptainOrdersHeader } from '../../components/captainorders/CaptainOrdersHeader'
import { LiveOrdersPanel } from '../../components/live-orders/LiveOrdersPanel'
import {
  LIVE_BOARD_TITLES,
  LIVE_CHANNEL_ICONS,
  type LiveBoardKind,
} from '../../components/live-orders/liveOrdersConfig'
import { LiveOrdersDetailModal } from '../../components/live-orders/LiveOrdersDetailModal'
import {
  liveOrdersApi,
  toLiveOrdersBoard,
  toRunningTables,
  type LiveOrderChannelRow,
  type LiveOrdersSummary,
  type RunningTablesSummary,
} from '../../services/orderService'
import {
  LIVE_BOARD_REFRESH_EVENTS,
  subscribeToRail,
} from '../../services/liveRailClient'
import {
  billingUrlForKotId,
  billingUrlForOrder,
} from '../../utils/billingLinks'
import { useNewOrder } from '../../state/useNewOrder'

interface LiveDetail {
  board: LiveBoardKind
  row: LiveOrderChannelRow
}

export default function CaptainOrdersLiveOrders() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, token } = useAuth()
  const [billNo, setBillNo] = useState('')
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

  // Live rail → refetch, so a bill settled on the Captain screen leaves Running
  // Orders here without waiting for a manual Refresh.
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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <CaptainOrdersHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder({ captain: true })}
        onViewKot={() => navigate('/captain-orders?kot=1')}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
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
              navigate(billingUrlForOrder(orderId, '/captain-orders'))
            }
            onOpenKot={(kotId) =>
              navigate(billingUrlForKotId(kotId, '/captain-orders'))
            }
          />
        )}
      </main>
    </div>
  )
}