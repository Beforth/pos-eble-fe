import { useCallback, useEffect, useMemo, useState } from 'react'
import { showToast } from '../../utils/toast'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Loader, RefreshCw, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import {
  listKotsApi,
  listOrdersApi,
  type KotDto,
  type KotItemDto,
  type OrderDto,
  type OrderStatus,
} from '../../services/orderService'

type Tab = 'parcel' | 'dine-in' | 'kot'

const TABS: { id: Tab; label: string }[] = [
  { id: 'parcel', label: 'PARCEL' },
  { id: 'dine-in', label: 'DINE IN' },
  { id: 'kot', label: 'KOT' },
]

/** Paid bills are peach, bills not yet paid (saved or printed) are green, cancelled are grey. */
const PAID_ROW = 'bg-[#fbdcae]'
const UNPAID_ROW = 'bg-emerald-200'
const CANCELLED_ROW = 'bg-ink/10'

function rowClass(status: OrderStatus | string): string {
  if (status === 'paid') return PAID_ROW
  if (status === 'cancelled') return CANCELLED_ROW
  return UNPAID_ROW
}

function kotItemLabel(item: KotItemDto): string {
  const name = item.name ?? item.item_name ?? ''
  const qty = item.qty ?? item.quantity ?? 1
  return `${name} x${qty}`
}

function amount(value: string | number): string {
  const n = Number(value)
  return Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value)
}

interface RecentOrdersDrawerProps {
  open: boolean
  onClose: () => void
}

/** Opens from the header's Recent icon: the latest bills by order type, and KOTs. */
export function RecentOrdersDrawer({ open, onClose }: RecentOrdersDrawerProps) {
  const { encryptedOutletId } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('dine-in')
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [kots, setKots] = useState<KotDto[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    setFailed(false)
    try {
      const [orderPage, kotPage] = await Promise.all([
        listOrdersApi(encryptedOutletId, { page_size: 60 }),
        listKotsApi(encryptedOutletId, { page_size: 60 }),
      ])
      setOrders(orderPage.results)
      setKots(kotPage.results)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  /** Open a bill or KOT in the billing screen (the same deep links Live Orders and KOT view use). */
  function openInBilling(search: string) {
    onClose()
    navigate(`/billing?${search}`)
  }

  const rows = useMemo(() => {
    if (tab === 'kot') return []
    const dineIn = (order: OrderDto) => order.order_type === 'dine-in'
    return orders.filter((order) => (tab === 'dine-in' ? dineIn(order) : !dineIn(order)))
  }, [orders, tab])

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close recent orders"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="recent-orders-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col rounded-l-2xl bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 id="recent-orders-title" className="text-base font-medium text-ink">
            Recent
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-md p-1.5 text-ink hover:bg-page"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex shrink-0 border-b border-line">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-1 border-b-2 px-4 py-3.5 text-sm font-medium ${
                tab === item.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-between px-5 py-3 text-sm text-ink">
          <span>{tab === 'kot' ? 'KOT No.' : 'Order No.'}</span>
          <span>{tab === 'kot' ? 'Items' : '₹'}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && orders.length === 0 && kots.length === 0 ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
              <Loader size={16} className="animate-spin" />
              Loading…
            </p>
          ) : tab === 'kot' ? (
            kots.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No recent KOTs.</p>
            ) : (
              kots.map((kot) => (
                <button
                  key={kot.id}
                  type="button"
                  onClick={() =>
                    openInBilling(
                      `openKot=${encodeURIComponent(kot.id)}${
                        kot.table_id ? `&tableId=${encodeURIComponent(kot.table_id)}` : ''
                      }`,
                    )
                  }
                  className="flex w-full items-start justify-between gap-3 border-b border-line bg-gray-100 px-5 py-3 text-left text-sm text-ink hover:brightness-95"
                >
                  <span className="min-w-0">
                    <span className="block">
                      KOT {kot.kot_no}
                      {kot.table_no ? ` · Table ${kot.table_no}` : ''}
                    </span>
                    {kot.items.length > 0 && (
                      <span className="mt-0.5 block text-xs text-muted">
                        {kot.items.map(kotItemLabel).join(', ')}
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums">{kot.item_count}</span>
                </button>
              ))
            )
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No recent orders.</p>
          ) : (
            rows.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => {
                  // A cancelled bill is closed for good: it is not reopened.
                  if (order.status === 'cancelled') {
                    showToast(`Bill ${order.bill_no || order.order_no} is cancelled`)
                    return
                  }
                  openInBilling(`openOrder=${encodeURIComponent(order.id)}`)
                }}
                className={`flex w-full items-center justify-between border-b border-line px-5 py-3 text-left text-sm text-ink hover:brightness-95 ${rowClass(order.status)}`}
              >
                <span className="font-medium text-primary underline decoration-primary/30">
                  {order.bill_no || order.order_no}
                </span>
                <span className="tabular-nums">{amount(order.grand_total)}</span>
              </button>
            ))
          )}
        </div>

        <footer className="shrink-0 border-t border-line px-5 py-4 text-center">
          <p className={`text-sm ${failed ? 'text-primary' : 'text-muted'}`}>
            {failed ? 'All Orders Are Not Synced.' : 'All orders are synced.'}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Refresh recent orders"
            data-tooltip="Refresh"
            className="mx-auto mt-2 flex size-9 items-center justify-center rounded-full text-ink hover:bg-page disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="mt-2 flex items-center justify-center gap-5 text-sm text-ink">
            <span className="inline-flex items-center gap-2">
              <span className="size-4 rounded-sm bg-[#fbdcae]" />
              Paid
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-4 rounded-sm bg-emerald-200" />
              Not paid
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-4 rounded-sm bg-ink/10" />
              Cancelled
            </span>
          </div>
        </footer>
      </aside>
    </div>,
    document.body,
  )
}
