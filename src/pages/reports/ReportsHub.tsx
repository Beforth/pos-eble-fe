import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  FileText,
  LineChart,
  Network,
  PieChart,
  ReceiptIndianRupee,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { BILLING_REPORTS, BILLING_REPORTS_PATH } from '../../config/billingReports'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

interface ReportCard {
  label: string
  description: string
  icon: ReactNode
  /** Omitted while the report is not built yet. */
  to?: string
}

const ICON_PROPS = { size: 20 }

const REPORTS: ReportCard[] = [
  {
    label: 'Category Summary',
    description: 'Categories sold for the date and time selected.',
    icon: <PieChart {...ICON_PROPS} />,
    to: '/reports/category-summary',
  },
  {
    label: 'Item Summary',
    description: 'Items of the categories sold for the date and time selected.',
    icon: <Network {...ICON_PROPS} />,
    to: '/reports/item-summary',
  },
  {
    label: 'Sales Summary',
    description:
      'Order/Invoice-wise sales report including the tips collected for the invoice.',
    icon: <TrendingUp {...ICON_PROPS} />,
    to: '/reports/sales-summary',
  },
  {
    label: 'Order Report',
    description: 'Order-wise status as well as collection report.',
    icon: <BarChart3 {...ICON_PROPS} />,
    to: '/reports/order-summary',
  },
  {
    label: 'Executive Sales Report',
    description: 'A short breakdown of all your sales and bookings.',
    icon: <LineChart {...ICON_PROPS} />,
    to: '/reports/executive-sales-summary',
  },
  {
    label: 'Employee Summary',
    description:
      'Employee-wise collection as well as a summary report along with waiter/delivery report.',
    icon: <Users {...ICON_PROPS} />,
    to: '/reports/employee-summary',
  },
  {
    label: 'Group Summary',
    description: 'Group wise Item wise sales summary.',
    icon: <Network {...ICON_PROPS} />,
    to: '/reports/group-summary',
  },
  {
    label: 'Variation Summary',
    description: 'Variations sold for the day.',
    icon: <LineChart {...ICON_PROPS} />,
    to: '/reports/variation-summary',
  },
  {
    label: 'Cover size summary',
    description:
      'Provides the number of covers or persons or pax served on the day.',
    icon: <FileText {...ICON_PROPS} />,
    to: '/reports/cover-size-summary',
  },
  {
    label: 'Tip Summary',
    description: 'Employee-wise as well as table-wise tips collected.',
    icon: <ReceiptIndianRupee {...ICON_PROPS} />,
  },
  {
    label: 'Counter Summary',
    description: 'Counterwise collection report.',
    icon: <FileText {...ICON_PROPS} />,
    to: '/reports/counter-summary',
  },
  {
    label: 'Locality Wise Summary',
    description: 'Locality-wise order count as well as total.',
    icon: <Users {...ICON_PROPS} />,
    to: '/reports/other-reports/locality-wise',
  },
  {
    label: 'Captain Wise Summary',
    description: 'Total sales made by each captain.',
    icon: <ReceiptIndianRupee {...ICON_PROPS} />,
  },
  {
    label: 'Settlement Summary',
    description: 'Counterwise billing user-wise order settlement report.',
    icon: <UserRound {...ICON_PROPS} />,
  },
  {
    label: 'NC Item Summary',
    description: 'List of items whose price was changed before billing.',
    icon: <FileText {...ICON_PROPS} />,
  },
  {
    label: 'Assignee Wise Summary',
    description: 'Assignee-wise collection as well as summary report.',
    icon: <Network {...ICON_PROPS} />,
  },
  {
    label: 'Tax Summary',
    description: 'Tax collected on the sales for the date and time selected.',
    icon: <ReceiptIndianRupee {...ICON_PROPS} />,
    to: '/reports/tax-summary',
  },
]

const CARD_CLASS =
  'flex items-start gap-3 rounded-xl border border-line bg-card p-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-primary hover:bg-primary/5'

function cardContent({ label, description, icon }: Omit<ReportCard, 'to'>) {
  return (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      </span>
      <ArrowRight size={16} className="shrink-0 text-primary" />
    </>
  )
}

export default function ReportsHub() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')

  function openReport(card: ReportCard) {
    if (card.to) {
      navigate(card.to)
      return
    }
    showToast(`${card.label} — coming soon`)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-bold text-ink">Reports</h1>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="space-y-6 pb-6">
          <section>
            <h2 className="mb-2 text-sm font-bold text-ink">Reports Screen</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {REPORTS.map((card) => (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => openReport(card)}
                  className={CARD_CLASS}
                >
                  {cardContent(card)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-ink">Live Reports</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {BILLING_REPORTS.map((report) => (
                <button
                  key={report.slug}
                  type="button"
                  onClick={() => navigate(`${BILLING_REPORTS_PATH}/${report.slug}`)}
                  className={CARD_CLASS}
                >
                  {cardContent({
                    label: report.label,
                    description: 'Live data for this outlet.',
                    icon: <BarChart3 {...ICON_PROPS} />,
                  })}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
