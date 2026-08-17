import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Clock,
  Combine,
  FilePlus2,
  FileSearch,
  Network,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Star,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'

const INVENTORY_REPORT_ROUTES: Record<string, string> = {
  'consumption-summary': '/inventory/other-reports/consumption-summary',
  'opening-closing': '/inventory/other-reports/opening-closing',
  'food-costing': '/inventory/other-reports/food-costing',
  'recipe-costing': '/inventory/other-reports/recipe-costing',
  'material-purchase': '/inventory/other-reports/material-purchase',
  'supplier-payment': '/inventory/other-reports/supplier-payment',
  'material-transfer': '/inventory/other-reports/material-transfer',
  'transfer-payment': '/inventory/other-reports/transfer-payment',
  'purchase-sales-return': '/inventory/other-reports/purchase-sales-return',
  'manual-stock-entry': '/inventory/other-reports/manual-stock-entry',
  'stock-report-timewise': '/inventory/other-reports/stock-report-timewise',
  'sales-transfer-variance': '/inventory/other-reports/sales-transfer-variance',
  'raised-po-variance': '/inventory/other-reports/raised-po-variance',
  'purchase-order-received': '/inventory/other-reports/purchase-order-received',
  'semi-finished-food-costing':
    '/inventory/other-reports/semi-finished-food-costing',
  'payment-ledger': '/inventory/other-reports/payment-ledger',
  'expiry-batchwise': '/inventory/other-reports/expiry-batchwise',
}

type ReportTabId =
  | 'bookmarked'
  | 'purchase-transfer'
  | 'closing-stock'
  | 'purchase-order'
  | 'cost-profit'
  | 'other'

interface ReportItem {
  id: string
  title: string
  description: string
  icon: ReactNode
  iconClassName: string
  tabIds: ReportTabId[]
  bookmarked?: boolean
}

const TABS: { id: ReportTabId; label: string }[] = [
  { id: 'bookmarked', label: 'Bookmarked Reports' },
  { id: 'purchase-transfer', label: 'Purchase And Transfer Movements' },
  { id: 'closing-stock', label: 'Closing Stock Tracking' },
  { id: 'purchase-order', label: 'Purchase Order Monitoring' },
  { id: 'cost-profit', label: 'Cost & Profitability' },
  { id: 'other', label: 'Other Reports' },
]

const TAB_COPY: Record<ReportTabId, { title: string; description: string } | null> =
  {
    bookmarked: {
      title: 'Bookmarked',
      description:
        "This section shows all the reports you've bookmarked for easy and frequent access.",
    },
    'purchase-transfer': null,
    'closing-stock': null,
    'purchase-order': null,
    'cost-profit': null,
    other: null,
  }

