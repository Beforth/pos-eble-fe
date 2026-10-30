import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  BadgePercent,
  Banknote,
  BellRing,
  Bike,
  BookOpen,
  Boxes,
  ChefHat,
  CircleHelp,
  CirclePlus,
  ClipboardList,
  Globe,
  HandCoins,
  Languages,
  ListChecks,
  MessageSquareQuote,
  Monitor,
  MonitorSmartphone,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  ScrollText,
  Settings,
  Sun,
  ToggleRight,
  Tv,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { DualScreenDrawer } from '../../components/billing/DualScreenDrawer'
import { useNewOrder } from '../../state/useNewOrder'

interface OperationTile {
  to: string
  label: string
  description: string
  icon: LucideIcon
  /** Opens this settings drawer instead of navigating to `to`. */
  drawer?: 'dual-screen'
}

interface OperationSection {
  title: string
  tiles: OperationTile[]
}

const SECTIONS: OperationSection[] = [
  {
    title: 'Orders & Billing',
    tiles: [
      {
        to: '/billing/all-orders',
        label: 'Orders',
        description: 'Every order taken, with filters and payment status.',
        icon: BookOpen,
      },
      {
        to: '/billing/online-orders',
        label: 'Online Orders',
        description: 'Orders that come in from online channels.',
        icon: Globe,
      },
      {
        to: '/billing/kot',
        label: 'KOTs',
        description: 'Kitchen tickets sent from billing and captain orders.',
        icon: ChefHat,
      },
      {
        to: '/billing/due-payments',
        label: 'Due Payment',
        description: 'Collect what customers still owe.',
        icon: HandCoins,
      },
      {
        to: '/billing',
        label: 'Billing Screen',
        description: 'Take a new order and settle bills.',
        icon: UtensilsCrossed,
      },
      {
        to: '/billing/live-orders',
        label: 'Live View',
        description: 'Every open kitchen ticket as a card, updating live.',
        icon: Monitor,
      },
      {
        to: '/billing/printers',
        label: 'Bill / KOT Print',
        description: 'How bills and kitchen tickets print.',
        icon: Printer,
      },
      {
        to: '/billing/custom-order-status',
        label: 'Custom Order Status',
        description: 'Your own order statuses for the kitchen and delivery flow.',
        icon: ListChecks,
      },
      {
        to: '/billing/delivery-boys',
        label: 'Delivery Boys',
        description: 'Delivery staff and the orders assigned to them.',
        icon: Bike,
      },
      {
        to: '/billing/day-end',
        label: 'Day End',
        description: 'Close the business day and review past closings.',
        icon: Sun,
      },
      {
        to: '/billing/logs',
        label: 'Logs',
        description: 'A trail of who did what at the counter.',
        icon: ScrollText,
      },
    ],
  },
  {
    title: 'Payments & Finance',
    tiles: [
      {
        to: '/billing/cashflow',
        label: 'Cash Flow',
        description: 'Money coming in and going out.',
        icon: Banknote,
      },
      {
        to: '/billing/expenses',
        label: 'Expense',
        description: 'Record and review expenses.',
        icon: Wallet,
      },
      {
        to: '/billing/withdrawals',
        label: 'Withdrawal',
        description: 'Cash taken out of the till.',
        icon: HandCoins,
      },
      {
        to: '/billing/cash-top-up',
        label: 'Cash Top-Up',
        description: 'Add cash to the till.',
        icon: CirclePlus,
      },
      {
        to: '/billing/currency-conversion',
        label: 'Currency Conversion',
        description: 'Convert between currencies at the counter.',
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    title: 'Menu & Inventory',
    tiles: [
      {
        to: '/billing/menu',
        label: 'Menu',
        description: 'Items, categories, variants and add-ons.',
        icon: ClipboardList,
      },
      {
        to: '/billing/menu-on-off',
        label: 'Menu Item On Off',
        description: 'Switch items on or off when they run out.',
        icon: ToggleRight,
      },
      {
        to: '/billing/taxes',
        label: 'Tax',
        description: 'Tax rates and how they print.',
        icon: Receipt,
      },
      {
        to: '/billing/discounts',
        label: 'Discount',
        description: 'Discounts and offers.',
        icon: BadgePercent,
      },
      {
        to: '/configuration/customers',
        label: 'Customers',
        description: 'Customer records and their history.',
        icon: Users,
      },
      {
        to: '/billing/feedback',
        label: 'Feedback',
        description: 'What customers say about their orders.',
        icon: MessageSquareQuote,
      },
      {
        to: '/billing/led-display',
        label: 'LED Display',
        description: 'Show prices and order totals on an LED display.',
        icon: Tv,
      },
      {
        to: '/billing/inventory',
        label: 'Inventory',
        description: 'Stock, purchases, suppliers and recipes.',
        icon: Boxes,
      },
      {
        to: '/customer-display',
        label: 'Dual Screen',
        description: 'The second screen that faces the customer.',
        icon: MonitorSmartphone,
        drawer: 'dual-screen',
      },
    ],
  },
  {
    title: 'System Settings',
    tiles: [
      {
        to: '/billing/biller-profiles',
        label: 'Billing User Profile',
        description: 'Your name, photo and account details.',
        icon: UserRound,
      },
      {
        to: '/billing/manual-sync',
        label: 'Manual Sync',
        description: 'Pull the latest menu and settings now.',
        icon: RefreshCw,
      },
      {
        to: '/billing/alerts',
        label: 'Alerts',
        description: 'Notices and warnings for this outlet.',
        icon: BellRing,
      },
      {
        to: '/billing/shortcuts',
        label: 'Shortcuts',
        description: 'Keyboard shortcuts for the billing screen.',
        icon: CircleHelp,
      },
      {
        to: '/billing/language-profiles',
        label: 'Language Profiles',
        description: 'Choose the language used on bills and screens.',
        icon: Languages,
      },
      {
        to: '/billing/settings',
        label: 'Settings',
        description: 'Outlet, billing, printing and display settings.',
        icon: Settings,
      },
      {
        to: '/management/device-mapping',
        label: 'Connect Captain & Secondary POS',
        description: 'Link captain devices and other billing counters.',
        icon: QrCode,
      },
    ],
  },
]

const TILE_CLASS =
  'flex items-center gap-3 rounded-xl border border-line bg-card p-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-primary hover:bg-primary/5'

function TileLink({
  tile,
  onOpenDrawer,
}: {
  tile: OperationTile
  onOpenDrawer: (drawer: 'dual-screen') => void
}) {
  const Icon = tile.icon
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{tile.label}</span>
        <span className="mt-0.5 block text-xs text-muted">{tile.description}</span>
      </span>
    </>
  )
  const { drawer } = tile
  if (drawer) {
    return (
      <button type="button" onClick={() => onOpenDrawer(drawer)} className={TILE_CLASS}>
        {content}
      </button>
    )
  }
  return (
    <Link to={tile.to} className={TILE_CLASS}>
      {content}
    </Link>
  )
}

/**
 * The Operations page: the day-to-day screens, grouped. Only screens the
 * signed-in user may open are shown.
 */
export default function BillingOperations() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { canAccess } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [dualScreenOpen, setDualScreenOpen] = useState(false)

  const sections = SECTIONS.map((section) => ({
    ...section,
    tiles: section.tiles.filter(({ to }) => canAccess(to)),
  })).filter((section) => section.tiles.length > 0)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <main className="flex min-h-0 flex-1 items-start overflow-y-auto px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 pb-6">
          <div className="mb-4">
            <h1 className="text-lg font-bold text-ink">Operations</h1>
            <p className="mt-0.5 text-sm text-muted">
              Open one of the day-to-day screens.
            </p>
          </div>

          {sections.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-line bg-card px-6 py-12 text-center text-sm text-muted">
              No operations are available for your account.
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="mb-2 text-sm font-bold text-ink">{section.title}</h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {section.tiles.map((tile) => (
                      <TileLink
                        key={tile.to}
                        tile={tile}
                        onOpenDrawer={() => setDualScreenOpen(true)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

      </main>

      <DualScreenDrawer
        open={dualScreenOpen}
        onClose={() => setDualScreenOpen(false)}
      />
    </div>
  )
}
