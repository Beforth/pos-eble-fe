import { useState, type ReactNode } from 'react'
import { useChrome } from '../state/ChromeContext'
import { Armchair, Bike, Package, AlertTriangle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import type { OrderTypeKey } from '../types'
import { ExpensesPanel } from '../components/dashboard/ExpensesPanel'
import { ItemPerformancePanel } from '../components/dashboard/ItemPerformancePanel'
import { LeakagePanel } from '../components/dashboard/LeakagePanel'
import { OnlineOrdersPanel } from '../components/dashboard/OnlineOrdersPanel'
import { OrderTypeCard } from '../components/dashboard/OrderTypeCard'
import { QuickHelpPanel } from '../components/dashboard/QuickHelpPanel'
import { SalesChartCard } from '../components/dashboard/SalesChartCard'
import { SalesStatCard } from '../components/dashboard/SalesStatCard'
import { ActionCenterButton, ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { PageContainer } from '../components/layout/PageContainer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import type { DateRangeOption } from '../components/common/DatePickerPill'
import { expenses, onlineOrders, syncStatus } from '../mocks/dashboardData'
import {
  getDashboardItemPerformanceApi,
  getDashboardLeakageApi,
  getDashboardOrderTypesApi,
  getDashboardQuickHelpApi,
  getDashboardSalesChartApi,
  getDashboardTotalSalesApi,
} from '../services/dashboardService'
import { useDashboardMetric } from '../state/useDashboardMetric'
import { brand } from '../theme/brand'
import { formatDayMonth, parseInputDate } from '../utils/format'

const dateOptions: DateRangeOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
]

function formatCustomRangeLabel(from: string, to: string): string {
  return `${formatDayMonth(parseInputDate(from))} – ${formatDayMonth(parseInputDate(to))}`
}

function useDatePickerState(initial = 'today') {
  const [range, setRange] = useState(initial)
  const [customLabel, setCustomLabel] = useState<string | undefined>()
  const [customFrom, setCustomFrom] = useState<string | undefined>()
  const [customTo, setCustomTo] = useState<string | undefined>()

  const handleRangeSelect = (next: string) => {
    if (next !== 'custom') setCustomLabel(undefined)
    setRange(next)
  }

  const handleCustomRange = (from: string, to: string) => {
    setCustomLabel(formatCustomRangeLabel(from, to))
    setCustomFrom(from)
    setCustomTo(to)
    setRange('custom')
  }

  return {
    options: dateOptions,
    value: range,
    onSelect: handleRangeSelect,
    customLabel,
    onCustomRange: handleCustomRange,
    customFrom,
    customTo,
  }
}

type DatePickerState = ReturnType<typeof useDatePickerState>

/**
 * Fetch one dashboard metric and render its panel. Owns the panel's date
 * picker state unless ``range`` is passed in; shows a skeleton while loading
 * and an error + retry when the call fails. ``className`` is applied to the
 * placeholders so they occupy the same grid cell as the real panel.
 */
function DashboardPanel<T>({
  fetcher,
  render,
  label,
  range: externalRange,
  refreshKey,
  className = '',
}: {
  fetcher: (outletId: string, from?: string, to?: string) => Promise<T>
  render: (data: T, range: DatePickerState) => ReactNode
  label: string
  range?: DatePickerState
  refreshKey?: unknown
  className?: string
}) {
  const { encryptedOutletId } = useAuth()
  const internalRange = useDatePickerState('today')
  const range = externalRange ?? internalRange
  const { data, loading, error, refetch } = useDashboardMetric(
    encryptedOutletId,
    fetcher,
    range,
    refreshKey,
  )

  if (loading && !data) {
    return (
      <section
        aria-label={`${label} loading`}
        className={`animate-pulse space-y-3 rounded-xl border border-line bg-card p-4 ${className}`}
      >
        <div className="h-4 w-1/3 rounded bg-page" />
        <div className="h-4 w-2/3 rounded bg-page" />
        <div className="h-4 w-1/2 rounded bg-page" />
      </section>
    )
  }

  if (error && !data) {
    return (
      <section
        className={`flex flex-col items-center gap-2 rounded-xl border border-line bg-card p-4 text-center ${className}`}
      >
        <AlertTriangle size={20} className="text-danger" />
        <p className="text-xs text-danger">
          {label}: {error}
        </p>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex h-8 cursor-pointer items-center rounded-md border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page"
        >
          Retry
        </button>
      </section>
    )
  }

  if (!data) return null
  return <>{render(data, range)}</>
}

type IconTone = 'primary' | 'accent' | 'success'

const orderTypeIcons: Record<
  OrderTypeKey,
  { icon: ReactNode; tone: IconTone }
> = {
  dineIn: { icon: <Armchair size={18} />, tone: 'primary' },
  delivery: { icon: <Package size={18} />, tone: 'success' },
  parcel: { icon: <Bike size={18} />, tone: 'accent' },
}

export default function Dashboard() {
  const { collapsed, toggleCollapsed } = useChrome()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const salesDatePicker = useDatePickerState('today')
  const onlineOrdersDatePicker = useDatePickerState('today')
  const expensesDatePicker = useDatePickerState('today')

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem="dashboard"
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

        <PageContainer
          title="Sales Statistics"
          actions={
            <ActionCenterButton
              count={2}
              onClick={() => {
                closeOtherDrawers()
                setActionCenterOpen(true)
              }}
            />
          }
          syncStatus={[
            { label: 'POS', minutesAgo: syncStatus.posSyncedMinutesAgo },
            { label: 'Orders', minutesAgo: syncStatus.ordersSyncedMinutesAgo },
          ]}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        >
          {/*
            PetPooja-style grid:
            left (8) — sales + chart, order types, online orders
            right (4) — leakage, item performance, expenses, quick help
          */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                <DashboardPanel
                  fetcher={getDashboardTotalSalesApi}
                  label="Total Sales"
                  range={salesDatePicker}
                  refreshKey={refreshKey}
                  render={(stats) => <SalesStatCard stats={stats} />}
                />
                <DashboardPanel
                  fetcher={getDashboardSalesChartApi}
                  label="Sales"
                  range={salesDatePicker}
                  refreshKey={refreshKey}
                  className="lg:col-span-2"
                  render={({ series, status, totalOrders }, range) => (
                    <SalesChartCard
                      series={series}
                      status={status}
                      totalOrders={totalOrders}
                      className="lg:col-span-2"
                      {...range}
                    />
                  )}
                />
              </div>

              <DashboardPanel
                fetcher={getDashboardOrderTypesApi}
                label="Order Types"
                range={salesDatePicker}
                refreshKey={refreshKey}
                render={(rows) => (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {rows.map((summary) => {
                      const meta = orderTypeIcons[summary.key as OrderTypeKey]
                      if (!meta) return null
                      return (
                        <OrderTypeCard
                          key={summary.key}
                          summary={summary}
                          icon={meta.icon}
                          iconTone={meta.tone}
                        />
                      )
                    })}
                  </div>
                )}
              />

              {/* Online Orders: no backend source yet - mock data. */}
              <OnlineOrdersPanel data={onlineOrders} {...onlineOrdersDatePicker} />
            </div>

            <div className="space-y-4 xl:col-span-4">
              <DashboardPanel
                fetcher={getDashboardLeakageApi}
                label="Leakage"
                refreshKey={refreshKey}
                render={(data, range) => <LeakagePanel data={data} {...range} />}
              />
              <DashboardPanel
                fetcher={getDashboardItemPerformanceApi}
                label="Item Performance"
                refreshKey={refreshKey}
                render={({ top, low }, range) => (
                  <ItemPerformancePanel top={top} low={low} {...range} />
                )}
              />
              {/* Expenses: no backend model yet - mock data. */}
              <ExpensesPanel data={expenses} {...expensesDatePicker} />
              <DashboardPanel
                fetcher={getDashboardQuickHelpApi}
                label="Quick Help"
                refreshKey={refreshKey}
                render={(data) => <QuickHelpPanel data={data} />}
              />
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  )
}
