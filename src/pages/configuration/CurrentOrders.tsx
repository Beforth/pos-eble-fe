import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bike,
  Grid2x2,
  Search,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { CurrentOrderDetailsModal } from '../../components/configuration/CurrentOrderDetailsModal'
import {
  currentOrdersList,
  money,
  rowClassForStatus,
  type CurrentOrderRow,
  type CurrentOrderType,
  type OrdersMainTab,
} from '../../mocks/currentOrdersData'

type TypeFilter = 'all' | CurrentOrderType

const TYPE_FILTERS: {
  id: TypeFilter
  label: string
  icon: typeof Grid2x2
}[] = [
  { id: 'all', label: 'All', icon: Grid2x2 },
  { id: 'dine-in', label: 'Dine In', icon: UtensilsCrossed },
  { id: 'delivery', label: 'Delivery', icon: Bike },
  { id: 'pick-up', label: 'Pick Up', icon: ShoppingBag },
]

const MAIN_TABS: { id: OrdersMainTab; label: string }[] = [
  { id: 'current', label: 'Current Order' },
  { id: 'online', label: 'Online Order' },
  { id: 'advance', label: 'Advance Order' },
]

const LEGEND = [
  { label: 'Saved Bill', className: 'bg-card border border-line' },
  { label: 'Printed Bill', className: 'bg-muted/40' },
  { label: 'Cancelled Bill', className: 'bg-accent' },
  { label: 'Paid', className: 'bg-secondary' },
] as const

