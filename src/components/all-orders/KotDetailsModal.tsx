import { useEffect } from 'react'
import { PencilLine, X } from 'lucide-react'
import type { AllOrderRow } from '../../mocks/allOrdersData'

interface KotDetailsModalProps {
  open: boolean
  order: AllOrderRow | null
  onClose: () => void
}

function itemCount(items: string): number {
  if (!items.trim()) return 0
  return items.split(',').filter((part) => part.trim()).length
}

export function KotDetailsModal({ open, order, onClose }: KotDetailsModalProps) {
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

  if (!open || !order) return null

  const kotId = 100 + Number(order.orderNo.slice(-3) || order.id)

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
        aria-label={`KOT Details Order No ${order.orderNo}`}
        className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">
            KOT Details [Order No :- {order.orderNo}]
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

        <div className="flex-1 overflow-auto p-5">
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary/5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-3 py-2.5">KOT ID</th>
                  <th className="px-3 py-2.5 text-center">No. Of Items</th>
                  <th className="px-3 py-2.5">Items</th>
                  <th className="px-3 py-2.5">Biller</th>
                  <th className="px-3 py-2.5">Created</th>
                  <th className="px-3 py-2.5">Information</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="px-3 py-3 font-semibold tabular-nums text-ink">
                    {kotId}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-ink">
                    {itemCount(order.items)}
                  </td>
                  <td className="px-3 py-3 text-ink">{order.items}</td>
                  <td className="px-3 py-3 text-ink">Utkarsh Gosavi</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">
                    {order.created}
                  </td>
                  <td className="px-3 py-3 text-muted">--</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            <PencilLine size={14} />
            Modified KOT
          </button>
        </div>
      </div>
    </div>
  )
}
