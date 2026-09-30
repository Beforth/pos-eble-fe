import { useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import {
  ArrowLeft,
  Bike,
  Grid2x2,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { CurrentOrderDetailsModal } from '../../components/configuration/CurrentOrderDetailsModal'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import {
  money,
  rowClassForStatus,
  type CurrentOrderRow,
  type CurrentOrderType,
  type OrdersMainTab,
} from '../../mocks/currentOrdersData'
import {
  cancelOrderApi,
  listOrdersApi,
  reprintOrderApi,
  toOrderRow,
  toOrderRows,
  type OrderEventData,
  type OrderStatus,
} from '../../services/orderService'
import { subscribeToRail } from '../../services/liveRailClient'

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

type StatusFilter = 'all' | OrderStatus

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'saved', label: 'Saved Bill' },
  { id: 'printed', label: 'Printed Bill' },
  { id: 'cancelled', label: 'Cancelled Bill' },
  { id: 'paid', label: 'Paid' },
]

const PAGE_SIZE = 50

export default function CurrentOrders() {
  const navigate = useNavigate()
  const { encryptedOutletId, token } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [mainTab, setMainTab] = useState<OrdersMainTab>('current')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
<<<<<<< HEAD
  const [orders, setOrders] = useState<CurrentOrderRow[]>(() => [
    ...currentOrdersList,
  ])
=======
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<CurrentOrderRow[]>([])
>>>>>>> origin/main
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [cancelPassword, setCancelPassword] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [viewOrder, setViewOrder] = useState<CurrentOrderRow | null>(null)

  const gateRef = useRef({ page: 1, search: '', status: 'all' as StatusFilter })
  useEffect(() => {
    gateRef.current = { page, search, status: statusFilter }
  }, [page, search, statusFilter])

<<<<<<< HEAD
  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (typeFilter !== 'all' && order.orderType !== typeFilter) return false
      return true
    })
  }, [orders, typeFilter])

  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      filtered,
      (order) => [
        order.orderNo,
        order.customerName,
        order.customerPhone,
        order.orderTypeLabel,
        order.source,
        order.paymentType,
        order.myAmount,
        order.tax,
        order.discount,
        order.grandTotal,
        order.createdAt,
      ],
      (order, key) => {
        if (key === 'orderType') return order.orderTypeLabel
        if (key === 'customerPhone') return order.customerPhone
        if (key === 'customerName') return order.customerName
        if (key === 'paymentType') return order.paymentType
        if (key === 'myAmount') return order.myAmount
        if (key === 'tax') return order.tax
        if (key === 'discount') return order.discount
        if (key === 'grandTotal') return order.grandTotal
        if (key === 'created') return order.createdAt
        return order.orderNo
      },
    )
=======
  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    const trimmed = search.trim()
    const delay = trimmed === '' ? 0 : 300
    const handle = window.setTimeout(() => {
      setLoading(true)
      listOrdersApi(encryptedOutletId, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: trimmed === '' ? undefined : trimmed,
        page,
        page_size: PAGE_SIZE,
      })
        .then((pageData) => {
          if (cancelled) return
          setOrders(toOrderRows(pageData.results))
          setTotalCount(pageData.count)
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            showToast(
              error instanceof Error ? error.message : 'Failed to load orders',
            )
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, delay)
    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [encryptedOutletId, statusFilter, search, page])

  useEffect(() => {
    if (!encryptedOutletId || !token) return
    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event, data) => {
        if (event === 'order.created') {
          const gate = gateRef.current
          if (gate.page === 1 && gate.search.trim() === '' && gate.status === 'all') {
            setOrders((prev) => [toOrderRow(data as OrderEventData), ...prev])
          }
          return
        }
        if (
          event === 'order.settle' ||
          event === 'order.printed' ||
          event === 'order.modified'
        ) {
          const row = toOrderRow(data as OrderEventData)
          setOrders((prev) => upsertOrder(prev, row))
          return
        }
        if (event === 'order.cancelled') {
          const payload = data as OrderEventData
          setOrders((prev) =>
            prev.map((order) =>
              order.id === payload.id
                ? { ...order, status: 'cancelled' as const }
                : order,
            ),
          )
        }
      },
    })
  }, [encryptedOutletId, token])

  function upsertOrder(
    prev: CurrentOrderRow[],
    row: CurrentOrderRow,
  ): CurrentOrderRow[] {
    const exists = prev.some((order) => order.id === row.id)
    if (!exists) return [row, ...prev]
    return prev.map((order) =>
      order.id === row.id
        ? { ...order, ...row, status: row.status as CurrentOrderRow['status'] }
        : order,
    )
  }

  const visible = useMemo(() => {
    if (typeFilter === 'all') return orders
    return orders.filter((order) => order.orderType === typeFilter)
  }, [orders, typeFilter])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
