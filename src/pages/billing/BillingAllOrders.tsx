import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Download, Search } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { AllOrdersChart } from '../../components/all-orders/AllOrdersChart'
import { AllOrdersTable } from '../../components/all-orders/AllOrdersTable'
import { OrderDetailsDrawer } from '../../components/all-orders/OrderDetailsDrawer'
import { KotDetailsModal } from '../../components/all-orders/KotDetailsModal'
import { EditOrderModal } from '../../components/all-orders/EditOrderModal'
import { ChangePaymentModal } from '../../components/all-orders/ChangePaymentModal'
import {
  allOrdersChartSeries,
  allOrdersGrandTotal,
  allOrdersList,
  type AllOrderRow,
} from '../../mocks/allOrdersData'
import { formatINR } from '../../utils/format'

const PAGE_SIZE = 10

export default function BillingAllOrders() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [orders, setOrders] = useState<AllOrderRow[]>(allOrdersList)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [chartOpen, setChartOpen] = useState(false)

  const [draftType, setDraftType] = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [appliedType, setAppliedType] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const [viewOrder, setViewOrder] = useState<AllOrderRow | null>(null)
  const [viewKotOrder, setViewKotOrder] = useState<AllOrderRow | null>(null)
  const [editOrder, setEditOrder] = useState<AllOrderRow | null>(null)
  const [changePaymentOrder, setChangePaymentOrder] = useState<AllOrderRow | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const filtered = useMemo(() => {
    let result = orders
    if (appliedType) {
      result = result.filter((o) => o.orderType === appliedType)
    }
    if (appliedSearch.trim()) {
      const q = appliedSearch.trim().toLowerCase()
      result = result.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(q) ||
          o.items.toLowerCase().includes(q),
      )
    }
    return result
  }, [orders, appliedType, appliedSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  function handleSearch() {
    setAppliedType(draftType)
    setAppliedSearch(draftSearch)
    setPage(1)
  }

  function handleShowAll() {
    setDraftType('')
    setDraftSearch('')
    setAppliedType('')
    setAppliedSearch('')
    setPage(1)
    showToast('Filters cleared')
  }

  function handleToggleAll() {
    if (selected.size === pageRows.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(pageRows.map((r) => r.id)))
    }
  }

  function handleToggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleExport() {
    const header = 'Order No,Type,Customer,Items,Amount,Tax,Discount,Grand Total,Payment,Status,Date'
    const lines = [
      header,
      ...filtered.map(
        (r) =>
          `${r.orderNo},${r.orderType},"${r.customerName}","${r.items}",${r.myAmount},${r.tax},${r.discount},${r.grandTotal},${r.payment},${r.status},"${r.created}"`,
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'all-orders.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => navigate('/table-view')}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[80] rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

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
        onSave={(updated) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o)),
          )
          setEditOrder(null)
          showToast('Order updated')
        }}
      />
      <ChangePaymentModal
        open={Boolean(changePaymentOrder)}
        order={changePaymentOrder}
        onClose={() => setChangePaymentOrder(null)}
        onSave={(orderId, payment) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId ? { ...o, payment } : o,
            ),
          )
          setChangePaymentOrder(null)
          showToast('Payment updated')
        }}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-ink">All Orders</h1>
            <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
              {formatINR(allOrdersGrandTotal)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChartOpen((o) => !o)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium ${
                chartOpen
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-line bg-card text-ink hover:bg-page'
              }`}
            >
              <BarChart3 size={14} />
              Last 15 Days
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <Download size={14} className="text-muted" />
              Export
            </button>
          </div>
        </div>

        {chartOpen ? (
          <div className="mb-4 rounded-xl border border-line bg-card p-4">
            <AllOrdersChart series={allOrdersChartSeries} />
          </div>
        ) : null}

        <div className="mb-4 rounded-xl border border-line bg-card p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              Order Type
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
                className="h-9 rounded-lg border border-line bg-page px-2 text-sm text-ink outline-none focus:border-primary"
              >
                <option value="">All Types</option>
                <option value="DINE IN">Dine In</option>
                <option value="PARCEL">Parcel</option>
                <option value="DELIVERY">Delivery</option>
                <option value="PICK UP">Pick Up</option>
              </select>
            </label>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search order ID or items..."
                className="h-9 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleShowAll}
              className="inline-flex h-9 items-center rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Clear Filter
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="overflow-x-auto">
            <AllOrdersTable
              rows={pageRows}
              selected={selected}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
              onView={setViewOrder}
              onViewKot={setViewKotOrder}
              onEdit={setEditOrder}
              onChangePayment={setChangePaymentOrder}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
            <span className="text-xs text-muted">
              Showing {(safePage - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} records
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1)
                .filter((n) => {
                  if (totalPages <= 3) return true
                  if (safePage <= 2) return n <= 3
                  if (safePage >= totalPages - 1) return n >= totalPages - 2
                  return Math.abs(n - safePage) <= 1
                })
                .map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-medium ${
                      n === safePage
                        ? 'bg-primary text-white'
                        : 'border border-line bg-card text-ink hover:bg-page'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page disabled:opacity-40"
              >
                Next
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage(totalPages)}
                className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page disabled:opacity-40"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
