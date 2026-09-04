import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilLine, Search } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { KotTable } from '../../components/kot/KotTable'
import { ViewKotModal } from '../../components/kot/ViewKotModal'
import { EditKotModal } from '../../components/kot/EditKotModal'
import { KotOrderDetailsDrawer } from '../../components/kot/KotOrderDetailsDrawer'
import { FilterSelect } from '../../components/all-orders/FilterSelect'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { loadKotRows, type KotRow } from '../../utils/kotListStore'

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
]

export default function BillingKot() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [rows, setRows] = useState<KotRow[]>(() => loadKotRows('billing'))
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

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (appliedStart) {
        const rowDate = row.created.slice(0, 10)
        if (rowDate < appliedStart) return false
      }
      if (appliedEnd) {
        const rowDate = row.created.slice(0, 10)
        if (rowDate > appliedEnd) return false
      }
      if (appliedType && row.orderType !== appliedType) return false
      if (appliedStatus && row.status !== appliedStatus) return false
      return true
    })
  }, [rows, appliedStart, appliedEnd, appliedType, appliedStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

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
        onSave={(updated) => {
          setRows((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r)),
          )
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
            onExportPage={() => {}}
            onExportAll={() => {}}
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

        {filtered.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-line bg-card text-center">
            <p className="text-sm font-medium text-muted">
              No results found. Try adjusting dates or click Clear Filter.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-card">
            <div className="overflow-x-auto">
              <KotTable
                rows={pageRows}
                onView={setViewKot}
                onEdit={setEditKot}
                onDetails={setDetailsKot}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">
                  Showing {(safePage - 1) * PAGE_SIZE + 1} to{' '}
                  {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
                  {filtered.length} records
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
