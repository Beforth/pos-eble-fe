import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, Sparkles, X } from 'lucide-react'
import { brand } from '../../theme/brand'

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  items: string[]
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: '1.0.1',
    date: '26 Oct 2026',
    title: 'Billing, KOT and online order improvements (14 Oct – 26 Oct)',
    items: [
      'Billing: Dine In / Parcel order types, Split and Advance Order buttons, and a redesigned payment method bar',
      'Advance Order: book the current bill for a chosen date and time with an advance payment and customer note',
      'Save & eBill sends the KOT to the kitchen, prints the KOT slip and empties the cart; ticking Its Paid marks the bill as paid',
      'Customer name and mobile are optional; the Final Bill name popup is removed and details clear after each order',
      'Short code search now looks across the whole menu; item cards redesigned so full item names are visible',
      'KOT view: order note shown above the items, long item lists scroll inside the card, and New Order works from the KOT view',
      'Live Orders cards are a uniform size with scrolling item lists',
      'Online orders appear on the billing Online Orders page instantly, without a page refresh',
      'Excel menu import keeps the sheet order and fills Online Display Name; Short Code 2, descriptions, SAP/FSN codes and Item Unit are no longer required',
      'New billing pages: Live View, Online Orders, Advance Orders, Due Payments, Expenses, Withdrawals, Delivery Boys, Printers, LED Display and Reports',
      'Fixes: outlet document preview in production, Wera error, KOT sorting, import sheet and toast issues, due payment from KOT view and Live Orders',
    ],
  },
  {
    version: '1.0.0',
    date: '17 Aug 2026',
    title: 'Initial release',
    items: [
      'Dashboard with sales overview, channel chart, and order mix',
      'Billing, captain orders, KOT, and table view',
      'Online orders, live orders, and due payment settlement',
      'Menu, inventory, finance, and reports',
      'User management, configuration, and print settings',
      'Support agent, notifications, and edit profile',
    ],
  },
]

interface ChangelogModalProps {
  open: boolean
  onClose: () => void
}

export function ChangelogModal({ open, onClose }: ChangelogModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
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

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close changelog"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(86vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line bg-card px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={22} />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-bold leading-tight text-ink">
                What&apos;s new
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {brand.shortName} · Release notes
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              v{brand.appVersion}
            </span>
            <button
              type="button"
              aria-label="Close"
              data-tooltip="Close"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-page px-6 py-5">
          <ol className="relative space-y-5 border-l-2 border-line pl-6">
            {changelogEntries.map((entry, index) => (
              <li key={entry.version} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[33px] top-5 size-4 rounded-full border-2 border-page ${
                    index === 0 ? 'bg-primary' : 'bg-line'
                  }`}
                />
                <article className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">
                      v{entry.version}
                    </span>
                    {index === 0 ? (
                      <span className="rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-success">
                        Latest
                      </span>
                    ) : null}
                    <span className="ml-auto text-xs font-medium text-muted">
                      {entry.date}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-ink">
                    {entry.title}
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {entry.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-ink"
                      >
                        <CircleCheck
                          size={16}
                          className="mt-0.5 shrink-0 text-success"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>,
    document.body,
  )
}
