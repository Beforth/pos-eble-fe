import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { OnlineOrderRow } from '../../utils/onlineOrderRows'

interface OnlineOrderActivityDrawerProps {
  open: boolean
  order: OnlineOrderRow | null
  onClose: () => void
}

type LifecycleTone = 'placed' | 'prepared' | 'ready' | 'dispatched' | 'delivered'

interface LifecycleEvent {
  title: string
  at: string
  requestFrom?: string
  riderStatus?: string
  tone: LifecycleTone
}

const toneDot: Record<LifecycleTone, string> = {
  placed: 'bg-muted',
  prepared: 'bg-secondary',
  ready: 'bg-accent',
  dispatched: 'bg-success',
  delivered: 'bg-success',
}

/** Convert `DD-MM-YYYY HH:mm:ss` → `YYYY-MM-DD HH:mm:ss` */
function toIsoLike(value: string): string {
  const match = value.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}:\d{2}:\d{2})$/,
  )
  if (!match) return value
  const [, dd, mm, yyyy, time] = match
  return `${yyyy}-${mm}-${dd} ${time}`
}

/** Only moments the system actually recorded; nothing is estimated. */
function buildLifecycle(order: OnlineOrderRow): LifecycleEvent[] {
  const events: LifecycleEvent[] = [
    { title: 'Order Placed', at: order.created, tone: 'placed' },
    {
      title: 'Order Received',
      at: order.received,
      requestFrom: 'Thirdparty',
      tone: 'placed',
    },
  ]

  if (order.accepted !== '—') {
    events.push({
      title: 'Order Accepted',
      at: order.accepted,
      requestFrom: 'POS',
      tone: 'prepared',
    })
  }

  if (order.foodReady !== '—') {
    events.push({
      title: 'Food Is Ready',
      at: order.foodReady,
      requestFrom: 'POS',
      tone: 'ready',
    })
  }

  if (order.status === 'Dispatched' || order.status === 'Delivered') {
    events.push({
      title: order.status,
      at: order.updated,
      requestFrom: 'Thirdparty',
      riderStatus: order.riderStatus || undefined,
      tone: order.status === 'Delivered' ? 'delivered' : 'dispatched',
    })
  }

  if (order.status === 'Rejected' || order.status === 'Cancelled') {
    events.push({
      title: order.status,
      at: order.updated,
      requestFrom: 'Thirdparty',
      tone: 'placed',
    })
  }

  return events
}

export function OnlineOrderActivityDrawer({
  open,
  order,
  onClose,
}: OnlineOrderActivityDrawerProps) {
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

  const events = order ? buildLifecycle(order) : []

  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close online order activity"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={
          order ? `Order activity #${order.orderNo}` : 'Online order activity'
        }
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="truncate text-base font-bold text-ink">
            {order ? `Order: #${order.orderNo}` : 'Order Activity'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="shrink-0 border-b border-line px-5 py-3">
          <span className="inline-flex rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-white">
            Lifecycle
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-line">
            {events.map((event, index) => (
              <li key={`${event.title}-${event.at}-${index}`} className="relative pl-7">
                <span
                  aria-hidden
                  className={`absolute left-0 top-3.5 size-3.5 rounded-full border-2 border-card ${toneDot[event.tone]}`}
                />
                <div className="rounded-lg border border-line bg-card px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                  <p className="text-sm font-bold text-ink">
                    {event.title}{' '}
                    <span className="font-bold">| {toIsoLike(event.at)}</span>
                  </p>
                  {(event.requestFrom || event.riderStatus) && (
                    <div className="mt-1.5 space-y-0.5 text-xs text-muted">
                      {event.requestFrom && (
                        <p>Request From: {event.requestFrom}</p>
                      )}
                      {event.riderStatus && (
                        <p>Rider Status: {event.riderStatus}</p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  )
}
