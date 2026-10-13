import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilLine, Search } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { KotTable } from '../../components/kot/KotTable'
import { ViewKotModal } from '../../components/kot/ViewKotModal'
import { EditKotModal } from '../../components/kot/EditKotModal'
import { KotOrderDetailsDrawer } from '../../components/kot/KotOrderDetailsDrawer'
import { FilterSelect } from '../../components/all-orders/FilterSelect'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import {
  billingUrlForKot,
  parseKotItems,
  type KotRow,
} from '../../utils/kotListStore'
import { downloadCsv } from '../../utils/exportCsv'
import { showToast } from '../../utils/toast'
import { useAuth } from '../../auth/AuthContext'
import { subscribeToRail } from '../../services/liveRailClient'
import {
  listKotsApi,
  toKotRow,
  updateKotApi,
  type KotEventData,
  type KotRowStatus,
} from '../../services/orderService'

const PAGE_SIZE = 15

const ORDER_TYPE_OPTIONS = [
  { value: '', label: 'All Order Type' },
  { value: 'DINE IN', label: 'Dine In' },
  { value: 'PARCEL', label: 'Parcel' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'PICK UP', label: 'Pick Up' },
  { value: 'OTHER', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'Used In Bill', label: 'Used In Bill' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Printed', label: 'Printed' },
]

export default function BillingKot() {
  const navigate = useNavigate()
  const { encryptedOutletId, token } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [rows, setRows] = useState<KotRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [draftType, setDraftType] = useState('')
  const [draftStatus, setDraftStatus] = useState('')

  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')
  const [appliedType, setAppliedType] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('')

  const [viewKot, setViewKot] = useState<KotRow | null>(null)
  const [editKot, setEditKot] = useState<KotRow | null>(null)
  const [detailsKot, setDetailsKot] = useState<KotRow | null>(null)

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    setLoading(true)
    listKotsApi(encryptedOutletId, {
      from: appliedStart || undefined,
      to: appliedEnd || undefined,
      order_type: appliedType || undefined,
      status: appliedStatus || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then((pageData) => {
        if (cancelled) return
        setRows(pageData.results.map(toKotRow))
        setTotalCount(pageData.count)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load KOTs',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    encryptedOutletId,
    appliedStart,
    appliedEnd,
    appliedType,
    appliedStatus,
    page,
  ])

  useEffect(() => {
    if (!encryptedOutletId || !token) return
    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event, data) => {
        if (event === 'kot.prep') {
          setRows((prev) => [toKotRow(data as KotEventData), ...prev])
          return
        }
        if (event === 'kot.modified' || event === 'kot.cancelled') {
          const row = toKotRow(data as KotEventData)
          setRows((prev) => {
            const index = prev.findIndex((existing) => existing.id === row.id)
            if (index === -1) return [row, ...prev]
            const next = [...prev]
            next[index] = row
            return next
          })
          return
        }
        if (event === 'kot.deleted') {
          const payload = data as { id: string }
          setRows((prev) => prev.filter((row) => row.id !== payload.id))
          return
        }
        if (event === 'kot.used_in_bill') {
          const payload = data as KotEventData
          setRows((prev) =>
            prev.map((row) =>
              row.id === payload.id
                ? { ...row, status: 'Used In Bill' as const }
                : row,
            ),
          )
          return
        }
        // Save & Print moved a served ticket onto a printed bill. It leaves the
        // kitchen's work but is not billed until payment, so keep the row and
        // only restyle it.
        if (event === 'kot.printed') {
          const row = toKotRow(data as KotEventData)
          setRows((prev) => {
            const index = prev.findIndex((existing) => existing.id === row.id)
            if (index === -1) return [row, ...prev]
            const next = [...prev]
            next[index] = { ...row, status: 'Printed' as const }
            return next
          })
        }
      },
    })
  }, [encryptedOutletId, token])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  function handleSearch() {
    setAppliedStart(draftStart)
    setAppliedEnd(draftEnd)
    setAppliedType(draftType)
    setAppliedStatus(draftStatus)
    setPage(1)
  }

  function handleShowAll() {
    setDraftStart('')
    setDraftEnd('')
    setDraftType('')
    setDraftStatus('')
    setAppliedStart('')
    setAppliedEnd('')
    setAppliedType('')
    setAppliedStatus('')
    setPage(1)
  }

  async function handleSaveKot(updated: KotRow) {
    if (!encryptedOutletId) return
    try {
      const dto = await updateKotApi(encryptedOutletId, updated.id, {
        customer_name: updated.customerName,
        customer_phone: updated.customerPhone,
        status: updated.status as KotRowStatus,
        item_count: updated.itemCount,
        items: parseKotItems(updated.items),
      })
      setRows((prev) =>
        prev.map((row) => (row.id === updated.id ? toKotRow(dto) : row)),
      )
      showToast(`KOT #${updated.kotId} updated`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update KOT',
      )
    }
  }

  async function exportRows(rowsToExport: KotRow[], suffix: string) {
    downloadCsv(
      `billing-kot-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'KOT ID',
        'Order Type',
        'Customer Name',
        'Customer Phone',
        'No. Of Items',
        'Items',
        'Status',
        'Bill Print Date',
        'Complete Duration',
        'Created',
      ],
      rowsToExport.map((row) => [
        row.kotId,
        row.orderType,
        row.customerName,
        row.customerPhone,
        row.itemCount,
        row.items,
        row.status,
        row.billPrintDate,
        row.completeDuration,
        row.created,
      ]),
    )
    showToast(`Exported ${rowsToExport.length} rows`)
  }

  async function exportAll() {
    if (!encryptedOutletId) return
    try {
      const all: KotRow[] = []
      const first = await listKotsApi(encryptedOutletId, {
        from: appliedStart || undefined,
        to: appliedEnd || undefined,
        order_type: appliedType || undefined,
        status: appliedStatus || undefined,
        page: 1,
        page_size: 100,
      })
      all.push(...first.results.map(toKotRow))
      const pages = Math.max(1, Math.ceil(first.count / 100))
      for (let p = 2; p <= pages; p += 1) {
        const next = await listKotsApi(encryptedOutletId, {
          from: appliedStart || undefined,
          to: appliedEnd || undefined,
          order_type: appliedType || undefined,
          status: appliedStatus || undefined,
          page: p,
          page_size: 100,
        })
        all.push(...next.results.map(toKotRow))
      }
      await exportRows(all, 'all')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to export KOTs')
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

      <ViewKotModal
        open={Boolean(viewKot)}
        kot={viewKot}
        onClose={() => setViewKot(null)}
      />
      <EditKotModal
        open={Boolean(editKot)}
        kot={editKot}
        onClose={() => setEditKot(null)}
        onSave={async (updated) => {
          await handleSaveKot(updated)
          setEditKot(null)
        }}
      />
      <KotOrderDetailsDrawer
        open={Boolean(detailsKot)}
        kot={detailsKot}
        onClose={() => setDetailsKot(null)}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">KOT</h1>
          <ExportExcelMenu
            onExportPage={() => exportRows(rows, 'page')}
            onExportAll={() => exportAll()}
          />
        </div>

        <div className="mb-4 rounded-xl border border-line bg-card p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              Start Date
              <input
                type="date"
                value={draftStart}
                onChange={(e) => setDraftStart(e.target.value)}
                className="h-9 rounded-lg border border-line bg-page px-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              End Date
              <input
                type="date"
                value={draftEnd}
                onChange={(e) => setDraftEnd(e.target.value)}
                className="h-9 rounded-lg border border-line bg-page px-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <FilterSelect
              label="Order Type"
              value={draftType}
              options={ORDER_TYPE_OPTIONS}
              onChange={setDraftType}
            />
            <FilterSelect
              label="Status"
              value={draftStatus}
              options={STATUS_OPTIONS}
              onChange={setDraftStatus}
            />
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Search size={14} className="mr-1.5" />
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

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-line bg-card text-center">
            <p className="text-sm font-medium text-muted">Loading KOTs…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-line bg-card text-center">
            <p className="text-sm font-medium text-muted">
              No results found. Try adjusting dates or click Clear Filter.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-card">
            <div className="overflow-x-auto">
              <KotTable
                rows={rows}
                onView={setViewKot}
                onEdit={setEditKot}
                onDetails={setDetailsKot}
                onOpenInBilling={(row) => navigate(billingUrlForKot(row))}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">
                  Showing {(safePage - 1) * PAGE_SIZE + 1} to{' '}
                  {Math.min(safePage * PAGE_SIZE, totalCount)} of{' '}
                  {totalCount} records
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <span className="inline-flex size-4 items-center justify-center rounded bg-primary text-[9px] font-bold text-white">
                    <PencilLine size={10} />
                  </span>
                  Modified KOT
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 3) },
                  (_, i) => i + 1,
                )
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
        )}
      </main>
    </div>
  )
}