import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  Globe2,
  HandCoins,
  HelpCircle,
  IdCard,
  Languages,
  Mail,
  Monitor,
  Phone,
  Receipt,
  RefreshCw,
  Sun,
  Table2,
  Tv,
  Users,
  Wallet,
  WalletCards,
} from 'lucide-react'
import { BillingHeader } from '../components/billing/BillingHeader'
import { brand } from '../theme/brand'

interface ConfigTile {
  id: string
  label: string
  icon: ReactNode
  shortcut?: string
  to?: string
}

const CONFIG_TILES: ConfigTile[] = [
  {
    id: 'orders',
    label: 'Orders',
    icon: <FileText size={28} strokeWidth={1.5} />,
    shortcut: 'Ctrl+O',
    to: '/configuration/orders',
  },
  {
    id: 'online-orders',
    label: 'Online Orders',
    icon: <Monitor size={28} strokeWidth={1.5} />,
    to: '/online-orders',
  },
  {
    id: 'kots',
    label: 'KOTs',
    icon: <Receipt size={28} strokeWidth={1.5} />,
    to: '/kot',
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: <Users size={28} strokeWidth={1.5} />,
    to: '/configuration/customers',
  },
  {
    id: 'customer-display',
    label: 'Customer Display',
    icon: <Tv size={28} strokeWidth={1.5} />,
    to: '/customer-display',
  },
  {
    id: 'cash-flow',
    label: 'Cash Flow',
    icon: <Banknote size={28} strokeWidth={1.5} />,
  },
  {
    id: 'expense',
    label: 'Expense',
    icon: <Wallet size={28} strokeWidth={1.5} />,
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal',
    icon: <CreditCard size={28} strokeWidth={1.5} />,
  },
  {
    id: 'cash-top-up',
    label: 'Cash Top-Up',
    icon: <HandCoins size={28} strokeWidth={1.5} />,
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <ClipboardList size={28} strokeWidth={1.5} />,
  },
  {
    id: 'notification',
    label: 'Notification',
    icon: <Bell size={28} strokeWidth={1.5} />,
  },
  {
    id: 'table',
    label: 'Table',
    icon: <Table2 size={28} strokeWidth={1.5} />,
    to: '/menu/tables',
  },
  {
    id: 'virtual-wallet',
    label: 'Virtual Wallet',
    icon: <WalletCards size={28} strokeWidth={1.5} />,
  },
  {
    id: 'manual-sync',
    label: 'Manual Sync',
    icon: <RefreshCw size={28} strokeWidth={1.5} />,
  },
  {
    id: 'help',
    label: 'Help',
    icon: <HelpCircle size={28} strokeWidth={1.5} />,
  },
  {
    id: 'due-payment',
    label: 'Due Payment',
    icon: <HandCoins size={28} strokeWidth={1.5} />,
    to: '/due-payments',
  },
  {
    id: 'language-profiles',
    label: 'Language Profiles',
    icon: <Languages size={28} strokeWidth={1.5} />,
  },
  {
    id: 'billing-user-profile',
    label: 'Billing User Profile',
    icon: <IdCard size={28} strokeWidth={1.5} />,
  },
  {
    id: 'currency-conversion',
    label: 'Currency Conversion',
    icon: <Globe2 size={28} strokeWidth={1.5} />,
  },
  {
    id: 'table-reservation',
    label: 'Table Reservation',
    icon: <Table2 size={28} strokeWidth={1.5} />,
  },
  {
    id: 'day-end',
    label: 'Day End',
    icon: <Sun size={28} strokeWidth={1.5} />,
    to: '/day-end',
  },
  {
    id: 'day-end-history',
    label: 'Day End History',
    icon: <ClipboardList size={28} strokeWidth={1.5} />,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: <Mail size={28} strokeWidth={1.5} />,
  },
]

export default function Configuration() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [activeId, setActiveId] = useState('orders')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleTileClick(tile: ConfigTile) {
    setActiveId(tile.id)
    if (tile.to) {
      navigate(tile.to)
      return
    }
    showToast(`${tile.label} — coming soon`)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => navigate('/table-view')}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-5">
        <div>
          <h1 className="text-lg font-semibold text-ink">Configuration</h1>
          <p className="mt-0.5 text-xs text-muted">Version: {brand.appVersion}</p>
        </div>
        <div className="text-center text-sm text-ink">
          <p className="font-medium">Main Server</p>
          <p className="text-muted">Master Billing Station</p>
        </div>
        <div className="flex flex-col items-start gap-1 text-sm text-ink sm:items-end">
          <a
            href="tel:9099912483"
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            <Phone size={14} className="text-muted" />
            9099912483
          </a>
          <a
            href="mailto:support@pos-eble.com"
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            <Mail size={14} className="text-muted" />
            support@pos-eble.com
          </a>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {CONFIG_TILES.map((tile) => {
            const active = tile.id === activeId
            return (
              <button
                key={tile.id}
                type="button"
                title={tile.shortcut ? `${tile.label} (${tile.shortcut})` : tile.label}
                onClick={() => handleTileClick(tile)}
                className={`group relative flex aspect-square flex-col items-center justify-center gap-2 rounded-md border px-2 py-3 text-center transition ${
                  active
                    ? 'border-primary/30 bg-primary/5 text-primary'
                    : 'border-transparent bg-[#f3f3f3] text-ink hover:bg-[#ececec]'
                }`}
              >
                {tile.shortcut ? (
                  <span className="pointer-events-none absolute left-1/2 top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                    {tile.shortcut}
                  </span>
                ) : null}
                <span className={active ? 'text-primary' : 'text-[#555]'}>
                  {tile.icon}
                </span>
                <span
                  className={`text-xs font-medium leading-tight ${
                    active ? 'text-primary' : 'text-ink'
                  }`}
                >
                  {tile.label}
                </span>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