const REPORTS: ReportItem[] = [
  {
    id: 'opening-closing',
    title: 'Opening - Closing Report',
    description:
      'Displays opening and closing balances, avg purchase price, and total stock value for each raw material over the selected period.',
    icon: <FileSearch size={18} />,
    iconClassName: 'bg-sky-100 text-sky-600',
    tabIds: ['bookmarked', 'closing-stock'],
    bookmarked: true,
  },
  {
    id: 'food-costing',
    title: 'Food Costing Report',
    description:
      'Cost analysis of each menu item, including raw material cost, sales price, and calculated profit margin percentage.',
    icon: <Combine size={18} />,
    iconClassName: 'bg-violet-100 text-violet-600',
    tabIds: ['bookmarked', 'cost-profit'],
    bookmarked: true,
  },
  {
    id: 'semi-finished-food-costing',
    title: 'Semi-Finished Food Costing Report',
    description:
      'Displays material-wise cost, quantity, production process, and FCR amount for each semi-finished item.',
    icon: <BarChart3 size={18} />,
    iconClassName: 'bg-sky-100 text-sky-600',
    tabIds: ['cost-profit'],
  },
  {
    id: 'recipe-costing',
    title: 'Recipe Costing',
    description:
      'Shows the estimated cost and profit of a menu item before billing, based on recipe ingredients and selected material prices.',
    icon: <Receipt size={18} />,
    iconClassName: 'bg-emerald-100 text-emerald-600',
    tabIds: ['bookmarked', 'cost-profit'],
    bookmarked: true,
  },
  {
    id: 'consumption-summary',
    title: 'Consumption Summary',
    description:
      'Displays raw material consumption details, including usage from bills, wastage, transfers, and capturing all types of consumption.',
    icon: <RefreshCw size={18} />,
    iconClassName: 'bg-amber-100 text-amber-600',
    tabIds: ['bookmarked', 'cost-profit'],
    bookmarked: true,
  },
  {
    id: 'payment-ledger',
    title: 'Payment Ledger Report',
    description:
      'Displays ledger payments, showing amounts to collect from or pay to vendors and customers.',
    icon: <BarChart3 size={18} />,
    iconClassName: 'bg-sky-100 text-sky-600',
    tabIds: ['other'],
  },
  {
    id: 'expiry-batchwise',
    title: 'Expiry And Batchwise Insights',
    description:
      'Batch-wise and expiry details of raw materials, including supplier, inward date, invoice, quantities, status, and days remaining.',
    icon: <Wrench size={18} />,
    iconClassName: 'bg-emerald-100 text-emerald-600',
    tabIds: ['other'],
  },
  {
    id: 'material-purchase',
    title: 'Material Purchase Report',
    description:
      'Displays total purchase value breakdown with average price, taxes, discounts, and net amount for each raw material.',
    icon: <ShoppingCart size={18} />,
    iconClassName: 'bg-sky-100 text-sky-600',
    tabIds: ['purchase-transfer'],
  },
  {
    id: 'supplier-payment',
    title: 'Supplier Payment Report',
    description:
      'Total purchase value breakdown with total payment made and pending amount for each vendor.',
    icon: <Network size={18} />,
    iconClassName: 'bg-emerald-100 text-emerald-600',
    tabIds: ['purchase-transfer'],
  },
  {
    id: 'material-transfer',
    title: 'Material Transfer Report',
    description:
      'Total transferred value with average price, taxes, discounts, and net amount for each raw material.',
    icon: <RefreshCw size={18} />,
    iconClassName: 'bg-amber-100 text-amber-600',
    tabIds: ['purchase-transfer'],
  },
  {
    id: 'transfer-payment',
    title: 'Transfer Payment Report',
    description:
      'Displays total transferred value breakdown with total payment made and pending amount for each location.',
    icon: <ArrowUpFromLine size={18} />,
    iconClassName: 'bg-slate-100 text-slate-600',
    tabIds: ['purchase-transfer'],
  },
  {
    id: 'purchase-sales-return',
    title: 'Purchase-Sales Return',
    description:
      'Summary of all purchase and sales return transactions, total returned qty, avg. price, taxes, disc, and net value for raw material.',
    icon: <ArrowDownToLine size={18} />,
    iconClassName: 'bg-teal-100 text-teal-600',
    tabIds: ['purchase-transfer'],
  },
  {
    id: 'manual-stock-entry',
    title: 'Manual Stock Entry Report',
    description:
      'Displays all manual adjustments with details, including quantity, value, and reason for each raw material.',
    icon: <BarChart3 size={18} />,
    iconClassName: 'bg-emerald-100 text-emerald-600',
    tabIds: ['closing-stock'],
  },
  {
    id: 'stock-report-timewise',
    title: 'Stock Report Timewise',
    description:
      'Displays opening and closing stock of each raw material between any two date and time, along with the difference.',
    icon: <Clock size={18} />,
    iconClassName: 'bg-amber-100 text-amber-600',
    tabIds: ['closing-stock'],
  },
  {
    id: 'sales-transfer-variance',
    title: 'Sales & Transfer Variance Report',
    description:
      'Displays purchase orders raised to you with transferred and purchased quantities, highlighting variance between them.',
    icon: <TrendingUp size={18} />,
    iconClassName: 'bg-sky-100 text-sky-600',
    tabIds: ['purchase-order'],
  },
  {
    id: 'raised-po-variance',
    title: 'Raised PO Variance Report',
    description:
      'PO raised by you with transferred and purchased qty, highlighting the variance between ordered, transferred, and purchased quantities.',
    icon: <FilePlus2 size={18} />,
    iconClassName: 'bg-emerald-100 text-emerald-600',
    tabIds: ['purchase-order'],
  },
  {
    id: 'purchase-order-received',
    title: 'Purchase Order Received Report',
    description:
      'All PO received from other parties with total quantity, value, and current status, providing a consolidated overview for monitoring.',
    icon: <ShoppingCart size={18} />,
    iconClassName: 'bg-amber-100 text-amber-600',
    tabIds: ['purchase-order'],
  },
]

