import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Package,
  ShoppingBag,
  Wallet,
  X,
} from 'lucide-react'

type NotificationKind = 'order' | 'inventory' | 'payment' | 'alert'

interface NotificationItem {
  id: string
  kind: NotificationKind
  title: string
  body: string
  time: string
  unread: boolean
}

interface NotificationsDrawerProps {
  open: boolean
  onClose: () => void
}

const INITIAL: NotificationItem[] = [
  {
    id: 'n1',
    kind: 'order',
    title: 'New online order',
    body: 'Swiggy order #4821 — Vegetable Grill Sandwich ×2',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 'n2',
    kind: 'payment',
    title: 'Due payment reminder',
    body: '₹ 1,250 pending settlement for yesterday’s COD orders',
    time: '18 min ago',
    unread: true,
  },
  {
    id: 'n3',
    kind: 'inventory',
    title: 'Low stock alert',
    body: 'Pav buns below reorder level (12 left)',
    time: '1 hr ago',
    unread: true,
  },
  {
    id: 'n4',
    kind: 'alert',
    title: 'KOT modified',
    body: 'Bill #1093 was modified on Table 4',
    time: '3 hr ago',
    unread: false,
  },
  {
    id: 'n5',
    kind: 'order',
    title: 'Order cancelled',
    body: 'Zomato order #4790 cancelled by customer',
    time: 'Yesterday',
    unread: false,
  },
]

const kindMeta: Record<
  NotificationKind,
  { icon: typeof Bell; tone: string }
> = {
  order: { icon: ShoppingBag, tone: 'bg-primary/10 text-primary' },
  inventory: { icon: Package, tone: 'bg-accent/10 text-accent' },
  payment: { icon: Wallet, tone: 'bg-success/10 text-success' },
  alert: { icon: AlertTriangle, tone: 'bg-danger/10 text-danger' },
}

export function NotificationsDrawer({
  open,
  onClose,
}: NotificationsDrawerProps) {
  const [items, setItems] = useState(INITIAL)
  const unreadCount = items.filter((item) => item.unread).length

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

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })))
  }

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    )
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close notifications"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">Notifications</h2>
              <p className="text-[11px] text-muted">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'You are all caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-page hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted">
              No notifications yet
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item) => {
                const meta = kindMeta[item.kind]
                const Icon = meta.icon
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-page ${
                        item.unread ? 'bg-primary/[0.03]' : ''
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {item.title}
                          </span>
                          {item.unread && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {item.body}
                        </span>
                        <span className="mt-1.5 block text-[11px] text-muted">
                          {item.time}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
