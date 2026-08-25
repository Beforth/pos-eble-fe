import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  CloudUpload,
  Info,
  Search,
} from 'lucide-react'
import { DatePickerPill, type DateRangeOption } from '../../components/common/DatePickerPill'
import { AggregatorLogo } from '../../components/common/AggregatorLogo'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { ActionDropdown } from '../../components/menu/MenuActionButtons'
import { formatDayMonth, parseInputDate } from '../../utils/format'

type PlatformId = 'zomato' | 'swiggy'
type ReconTabId =
  | 'missing'
  | 'status-mismatch'
  | 'variance'
  | 'rejected'
  | 'final'

interface ReconRow {
  id: string
  orderId: string
  orderDateTime: string
  missingFrom: string
  orderStatus: string
  subTotal: number
  packingCharge: number
  gstTotal: number
  totalDiscount: number
}

const OUTLET_CODE = '5sbhwvqj'

const PLATFORMS: Array<{ id: PlatformId; name: 'Zomato' | 'Swiggy' }> = [
  { id: 'zomato', name: 'Zomato' },
  { id: 'swiggy', name: 'Swiggy' },
]

const RECON_TABS: Array<{ id: ReconTabId; label: string }> = [
  { id: 'missing', label: 'Missing Orders' },
  { id: 'status-mismatch', label: 'Status Mismatch Orders' },
  { id: 'variance', label: 'Variance Orders' },
  { id: 'rejected', label: 'Rejected/Cancelled Orders' },
  { id: 'final', label: 'Final Reconciliation' },
]

