import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Receipt,
  Store,
  X,
} from 'lucide-react'
import {
  getOutletSettingsApi,
  getOutletTimingsApi,
  type OutletSummary,
  type OutletTimings,
} from '../../services/outletService'

interface OutletDetailsModalProps {
  outlet: OutletSummary | null
  onClose: () => void
  onEdit: () => void
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Field({
  label,
  value,
  wide = false,
}: {
  label: string
  value?: string | number | null
  wide?: boolean
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd
        className={`mt-0.5 break-words text-sm ${
          value ? 'font-medium text-ink' : 'text-muted'
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

function Chips({ items, empty = '—' }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <span className="text-sm text-muted">{empty}</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-xs font-medium text-primary"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function Card({
  icon,
  title,
  children,
  className = '',
}: {
  icon: ReactNode
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-xl border border-line bg-card p-4 ${className}`}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function ChipField({
  label,
  items,
  wide = false,
}: {
  label: string
  items: string[]
  wide?: boolean
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="mb-1 text-xs font-medium text-muted">{label}</dt>
      <dd>
        <Chips items={items} />
      </dd>
    </div>
  )
}

export function OutletDetailsModal({
  outlet,
  onClose,
  onEdit,
}: OutletDetailsModalProps) {
  const [timings, setTimings] = useState<OutletTimings | null>(null)
  const [paymentTypes, setPaymentTypes] = useState<string[] | null>(null)
  const [failed, setFailed] = useState(false)

  const outletId = outlet?.id ?? null

  useEffect(() => {
    if (!outletId) return
    let cancelled = false
    setTimings(null)
    setPaymentTypes(null)
    setFailed(false)
    Promise.all([
      getOutletTimingsApi(outletId),
      getOutletSettingsApi(outletId, 'payment'),
    ])
      .then(([nextTimings, payment]) => {
        if (cancelled) return
        setTimings(nextTimings)
        const rows = (payment.payment_types ?? []) as {
          name: string
          is_enabled: boolean
        }[]
        setPaymentTypes(rows.filter((row) => row.is_enabled).map((row) => row.name))
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [outletId])

  useEffect(() => {
    if (!outletId) return
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
  }, [outletId, onClose])

  if (!outlet) return null

  const loadingExtras = !failed && (timings === null || paymentTypes === null)
  const address = [outlet.address_line1, outlet.address_line2, outlet.area, outlet.city]
    .filter(Boolean)
    .join(', ')

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="outlet-details-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-page shadow-xl"
      >
        <div className="flex shrink-0 items-start gap-4 border-b border-line bg-card px-5 py-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="outlet-details-title"
              className="truncate text-lg font-bold text-ink"
            >
              {outlet.name}
            </h2>
            <p className="mt-0.5 truncate text-sm text-muted">
              {outlet.alias || address || 'No address added'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {outlet.outlet_type ? (
                <span className="inline-flex h-6 items-center rounded-full bg-page px-2.5 text-xs font-medium text-ink ring-1 ring-line">
                  {outlet.outlet_type}
                </span>
              ) : null}
              <span className="inline-flex h-6 items-center rounded-full bg-page px-2.5 text-xs font-medium text-ink ring-1 ring-line">
                {outlet.open_24x7 ? 'Open 24x7' : 'Set hours'}
              </span>
              {outlet.phone ? (
                <span className="inline-flex h-6 items-center rounded-full bg-page px-2.5 text-xs font-medium text-ink ring-1 ring-line">
                  {outlet.phone}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
            aria-label="Close"
            data-tooltip="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <Card icon={<Store size={15} />} title="Basic Information">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Field label="Outlet Name" value={outlet.name} />
              <Field label="Outlet Alias" value={outlet.alias} />
              <Field label="Phone" value={outlet.phone} />
              <Field label="Email" value={outlet.email} />
              <Field label="Timezone" value={outlet.timezone} />
              <Field label="Seating Capacity" value={outlet.seating_capacity} />
              <ChipField label="Online Channels" items={outlet.online_channels} />
              <ChipField label="Cuisines" items={outlet.cuisines} />
            </dl>
          </Card>

          <Card icon={<MapPin size={15} />} title="Address">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Field label="Address Line 1" value={outlet.address_line1} wide />
              <Field label="Address Line 2" value={outlet.address_line2} wide />
              <Field label="Landmark" value={outlet.landmark} />
              <Field label="Area" value={outlet.area} />
              <Field label="City" value={outlet.city} />
              <Field label="State" value={outlet.state} />
              <Field label="Country" value={outlet.country} />
              <Field label="Zip Code" value={outlet.zip_code} />
              <Field label="Latitude" value={outlet.latitude} />
              <Field label="Longitude" value={outlet.longitude} />
            </dl>
          </Card>

          <Card icon={<Clock size={15} />} title="Timings">
            {loadingExtras ? (
              <div className="flex items-center gap-2 py-3 text-sm text-muted">
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </div>
            ) : failed || !timings ? (
              <p className="text-sm text-muted">Unable to load timings.</p>
            ) : (
              <div className="space-y-3">
                {outlet.open_24x7 ? (
                  <p className="text-sm font-medium text-ink">Open 24 hours, every day.</p>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-line">
                    {DAYS.map((day, index) => {
                      const slots = timings.day_slots[day] ?? []
                      return (
                        <div
                          key={day}
                          className={`flex items-center gap-3 px-3 py-2 text-sm ${
                            index > 0 ? 'border-t border-line' : ''
                          }`}
                        >
                          <span className="w-10 shrink-0 font-semibold text-ink">{day}</span>
                          {slots.length > 0 ? (
                            <span className="flex flex-wrap gap-1.5">
                              {slots.map((slot) => (
                                <span
                                  key={`${slot.from}-${slot.to}`}
                                  className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium tabular-nums text-primary"
                                >
                                  {slot.from} - {slot.to}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="text-muted">Closed</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                <dl>
                  <ChipField label="Holidays" items={timings.holidays} />
                </dl>
              </div>
            )}
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card icon={<CreditCard size={15} />} title="Payment">
              <dl className="space-y-3">
                <Field label="Currency" value={outlet.currency} />
                {failed ? (
                  <Field label="Payment Types" value="Unable to load" />
                ) : paymentTypes === null ? (
                  <Field label="Payment Types" value="Loading..." />
                ) : (
                  <ChipField label="Payment Types" items={paymentTypes} />
                )}
              </dl>
            </Card>

            <Card icon={<Receipt size={15} />} title="Tax & License">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="GSTIN" value={outlet.gstin} />
                <Field label="FSSAI No." value={outlet.fssai_no} />
                <Field label="PAN Number" value={outlet.pan_number} />
                <Field label="Tax Authority" value={outlet.tax_authority} />
              </dl>
            </Card>
          </div>

          <Card icon={<FileText size={15} />} title="Invoice">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Field label="Invoice Prefix" value={outlet.invoice_prefix} />
              <Field label="Starting Number" value={outlet.starting_invoice_number} />
              <Field
                label="Terms & Conditions"
                value={outlet.invoice_terms_conditions}
                wide
              />
            </dl>
          </Card>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-card px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Edit Outlet
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
