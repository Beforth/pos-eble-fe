import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ClipboardList,
  FileBarChart,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  Receipt,
} from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

interface InventoryCard {
  label: string
  description: string
  icon: ReactNode
  /** Omitted while the screen is not built yet. */
  to?: string
}

interface InventorySection {
  title: string
  cards: InventoryCard[]
}

const ICON_PROPS = { size: 20 }

const SECTIONS: InventorySection[] = [
  {
    title: 'Purchase',
    cards: [
      {
        label: 'Purchase Management',
        description:
          'Keep a clear record of all raw material purchases and inward entries to maintain accurate inventory tracking.',
        icon: <ShoppingCart {...ICON_PROPS} />,
        to: '/inventory/purchase',
      },
      {
        label: 'Purchase Order',
        description:
          'Easily create and track purchase orders (POs) for better procurement management.',
        icon: <Receipt {...ICON_PROPS} />,
        to: '/inventory/purchase-order',
      },
    ],
  },
  {
    title: 'Wastage and Conversion',
    cards: [
      {
        label: 'Wastage',
        description:
          'Record and track raw material or item wastage for accurate inventory management.',
        icon: <Trash2 {...ICON_PROPS} />,
        to: '/inventory/wastage',
      },
      {
        label: 'Production Execution',
        description:
          'Production of raw materials into cooked or semi-cooked products.',
        icon: <UtensilsCrossed {...ICON_PROPS} />,
        to: '/inventory/production-execution',
      },
    ],
  },
  {
    title: 'Reports',
    cards: [
      {
        label: 'Current Stock',
        description: 'The report shows the current stock of your ingredients.',
        icon: <BarChart3 {...ICON_PROPS} />,
        to: '/inventory/current-stock',
      },
      {
        label: 'Opening - Closing Report',
        description: 'Displays the opening and closing stock of your ingredients.',
        icon: <FileBarChart {...ICON_PROPS} />,
        to: '/inventory/other-reports/opening-closing',
      },
      {
        label: 'Indent Management',
        description:
          'Calculate the raw materials required to prepare specific items in bulk.',
        icon: <ClipboardList {...ICON_PROPS} />,
      },
    ],
  },
]

export default function InventoryManagement() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')

  function openCard(card: InventoryCard) {
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

      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-bold text-ink">Inventory Management</h1>
        <button
          type="button"
          onClick={() => navigate('/configuration')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="space-y-6">
          {SECTIONS.map((section) => (
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
          ))}
        </div>
      </main>
    </div>
  )
}
