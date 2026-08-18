import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Phone, X } from 'lucide-react'
import { brand } from '../../theme/brand'

interface AggregatorHelpCenterModalProps {
  open: boolean
  onClose: () => void
}

type HelpTab = 'swiggy' | 'zomato'

const HELP: Record<
  HelpTab,
  {
    name: string
    logo: string
    partnerUrl: string
    partnerLabel: string
    phone: string
    hours: string
    faqs: Array<{ q: string; a: string }>
  }
> = {
  swiggy: {
    name: 'Swiggy',
    logo: '/swiggy.png',
    partnerUrl: 'https://partner.swiggy.com/',
    partnerLabel: 'Open Swiggy Partner dashboard',
    phone: '080-67466729',
    hours: '24×7 partner support',
    faqs: [
      {
        q: 'Orders are not showing in POS',
        a: 'Confirm the outlet is online on Swiggy, then check Online Order Configuration and sync. If the store is paused on Swiggy, new orders will not arrive.',
      },
      {
        q: 'Rider not assigned / delayed pickup',
        a: 'Mark food ready in POS so Swiggy can dispatch a rider. For a stuck rider, call Swiggy partner support with the order ID.',
      },
      {
        q: 'Wrong menu or price on Swiggy',
        a: 'Update the item on the Swiggy / Toing menu in this POS, then wait for the catalog to sync. Price changes can take a few minutes.',
      },
      {
        q: 'Payment or settlement mismatch',
        a: 'Online-paid Swiggy bills settle in the aggregator payout. Match the order ID in Online Orders Activity with the Swiggy payout report.',
      },
    ],
  },
  zomato: {
    name: 'Zomato',
    logo: '/zomato.png',
    partnerUrl: 'https://www.zomato.com/partners',
    partnerLabel: 'Open Zomato Partner dashboard',
    phone: '080-67466729',
    hours: '24×7 partner support',
    faqs: [
      {
        q: 'Order accepted on Zomato but missing here',
        a: 'Refresh Online Orders. If it still does not appear, confirm the Zomato store ID in Connected Services and that auto-accept is set as you expect.',
      },
      {
        q: 'Customer cancelled after KOT printed',
        a: 'The order will show as Cancelled. Do not dispatch. Raise a cancellation with Zomato if food was already prepared.',
      },
      {
        q: 'Item unavailable / 86’d on Zomato',
        a: 'Turn the item off on the Zomato channel menu in POS. Until it syncs, reject that item on the incoming order if needed.',
      },
      {
        q: 'OTP not matching at handover',
        a: 'Use the OTP shown on the order in this screen. If the rider’s OTP differs, do not hand over — call Zomato support with the order number.',
      },
    ],
  },
}

export function AggregatorHelpCenterModal({
  open,
  onClose,
}: AggregatorHelpCenterModalProps) {
  const titleId = useId()
  const [tab, setTab] = useState<HelpTab>('swiggy')
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    if (!open) return
    setTab('swiggy')
    setOpenFaq(0)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const help = HELP[tab]

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close aggregator help center"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(84vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              Aggregator Help Center
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Support for Swiggy and Zomato orders at {brand.shortName}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-line px-5 pt-3">
          {(['swiggy', 'zomato'] as const).map((id) => {
            const item = HELP[id]
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id)
                  setOpenFaq(0)
                }}
                className={`inline-flex items-center gap-2 border-b-2 px-3 pb-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                <span className="relative inline-flex size-5 items-center justify-center overflow-hidden rounded">
                  <img
                    src={item.logo}
                    alt=""
                    className={
                      id === 'swiggy'
                        ? 'absolute size-8 max-w-none object-cover'
                        : 'size-5 object-contain'
                    }
                  />
                </span>
                {item.name}
              </button>
            )
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 rounded-lg border border-line bg-page px-3 py-3">
            <p className="text-sm font-semibold text-ink">{help.name} partner support</p>
            <p className="mt-0.5 text-xs text-muted">{help.hours}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`tel:${help.phone.replace(/[^\d+]/g, '')}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
              >
                <Phone size={14} className="text-primary" />
                {help.phone}
              </a>
              <a
                href={help.partnerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 text-sm font-medium text-white hover:bg-primary-hover"
              >
                <ExternalLink size={14} />
                {help.partnerLabel}
              </a>
            </div>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Common questions
          </p>
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {help.faqs.map((faq, index) => {
              const expanded = openFaq === index
              return (
                <li key={faq.q}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenFaq(expanded ? -1 : index)}
                    className="flex w-full items-start justify-between gap-3 bg-card px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-page"
                  >
                    {faq.q}
                    <span className="mt-0.5 text-muted">{expanded ? '−' : '+'}</span>
                  </button>
                  {expanded ? (
                    <p className="bg-page px-3 pb-3 text-sm leading-relaxed text-muted">
                      {faq.a}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  )
}
