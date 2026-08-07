import { useMemo, useState } from 'react'
import {
  BarChart3,
  ChevronDown,
  FileDown,
  FileText,
  Globe,
  PiggyBank,
  Search,
  Split,
} from 'lucide-react'
import { AllOrdersChart } from '../components/all-orders/AllOrdersChart'
import { AllOrdersTable } from '../components/all-orders/AllOrdersTable'
import { ExportExcelMenu } from '../components/all-orders/ExportExcelMenu'
import { FilterSelect } from '../components/all-orders/FilterSelect'
import { OrderDetailsDrawer } from '../components/all-orders/OrderDetailsDrawer'
import { ChangePaymentModal } from '../components/all-orders/ChangePaymentModal'
import { EditOrderModal } from '../components/all-orders/EditOrderModal'
import { KotDetailsModal } from '../components/all-orders/KotDetailsModal'
import { CheckboxMultiSelect } from '../components/all-orders/OrderTypeMultiSelect'
import { DateTimeField } from '../components/common/DateTimeField'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import {
  advanceOrdersChartSeries,
  allOrdersChartSeries,
  allOrdersGrandTotal,
  allOrdersList,
  cumulativeItems,
  type AllOrderRow,
} from '../mocks/allOrdersData'
import { brand } from '../theme/brand'
import { formatDayMonth, formatINR, formatNumber } from '../utils/format'

type OrdersTab = 'order' | 'advance'

const PAGE_SIZE = 10

const ORDER_TYPE_OPTIONS = [
  { value: 'PARCEL', label: 'PARCEL' },
  { value: 'DINE IN', label: 'DINE IN' },
  { value: 'DELIVERY', label: 'DELIVERY' },
  { value: 'PICK UP', label: 'PICK UP' },
]

const SUB_ORDER_TYPE_OPTIONS = [
  { value: 'swiggy', label: 'Swiggy' },
  { value: 'zomato', label: 'Zomato' },
  { value: 'home-website', label: 'Home Website' },
  { value: 'parcel-menu', label: 'Parcel Menu' },
  { value: 'qr-code', label: 'QR Code' },
  { value: 'parcel', label: 'Parcel' },
  { value: 'dine-in', label: 'Dine In' },
  ...ORDER_TYPE_OPTIONS,
]

const PAYMENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'not-paid', label: 'Not Paid' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'due-payment', label: 'Due Payment' },
  { value: 'other', label: 'Other' },
  { value: 'wallet', label: 'Wallet' },
]

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'printed', label: 'Printed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'saved-printed', label: 'Saved + Printed' },
  { value: 'complimentary', label: 'Complimentary' },
  { value: 'sales-return', label: 'Sales Return' },
]

const OTHER_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'discount', label: 'Discount > 0' },
  { value: 'tax', label: 'Tax > 0' },
  { value: 'bill-updated', label: 'Bill Updated' },
  { value: 'bill-reprinted', label: 'Bill Reprinted' },
]

const GSTIN_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'with', label: 'With GSTIN' },
  { value: 'without', label: 'Without GSTIN' },
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

function atEndOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    0,
  )
}

function filterInputClass() {
  return 'mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary'
}

