import { useMemo, useState } from 'react'
import { Download, FileText, Search } from 'lucide-react'
import { FinancePageShell } from '../../components/layout/FinancePageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import {
  FINANCE_TRANSACTIONS,
  TRANSACTION_TOTALS,
  type FinanceTransaction,
  type TransactionTab,
} from '../../mocks/financeTransactionsData'
import { formatNumber } from '../../utils/format'

const PAGE_SIZE = 10

const MAIN_TABS: { id: TransactionTab; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'cash', label: 'Cash' },
  { id: 'card-upi', label: 'Card/UPI' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'online', label: 'Online/Others' },
]

const CARD_SUB_TABS = [
  { id: 'edc', label: 'EDC Payments' },
  { id: 'qr', label: 'QR Payments' },
  { id: 'non-integrated', label: 'Non-integrated' },
] as const

const ONLINE_SUB_TABS = [
  { id: 'online', label: 'Online' },
  { id: 'others', label: 'Others' },
] as const

function matchesTab(row: FinanceTransaction, tab: TransactionTab, onlineSub: string) {
  if (tab === 'all') return true
  if (tab === 'cash') return row.paymentType === 'Cash'
  if (tab === 'card-upi') return false
  if (tab === 'wallet') return false
  if (tab === 'online') {
    if (onlineSub === 'online') return row.paymentType === 'Online'
    return row.paymentType.startsWith('Other')
  }
  return true
}

