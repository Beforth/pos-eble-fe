import { useMemo, useState, type ComponentType } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import {
  Bike,
  ChevronLeft,
  Download,
  LayoutGrid,
  Loader2,
  Search,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { BillingOrdersTable } from '../../components/billing/BillingOrdersTable'
import { CancelOrderReasonModal } from '../../components/billing/CancelOrderReasonModal'
import { BillReceipt } from '../../components/billing/BillReceipt'
import { SelectDropdown } from '../../components/common/SelectDropdown'
import { OrderDetailsDrawer } from '../../components/all-orders/OrderDetailsDrawer'
import { KotDetailsModal } from '../../components/all-orders/KotDetailsModal'
import { EditOrderModal } from '../../components/all-orders/EditOrderModal'
import { ChangePaymentModal } from '../../components/all-orders/ChangePaymentModal'
import { SettleDueModal } from '../../components/all-orders/SettleDueModal'
import { useAllOrdersData } from '../../services/useAllOrdersData'
import type { OrderDto } from '../../services/orderService'
import type { TaxBreakdownLine } from '../../utils/taxEngine'
import { type AllOrderRow, type OrderStatus } from '../../mocks/allOrdersData'
import { billingUrlForOrder } from '../../utils/billingLinks'
import { STATUS_DOT, STATUS_LEGEND_LABEL } from '../../utils/billingOrderStatus'
import { downloadCsv } from '../../utils/exportCsv'
import { useNewOrder } from '../../state/useNewOrder'
import { FilterSelect } from '../../components/all-orders/FilterSelect'
import { TimeField } from '../../components/common/TimeField'
import {
  DATE_PRESETS,
  EMPTY_ORDER_FILTERS,
  activeFilterCount,
  matchesOrderFilters,
  type DatePreset,
  type OrderFilterValues,
} from '../../utils/orderFilters'

const PAGE_SIZE = 20

const filterInputClass =
  'h-9 w-full rounded-lg border border-line bg-page px-2.5 text-sm text-ink outline-none focus:border-primary'

type SortKey = 'latest' | 'oldest' | 'high' | 'low'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'latest', label: 'Latest Date' },
  { value: 'oldest', label: 'Oldest Date' },
  { value: 'high', label: 'Amount: High to Low' },
  { value: 'low', label: 'Amount: Low to High' },
]

const TYPE_TABS: {
  value: string
  label: string
  icon: ComponentType<{ size?: number }>
}[] = [
  { value: '', label: 'All', icon: LayoutGrid },
  { value: 'DINE IN', label: 'Dine In', icon: UtensilsCrossed },
  { value: 'PARCEL', label: 'Parcel', icon: ShoppingBag },
  { value: 'DELIVERY', label: 'Delivery', icon: Bike },
  { value: 'PICK UP', label: 'Pick Up', icon: Store },
]

const LEGEND_ORDER: OrderStatus[] = ['Saved', 'Printed', 'Cancelled', 'Settled']

/**
 * Builds the printable cancelled bill from the server order. The order stores
 * one tax total, so it is shown as a single line — forward when it was added on
 * top of the amount, backward (included) otherwise; round-off is whatever makes
 * the printed total match the order's grand total.
 */
function cancelledReceipt(order: OrderDto) {
  const mine = Number(order.my_amount || 0)
  const tax = Number(order.tax || 0)
  const discount = Number(order.discount || 0)
  const grand = Number(order.grand_total || 0)
  const forward = tax > 0 && Math.abs(grand - (mine - discount + tax)) < 1
  const taxBreakdown: TaxBreakdownLine[] =
    tax > 0
      ? [{ label: 'Tax', amount: tax, mode: forward ? 'forward' : 'backward', rate: 0 }]
      : []
  const roundOff =
    Math.round((grand - (mine - discount + (forward ? tax : 0))) * 100) / 100
  const created = new Date(order.created_at)
  return {
    meta: {
      billNo: order.bill_no || order.order_no,
      date: created.toLocaleDateString('en-IN'),
      time: created.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      orderType: order.order_type_label || order.order_type,
      cashier: order.settlement_by,
      customerName: order.customer_name,
    },
    items: order.items.map((item) => ({
      name: item.name,
      note: item.note || undefined,
      qty: Number(item.qty || 0),
      rate: Number(item.unit_price || 0),
    })),
    charges: { taxBreakdown, roundOff, discount },
    paymentMode: order.payment_type || '—',
  }
}

