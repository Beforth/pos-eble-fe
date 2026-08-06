import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'

interface ActionItem {
  id: string
  title: string
  count: number
  description: string
  actionLabel: string
}

interface ActionCenterDrawerProps {
  open: boolean
  onClose: () => void
}

const INITIAL: ActionItem[] = [
  {
    id: 'a1',
    title: 'Items missing description',
    count: 7,
    description:
      'Add description to enhance customer awareness of items on order platforms.',
    actionLabel: 'View Item',
  },
  {
    id: 'a2',
    title: 'Items missing photos',
    count: 44,
    description:
      'Add photos to increase the visibility of your menu on order platform.',
    actionLabel: 'View Item',
  },
]

export function ActionCenterDrawer({
  open,
  onClose,
}: ActionCenterDrawerProps) {
  const [items, setItems] = useState(INITIAL)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  function clearItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close action center"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Action Center"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-base font-bold text-ink">Action Center</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              No pending actions
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="py-4 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        <span className="font-semibold text-ink">
                          {item.count}
                        </span>{' '}
                        {item.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => clearItem(item.id)}
                        className="h-8 rounded-lg border border-line px-3 text-xs font-medium text-muted transition-colors hover:bg-page hover:text-ink"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="h-8 rounded-lg border border-primary px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                      >
                        {item.actionLabel}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}

interface ActionCenterButtonProps {
  count?: number
  onClick: () => void
}

export function ActionCenterButton({
  count = 0,
  onClick,
}: ActionCenterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-9 items-center gap-2 rounded-full border border-primary/40 bg-card px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
    >
      <Bell size={15} className="fill-primary text-primary" />
      <span className="hidden sm:inline">Action Center</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