export default function AllOrders() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)
  const [tab, setTab] = useState<OrdersTab>('order')
  const [chartOpen, setChartOpen] = useState(true)
  const [moreFilters, setMoreFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [orderTypes, setOrderTypes] = useState<string[]>([])
  const [orderId, setOrderId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [subOrderTypes, setSubOrderTypes] = useState<string[]>([])
  const [paymentType, setPaymentType] = useState('all')
  const [orderStatus, setOrderStatus] = useState('all')
  const [otherStatus, setOtherStatus] = useState('all')
  const [grandTotalOp, setGrandTotalOp] = useState('=')
  const [grandTotalValue, setGrandTotalValue] = useState('')
  const [gstin, setGstin] = useState('all')
  const [searched, setSearched] = useState(true)
  const [advanceSearched, setAdvanceSearched] = useState(false)
  const [itemGroup, setItemGroup] = useState('addons')
  const [detailsOrder, setDetailsOrder] = useState<AllOrderRow | null>(null)
  const [kotOrder, setKotOrder] = useState<AllOrderRow | null>(null)
  const [editOrder, setEditOrder] = useState<AllOrderRow | null>(null)
  const [paymentOrder, setPaymentOrder] = useState<AllOrderRow | null>(null)
  const [orders, setOrders] = useState(allOrdersList)

  const [startDate, setStartDate] = useState(() => atStartOfDay(new Date()))
  const [endDate, setEndDate] = useState(() => atEndOfDay(new Date()))
  const [advanceDate, setAdvanceDate] = useState(() => atStartOfDay(new Date()))

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  const filteredOrders = useMemo(() => {
    if (!searched) return []
    return orders.filter((row) => {
      const typeOk =
        orderTypes.length === 0 || orderTypes.includes(row.orderType)
      const idOk =
        !orderId.trim() ||
        row.orderNo.includes(orderId.trim()) ||
        row.items.toLowerCase().includes(orderId.trim().toLowerCase())
      const nameOk =
        !customerName.trim() ||
        row.customerName
          .toLowerCase()
          .includes(customerName.trim().toLowerCase())
      const paymentOk =
        paymentType === 'all' ||
        row.payment.toLowerCase().includes(paymentType.toLowerCase())
      const statusOk =
        orderStatus === 'all' ||
        row.status.toLowerCase() === orderStatus.toLowerCase()

      let totalOk = true
      if (grandTotalValue.trim()) {
        const amount = Number(grandTotalValue)
        if (Number.isFinite(amount)) {
          if (grandTotalOp === '=') totalOk = row.grandTotal === amount
          else if (grandTotalOp === '>') totalOk = row.grandTotal > amount
          else if (grandTotalOp === '<') totalOk = row.grandTotal < amount
          else if (grandTotalOp === '>=') totalOk = row.grandTotal >= amount
          else if (grandTotalOp === '<=') totalOk = row.grandTotal <= amount
        }
      }

      return typeOk && idOk && nameOk && paymentOk && statusOk && totalOk
    })
  }, [
    orders,
    orderTypes,
    orderId,
    customerName,
    paymentType,
    orderStatus,
    grandTotalOp,
    grandTotalValue,
    searched,
  ])

  function resetFilters() {
    setOrderTypes([])
    setOrderId('')
    setCustomerName('')
    setCustomerPhone('')
    setSubOrderTypes([])
    setPaymentType('all')
    setOrderStatus('all')
    setOtherStatus('all')
    setGrandTotalOp('=')
    setGrandTotalValue('')
    setGstin('all')
    setSearched(true)
    setPage(1)
  }

  const totalRecords = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const pageRows = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      if (pageRows.every((row) => prev.has(row.id))) {
        const next = new Set(prev)
        pageRows.forEach((row) => next.delete(row.id))
        return next
      }
      const next = new Set(prev)
      pageRows.forEach((row) => next.add(row.id))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem="all-orders"
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
      <OrderDetailsDrawer
        open={detailsOrder !== null}
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
      />
      <KotDetailsModal
        open={kotOrder !== null}
        order={kotOrder}
        onClose={() => setKotOrder(null)}
      />
      <EditOrderModal
        open={editOrder !== null}
        order={editOrder}
        onClose={() => setEditOrder(null)}
      />
      <ChangePaymentModal
        open={paymentOrder !== null}
        order={paymentOrder}
        onClose={() => setPaymentOrder(null)}
        onSave={(orderId, payment) => {
          setOrders((prev) =>
            prev.map((row) =>
              row.id === orderId ? { ...row, payment } : row,
            ),
          )
        }}
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
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <h1 className="text-lg font-bold text-ink sm:text-xl">
                All Orders
              </h1>

              <div className="inline-flex rounded-lg border border-line bg-card p-0.5">
                {(
                  [
                    { value: 'order', label: 'Order' },
                    { value: 'advance', label: 'Advance Order' },
                  ] as const
                ).map((option) => {
                  const active = tab === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTab(option.value)}
                      className={`h-8 rounded-md px-3 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-primary text-white'
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted">
                Grand Total :{' '}
                <span className="font-bold text-ink tabular-nums">
                  {tab === 'order'
                    ? formatINR(allOrdersGrandTotal, 2)
                    : formatINR(0, 2)}
                </span>
              </p>

              {tab === 'order' ? (
                <>
                  <button
                    type="button"
                    aria-expanded={chartOpen}
                    onClick={() => setChartOpen((prev) => !prev)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
                  >
                    <BarChart3 size={14} className="text-primary" />
                    Last 15 Days Orders
                    <ChevronDown
                      size={14}
                      className={`text-muted transition-transform duration-200 ${
                        chartOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink"
                  >
                    Action
                    <ChevronDown size={14} className="text-muted" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    aria-expanded={chartOpen}
                    onClick={() => setChartOpen((prev) => !prev)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
                  >
                    <BarChart3 size={14} className="text-primary" />
                    Last 15 Days Orders
                    <ChevronDown
                      size={14}
                      className={`text-muted transition-transform duration-200 ${
                        chartOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink"
                  >
                    Cumulative Items
                  </button>
                </>
              )}

              <ExportExcelMenu />
            </div>
          </div>

          {/* Chart — toggled by Last 15 Days Orders */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              chartOpen ? 'mb-4 grid-rows-[1fr]' : 'mb-0 grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <AllOrdersChart
                series={
                  tab === 'order'
                    ? allOrdersChartSeries
                    : advanceOrdersChartSeries
                }
              />
            </div>
          </div>

          {tab === 'order' ? (
            <>
              {/* Filters */}
              <div className="mb-4 space-y-2 rounded-xl border border-line bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex flex-wrap items-end gap-2">
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
                    defaultTime={{ hours: 23, minutes: 59, seconds: 59 }}
                  />
                  <CheckboxMultiSelect
                    label="All Order Type"
                    options={ORDER_TYPE_OPTIONS}
                    value={orderTypes}
                    onChange={setOrderTypes}
                  />
                  <label className="min-w-[140px] flex-1 text-xs text-muted">
                    Order ID
                    <input
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className={filterInputClass()}
                    />
                  </label>
                  {moreFilters ? (
                    <label className="min-w-[140px] flex-1 text-xs text-muted">
                      Customer Name
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
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
                        onClick={() => {
                          setSearched(true)
                          setPage(1)
                        }}
                        className="h-9 rounded-lg border border-primary bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
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
                        Customer Phone
                        <input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className={filterInputClass()}
                        />
                      </label>
                      <CheckboxMultiSelect
                        label="Sub Order Type"
                        options={SUB_ORDER_TYPE_OPTIONS}
                        value={subOrderTypes}
                        onChange={setSubOrderTypes}
                      />
                      <FilterSelect
                        label="All Payment Type"
                        value={paymentType}
                        onChange={setPaymentType}
                        options={PAYMENT_TYPE_OPTIONS}
                      />
                      <FilterSelect
                        label="Order Status"
                        value={orderStatus}
                        onChange={setOrderStatus}
                        options={ORDER_STATUS_OPTIONS}
                      />
                      <FilterSelect
                        label="Other Status"
                        value={otherStatus}
                        onChange={setOtherStatus}
                        options={OTHER_STATUS_OPTIONS}
                      />
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                      <div className="min-w-[180px] flex-1">
                        <p className="text-xs text-muted">Grand Total</p>
                        <div className="mt-1 flex h-9 overflow-hidden rounded-lg border border-line">
                          <select
                            value={grandTotalOp}
                            onChange={(e) => setGrandTotalOp(e.target.value)}
                            className="h-full w-14 border-r border-line bg-page px-1.5 text-sm text-ink outline-none"
                          >
                            <option value="=">=</option>
                            <option value=">">{'>'}</option>
                            <option value="<">{'<'}</option>
                            <option value=">=">{'>='}</option>
                            <option value="<=">{'<='}</option>
                          </select>
                          <input
                            value={grandTotalValue}
                            onChange={(e) => setGrandTotalValue(e.target.value)}
                            placeholder="Amount"
                            className="h-full min-w-0 flex-1 bg-card px-2.5 text-sm text-ink outline-none"
                          />
                        </div>
                      </div>
                      <FilterSelect
                        label="GSTIN"
                        value={gstin}
                        onChange={setGstin}
                        options={GSTIN_OPTIONS}
                      />
                      <button
                        type="button"
                        onClick={() => setMoreFilters(false)}
                        className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-page"
                      >
                        Less Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSearched(true)
                          setPage(1)
                        }}
                        className="h-9 rounded-lg border border-primary bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
                      >
                        Show All
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="relative overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="overflow-x-auto pb-14">
                  <AllOrdersTable
                    rows={pageRows}
                    selected={selected}
                    onToggle={toggleRow}
                    onToggleAll={toggleAll}
                    onView={setDetailsOrder}
                    onViewKot={setKotOrder}
                    onEdit={setEditOrder}
                    onChangePayment={setPaymentOrder}
                  />
                </div>

                {totalRecords > 0 && (
                  <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line bg-page/95 px-3 py-2 text-xs text-muted backdrop-blur-sm">
                    <p className="shrink-0 text-ink">
                      Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                      {Math.min(page * PAGE_SIZE, totalRecords)} of{' '}
                      {formatNumber(totalRecords)} records
                    </p>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                          const start = Math.min(
                            Math.max(1, page - 1),
                            Math.max(1, totalPages - 2),
                          )
                          const n = start + i
                          if (n > totalPages) return null
                          const active = page === n
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setPage(n)}
                              className={`flex h-8 min-w-8 items-center justify-center rounded border bg-card px-2.5 text-sm font-medium text-ink ${
                                active
                                  ? 'border-primary'
                                  : 'border-line hover:border-muted'
                              }`}
                            >
                              {n}
                            </button>
                          )
                        },
                      )}
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="flex h-8 items-center justify-center rounded border border-line bg-card px-3 text-sm font-medium text-ink hover:border-muted disabled:opacity-40"
                      >
                        Next
                      </button>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage(totalPages)}
                        className="flex h-8 items-center justify-center rounded border border-line bg-card px-3 text-sm font-medium text-ink hover:border-muted disabled:opacity-40"
                      >
                        Last
                      </button>
                    </div>

                    <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1.5">
                        <PiggyBank size={13} /> Settlement Amount
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText size={13} /> Updated After Save & Print
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Globe size={13} /> Online Order
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="flex size-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-deep">
                          A
                        </span>
                        Advance Order
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Split size={13} /> Split Bill
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Advance filters */}
              <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-line bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <DateTimeField
                  label="Select Date"
                  value={advanceDate}
                  onChange={setAdvanceDate}
                  defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
                  className="max-w-[240px] flex-none"
                />
                <label className="min-w-[200px] text-xs text-muted">
                  Display Item Group On
                  <select
                    value={itemGroup}
                    onChange={(e) => setItemGroup(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none"
                  >
                    <option value="addons">Items with addons</option>
                    <option value="plain">Items without addons</option>
                    <option value="category">By category</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => setAdvanceSearched(true)}
                  className="h-9 rounded-lg border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setAdvanceSearched(false)}
                  className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-page"
                >
                  <FileDown size={14} className="text-primary" />
                  Export
                </button>
              </div>

              {advanceSearched ? (
                <div className="rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="border-b border-line bg-primary/5 px-4 py-2 text-sm text-primary">
                    Cumulative Items : {formatDayMonth(advanceDate)}
                  </div>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                          Item Name
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cumulativeItems.map((item) => (
                        <tr
                          key={item.name}
                          className="border-b border-line last:border-0"
                        >
                          <td className="px-4 py-2.5 text-ink">{item.name}</td>
                          <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
                  <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-page text-muted">
                    <Search size={28} />
                  </span>
                  <p className="text-base font-semibold text-ink">
                    No Results Found
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    We couldn&apos;t find a match for your search.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
