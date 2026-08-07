import { useMemo, useState } from 'react'
import { PencilLine } from 'lucide-react'
import { ExportExcelMenu } from '../components/all-orders/ExportExcelMenu'
import { FilterSelect } from '../components/all-orders/FilterSelect'
import { DateTimeField } from '../components/common/DateTimeField'
import { EditKotModal } from '../components/kot/EditKotModal'
import { KotOrderDetailsDrawer } from '../components/kot/KotOrderDetailsDrawer'
import { KotTable } from '../components/kot/KotTable'
import { ViewKotModal } from '../components/kot/ViewKotModal'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import { kotList, parseKotDate, type KotRow } from '../mocks/kotData'
import { brand } from '../theme/brand'
import { formatNumber } from '../utils/format'

const PAGE_SIZE = 15

const ORDER_TYPE_OPTIONS = [
  { value: 'all', label: 'All Order Type' },
  { value: 'DINE IN', label: 'Dine In' },
  { value: 'PARCEL', label: 'Parcel' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'PICK UP', label: 'Pick Up' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'Used In Bill', label: 'Used In Bill' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Cancelled', label: 'Cancelled' },
]

function atStartOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  )
}

function defaultStartDate() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return atStartOfDay(d)
}

function defaultEndDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return atStartOfDay(d)
}

function filterInputClass() {
  return 'mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary'
}

interface KotFilters {
  startDate: Date
  endDate: Date
  orderType: string
  status: string
  customerName: string
  customerPhone: string
  kotId: string
}

function createDefaultFilters(): KotFilters {
  return {
    startDate: defaultStartDate(),
    endDate: defaultEndDate(),
    orderType: 'all',
    status: 'all',
    customerName: '',
    customerPhone: '',
    kotId: '',
  }
}

