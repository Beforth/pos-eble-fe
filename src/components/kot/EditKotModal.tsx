import { useEffect, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import type { KotRow, KotStatus } from '../../mocks/kotData'

interface EditLineItem {
  id: string
  name: string
  quantity: number
}

interface EditKotModalProps {
  open: boolean
  kot: KotRow | null
  onClose: () => void
  onSave?: (kot: KotRow) => void
}

function buildLineItems(kot: KotRow): EditLineItem[] {
  const parts = kot.items
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return [{ id: '1', name: 'Item', quantity: 1 }]
  }

  return parts.map((part, index) => {
    const qtyMatch = part.match(/\{(\d+)[^}]*\}/) ?? part.match(/[×x]\s*(\d+)/i)
    const quantity = qtyMatch ? Number(qtyMatch[1]) : 1
    return {
      id: String(index + 1),
      name: part.replace(/\s*[×x]\s*\d+/i, '').trim(),
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    }
  })
}

const STATUS_OPTIONS: KotStatus[] = ['Used In Bill', 'Pending', 'Cancelled']

export function EditKotModal({ open, kot, onClose, onSave }: EditKotModalProps) {
  const [items, setItems] = useState<EditLineItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [status, setStatus] = useState<KotStatus>('Used In Bill')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  useEffect(() => {
    if (open && kot) {
      setItems(buildLineItems(kot))
      setCustomerName(kot.customerName)
      setCustomerPhone(kot.customerPhone)
      setStatus(kot.status)
      setEditingItemId(null)
    }
  }, [open, kot])

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

  function setQuantity(id: string, quantity: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.floor(quantity) || 1) }
          : item,
      ),
    )
  }

  function setItemName(id: string, name: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item)),
    )
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setEditingItemId((current) => (current === id ? null : current))
  }

  function handleSave() {
    const nextItems = items
      .map((item) => item.name.trim())
      .filter(Boolean)
    const itemsText = nextItems.join(', ')
    onSave?.({
      ...kot,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      status,
      items: itemsText || kot.items,
      itemCount: nextItems.length || kot.itemCount,
      modified: true,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close edit KOT"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Edit KOT ${kot.kotId}`}
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">
            Edit KOT #{kot.kotId}
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

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 border-b border-line pb-4 sm:grid-cols-2">
            <label className="text-xs text-muted">
              Customer Name
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="text-xs text-muted">
              Customer Phone
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <div className="text-xs text-muted">
              Order Type
              <p className="mt-1 flex h-9 items-center rounded-lg border border-line bg-page px-2.5 text-sm font-medium uppercase text-ink">
                {kot.orderType}
              </p>
            </div>
            <label className="text-xs text-muted">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as KotStatus)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-2.5 text-sm text-ink outline-none focus:border-primary"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary/5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="w-10 px-2 py-2.5" />
                  <th className="w-10 px-2 py-2.5" />
                  <th className="px-3 py-2.5">Item Name</th>
                  <th className="px-3 py-2.5 text-center">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isEditing = editingItemId === item.id
                  return (
                    <tr key={item.id} className="border-t border-line">
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                          className="flex size-7 items-center justify-center rounded border border-line text-danger hover:bg-page"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          aria-label={
                            isEditing
                              ? `Done editing ${item.name}`
                              : `Edit ${item.name}`
                          }
                          onClick={() =>
                            setEditingItemId(isEditing ? null : item.id)
                          }
                          className={`flex size-7 items-center justify-center rounded border transition-colors ${
                            isEditing
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-line text-muted hover:bg-page hover:text-ink'
                          }`}
                        >
                          <Pencil size={13} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-ink">
                        {isEditing ? (
                          <input
                            autoFocus
                            value={item.name}
                            onChange={(e) =>
                              setItemName(item.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === 'Escape') {
                                setEditingItemId(null)
                              }
                            }}
                            onBlur={() => setEditingItemId(null)}
                            className="h-8 w-full max-w-[280px] rounded border border-primary bg-white px-2 text-sm text-ink outline-none"
                          />
                        ) : (
                          item.name
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            setQuantity(item.id, Number(e.target.value))
                          }
                          className="mx-auto h-8 w-16 rounded border border-line bg-white px-2 text-center text-sm tabular-nums outline-none focus:border-primary"
                        />
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-sm text-muted"
                    >
                      No items in this KOT.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Don&apos;t Save
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  )
}