export default function FinanceTransactions() {
  const [tab, setTab] = useState<TransactionTab>('all')
  const [cardSub, setCardSub] =
    useState<(typeof CARD_SUB_TABS)[number]['id']>('edc')
  const [onlineSub, setOnlineSub] =
    useState<(typeof ONLINE_SUB_TABS)[number]['id']>('online')
  const [fromDate, setFromDate] = useState('2026-07-28')
  const [toDate, setToDate] = useState('2026-08-12')
  const [billStatus, setBillStatus] = useState('Success')
  const [orderType, setOrderType] = useState('All')
  const [subOrderType, setSubOrderType] = useState('All')
  const [paymentType, setPaymentType] = useState('All')
  const [billNo, setBillNo] = useState('')
  const [appliedBillNo, setAppliedBillNo] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('Success')
  const [appliedOrderType, setAppliedOrderType] = useState('All')
  const [appliedSubOrderType, setAppliedSubOrderType] = useState('All')
  const [appliedPaymentType, setAppliedPaymentType] = useState('All')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const showClassicFilters = tab === 'all' || tab === 'cash'
  const showSearchBar = tab === 'card-upi' || tab === 'wallet' || tab === 'online'

  const filtered = useMemo(() => {
    return FINANCE_TRANSACTIONS.filter((row) => {
      if (!matchesTab(row, tab, onlineSub)) return false
      if (
        appliedStatus !== 'All' &&
        row.status.toLowerCase() !== appliedStatus.toLowerCase()
      ) {
        return false
      }
      if (appliedOrderType !== 'All' && row.orderType !== appliedOrderType) {
        return false
      }
      if (
        appliedSubOrderType !== 'All' &&
        row.subOrderType !== appliedSubOrderType
      ) {
        return false
      }
      if (
        appliedPaymentType !== 'All' &&
        row.paymentType !== appliedPaymentType
      ) {
        return false
      }
      if (
        appliedBillNo &&
        !row.billNo.toLowerCase().includes(appliedBillNo.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [
    tab,
    onlineSub,
    appliedStatus,
    appliedOrderType,
    appliedSubOrderType,
    appliedPaymentType,
    appliedBillNo,
  ])

  const displayTotal =
    tab === 'card-upi' || tab === 'wallet'
      ? 0
      : Math.max(TRANSACTION_TOTALS[tab], filtered.length)

  const rowsForTable =
    tab === 'card-upi' || tab === 'wallet' ? [] : filtered

  const totalPages = Math.max(1, Math.ceil(rowsForTable.length / PAGE_SIZE) || 1)
  const currentPage = Math.min(page, totalPages)
  const pageRows = rowsForTable.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setAppliedBillNo(billNo.trim())
    setAppliedStatus(billStatus)
    setAppliedOrderType(orderType)
    setAppliedSubOrderType(subOrderType)
    setAppliedPaymentType(paymentType)
    setPage(1)
  }

  function handleClear() {
    setFromDate('2026-07-28')
    setToDate('2026-08-12')
    setBillStatus(tab === 'all' ? 'Success' : 'All')
    setOrderType('All')
    setSubOrderType('All')
    setPaymentType('All')
    setBillNo('')
    setAppliedBillNo('')
    setAppliedStatus(tab === 'all' ? 'Success' : 'All')
    setAppliedOrderType('All')
    setAppliedSubOrderType('All')
    setAppliedPaymentType('All')
    setPage(1)
  }

  function changeTab(next: TransactionTab) {
    setTab(next)
    setPage(1)
    setBillStatus(next === 'all' ? 'Success' : 'All')
    setAppliedStatus(next === 'all' ? 'Success' : 'All')
    if (next === 'online') setOnlineSub('online')
    if (next === 'card-upi') setCardSub('edc')
  }

  return (
    <FinancePageShell activeItem="transactions">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-line">
        <div className="flex flex-wrap gap-1">
          {MAIN_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === item.id
                  ? 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => showToast('Download started')}
          className="mb-2 inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <Download size={15} />
          Download
        </button>
      </div>

      {tab === 'card-upi' ? (
        <div className="mb-3 flex flex-wrap gap-1 border-b border-line">
          {CARD_SUB_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCardSub(item.id)}
              className={`relative px-3 py-2 text-sm font-medium ${
                cardSub === item.id
                  ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {tab === 'online' ? (
        <div className="mb-3 flex flex-wrap gap-1 border-b border-line">
          {ONLINE_SUB_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setOnlineSub(item.id)
                setPage(1)
              }}
              className={`relative px-3 py-2 text-sm font-medium ${
                onlineSub === item.id
                  ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {showClassicFilters ? (
        <div className="mb-4 rounded-xl border border-line bg-page/60 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <FilterSelect
              label="Bill Status"
              value={billStatus}
              options={['All', 'Success', 'Failed', 'Cancelled']}
              onChange={setBillStatus}
            />
            <FilterSelect
              label="Order Type"
              value={orderType}
              options={['All', 'Delivery', 'Take Away', 'Dine In']}
              onChange={setOrderType}
            />
            <FilterSelect
              label="Sub Order Type"
              value={subOrderType}
              options={[
                'All',
                'Home Delivery',
                'Parcel',
                'Swiggy',
                'Zomato',
              ]}
              onChange={setSubOrderType}
            />
            {tab === 'all' ? (
              <FilterSelect
                label="Payment Type"
                value={paymentType}
                options={['All', 'Cash', 'Other (UPI)', 'Online']}
                onChange={setPaymentType}
              />
            ) : null}
            <div className="min-w-[160px] flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Bill Number
              </label>
              <input
                type="text"
                value={billNo}
                onChange={(event) => setBillNo(event.target.value)}
                placeholder="Enter Bill No"
                className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
            <OutlineButton variant="gray" onClick={handleClear}>
              Clear
            </OutlineButton>
          </div>
        </div>
      ) : null}

      {showSearchBar ? (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="flex h-11 w-full items-center gap-2 rounded-xl border border-line bg-card px-3 text-left text-sm text-muted hover:bg-page"
          >
            <Search size={16} />
            <span className="flex-1">Search and filters</span>
            <span className="text-xs">{filtersOpen ? 'Hide' : 'Show'}</span>
          </button>
          {filtersOpen ? (
            <div className="mt-2 rounded-xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[180px] flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-ink">
                    Bill Number
                  </label>
                  <input
                    type="text"
                    value={billNo}
                    onChange={(event) => setBillNo(event.target.value)}
                    placeholder="Enter Bill No"
                    className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
                <OutlineButton variant="gray" onClick={handleClear}>
                  Clear
                </OutlineButton>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
                {tab === 'card-upi' ? (
                  <>
                    <th className="px-3 py-2.5">Bill No</th>
                    <th className="px-3 py-2.5">Order Date</th>
                    <th className="px-3 py-2.5">Txn Unique ID</th>
                    <th className="px-3 py-2.5">TID</th>
                    <th className="px-3 py-2.5">Service Provider</th>
                    <th className="px-3 py-2.5">Payment Method</th>
                    <th className="px-3 py-2.5">Card Brand</th>
                    <th className="px-3 py-2.5 text-right">Tax (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Discount (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Bill Amount (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Tip (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Provider Charges (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Settled Amount (Rs.)</th>
                    <th className="px-3 py-2.5">Bill Status</th>
                    <th className="px-3 py-2.5">Txn Status</th>
                    <th className="px-3 py-2.5">Txn Modified Date</th>
                  </>
                ) : tab === 'wallet' || tab === 'online' ? (
                  <>
                    <th className="px-3 py-2.5">Bill No</th>
                    <th className="px-3 py-2.5">Order Date</th>
                    <th className="px-3 py-2.5">Order Type</th>
                    <th className="px-3 py-2.5">Sub Order Type</th>
                    <th className="px-3 py-2.5">Payment Type</th>
                    <th className="px-3 py-2.5">Service Provider</th>
                    <th className="px-3 py-2.5 text-right">Tax (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Discount (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Bill Amount (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Tip (Rs.)</th>
                    <th className="px-3 py-2.5">Bill Status</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2.5">Bill No</th>
                    <th className="px-3 py-2.5">Order Type</th>
                    <th className="px-3 py-2.5">Sub Order Type</th>
                    <th className="px-3 py-2.5">Payment Type</th>
                    <th className="px-3 py-2.5 text-right">Tax (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Discount (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Total (Rs.)</th>
                    <th className="px-3 py-2.5 text-right">Tip (Rs.)</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Created On</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={16}
                    className="px-3 py-16 text-center"
                  >
                    <span className="mx-auto mb-3 inline-flex text-muted">
                      <FileText size={48} className="text-muted/45" />
                    </span>
                    <p className="text-sm font-semibold text-ink">
                      No Transaction Data Available
                    </p>
                  </td>
                </tr>
              ) : tab === 'wallet' || tab === 'online' ? (
                pageRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-b-0 ${
                      index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => showToast(`Opening bill ${row.billNo}`)}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.billNo}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      {row.orderDate ?? row.createdOn}
                    </td>
                    <td className="px-3 py-2.5 text-ink">{row.orderType}</td>
                    <td className="px-3 py-2.5 text-ink">{row.subOrderType}</td>
                    <td className="px-3 py-2.5 text-ink">{row.paymentType}</td>
                    <td className="px-3 py-2.5 text-muted">
                      {row.serviceProvider || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-ink">
                      {formatNumber(row.tax)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-ink">
                      {formatNumber(row.discount)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-ink">
                      {formatNumber(row.total)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-ink">
                      {formatNumber(row.tip)}
                    </td>
                    <td className="px-3 py-2.5 text-ink">{row.status}</td>
                  </tr>
                ))
              ) : (
                pageRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-b-0 ${
                      index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => showToast(`Opening bill ${row.billNo}`)}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.billNo}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-ink">{row.orderType}</td>
                    <td className="px-3 py-2.5 text-ink">{row.subOrderType}</td>
                    <td className="px-3 py-2.5 text-ink">{row.paymentType}</td>
                    <td className="px-3 py-2.5 text-right text-ink">
                      {formatNumber(row.tax)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-ink">
                      {formatNumber(row.discount)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-ink">
                      {formatNumber(row.total)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-ink">
                      {formatNumber(row.tip)}
                    </td>
                    <td className="px-3 py-2.5 text-ink">{row.status}</td>
                    <td className="px-3 py-2.5 text-ink">{row.createdOn}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-primary/5 px-4 py-3">
          <p className="text-sm text-ink">
            {rowsForTable.length === 0
              ? 'Showing 0 transactions'
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
                  currentPage * PAGE_SIZE,
                  rowsForTable.length,
                )} of ${displayTotal} transactions`}
          </p>
          {rowsForTable.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              <PagerButton
                label="First"
                disabled={currentPage <= 1}
                onClick={() => setPage(1)}
              />
              <PagerButton
                label="Previous"
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              />
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(
                (n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`flex size-8 items-center justify-center rounded-md border text-sm font-medium ${
                      currentPage === n
                        ? 'border-primary bg-primary text-white'
                        : 'border-line bg-card text-ink hover:bg-page'
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}
              <PagerButton
                label="Next"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              />
              <PagerButton
                label="Last"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(totalPages)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </FinancePageShell>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-[140px]">
      <label className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function PagerButton({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-8 rounded-md border border-line px-2.5 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
    >
      {label}
    </button>
  )
}
