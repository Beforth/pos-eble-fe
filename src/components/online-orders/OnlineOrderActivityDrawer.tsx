import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { OnlineOrderRow } from '../../mocks/onlineOrdersData'

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

function shiftSeconds(value: string, seconds: number): string {
  const match = value.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  )
  if (!match) return value
  const [, dd, mm, yyyy, hh, mi, ss] = match
  const date = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(mi),
    Number(ss) + seconds,
  )
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function buildLifecycle(order: OnlineOrderRow): LifecycleEvent[] {
  const events: LifecycleEvent[] = [
    {
      title: 'Order Placed',
      at: order.created,
      tone: 'placed',
    },
    {
      title: 'Order Placed',
      at: order.received,
      requestFrom: 'Thirdparty',
      riderStatus: 'CONFIRMED',
      tone: 'placed',
    },
    {
      title: 'Prepared (Bill)',
      at: order.accepted,
      requestFrom: 'POS',
      tone: 'prepared',
    },
    {
      title: 'Prepared (Bill)',
      at: shiftSeconds(order.accepted, 49),
      requestFrom: 'Thirdparty',
      riderStatus: 'ARRIVED',
      tone: 'prepared',
    },
  ]

  if (
    order.status === 'Food Ready' ||
    order.status === 'Dispatched' ||
    order.status === 'Delivered'
  ) {
    events.push({
      title: 'Food Is Ready',
      at: shiftSeconds(order.accepted, 22 * 60),
      requestFrom: 'POS',
      tone: 'ready',
    })
  }

  if (order.status === 'Dispatched' || order.status === 'Delivered') {
    events.push({
      title: 'Dispatched',
      at: shiftSeconds(order.accepted, 24 * 60),
      requestFrom: 'Thirdparty',
      riderStatus: 'PICKEDUP',
      tone: 'dispatched',
    })
  }

  if (order.status === 'Delivered') {
    events.push({
      title: 'Delivered',
      at: order.updated,
      requestFrom: 'Thirdparty',
      tone: 'delivered',
    })
  }

  if (order.status === 'Cancelled') {
    events.push({
      title: 'Cancelled',
      at: order.updated,
      requestFrom: 'Thirdparty',
      tone: 'placed',
    })
  }

  if (order.status === 'Accepted') {
    // Keep early lifecycle only
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