export default function Kot() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  const [moreFilters, setMoreFilters] = useState(false)
  const [draft, setDraft] = useState<KotFilters>(createDefaultFilters)
  const [applied, setApplied] = useState<KotFilters>(createDefaultFilters)
  const [ignoreDateFilter, setIgnoreDateFilter] = useState(false)
  const [searched, setSearched] = useState(true)
  const [page, setPage] = useState(1)
  const [searchFlash, setSearchFlash] = useState(false)
  const [showAllFlash, setShowAllFlash] = useState(false)
  const [rows, setRows] = useState<KotRow[]>(() => [...kotList])
  const [editKot, setEditKot] = useState<KotRow | null>(null)
  const [viewKot, setViewKot] = useState<KotRow | null>(null)
  const [detailsKot, setDetailsKot] = useState<KotRow | null>(null)

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  const filtered = useMemo(() => {
    if (!searched) return []
    return rows.filter((row) => {
      const created = parseKotDate(row.created)
      const dateOk =
        ignoreDateFilter ||
        !created ||
        (created.getTime() >= applied.startDate.getTime() &&
          created.getTime() <= applied.endDate.getTime())

      const typeOk =
        applied.orderType === 'all' || row.orderType === applied.orderType

      const statusOk =
        applied.status === 'all' || row.status === applied.status

      const nameOk =
        !applied.customerName.trim() ||
        row.customerName
          .toLowerCase()
          .includes(applied.customerName.trim().toLowerCase())

      const phoneOk =
        !applied.customerPhone.trim() ||
        row.customerPhone.includes(applied.customerPhone.trim())

      const kotIdOk =
        !applied.kotId.trim() ||
        String(row.kotId).includes(applied.kotId.trim())

      return dateOk && typeOk && statusOk && nameOk && phoneOk && kotIdOk
    })
  }, [applied, ignoreDateFilter, rows, searched])

  function handleSaveKot(updated: KotRow) {
    setRows((prev) =>
      prev.map((row) => (row.id === updated.id ? updated : row)),
    )
  }

  const totalRecords = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function flash(setter: (v: boolean) => void) {
    setter(true)
    window.setTimeout(() => setter(false), 400)
  }

  function handleSearch() {
    setApplied({ ...draft })
    setIgnoreDateFilter(false)
    setSearched(true)
    setPage(1)
    flash(setSearchFlash)
  }

  function handleShowAll() {
    const next = createDefaultFilters()
    setDraft(next)
    setApplied(next)
    setIgnoreDateFilter(true)
    setSearched(true)
    setPage(1)
    setMoreFilters(false)
    flash(setShowAllFlash)
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem="kot"
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

      <ViewKotModal
        open={Boolean(viewKot)}
        kot={viewKot}
        onClose={() => setViewKot(null)}
      />
      <KotOrderDetailsDrawer
        open={Boolean(detailsKot)}
        kot={detailsKot}
        onClose={() => setDetailsKot(null)}
      />
      <EditKotModal
        open={Boolean(editKot)}
        kot={editKot}
        onClose={() => setEditKot(null)}
        onSave={handleSaveKot}
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-bold text-ink sm:text-xl">KOT</h1>
            <ExportExcelMenu />
          </div>

          <div className="mb-4 space-y-2 rounded-xl border border-line bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-end gap-2">
              <DateTimeField
                label="Start Date"
                value={draft.startDate}
                onChange={(startDate) =>
                  setDraft((prev) => ({ ...prev, startDate }))
                }
                defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
              />
              <DateTimeField
                label="End Date"
                value={draft.endDate}
                onChange={(endDate) =>
                  setDraft((prev) => ({ ...prev, endDate }))
                }
                defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
              />
              <FilterSelect
                label="All Order Type"
                value={draft.orderType}
                onChange={(orderType) =>
                  setDraft((prev) => ({ ...prev, orderType }))
                }
                options={ORDER_TYPE_OPTIONS}
                className="min-w-[150px] flex-none"
              />

              {moreFilters ? (
                <label className="min-w-[140px] flex-1 text-xs text-muted">
                  KOT ID
                  <input
                    value={draft.kotId}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, kotId: e.target.value }))
                    }
                    placeholder="Search KOT ID"
                    className={filterInputClass()}
                  />
                </label>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMoreFilters(true)}
                    className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-page"
                  >
                    More Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className={`h-9 rounded-lg border border-primary px-4 text-sm font-semibold transition-colors ${
                      searchFlash
                        ? 'bg-primary text-white'
                        : 'bg-white text-primary hover:bg-primary/5'
                    }`}
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleShowAll}
                    className={`h-9 rounded-lg border border-primary px-4 text-sm font-semibold transition-colors ${
                      showAllFlash
                        ? 'bg-primary text-white'
                        : 'bg-white text-primary hover:bg-primary/5'
                    }`}
                  >
                    Show All
                  </button>
                </>
              )}
            </div>

            {moreFilters && (
              <>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="min-w-[140px] flex-1 text-xs text-muted">
                    Customer Name
                    <input
                      value={draft.customerName}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      placeholder="Customer name"
                      className={filterInputClass()}
                    />
                  </label>
                  <label className="min-w-[140px] flex-1 text-xs text-muted">
                    Customer Phone
                    <input
                      value={draft.customerPhone}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }))
                      }
                      placeholder="Phone number"
                      className={filterInputClass()}
                    />
                  </label>
                  <FilterSelect
                    label="Status"
                    value={draft.status}
                    onChange={(status) =>
                      setDraft((prev) => ({ ...prev, status }))
                    }
                    options={STATUS_OPTIONS}
                    className="min-w-[150px] flex-none"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMoreFilters(false)}
                    className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-page"
                  >
                    Less Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className={`h-9 rounded-lg border border-primary px-4 text-sm font-semibold transition-colors ${
                      searchFlash
                        ? 'bg-primary text-white'
                        : 'bg-white text-primary hover:bg-primary/5'
                    }`}
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleShowAll}
                    className={`h-9 rounded-lg border border-primary px-4 text-sm font-semibold transition-colors ${
                      showAllFlash
                        ? 'bg-primary text-white'
                        : 'bg-white text-primary hover:bg-primary/5'
                    }`}
                  >
                    Show All
                  </button>
                </div>
              </>
            )}
          </div>

          {totalRecords > 0 ? (
            <>
              <KotTable
                rows={pageRows}
                onEdit={setEditKot}
                onView={setViewKot}
                onDetails={setDetailsKot}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                <div className="space-y-2">
                  <p>
                    Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                    {Math.min(page * PAGE_SIZE, totalRecords)} of{' '}
                    {formatNumber(totalRecords)} records.
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-ink">
                    <span className="inline-flex size-3.5 items-center justify-center rounded-sm bg-primary/15 text-primary">
                      <PencilLine size={10} />
                    </span>
                    Modified KOT
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`flex size-8 items-center justify-center rounded-lg border text-sm font-medium ${
                          page === n
                            ? 'border-primary bg-primary text-white'
                            : 'border-line bg-white text-ink hover:bg-page'
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 rounded-lg border border-line px-3 font-medium text-ink disabled:opacity-40"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(totalPages)}
                    className="h-8 rounded-lg border border-line px-3 font-medium text-ink disabled:opacity-40"
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-line bg-white px-6 py-16 text-center">
              <p className="text-base font-semibold text-ink">No Results Found</p>
              <p className="mt-1 text-sm text-muted">
                We couldn&apos;t find a match for your search. Try adjusting
                dates or click Show All.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