export default function CurrentOrders() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [mainTab, setMainTab] = useState<OrdersMainTab>('current')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState<CurrentOrderRow[]>(() => [
    ...currentOrdersList,
  ])
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [cancelPassword, setCancelPassword] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [viewOrder, setViewOrder] = useState<CurrentOrderRow | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (typeFilter !== 'all' && order.orderType !== typeFilter) return false
      if (!q) return true
      return (
        order.orderNo.includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        order.orderTypeLabel.toLowerCase().includes(q) ||
        (order.source?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [orders, search, typeFilter])

  function openCancel(orderId: string) {
    setCancelOrderId(orderId)
    setCancelPassword('')
    setCancelReason('')
    setCancelError(null)
  }

  function closeCancel() {
    setCancelOrderId(null)
    setCancelPassword('')
    setCancelReason('')
    setCancelError(null)
  }

  function submitCancel() {
    if (!cancelPassword.trim()) {
      setCancelError('Password is required')
      return
    }
    if (!cancelReason.trim()) {
      setCancelError('Cancel reason is required')
      return
    }
    setOrders((prev) =>
      prev.map((order) =>
        order.id === cancelOrderId
          ? { ...order, status: 'cancelled' as const }
          : order,
      ),
    )
    showToast(`Order cancelled`)
    closeCancel()
  }

  function handleReprint(order: CurrentOrderRow) {
    setOrders((prev) =>
      prev.map((row) =>
        row.id === order.id
          ? {
              ...row,
              status: row.status === 'cancelled' ? row.status : 'printed',
              printCount: (row.printCount ?? 0) + 1,
            }
          : row,
      ),
    )
    showToast(`Order #${order.orderNo} sent to reprint`)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => navigate('/table-view')}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-card px-4 py-2">
        <div className="flex items-center gap-1">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMainTab(tab.id)
                if (tab.id !== 'current') {
                  showToast(`${tab.label} — coming soon`)
                }
              }}
              className={`px-3 py-2 text-sm font-semibold transition-colors ${
                mainTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'border-b-2 border-transparent text-muted hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Get Past Orders — coming soon')}
            className="inline-flex h-9 items-center rounded-lg border border-primary bg-card px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Get Past Orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/configuration')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary bg-card px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card px-4 py-3 sm:px-5">
        <div className="mb-3 flex flex-wrap items-end gap-2 border-b border-line pb-3">
          {TYPE_FILTERS.map(({ id, label, icon: Icon }) => {
            const active = typeFilter === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTypeFilter(id)}
                className={`flex min-w-[72px] flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'border-b-2 border-transparent text-muted hover:bg-page hover:text-primary'
                }`}
              >
                <Icon size={22} strokeWidth={1.6} />
                {label}
              </button>
            )
          })}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-line bg-card pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
            {LEGEND.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-1.5 text-xs text-ink"
              >
                <span className={`size-3.5 rounded-full ${item.className}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded border border-line">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-page text-left text-xs font-semibold text-ink">
                <th className="border-b border-line px-3 py-2.5">Order No.</th>
                <th className="border-b border-line px-3 py-2.5">Order Type</th>
                <th className="border-b border-line px-3 py-2.5">
                  Customer Phone
                </th>
                <th className="border-b border-line px-3 py-2.5">
                  Customer Name
                </th>
                <th className="border-b border-line px-3 py-2.5">
                  Payment Type
                </th>
                <th className="border-b border-line px-3 py-2.5 text-right">
                  My Amount (₹)
                </th>
                <th className="border-b border-line px-3 py-2.5 text-right">
                  Tax (₹)
                </th>
                <th className="border-b border-line px-3 py-2.5 text-right">
                  Discount (₹)
                </th>
                <th className="border-b border-line px-3 py-2.5 text-right">
                  Grand Total (₹)
                </th>
                <th className="border-b border-line px-3 py-2.5">Created</th>
                <th className="border-b border-line px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    No orders found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const cancelling = cancelOrderId === order.id
                  const canCancel = order.status !== 'cancelled'
                  const struck = order.status === 'cancelled'
                  const cellStrike = struck
                    ? 'line-through decoration-ink/40 text-muted'
                    : ''
                  return (
                    <tr key={order.id} className={rowClassForStatus(order.status)}>
                      <td
                        className={`border-b border-line px-3 py-2 align-top ${cellStrike}`}
                      >
                        <span
                          className={`font-semibold ${struck ? 'text-muted' : 'text-primary'}`}
                        >
                          {order.orderNo}
                        </span>
                        {order.source ? (
                          <span className="mt-0.5 block text-[11px] text-muted">
                            [{order.source}]
                          </span>
                        ) : null}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 align-top ${cellStrike}`}
                      >
                        {order.orderTypeLabel}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 align-top ${cellStrike}`}
                      >
                        {order.customerPhone || '—'}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 align-top ${cellStrike}`}
                      >
                        {order.customerName || '—'}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 align-top ${cellStrike}`}
                      >
                        {order.source
                          ? `${order.source} [${order.paymentType}]`
                          : order.paymentType}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 text-right align-top tabular-nums ${cellStrike}`}
                      >
                        {money(order.myAmount)}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 text-right align-top tabular-nums ${cellStrike}`}
                      >
                        {money(order.tax)}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 text-right align-top tabular-nums ${cellStrike}`}
                      >
                        ({money(order.discount)})
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 text-right align-top font-semibold tabular-nums ${cellStrike}`}
                      >
                        {money(order.grandTotal)}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 align-top whitespace-nowrap ${cellStrike}`}
                      >
                        {order.createdAt}
                      </td>
                      <td className="border-b border-line px-3 py-2 align-top">
                        <div className="flex flex-wrap items-center gap-x-1 text-sm no-underline">
                          <button
                            type="button"
                            onClick={() => setViewOrder(order)}
                            className="font-semibold text-primary underline decoration-primary/40 hover:text-primary-hover"
                          >
                            View
                          </button>
                          <span className="text-muted">|</span>
                          <button
                            type="button"
                            onClick={() => handleReprint(order)}
                            className="font-semibold text-primary underline decoration-primary/40 hover:text-primary-hover"
                          >
                            Reprint
                          </button>
                          {canCancel ? (
                            <>
                              <span className="text-muted">|</span>
                              <button
                                type="button"
                                onClick={() => openCancel(order.id)}
                                className="font-semibold text-primary underline decoration-primary/40 hover:text-primary-hover"
                              >
                                Cancel
                              </button>
                            </>
                          ) : null}
                        </div>

                        {cancelling ? (
                          <div className="mt-3 max-w-md space-y-2 rounded-lg border border-line bg-card p-3 shadow-sm">
                            <label className="block text-xs font-medium text-ink">
                              Password*
                              <input
                                type="password"
                                value={cancelPassword}
                                onChange={(event) => {
                                  setCancelPassword(event.target.value)
                                  setCancelError(null)
                                }}
                                className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
                              />
                            </label>
                            <label className="block text-xs font-medium text-ink">
                              Cancel Reason*
                              <textarea
                                value={cancelReason}
                                onChange={(event) => {
                                  setCancelReason(event.target.value)
                                  setCancelError(null)
                                }}
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-primary"
                              />
                            </label>
                            {cancelError ? (
                              <p className="text-xs text-primary">{cancelError}</p>
                            ) : null}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={submitCancel}
                                className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
                              >
                                Submit
                              </button>
                              <button
                                type="button"
                                onClick={closeCancel}
                                className="h-9 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      <CurrentOrderDetailsModal
        open={Boolean(viewOrder)}
        order={viewOrder}
        onClose={() => setViewOrder(null)}
      />
    </div>
  )
}
