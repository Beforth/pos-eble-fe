import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Calculator,
  CalendarClock,
  LifeBuoy,
  Monitor,
  QrCode,
  ReceiptText,
  Search,
  Settings,
  Smartphone,
  UserRound,
  Printer,
  X,
} from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

interface SettingCard {
  label: string
  description: string
  icon: ReactNode
  /** Omitted while the screen is not built yet. */
  to?: string
}

interface SettingSection {
  title: string
  cards: SettingCard[]
}

const ICON_PROPS = { size: 20 }

const SECTIONS: SettingSection[] = [
  {
    title: 'Billing Screen',
    cards: [
      {
        label: 'Display',
        description: 'Customise what appears on the billing screen.',
        icon: <Monitor {...ICON_PROPS} />,
        to: '/billing/settings/display',
      },
      {
        label: 'Calculations',
        description: 'Configure service charges and rounding rules.',
        icon: <Calculator {...ICON_PROPS} />,
        to: '/billing/settings/calculations',
      },
      {
        label: 'Linked Services',
        description: 'Set how add-ons services work with your POS system.',
        icon: <LifeBuoy {...ICON_PROPS} />,
        to: '/billing/settings/connected-services',
      },
      {
        label: 'Print',
        description: 'Manage printing rules for Bill and KOT.',
        icon: <Printer {...ICON_PROPS} />,
        to: '/billing/settings/print',
      },
      {
        label: 'Customer',
        description: 'Configure phone validation and dues.',
        icon: <UserRound {...ICON_PROPS} />,
        to: '/billing/settings/customer',
      },
    ],
  },
  {
    title: 'Online/Advance Order',
    cards: [
      {
        label: 'Online Order Configuration',
        description:
          'Manage general online order settings, auto-acceptance, food ready controls, and outlet timings.',
        icon: <Settings {...ICON_PROPS} />,
        to: '/billing/settings/online-order',
      },
      {
        label: 'Advance Order Configuration',
        description: 'Control advance order configurations.',
        icon: <CalendarClock {...ICON_PROPS} />,
      },
      {
        label: 'Online Order System Configuration',
        description:
          'Manage system-level settings and operational controls for online orders.',
        icon: <Smartphone {...ICON_PROPS} />,
      },
    ],
  },
  {
    title: 'Dinein QR Orders',
    cards: [
      {
        label: 'Dinein QR Order Configuration',
        description: 'Manage general dinein QR order settings and ring notifications.',
        icon: <QrCode {...ICON_PROPS} />,
      },
    ],
  },
  {
    title: 'System Setting',
    cards: [
      {
        label: 'Billing System',
        description: 'Set how your POSS updates with the central system.',
        icon: <ReceiptText {...ICON_PROPS} />,
        to: '/billing/settings/billing-system',
      },
      {
        label: 'Connect Captain & Secondary POS',
        description: 'Generate a QR code to connect captain and secondary POS.',
        icon: <QrCode {...ICON_PROPS} />,
        to: '/management/device-mapping',
      },
    ],
  },
]

export default function BillingSettings() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SECTIONS
    return SECTIONS.map((section) => ({
      ...section,
      cards: section.cards.filter(
        (card) =>
          card.label.toLowerCase().includes(q) ||
          card.description.toLowerCase().includes(q),
      ),
    })).filter((section) => section.cards.length > 0)
  }, [query])

  function openCard(card: SettingCard) {
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

      <div className="flex items-center justify-between gap-3 border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-bold text-ink">Outlet Settings</h1>
        {searching ? (
          <div className="relative w-64">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search settings"
              className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-9 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                setSearching(false)
                setQuery('')
              }}
              aria-label="Close search"
              data-tooltip="Close search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearching(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
          >
            <Search size={16} />
            Search
          </button>
        )}
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="space-y-6 pb-6">
          {sections.length === 0 ? (
            <p className="rounded-xl border border-line bg-card p-10 text-center text-sm text-muted">
              No settings match your search.
            </p>
          ) : (
            sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-2 text-sm font-bold text-ink">{section.title}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {section.cards.map((card) => (
                    <button
                      key={card.label}
                      type="button"
                      onClick={() => openCard(card)}
                      className="flex items-start gap-3 rounded-xl border border-line bg-card p-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {card.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink">{card.label}</span>
                        <span className="mt-0.5 block text-xs text-muted">{card.description}</span>
                      </span>
                      <ArrowRight size={16} className="shrink-0 text-primary" />
                    </button>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
