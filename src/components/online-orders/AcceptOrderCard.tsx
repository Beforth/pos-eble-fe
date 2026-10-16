import { useState } from 'react'
import { Check, Clock3, Loader2, MapPin, Phone, StickyNote, X } from 'lucide-react'
import { AggregatorLogo } from '../common/AggregatorLogo'
import { Badge } from '../common/Badge'
import { formatINR } from '../../utils/format'
import type {
  OnlineOrder,
  RejectionReason,
} from '../../services/onlineOrderApi'

const PREP_CHOICES = [10, 15, 20, 30, 45, 60]
const MAX_PREP = 300

const TYPE_LABEL: Record<OnlineOrder['order_type'], string> = {
  delivery: 'Delivery',
  'pick-up': 'Pick up',
  'dine-in': 'Dine in',
}

const STATUS_LABEL: Record<OnlineOrder['status'], string> = {
  received: 'New',
  accepted: 'Accepted',
  auto_accepted: 'Auto-accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

function platformTitle(platform: string): string {
  return platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Online'
}

function clock(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function waited(iso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min ago`
}

/** `m:ss` until Wera accepts the order for us, or null once that time is up. */
function countdown(iso: string | null, now: number): string | null {
  if (!iso) return null
  const seconds = Math.floor((Date.parse(iso) - now) / 1000)
  if (seconds <= 0) return null
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

interface AcceptOrderCardProps {
  order: OnlineOrder
  now: number
  defaultPreparation: number
  reasons: RejectionReason[]
  busy: boolean
  onAccept: (order: OnlineOrder, minutes: number) => void
  onReject: (order: OnlineOrder, reasonId: number) => void
}

export function AcceptOrderCard({
  order,
  now,
  defaultPreparation,
  reasons,
  busy,
  onAccept,
  onReject,
}: AcceptOrderCardProps) {
  const [minutes, setMinutes] = useState(String(defaultPreparation))
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState<number | null>(null)

  const waiting = order.status === 'received'
  const left = waiting ? countdown(order.auto_accept_at, now) : null
  const prep = Number(minutes)
  const prepValid = Number.isInteger(prep) && prep >= 1 && prep <= MAX_PREP
  const choices = PREP_CHOICES.includes(defaultPreparation)
    ? PREP_CHOICES
    : [...PREP_CHOICES, defaultPreparation].sort((a, b) => a - b)
  const platform = platformTitle(order.platform)
  const urgent = waiting && left !== null && Number(left.split(':')[0]) < 1

  return (
    <article
      className={`rounded-xl border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
        waiting ? 'border-primary/40' : 'border-line'
      }`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {order.platform === 'zomato' || order.platform === 'swiggy' ? (
            <AggregatorLogo
              name={order.platform === 'swiggy' ? 'Swiggy' : 'Zomato'}
              size="md"
            />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-page text-sm font-bold text-muted">
              {platform.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">
              {platform} #{order.external_order_id || order.wera_order_id}
            </p>
            <p className="text-xs text-muted">
              Received {clock(order.received_at)} · {waited(order.received_at, now)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral" size="md">
            {TYPE_LABEL[order.order_type]}
          </Badge>
          <Badge variant={order.prepaid ? 'success' : 'accent'} size="md">
            {order.prepaid ? 'Prepaid' : 'Cash on delivery'}
          </Badge>
          <Badge
            variant={
              waiting
                ? 'primary'
                : order.status === 'rejected' || order.status === 'cancelled'
                  ? 'neutral'
                  : 'success'
            }
            size="md"
          >
            {STATUS_LABEL[order.status]}
          </Badge>
        </div>
      </header>

      {waiting && (
        <p
          className={`mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
            urgent ? 'bg-accent/10 text-accent' : 'bg-page text-muted'
          }`}
        >
          <Clock3 size={14} />
          {left
            ? `Answer within ${left} - after that Wera accepts it for you`
            : 'Time is up - Wera is accepting this order for you'}
        </p>
      )}

      <div className="mt-3 space-y-1 text-sm">
        <p className="font-semibold text-ink">
          {order.customer.name || 'Customer'}
        </p>
        {order.customer.phone && (
          <p className="flex items-center gap-1.5 text-muted">
            <Phone size={13} />
            {order.customer.phone}
          </p>
        )}
        {order.order_type === 'delivery' && order.customer.address && (
          <p className="flex items-start gap-1.5 text-muted">
            <MapPin size={13} className="mt-0.5 shrink-0" />
            <span>
              {order.customer.address}
              {order.customer.delivery_area ? `, ${order.customer.delivery_area}` : ''}
            </span>
          </p>
        )}
        {(order.instructions || order.customer.address_instructions) && (
          <p className="flex items-start gap-1.5 rounded-md bg-accent/10 px-2 py-1.5 text-accent">
            <StickyNote size={13} className="mt-0.5 shrink-0" />
            <span>
              {[order.instructions, order.customer.address_instructions]
                .filter(Boolean)
                .join(' | ')}
            </span>
          </p>
        )}
        {order.is_train_order && (
          <p className="text-xs font-medium text-accent">
            Train order: add plates, spoons and tissues.
          </p>
        )}
      </div>

      <ul className="mt-3 divide-y divide-line rounded-lg border border-line text-sm">
        {order.items.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className="flex items-start justify-between gap-3 px-3 py-2"
          >
            <span className="min-w-0">
              <span className="font-semibold text-ink tabular-nums">
                {Number(item.qty)} ×
              </span>{' '}
              <span className="text-ink">{item.name}</span>
              {item.note && (
                <span className="block text-xs text-muted">{item.note}</span>
              )}
            </span>
            <span className="shrink-0 text-ink tabular-nums">
              {formatINR(Number(item.line_total), 2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-bold text-ink tabular-nums">
          {formatINR(Number(order.gross_amount), 2)}
        </p>
        {order.order_otp && (
          <span className="rounded-md border border-line bg-page px-2 py-1 text-xs text-muted">
            Order OTP{' '}
            <span className="font-bold tracking-wider text-ink">{order.order_otp}</span>
          </span>
        )}
      </div>

      {waiting ? (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          {!rejecting ? (
            <>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted">
                  Preparation time (minutes)
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {choices.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMinutes(String(value))}
                      aria-pressed={prep === value}
                      className={`inline-flex h-8 min-w-10 cursor-pointer items-center justify-center rounded-md border px-2.5 text-sm font-medium ${
                        prep === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-line bg-card text-ink hover:bg-page'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={MAX_PREP}
                    value={minutes}
                    onChange={(event) => setMinutes(event.target.value)}
                    aria-label="Preparation time in minutes"
                    className="h-8 w-20 rounded-md border border-line bg-card px-2 text-center text-sm text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(order, prep)}
                  disabled={busy || !prepValid}
                  className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Accept{prepValid ? ` · ${prep} min` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-page disabled:opacity-60"
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink">Why are you rejecting it?</p>
              <div role="radiogroup" aria-label="Reason for rejecting" className="space-y-1.5">
                {reasons.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-ink hover:bg-page"
                  >
                    <input
                      type="radio"
                      name={`reason-${order.id}`}
                      checked={reason === item.id}
                      onChange={() => setReason(item.id)}
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => reason !== null && onReject(order, reason)}
                  disabled={busy || reason === null}
                  className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-danger px-4 text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy && <Loader2 size={16} className="animate-spin" />}
                  Reject order
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  disabled={busy}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page disabled:opacity-60"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-1 border-t border-line pt-3 text-sm text-muted">
          {(order.status === 'accepted' || order.status === 'auto_accepted') && (
            <p>
              {order.status === 'auto_accepted'
                ? 'Accepted by Wera after the wait'
                : `Accepted at ${clock(order.accepted_at)}`}
              {order.preparation_time ? ` · ${order.preparation_time} min to prepare` : ''}
            </p>
          )}
          {order.rider.name && (
            <p>
              Rider {order.rider.name}
              {order.rider.number ? ` (${order.rider.number})` : ''}
              {order.rider.status ? ` - ${order.rider.status}` : ''}
            </p>
          )}
          {order.status === 'rejected' && order.rejection_reason && (
            <p>Rejected: {order.rejection_reason}</p>
          )}
          {order.status === 'cancelled' && (
            <p>Cancelled{order.cancel_reason ? `: ${order.cancel_reason}` : ''}</p>
          )}
        </div>
      )}
    </article>
  )
}
