import { useMemo, useState, type ReactNode } from 'react'
import {
  Building2,
  Calculator,
  CalendarClock,
  CreditCard,
  FileText,
  LayoutGrid,
  Link2,
  Mail,
  Monitor,
  Phone,
  Printer,
  Receipt,
  Search,
  Settings2,
  Smartphone,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const CARD_ROUTES: Record<string, string> = {
  'outlet-details': '/management/configuration/outlet/details',
  'contact-details': '/management/configuration/outlet/contact',
  'outlet-timings': '/management/configuration/outlet/timings',
  payment: '/management/configuration/outlet/payment',
  'invoice-sequence': '/management/configuration/outlet/invoice-sequence',
  'floor-plan': '/management/configuration/floor-plan',
  display: '/management/configuration/outlet/display',
  'print-logo': '/management/configuration/outlet/print-logo',
  calculations: '/management/configuration/outlet/calculations',
  'connected-services': '/management/configuration/outlet/connected-services',
  print: '/management/configuration/outlet/print',
  customer: '/management/configuration/outlet/customer',
  'online-advance-config':
    '/management/configuration/outlet/online-advance',
  'billing-system': '/management/configuration/outlet/billing-system',
  'sms-configuration': '/management/configuration/outlet/sms',
  documents: '/management/configuration/outlet/documents',
}

interface ConfigCard {
  id: string
  title: string
  description: string
  icon: ReactNode
  tone: string
}

interface ConfigSection {
  id: string
  title: string
  cards: ConfigCard[]
}

const SECTIONS: ConfigSection[] = [
  {
    id: 'outlet-information',
    title: 'Outlet Information',
    cards: [
      {
        id: 'outlet-details',
        title: 'Outlet Details',
        description: 'Configure email id, address, Logo of an Outlet.',
        icon: <FileText size={18} />,
        tone: 'bg-primary/10 text-primary',
      },
      {
        id: 'contact-details',
        title: 'Contact Details',
        description: 'Configure contact details of yours and your staff.',
        icon: <Phone size={18} />,
        tone: 'bg-accent/15 text-accent',
      },
      {
        id: 'outlet-timings',
        title: 'Outlet Timings',
        description: 'Configure closing hours, lunch & dinner timings etc.',
        icon: <CalendarClock size={18} />,
        tone: 'bg-secondary/40 text-deep',
      },
      {
        id: 'payment',
        title: 'Payment',
        description: 'Configure Currency and Payment Types available.',
        icon: <CreditCard size={18} />,
        tone: 'bg-success/10 text-success',
      },
      {
        id: 'invoice-sequence',
        title: 'Invoice Sequence',
        description: 'Configure multiple invoice sequences.',
        icon: <Receipt size={18} />,
        tone: 'bg-deep/10 text-deep',
      },
      {
        id: 'floor-plan',
        title: 'Floor Plan',
        description: 'Create your own floor plan using tables.',
        icon: <LayoutGrid size={18} />,
        tone: 'bg-primary/10 text-primary',
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'Upload business & license documents for your outlet.',
        icon: <FileText size={18} />,
        tone: 'bg-deep/10 text-deep',
      },
    ],
  },
  {
    id: 'billing-screen',
    title: 'Billing Screen',
    cards: [
      {
        id: 'display',
        title: 'Display',
        description: 'Configure the billing screen display, look & values.',
        icon: <Monitor size={18} />,
        tone: 'bg-accent/15 text-accent',
      },
      {
        id: 'print-logo',
        title: 'Set Your Print Logo',
        description: 'Logo to print at your desktop point of sale.',
        icon: <Settings2 size={18} />,
        tone: 'bg-secondary/40 text-deep',
      },
      {
        id: 'calculations',
        title: 'Calculations',
        description: 'Configure how invoice gets calculated.',
        icon: <Calculator size={18} />,
        tone: 'bg-success/10 text-success',
      },
      {
        id: 'connected-services',
        title: 'Connected Services',
        description: 'Configure how different services gets connects.',
        icon: <Link2 size={18} />,
        tone: 'bg-primary/10 text-primary',
      },
      {
        id: 'print',
        title: 'Print',
        description: 'Configure the print settings of the Bill and KOT.',
        icon: <Printer size={18} />,
        tone: 'bg-deep/10 text-deep',
      },
      {
        id: 'customer',
        title: 'Customer',
        description: "Configure the billing screen and it's component.",
        icon: <UserRound size={18} />,
        tone: 'bg-accent/15 text-accent',
      },
    ],
  },
  {
    id: 'online-advance',
    title: 'Online/Advance Order',
    cards: [
      {
        id: 'online-advance-config',
        title: 'Online/Advance Order Configuration',
        description:
          'Configure auto accept, Duration, Cancel timings etc. of Online Orders.',
        icon: <Smartphone size={18} />,
        tone: 'bg-primary/10 text-primary',
      },
    ],
  },
  {
    id: 'system-setting',
    title: 'System Setting',
    cards: [
      {
        id: 'billing-system',
        title: 'Billing System',
        description: 'Configure Billing screen internal settings.',
        icon: <Building2 size={18} />,
        tone: 'bg-secondary/40 text-deep',
      },
    ],
  },
  {
    id: 'notification-setting',
    title: 'Notification Setting',
    cards: [
      {
        id: 'sms-configuration',
        title: 'SMS Configuration',
        description: `Configure the option to receive SMS from ${brand.shortName}.`,
        icon: <Mail size={18} />,
        tone: 'bg-success/10 text-success',
      },
    ],
  },
]

function ConfigCardItem({
  card,
  onOpen,
}: {
  card: ConfigCard
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-full w-full items-start gap-3 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-primary/35 hover:bg-page/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span
        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${card.tone}`}
      >
        {card.icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{card.title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted">
          {card.description}
        </span>
      </span>
    </button>
  )
}

export default function OutletConfiguration() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function openCard(cardId: string, title: string) {
    const route = CARD_ROUTES[cardId]
    if (route) {
      navigate(route)
      return
    }
    showToast(`Opening ${title}`)
  }

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SECTIONS
    return SECTIONS.map((section) => ({
      ...section,
      cards: section.cards.filter(
        (card) =>
          card.title.toLowerCase().includes(q) ||
          card.description.toLowerCase().includes(q),
      ),
    })).filter((section) => section.cards.length > 0)
  }, [query])

  return (
    <ReportsPageShell
      title="Outlet Configuration"
      activeItem="config-outlet"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right text-xs text-muted sm:text-sm">
            <p>
              Restaurant: ID -{' '}
              <span className="font-semibold text-ink">133856</span>
            </p>
            <p>
              Desktop Version:{' '}
              <span className="font-semibold text-ink">
                {brand.appVersion}.0.1
              </span>
            </p>
          </div>
          <label className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-9 w-40 rounded-md border border-line bg-card py-1.5 pl-3 pr-9 text-sm text-ink outline-none placeholder:text-muted focus:border-primary sm:w-48"
            />
            <Search
              size={15}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </label>
          <PrimaryButton onClick={() => showToast('Search applied')}>
            Search
          </PrimaryButton>
        </div>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        Below are the configuration to manage your outlet information.
      </p>

      {filteredSections.length === 0 ? (
        <div className="rounded-xl border border-line bg-card px-6 py-16 text-center">
          <p className="text-base font-semibold text-ink">No Results Found</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t find a match for your search.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredSections.map((section) => (
            <section key={section.id}>
              <h2 className="mb-3 text-base font-bold text-ink">
                {section.title}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {section.cards.map((card) => (
                  <ConfigCardItem
                    key={card.id}
                    card={card}
                    onOpen={() => openCard(card.id, card.title)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </ReportsPageShell>
  )
}
