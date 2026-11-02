import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  Package,
  ShoppingBag,
  Wallet,
  X,
} from 'lucide-react'
import { useNotifications } from '../../state/NotificationsContext'
import type {
  AppNotification,
  NotificationKind,
} from '../../services/notificationService'

interface NotificationsDrawerProps {
  open: boolean
  onClose: () => void
}

const kindMeta: Record<NotificationKind, { icon: typeof Bell; tone: string }> = {
  order: { icon: ShoppingBag, tone: 'bg-primary/10 text-primary' },
  inventory: { icon: Package, tone: 'bg-accent/10 text-accent' },
  payment: { icon: Wallet, tone: 'bg-success/10 text-success' },
  alert: { icon: AlertTriangle, tone: 'bg-danger/10 text-danger' },
}

/** "just now", "5 min ago", "3 hr ago", "Yesterday", then the date. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const minutes = Math.floor((Date.now() - then) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  if (hours < 48) return 'Yesterday'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const navigate = useNavigate()
  const { items, unreadCount, loading, markRead, markAllRead } = useNotifications()

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

  function openItem(item: AppNotification) {
    markRead(item.id)
    if (item.link) {
      onClose()
      navigate(item.link)
    }
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
                {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
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
              data-tooltip="Close"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-page hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BellOff size={40} strokeWidth={1.5} />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">
                {loading ? 'Loading…' : 'No notifications yet'}
              </p>
              {!loading ? (
                <p className="mt-1 text-xs text-muted">
                  New online orders, stock alerts and cancelled bills show up here.
                </p>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item) => {
                const meta = kindMeta[item.kind] ?? kindMeta.alert
                const Icon = meta.icon
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-page ${
                        item.read ? '' : 'bg-primary/[0.03]'
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
                          {!item.read && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {item.body}
                        </span>
                        <span className="mt-1.5 block text-[11px] text-muted">
                          {timeAgo(item.created_at)}
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