export default function BillingAllOrders() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, token } = useAuth()
  const { orders, loading, saveChangePayment, saveDueCollect, cancelOrder } =
    useAllOrdersData(encryptedOutletId, token)
  const [cancelTarget, setCancelTarget] = useState<AllOrderRow | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelledBill, setCancelledBill] = useState<{
    order: OrderDto
    reason: string
  } | null>(null)
  const [billNo, setBillNo] = useState('')
  const [shown, setShown] = useState(PAGE_SIZE)

  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('latest')
  const [pastOpen, setPastOpen] = useState(false)
  const [extra, setExtra] = useState<OrderFilterValues>(EMPTY_ORDER_FILTERS)

  function setFilter<K extends keyof OrderFilterValues>(key: K, value: OrderFilterValues[K]) {
    setExtra((prev) => ({ ...prev, [key]: value }))
    setShown(PAGE_SIZE)
  }

  const tableOptions = useMemo(
    () =>
      Array.from(new Set(orders.map((o) => o.tableNo ?? '').filter((n) => n !== '')))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [orders],
  )

  // Payment modes actually present in the loaded orders, so the list never
  // offers one that would return nothing.
  const paymentOptions = useMemo(
    () =>
      Array.from(
        new Set(orders.map((o) => o.paymentType ?? '').filter((p) => p !== '')),
      ).sort(),
    [orders],
  )

  const [viewOrder, setViewOrder] = useState<AllOrderRow | null>(null)
  const [viewKotOrder, setViewKotOrder] = useState<AllOrderRow | null>(null)
  const [editOrder, setEditOrder] = useState<AllOrderRow | null>(null)
  const [changePaymentOrder, setChangePaymentOrder] = useState<AllOrderRow | null>(null)
  const [dueOrder, setDueOrder] = useState<AllOrderRow | null>(null)

  // Search, status and the extra filters narrow everything; the order-type tabs
  // then split that result, so each tab's count reflects the other filters.
  const narrowed = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (!matchesOrderFilters(o, extra)) return false
      if (!q) return true
      return (
        o.orderNo.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerPhone ?? '').toLowerCase().includes(q) ||
        o.items.toLowerCase().includes(q)
      )
    })
  }, [orders, status, search, extra])

  const filtered = useMemo(() => {
    const list = type ? narrowed.filter((o) => o.orderType === type) : narrowed
    const sorted = [...list]
    sorted.sort((a, b) => {
      if (sort === 'high') return b.grandTotal - a.grandTotal
      if (sort === 'low') return a.grandTotal - b.grandTotal
      const diff = (b.createdAt ?? 0) - (a.createdAt ?? 0)
      return sort === 'oldest' ? -diff : diff
    })
    return sorted
  }, [narrowed, type, sort])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { '': narrowed.length }
    for (const o of narrowed) counts[o.orderType] = (counts[o.orderType] ?? 0) + 1
    return counts
  }, [narrowed])

  const visible = filtered.slice(0, shown)
  const filtersOn =
    status !== 'all' ||
    type !== '' ||
    search.trim() !== '' ||
    activeFilterCount(extra) > 0

  function resetFilters() {
    setStatus('all')
    setType('')
    setSearch('')
    setExtra(EMPTY_ORDER_FILTERS)
    setShown(PAGE_SIZE)
  }

  function handleExport() {
    downloadCsv(
      'all-orders.csv',
      ['Order No', 'Type', 'Phone', 'Customer', 'Items', 'Items amount', 'Tax', 'Discount', 'Total', 'Payment', 'Status', 'Date'],
      filtered.map((r) => [
        r.orderNo, r.orderType, r.customerPhone ?? '', r.customerName, r.items,
        r.myAmount, r.tax, r.discount, r.grandTotal, r.payment, r.status, r.created,
      ]),
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <OrderDetailsDrawer
        open={Boolean(viewOrder)}
        order={viewOrder}
        onClose={() => setViewOrder(null)}
      />
      <KotDetailsModal
        open={Boolean(viewKotOrder)}
        order={viewKotOrder}
        onClose={() => setViewKotOrder(null)}
      />
      <EditOrderModal
        open={Boolean(editOrder)}
        order={editOrder}
        onClose={() => setEditOrder(null)}
      />
      <ChangePaymentModal
        open={Boolean(changePaymentOrder)}
        order={changePaymentOrder}
        onClose={() => setChangePaymentOrder(null)}
        onSave={saveChangePayment}
      />
      <SettleDueModal
        open={Boolean(dueOrder)}
        order={dueOrder}
        onClose={() => setDueOrder(null)}
        onSave={saveDueCollect}
      />

      <CancelOrderReasonModal
        open={Boolean(cancelTarget)}
        orderNo={cancelTarget?.orderNo ?? ''}
        loading={cancelling}
        onClose={() => setCancelTarget(null)}
        onConfirm={async (reason) => {
          if (!cancelTarget) return
          setCancelling(true)
          const cancelled = await cancelOrder(cancelTarget.id, reason)
          setCancelling(false)
          setCancelTarget(null)
          // The cancelled bill prints right after the cancellation.
          if (cancelled) setCancelledBill({ order: cancelled, reason })
        }}
      />

      {cancelledBill
        ? (() => {
            const receipt = cancelledReceipt(cancelledBill.order)
            return (
              <BillReceipt
                meta={receipt.meta}
                items={receipt.items}
                charges={receipt.charges}
                paymentMode={receipt.paymentMode}
                cancelled={{ reason: cancelledBill.reason }}
                onClose={() => setCancelledBill(null)}
              />
            )
          })()
        : null}

      <div className="flex items-center justify-between border-b border-line bg-card px-4 sm:px-6">
        <nav className="flex" aria-label="Order lists">
          <span
            aria-current="page"
            className="border-b-2 border-primary px-4 py-3 text-sm font-semibold text-primary"
          >
            Current Order
          </span>
          <Link
            to="/billing/online-orders"
            className="px-4 py-3 text-sm font-medium text-ink hover:text-primary"
          >
            Online Order
          </Link>
          <Link
            to="/billing/advance-orders"
            className="px-4 py-3 text-sm font-medium text-ink hover:text-primary"
          >
            Advance Order
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => navigate('/billing/operations')}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card px-4 py-3 sm:px-6">
        <div
          className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-page p-1"
          role="tablist"
          aria-label="Order type"
        >
          {TYPE_TABS.map((tab) => {
            const active = type === tab.value
            const Icon = tab.icon
            return (
              <button
                key={tab.value || 'all'}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setType(tab.value)
                  setShown(PAGE_SIZE)
                }}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <Icon size={16} />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    active ? 'bg-primary/10 text-primary' : 'bg-card text-muted'
                  }`}
                >
                  {typeCounts[tab.value] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            aria-label="Download list"
            data-tooltip="Download list"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-card text-ink hover:bg-page"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            onClick={() => setPastOpen((open) => !open)}
            aria-pressed={pastOpen}
            className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-semibold ${
              pastOpen
                ? 'border-primary bg-primary text-white'
                : 'border-primary text-primary hover:bg-primary/5'
            }`}
          >
            Get Past Orders
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {pastOpen ? (
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-3 xl:grid-cols-7">
            <FilterSelect
              label="Date"
              value={extra.datePreset}
              onChange={(value) => setFilter('datePreset', value as DatePreset)}
              options={DATE_PRESETS}
              className="w-full min-w-0"
            />
            <TimeField
              label="Time from"
              value={extra.timeFrom}
              onChange={(value) => setFilter('timeFrom', value)}
            />
            <TimeField
              label="Time to"
              value={extra.timeTo}
              onChange={(value) => setFilter('timeTo', value)}
            />
            <FilterSelect
              label="Table"
              value={extra.table}
              onChange={(value) => setFilter('table', value)}
              options={[
                { value: '', label: 'Any table' },
                { value: 'none', label: 'Counter (no table)' },
                ...tableOptions.map((no) => ({ value: no, label: `Table ${no}` })),
              ]}
              className="w-full min-w-0"
            />
            <FilterSelect
              label="Payment"
              value={extra.payment}
              onChange={(value) => setFilter('payment', value)}
              options={[
                { value: '', label: 'Any payment' },
                ...paymentOptions.map((option) => ({ value: option, label: option })),
              ]}
              className="w-full min-w-0"
            />
            <FilterSelect
              label="Taken from"
              value={extra.source}
              onChange={(value) => setFilter('source', value)}
              options={[
                { value: '', label: 'Billing and Captain' },
                { value: 'billing', label: 'Billing' },
                { value: 'captain', label: 'Captain' },
              ]}
              className="w-full min-w-0"
            />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Amount (₹)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={extra.amountMin}
                  onChange={(e) => setFilter('amountMin', e.target.value)}
                  placeholder="Min"
                  aria-label="Minimum amount"
                  className={filterInputClass}
                />
                <span className="text-xs text-muted">to</span>
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={extra.amountMax}
                  onChange={(e) => setFilter('amountMax', e.target.value)}
                  placeholder="Max"
                  aria-label="Maximum amount"
                  className={filterInputClass}
                />
              </div>
            </div>
            {extra.datePreset === 'custom' ? (
              <>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">From date</span>
                  <input
                    type="date"
                    value={extra.dateFrom}
                    max={extra.dateTo || undefined}
                    onChange={(e) => setFilter('dateFrom', e.target.value)}
                    className={filterInputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted">To date</span>
                  <input
                    type="date"
                    value={extra.dateTo}
                    min={extra.dateFrom || undefined}
                    onChange={(e) => setFilter('dateTo', e.target.value)}
                    className={filterInputClass}
                  />
                </label>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShown(PAGE_SIZE)
              }}
              placeholder="Search order no., name, phone or item"
              aria-label="Search orders"
              className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-9 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                data-tooltip="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              Sort by
              <SelectDropdown
                value={sort}
                options={SORT_OPTIONS}
                onChange={(value) => setSort(value as SortKey)}
                caption="Sort orders"
                searchable={false}
                align="right"
                triggerClassName="h-9 w-[190px]"
              />
            </div>
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter by bill status"
            >
              {LEGEND_ORDER.map((key) => {
                const active = status === key
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setStatus(active ? 'all' : key)
                      setShown(PAGE_SIZE)
                    }}
                    className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-line bg-card text-ink hover:bg-page'
                    }`}
                  >
                    <span className={`size-2.5 rounded-full ${STATUS_DOT[key]}`} />
                    {STATUS_LEGEND_LABEL[key]}
                  </button>
                )
              })}
            </div>
            {filtersOn ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-12 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading orders…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card px-6 py-12 text-center">
            <p className="text-base font-semibold text-ink">
              {filtersOn ? 'No orders match' : 'No orders yet'}
            </p>
            <p className="mt-1 text-sm text-muted">
              {filtersOn
                ? 'Try another order type or status, or clear the search.'
                : 'Orders will appear here as soon as they are taken.'}
            </p>
            {filtersOn ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex h-9 items-center rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
              >
                Show all orders
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-line bg-card">
              <BillingOrdersTable
                rows={visible}
                onView={setViewOrder}
                onViewKot={setViewKotOrder}
                onEdit={setEditOrder}
                onChangePayment={setChangePaymentOrder}
                onSettleDue={setDueOrder}
                onOpenInBilling={(row) => navigate(billingUrlForOrder(row.id))}
                onCancel={setCancelTarget}
              />
            </div>
            {filtered.length > visible.length ? (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShown((n) => n + PAGE_SIZE)}
                  className="inline-flex h-10 items-center rounded-lg border border-line bg-card px-5 text-sm font-semibold text-ink hover:bg-page"
                >
                  Show {Math.min(PAGE_SIZE, filtered.length - visible.length)} more
                </button>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}
