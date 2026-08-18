import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { brand } from '../../theme/brand'

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  items: string[]
}

export const changelogEntries: ChangelogEntry[] = [
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
        className="relative z-10 flex max-h-[min(80vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              Changelog
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {brand.shortName} · Version {brand.appVersion}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <ol className="space-y-5">
            {changelogEntries.map((entry) => (
              <li key={entry.version}>
                <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-semibold text-ink">
                    Version {entry.version}
                  </p>
                  <p className="text-xs text-muted">{entry.date}</p>
                </div>
                <p className="mb-2 text-sm text-ink">{entry.title}</p>
                <ul className="space-y-1.5">
                  {entry.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm leading-relaxed text-muted"
                    >
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>,
    document.body,
  )
}