function ReportCard({
  report,
  bookmarked,
  onToggleBookmark,
  onView,
}: {
  report: ReportItem
  bookmarked: boolean
  onToggleBookmark: () => void
  onView: () => void
}) {
  return (
    <article
      onClick={onView}
      className="group flex h-full cursor-pointer flex-col rounded-xl border border-line bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:bg-page/40 hover:shadow-md"
    >
      <div className="mb-3 flex items-start gap-3">
        <span
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${report.iconClassName}`}
        >
          {report.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink group-hover:text-primary">
              {report.title}
            </h3>
            <button
              type="button"
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark()
              }}
              className="shrink-0 rounded p-0.5 text-secondary hover:bg-page"
            >
              <Star
                size={16}
                className={bookmarked ? 'fill-secondary text-secondary' : 'text-muted'}
                strokeWidth={bookmarked ? 0 : 1.75}
              />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {report.description}
          </p>
        </div>
      </div>
      <div className="mt-auto flex justify-end pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView()
          }}
          className="text-sm font-semibold text-primary hover:underline"
        >
          View Report →
        </button>
      </div>
    </article>
  )
}

export default function OtherReports() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ReportTabId>('bookmarked')
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(REPORTS.map((report) => [report.id, Boolean(report.bookmarked)])),
  )
  const [toast, setToast] = useState<string | null>(null)

  const copy = TAB_COPY[activeTab]

  const visibleReports = useMemo(() => {
    if (activeTab === 'bookmarked') {
      return REPORTS.filter((report) => bookmarks[report.id])
    }
    return REPORTS.filter((report) => report.tabIds.includes(activeTab))
  }, [activeTab, bookmarks])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function openReport(report: ReportItem) {
    const route =
      INVENTORY_REPORT_ROUTES[report.id] ||
      `/inventory/other-reports/${report.id}`
    navigate(route)
  }

  function toggleBookmark(id: string) {
    setBookmarks((prev) => {
      const next = !prev[id]
      showToast(next ? 'Report bookmarked' : 'Bookmark removed')
      return { ...prev, [id]: next }
    })
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 overflow-x-auto border-b border-line">
        <div className="flex min-w-max gap-1">
          {TABS.map((tab) => {
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
                {active ? (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {copy ? (
        <div className="mb-4">
          <h1 className="text-lg font-bold text-ink">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted">{copy.description}</p>
        </div>
      ) : null}

      {visibleReports.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-12 text-center">
          <p className="text-base font-semibold text-ink">No reports found</p>
          <p className="mt-1 max-w-md text-sm text-muted">
            {activeTab === 'bookmarked'
              ? 'Bookmark reports from other tabs to see them here.'
              : 'No reports are available in this section yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              bookmarked={Boolean(bookmarks[report.id])}
              onToggleBookmark={() => toggleBookmark(report.id)}
              onView={() => openReport(report)}
            />
          ))}
        </div>
      )}
    </InventoryPageShell>
  )
}