>>>>>>> origin/main

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

  async function submitCancel() {
    if (!cancelPassword.trim()) {
      setCancelError('Password is required')
      return
    }
    if (!cancelReason.trim()) {
      setCancelError('Cancel reason is required')
      return
    }
    if (!encryptedOutletId || !cancelOrderId) {
      setCancelError('Missing order to cancel')
      return
    }
    try {
      const updated = await cancelOrderApi(encryptedOutletId, cancelOrderId)
      setOrders((prev) =>
        prev.map((order) =>
          order.id === cancelOrderId ? toOrderRow(updated) : order,
        ),
      )
      showToast('Order cancelled')
      closeCancel()
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : 'Failed to cancel order',
      )
    }
  }

  async function handleReprint(order: CurrentOrderRow) {
    if (!encryptedOutletId) return
    try {
      const updated = await reprintOrderApi(encryptedOutletId, order.id)
      setOrders((prev) =>
        prev.map((row) => (row.id === order.id ? toOrderRow(updated) : row)),
      )
      showToast(`Order #${order.orderNo} sent to reprint`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to reprint order',
      )
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">

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
<<<<<<< HEAD
          <ListSearch
            value={search}
            onChange={setSearch}
            placeholder="Search"
            className="max-w-sm"
          />
=======
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-line bg-card pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
>>>>>>> origin/main
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

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map(({ id, label }) => {
            const active = statusFilter === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setStatusFilter(id)
                  setPage(1)
                }}
                className={`h-8 rounded-full border px-3 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-card text-muted hover:border-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded border border-line">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-page text-left text-xs font-semibold text-ink">
                <SortableTh
                  columnKey="orderNo"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Order No.
                </SortableTh>
                <SortableTh
                  columnKey="orderType"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Order Type
                </SortableTh>
                <SortableTh
                  columnKey="customerPhone"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Customer Phone
                </SortableTh>
                <SortableTh
                  columnKey="customerName"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Customer Name
                </SortableTh>
                <SortableTh
                  columnKey="paymentType"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Payment Type
                </SortableTh>
                <SortableTh
                  columnKey="myAmount"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                  className="border-b border-line px-3 py-2.5"
                >
                  My Amount (₹)
                </SortableTh>
                <SortableTh
                  columnKey="tax"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                  className="border-b border-line px-3 py-2.5"
                >
                  Tax (₹)
                </SortableTh>
                <SortableTh
                  columnKey="discount"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                  className="border-b border-line px-3 py-2.5"
                >
                  Discount (₹)
                </SortableTh>
                <SortableTh
                  columnKey="grandTotal"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                  className="border-b border-line px-3 py-2.5"
                >
                  Grand Total (₹)
                </SortableTh>
                <SortableTh
                  columnKey="created"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Created
                </SortableTh>
                <th className="border-b border-line px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    No orders found for this filter.
                  </td>
                </tr>
              ) : (
                visible.map((order) => {
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted">
            {loading
              ? 'Loading…'
              : totalCount === 0
                ? 'No orders'
                : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-semibold text-ink transition-colors hover:border-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-ink">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-semibold text-ink transition-colors hover:border-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
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