const DATE_OPTIONS: DateRangeOption[] = [
  { value: 'custom-aug', label: '6th Aug to 11th Aug' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
]

const PAYOUT_HISTORY_GROUPS: Array<{
  month: string
  items: Array<{
    id: string
    rangeLabel: string
    bannerFrom: string
    bannerTo: string
  }>
}> = [
  {
    month: 'July 2026',
    items: [
      {
        id: '2026-07-20',
        rangeLabel: '20 - 26',
        bannerFrom: 'July 20, 2026',
        bannerTo: 'July 26, 2026',
      },
      {
        id: '2026-07-13',
        rangeLabel: '13 - 19',
        bannerFrom: 'July 13, 2026',
        bannerTo: 'July 19, 2026',
      },
      {
        id: '2026-07-06',
        rangeLabel: '06 - 12',
        bannerFrom: 'July 06, 2026',
        bannerTo: 'July 12, 2026',
      },
      {
        id: '2026-07-01',
        rangeLabel: '01 - 31',
        bannerFrom: 'July 01, 2026',
        bannerTo: 'July 31, 2026',
      },
    ],
  },
  {
    month: 'June 2026',
    items: [
      {
        id: '2026-06-22',
        rangeLabel: '22 - 28',
        bannerFrom: 'June 22, 2026',
        bannerTo: 'June 28, 2026',
      },
    ],
  },
]

function PayoutUploadHistoryDropdown({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PAYOUT_HISTORY_GROUPS
    return PAYOUT_HISTORY_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          group.month.toLowerCase().includes(q) ||
          item.rangeLabel.toLowerCase().includes(q) ||
          item.bannerFrom.toLowerCase().includes(q) ||
          item.bannerTo.toLowerCase().includes(q),
      ),
    })).filter((group) => group.items.length > 0)
  }, [query])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 min-w-[200px] items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
      >
        Payout Upload History
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-1.5 w-[240px] overflow-hidden rounded-xl border border-line bg-card shadow-lg">
          <div className="border-b border-line p-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-line bg-page px-2.5">
              <Search size={14} className="shrink-0 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filteredGroups.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted">
                No matching periods
              </li>
            ) : (
              filteredGroups.map((group) => (
                <li key={group.month}>
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    {group.month}
                  </p>
                  <ul>
                    {group.items.map((item) => {
                      const selected = item.id === value
                      return (
                        <li key={item.id} role="option" aria-selected={selected}>
                          <button
                            type="button"
                            onClick={() => {
                              onChange(item.id)
                              setOpen(false)
                            }}
                            className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-page ${
                              selected
                                ? 'font-semibold text-ink'
                                : 'text-ink'
                            }`}
                          >
                            <span>{item.rangeLabel}</span>
                            {selected ? (
                              <Check
                                size={15}
                                strokeWidth={2.5}
                                className="shrink-0 text-success"
                              />
                            ) : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

const SAMPLE_MISSING_ROWS: ReconRow[] = [
  {
    id: '1',
    orderId: '8431773227',
    orderDateTime: '2026-08-08 15:35:02',
    missingFrom: 'Zomato',
    orderStatus: 'Delivered',
    subTotal: 238,
    packingCharge: 0,
    gstTotal: 11.34,
    totalDiscount: 0,
  },
  {
    id: '2',
    orderId: '8431028841',
    orderDateTime: '2026-08-07 21:12:44',
    missingFrom: 'Zomato',
    orderStatus: 'Delivered',
    subTotal: 420,
    packingCharge: 15,
    gstTotal: 21.75,
    totalDiscount: 40,
  },
  {
    id: '3',
    orderId: '8429981103',
    orderDateTime: '2026-08-06 13:48:19',
    missingFrom: 'Zomato',
    orderStatus: 'Delivered',
    subTotal: 185,
    packingCharge: 0,
    gstTotal: 9.25,
    totalDiscount: 0,
  },
]

const TAB_INFO: Record<ReconTabId, string> = {
  missing:
    "Displays orders that are missing by comparing Petpooja data with the third-party payout sheet. The 'Missing From' column indicates whether the order is absent in Petpooja or the payout sheet.",
  'status-mismatch':
    'Identifies orders where the status differs between Petpooja and the third-party payout sheet, helping ensure accuracy in reconciliation.',
  variance:
    'Highlights cells where values deviate between Petpooja and the payout sheet, ensuring discrepancies are easily spotted and corrected.',
  rejected:
    'Shows reconciliation details for rejected or canceled orders in the payout sheet, including the order-level payout percentage.',
  final:
    'Provides a complete reconciliation of all orders present in the payout sheet, displaying order-level payout details for a clear financial overview.',
}

function RecordsNotFound() {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <svg
        width="140"
        height="110"
        viewBox="0 0 140 110"
        fill="none"
        aria-hidden
        className="opacity-90"
      >
        <rect
          x="28"
          y="18"
          width="62"
          height="78"
          rx="6"
          fill="#eef2f7"
          stroke="#c5d0de"
        />
        <rect x="38" y="32" width="42" height="6" rx="3" fill="#c5d0de" />
        <rect x="38" y="44" width="34" height="6" rx="3" fill="#d7e0ea" />
        <rect x="38" y="56" width="38" height="6" rx="3" fill="#d7e0ea" />
        <circle cx="96" cy="68" r="22" fill="#dbe7f5" stroke="#7aa2c9" />
        <circle cx="96" cy="68" r="12" stroke="#4b7ea8" strokeWidth="3" />
        <path
          d="M112 84 L124 98"
          stroke="#4b7ea8"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-base font-semibold text-ink">Records Not Found.</p>
    </div>
  )
}

const ALL_COLUMNS = [
  { key: 'orderId', label: 'Order ID', sortable: true },
  { key: 'orderDateTime', label: 'Order (D/T)', sortable: true },
  { key: 'missingFrom', label: 'Missing From', sortable: false },
  { key: 'orderStatus', label: 'Order Status', sortable: false },
  { key: 'subTotal', label: 'Sub Total', sortable: false },
  { key: 'packingCharge', label: 'Packing Charge', sortable: false },
  { key: 'gstTotal', label: 'GST Total', sortable: false },
  { key: 'totalDiscount', label: 'Total Discount', sortable: false },
] as const

type ColumnKey = (typeof ALL_COLUMNS)[number]['key']

function formatNum(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function OnlineOrderReconciliation() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [platform, setPlatform] = useState<PlatformId>('zomato')
  const [activeTab, setActiveTab] = useState<ReconTabId>('missing')
  const [dateRange, setDateRange] = useState('custom-aug')
  const [customLabel, setCustomLabel] = useState('6th Aug to 11th Aug')
  const [payoutPeriodId, setPayoutPeriodId] = useState('2026-07-20')
  const [uploadName, setUploadName] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [finalSearch, setFinalSearch] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    () => new Set(ALL_COLUMNS.map((col) => col.key)),
  )

  const selectedPayout = useMemo(() => {
    for (const group of PAYOUT_HISTORY_GROUPS) {
      const match = group.items.find((item) => item.id === payoutPeriodId)
      if (match) return match
    }
    return PAYOUT_HISTORY_GROUPS[0].items[0]
  }, [payoutPeriodId])

  const rows = useMemo(() => {
    // Only Missing Orders has sample rows for now; other tabs match Petpooja empty states.
    if (activeTab !== 'missing') return []
    if (platform === 'swiggy') {
      return SAMPLE_MISSING_ROWS.map((row) => ({
        ...row,
        missingFrom: 'Swiggy',
        id: `s-${row.id}`,
      }))
    }
    return SAMPLE_MISSING_ROWS
  }, [activeTab, platform])

  const shownColumns = ALL_COLUMNS.filter((col) => visibleColumns.has(col.key))
  const showEmptyState = rows.length === 0
  const showFinalSearch = activeTab === 'final'

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleCustomRange(from: string, to: string) {
    const fromLabel = formatDayMonth(parseInputDate(from))
    const toLabel = formatDayMonth(parseInputDate(to))
    setCustomLabel(`${fromLabel} to ${toLabel}`)
    setDateRange('custom')
  }

  function toggleColumn(key: ColumnKey) {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function cellValue(row: ReconRow, key: ColumnKey): string {
    switch (key) {
      case 'orderId':
        return row.orderId
      case 'orderDateTime':
        return row.orderDateTime
      case 'missingFrom':
        return row.missingFrom
      case 'orderStatus':
        return row.orderStatus
      case 'subTotal':
        return formatNum(row.subTotal)
      case 'packingCharge':
        return formatNum(row.packingCharge)
      case 'gstTotal':
        return formatNum(row.gstTotal)
      case 'totalDiscount':
        return formatNum(row.totalDiscount)
    }
  }

  return (
    <ReportsPageShell
      title="Manage Your All Third Party Online Orders Reconciliation"
      activeItem="acct-online-order-reconciliation"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-2 mb-4 text-xs text-muted">
        Note: You would be able to view and reconcile the data till the previous
        day.
      </p>

      <div className="mb-4 flex flex-wrap gap-3">
        {PLATFORMS.map((item) => {
          const selected = platform === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPlatform(item.id)}
              aria-pressed={selected}
              className={`relative flex min-w-[180px] items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-all ${
                selected
                  ? 'border-primary shadow-[0_0_0_1px_var(--color-primary)]'
                  : 'border-line shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-muted'
              }`}
            >
              {selected ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-white shadow">
                  <Check size={12} strokeWidth={3} />
                </span>
              ) : null}
              <AggregatorLogo name={item.name} />
              <span>
                <span className="block text-sm font-bold text-ink">
                  {item.name}
                </span>
                <span className="block text-xs text-muted">{OUTLET_CODE}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-3 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <DatePickerPill
          options={DATE_OPTIONS}
          value={dateRange}
          onSelect={setDateRange}
          customLabel={customLabel}
          onCustomRange={handleCustomRange}
        />

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              setUploadName(file.name)
              showToast(`Uploaded ${file.name}`)
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <CloudUpload size={16} className="text-primary" />
            Upload
          </button>
          <span className="max-w-[200px] truncate text-xs text-muted">
            {uploadName || 'Please upload a file'}
          </span>
        </div>

        <p className="pb-2 text-sm text-ink">
          Integration Live On:{' '}
          <span className="font-medium">1 Jan 2026 13:05:58</span>
        </p>

        <PayoutUploadHistoryDropdown
          value={payoutPeriodId}
          onChange={(id) => {
            setPayoutPeriodId(id)
            showToast('Payout period selected')
          }}
        />
      </div>

      <div className="mb-3 rounded-lg border border-success/25 bg-success/10 px-4 py-2.5 text-sm text-success">
        Last payout sheet uploaded for the period from{' '}
        {selectedPayout.bannerFrom} to {selectedPayout.bannerTo}.
      </div>

      <div className="mb-3 flex flex-wrap gap-1 border-b border-line">
        {RECON_TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <div
              key={tab.id}
              className={`group relative inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`transition-colors ${
                  active ? 'text-primary' : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
              <span className="relative inline-flex">
                <button
                  type="button"
                  aria-label={`${tab.label} info`}
                  className="inline-flex text-muted hover:text-ink"
                >
                  <Info size={13} aria-hidden />
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-left text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                >
                  {TAB_INFO[tab.id]}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      {showFinalSearch ? (
        <div className="mb-3 flex justify-end">
          <label className="inline-flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-line bg-card px-2.5">
            <Search size={14} className="shrink-0 text-muted" />
            <input
              type="search"
              value={finalSearch}
              onChange={(event) => setFinalSearch(event.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
            <ChevronDown size={14} className="shrink-0 text-muted" />
          </label>
        </div>
      ) : null}

      {showEmptyState ? (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <RecordsNotFound />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Order Mismatch List</h2>
            <div className="flex flex-wrap items-center gap-2">
              <ActionDropdown
                label="Columns"
                options={ALL_COLUMNS.map((col) => ({
                  label: `${visibleColumns.has(col.key) ? '✓ ' : ''}${col.label}`,
                  onClick: () => toggleColumn(col.key),
                }))}
              />
              <ActionDropdown
                label="Action"
                options={[
                  {
                    label: 'Export Excel',
                    onClick: () => showToast('Exporting Excel…'),
                  },
                  {
                    label: 'Mark as Reviewed',
                    onClick: () => showToast('Marked as reviewed'),
                  },
                  {
                    label: 'Refresh',
                    onClick: () => showToast('List refreshed'),
                  },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-line bg-primary/5 text-xs font-semibold text-ink">
                <tr>
                  {shownColumns.map((col) => (
                    <th key={col.key} className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable ? (
                          <ArrowDownUp size={12} className="text-muted" />
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-page/40"
                  >
                    {shownColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-2.5 whitespace-nowrap text-ink"
                      >
                        {cellValue(row, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ReportsPageShell>
  )
}
