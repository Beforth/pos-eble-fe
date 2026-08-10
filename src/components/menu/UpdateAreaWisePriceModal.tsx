import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Info, X } from 'lucide-react'
import { brand } from '../../theme/brand'
import type { MenuItemRow } from '../../mocks/menuItemsData'

interface UpdateAreaWisePriceModalProps {
  open: boolean
  item: MenuItemRow | null
  onClose: () => void
  onSave: (itemId: string, price: number, active: boolean) => void
}

export function UpdateAreaWisePriceModal({
  open,
  item,
  onClose,
  onSave,
}: UpdateAreaWisePriceModalProps) {
  const [price, setPrice] = useState('')
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (!open || !item) return
    setPrice(String(item.price))
    setActive(item.available)
  }, [open, item])

  useEffect(() => {
    if (!open) return
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
  }, [open, onClose])

  if (!open || !item) return null

  function handleSave() {
    const parsed = Number(price)
    if (Number.isNaN(parsed) || parsed < 0) return
    onSave(item!.id, parsed, active)
  }

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
        aria-labelledby="update-area-price-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="update-area-price-title"
            className="text-base font-semibold text-ink"
          >
            Update Item
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-4 text-sm font-medium text-ink">{brand.shopName}</p>

          <div className="overflow-hidden rounded-md border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page">
                <tr>
                  <th className="px-3 py-2.5 font-semibold text-ink">
                    Item Name
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-ink">
                    Price <span className="text-primary">*</span>
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-ink">Active</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-3 font-medium text-ink">{item.name}</td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      className="h-9 w-24 rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(event) => setActive(event.target.checked)}
                      className="size-4 cursor-pointer accent-primary"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-primary">
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>
              Area Details Note:- While update Item Price, it will also update
              Item area price.
            </span>
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
