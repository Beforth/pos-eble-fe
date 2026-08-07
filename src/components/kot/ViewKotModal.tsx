import { useEffect, useMemo, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { KotRow } from '../../mocks/kotData'

interface ViewKotModalProps {
  open: boolean
  kot: KotRow | null
  onClose: () => void
}

interface KotItemRow {
  id: string
  name: string
  specialNote: string
  quantity: number
  status: string
  preparationTime: string
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-ink">{label}:</p>
      <div className="mt-0.5 text-sm text-muted">{children}</div>
    </div>
  )
}

function buildKotItems(kot: KotRow): KotItemRow[] {
  const parts = kot.items
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return [
      {
        id: '1',
        name: '—',
        specialNote: '--',
        quantity: kot.itemCount || 1,
        status: kot.status === 'Cancelled' ? 'Cancelled' : 'Not Prepared',
        preparationTime: '-',
      },
    ]
  }

  return parts.map((part, index) => {
    const qtyMatch =
      part.match(/\{(\d+)[^}]*\}/) ?? part.match(/[×x]\s*(\d+)/i)
    const quantity = qtyMatch ? Number(qtyMatch[1]) : 1
    const name = part.replace(/\s*[×x]\s*\d+/i, '').trim()

    let status = 'Not Prepared'
    if (kot.status === 'Used In Bill') status = 'Prepared'
    if (kot.status === 'Cancelled') status = 'Cancelled'
    if (kot.status === 'Pending') status = 'Not Prepared'

    return {
      id: String(index + 1),
      name,
      specialNote: '--',
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      status,
      preparationTime: kot.completeDuration !== '--' ? kot.completeDuration : '-',
    }
  })
}

export function ViewKotModal({ open, kot, onClose }: ViewKotModalProps) {
  const items = useMemo(() => (kot ? buildKotItems(kot) : []), [kot])

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

  if (!open || !kot) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close KOT details"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`KOT Details ${kot.kotId}`}
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">KOT Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-line pb-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="KOT ID">
              <span className="font-semibold tabular-nums text-ink">
                {kot.kotId}
              </span>
            </Field>
            <Field label="Billing User">Utkarsh</Field>
            <Field label="Customer Name">
              {kot.customerName || ''}
            </Field>

            <Field label="Customer Phone">
              {kot.customerPhone || ''}
            </Field>
            <Field label="Customer Address"></Field>
            <Field label="Customer Locality">-</Field>

            <Field label="Order Type">
              <span className="uppercase">{kot.orderType}</span>
            </Field>
            <Field label="No. of Persons">-</Field>
            <Field label="Created">{kot.created}</Field>
          </div>

          <h3 className="mb-2 mt-5 text-sm font-bold text-ink">KOT Items</h3>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary/5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-3 py-2.5">Item Name</th>
                  <th className="px-3 py-2.5">Special Note</th>
                  <th className="px-3 py-2.5 text-center">Quantity</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Preparation Time</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-t border-line ${
                      index % 2 === 1 ? 'bg-page/50' : 'bg-white'
                    }`}
                  >
                    <td className="px-3 py-3 text-ink">{item.name}</td>
                    <td className="px-3 py-3 text-muted">{item.specialNote}</td>
                    <td className="px-3 py-3 text-center tabular-nums text-ink">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 text-ink">{item.status}</td>
                    <td className="px-3 py-3 text-muted">{item.preparationTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
