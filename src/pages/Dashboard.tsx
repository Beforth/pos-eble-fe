import { useState, type ReactNode } from 'react'
import { Armchair, Bike, Package } from 'lucide-react'
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
import {
  channelSeries,
  chartStatus,
  expenses,
  leakage,
  lowItems,
  onlineOrders,
  orderTypeSummaries,
  quickHelp,
  salesStats,
  syncStatus,
  topItems,
} from '../mocks/dashboardData'
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

  const handleRangeSelect = (next: string) => {
    if (next !== 'custom') setCustomLabel(undefined)
    setRange(next)
  }

  const handleCustomRange = (from: string, to: string) => {
    setCustomLabel(formatCustomRangeLabel(from, to))
    setRange('custom')
  }

  return {
    options: dateOptions,
    value: range,
    onSelect: handleRangeSelect,
    customLabel,
    onCustomRange: handleCustomRange,
  }
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
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  const salesDatePicker = useDatePickerState('today')
  const onlineOrdersDatePicker = useDatePickerState('today')
  const leakageDatePicker = useDatePickerState('today')
  const itemPerfDatePicker = useDatePickerState('today')
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
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
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
          onRefresh={() => salesDatePicker.onSelect(salesDatePicker.value)}
        >
          {/*
            PetPooja-style grid:
            left (8) — sales + chart, order types, online orders
            right (4) — leakage, item performance, expenses, quick help
          */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                <SalesStatCard stats={salesStats} />
                <SalesChartCard
                  series={channelSeries}
                  status={chartStatus}
                  totalOrders={salesStats.totalOrders}
                  className="lg:col-span-2"
                  {...salesDatePicker}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {orderTypeSummaries.map((summary) => {
                  const meta = orderTypeIcons[summary.key]
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

              <OnlineOrdersPanel data={onlineOrders} {...onlineOrdersDatePicker} />
            </div>

            <div className="space-y-4 xl:col-span-4">
              <LeakagePanel data={leakage} {...leakageDatePicker} />
              <ItemPerformancePanel
                top={topItems}
                low={lowItems}
                {...itemPerfDatePicker}
              />
              <ExpensesPanel data={expenses} {...expensesDatePicker} />
              <QuickHelpPanel data={quickHelp} />
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  )
}
