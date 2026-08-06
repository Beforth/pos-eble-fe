import { useMemo, useState } from 'react'
import { PencilLine } from 'lucide-react'
import { ExportExcelMenu } from '../components/all-orders/ExportExcelMenu'
import { DateTimeField } from '../components/common/DateTimeField'
import { KotTable } from '../components/kot/KotTable'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import { kotList } from '../mocks/kotData'
import { brand } from '../theme/brand'
import { formatNumber } from '../utils/format'

const PAGE_SIZE = 15

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

export default function Kot() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  const [startDate, setStartDate] = useState(() => atStartOfDay(new Date()))
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return atStartOfDay(tomorrow)
  })
  const [orderType, setOrderType] = useState('all')
  const [searched, setSearched] = useState(true)
  const [page, setPage] = useState(1)

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  const filtered = useMemo(() => {
    if (!searched) return []
    return kotList.filter((row) => {
      if (orderType === 'all') return true
      return row.orderType.toLowerCase().replace(/\s+/g, '-') === orderType
    })
  }, [orderType, searched])

  const totalRecords = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-page">
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

          <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-line bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <DateTimeField
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
            />
            <DateTimeField
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
            />
            <label className="min-w-[150px] text-xs text-muted">
              All Order Type
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none"
              >
                <option value="all">All Order Type</option>
                <option value="dine-in">Dine In</option>
                <option value="parcel">Parcel</option>
                <option value="delivery">Delivery</option>
                <option value="pick-up">Pick Up</option>
              </select>
            </label>
            <button
              type="button"
              className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-page"
            >
              More Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setSearched(true)
                setPage(1)
              }}
              className="h-9 rounded-lg border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderType('all')
                setSearched(true)
                setPage(1)
              }}
              className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Show All
            </button>
          </div>

          <KotTable rows={pageRows} />

          {totalRecords > 0 ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
              <div className="space-y-2">
                <p>
                  Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                  {Math.min(page * PAGE_SIZE, totalRecords)} of{' '}
                  {formatNumber(totalRecords)} records.
                </p>
                <p className="inline-flex items-center gap-1.5 text-ink">
                  <PencilLine size={13} className="text-primary" />
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
                          : 'border-line bg-card text-ink hover:bg-page'
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
          ) : (
            <div className="mt-4 rounded-xl border border-line bg-card px-6 py-16 text-center">
              <p className="text-base font-semibold text-ink">No Results Found</p>
              <p className="mt-1 text-sm text-muted">
                We couldn&apos;t find a match for your search.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
