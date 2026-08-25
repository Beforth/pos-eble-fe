import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { FinancePageShell } from '../../components/layout/FinancePageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

interface MarketplaceService {
  id: string
  name: string
  logoLabel: string
  logoTone: string
  description: string
}

const SERVICES: MarketplaceService[] = [
  {
    id: 'icici',
    name: 'ICICI Bank EDC',
    logoLabel: 'ICICI Bank',
    logoTone: 'bg-accent/15 text-accent',
    description:
      'ICICI Bank EDC devices come with smart Petpooja Payment and an EDC device. Collect payments directly from the billing screen with automatic order settlement.',
  },
  {
    id: 'pine-labs',
    name: 'Pine Labs EDC',
    logoLabel: 'Pine Labs',
    logoTone: 'bg-accent/15 text-accent',
    description:
      'Pine Labs EDC machine integrates with Petpooja so you can collect card and UPI payments from the billing screen and settle orders automatically.',
  },
  {
    id: 'bharatpe',
    name: 'BharatPe EDC',
    logoLabel: 'BharatPe',
    logoTone: 'bg-success/10 text-success',
    description:
      'BharatPe EDC devices come with smart Petpooja Payment and an EDC device. This combo lets you collect payments from all modes on a single terminal.',
  },
  {
    id: 'mosambee',
    name: 'Mosambee EDC',
    logoLabel: 'Mosambee',
    logoTone: 'bg-primary/10 text-primary',
    description:
      'Mosambee EDC devices come with smart Petpooja Payment and an EDC device. Collect payments from all modes on a single terminal with automatic settlement.',
  },
  {
    id: 'razorpay',
    name: 'Razorpay EDC',
    logoLabel: 'Razorpay',
    logoTone: 'bg-deep/10 text-deep',
    description:
      'Razorpay EDC devices come with a smart Petpooja Payment and an EDC device. This smart combo allows you to collect payments from all modes on a single terminal.',
  },
  {
    id: 'paytm',
    name: 'Paytm EDC',
    logoLabel: 'Paytm',
    logoTone: 'bg-accent/15 text-accent',
    description:
      'Paytm EDC devices come with a smart Petpooja Payment and an EDC device. This smart combo allows you to collect payments from all modes on a single terminal.',
  },
]

export default function FinanceMarketplace() {
  const [toast, setToast] = useState<string | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const details = SERVICES.find((item) => item.id === detailsId) ?? null

  return (
    <FinancePageShell activeItem="marketplace">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink hover:bg-page"
        >
          Swipe Machine Integration
          <ChevronRight size={14} className="text-muted" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((service) => (
          <article
            key={service.id}
            className="flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div
              className={`flex h-28 items-center justify-center border-b border-line ${service.logoTone}`}
            >
              <span className="text-base font-semibold tracking-tight">
                {service.logoLabel}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-base font-semibold text-ink">{service.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {service.description}
              </p>
              <button
                type="button"
                onClick={() => setDetailsId(service.id)}
                className="mt-3 self-start text-sm font-semibold text-primary hover:underline"
              >
                View details
              </button>
              <div className="mt-4">
                <OutlineButton
                  variant="gray"
                  onClick={() =>
                    showToast(`Service request sent for ${service.name}`)
                  }
                >
                  Request Service
                </OutlineButton>
              </div>
            </div>
          </article>
        ))}
      </div>

      {details ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setDetailsId(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-line bg-card p-5 shadow-xl">
            <h2 className="text-lg font-bold text-ink">{details.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {details.description}
            </p>
            <p className="mt-3 text-sm text-ink">
              Integrate this EDC with your billing screen to accept card and UPI
              payments and settle orders automatically in Petpooja Finance.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <OutlineButton variant="gray" onClick={() => setDetailsId(null)}>
                Close
              </OutlineButton>
              <button
                type="button"
                onClick={() => {
                  showToast(`Service request sent for ${details.name}`)
                  setDetailsId(null)
                }}
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Request Service
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FinancePageShell>
  )
}
