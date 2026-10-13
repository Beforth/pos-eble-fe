import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Info, Loader2, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useMenuChannels } from '../../state/MenuChannelsContext'
import { updateItemApi } from '../../services/menuService'
import { brand } from '../../theme/brand'
import type {
  Item,
  ChannelPriceInput,
  ItemAvailabilityInput,
} from '../../types/menu'
import { showToast } from '../../utils/toast'

interface UpdateAreaWisePriceModalProps {
  open: boolean
  item: Item | null
  onClose: () => void
  onSaved: () => void
}

export function UpdateAreaWisePriceModal({
  open,
  item,
  onClose,
  onSaved,
}: UpdateAreaWisePriceModalProps) {
  const { channels, status } = useMenuChannels()
  const { encryptedOutletId } = useAuth()
  const [saving, setSaving] = useState(false)

  const sorted = useMemo(
    () => [...channels].sort((a, b) => a.position - b.position),
    [channels],
  )

  const [prices, setPrices] = useState<Record<string, string>>({})
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [available, setAvailable] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open || !item) return
    const p: Record<string, string> = {}
    const a: Record<string, boolean> = {}
    const av: Record<string, boolean> = {}
    for (const c of channels) {
      const areaPrice = item.area_prices.find(
        (ap) => ap.outlet_channel_id === c.id,
      )
      p[c.id] = String(areaPrice?.price ?? item.base_price)
      a[c.id] = areaPrice?.is_active ?? true
      const areaAvail = item.availability.find(
        (av) => av.outlet_channel_id === c.id,
      )
      av[c.id] = areaAvail?.is_available ?? true
    }
    setPrices(p)
    setActive(a)
    setAvailable(av)
  }, [open, item, channels])

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

  async function handleSave() {
    if (!item || !encryptedOutletId) return

    for (const c of sorted) {
      const parsed = Number(prices[c.id])
      if (Number.isNaN(parsed) || parsed < 0) {
        showToast('Please enter a valid non-negative price for every channel')
        return
      }
    }

    const area_prices: ChannelPriceInput[] = sorted.map((c) => ({
      outlet_channel_id: c.id,
      price: Number(prices[c.id]),
      is_active: active[c.id],
    }))
    const availability: ItemAvailabilityInput[] = sorted.map((c) => ({
      outlet_channel_id: c.id,
      is_available: available[c.id],
    }))

    setSaving(true)
    try {
      await updateItemApi(encryptedOutletId, item.id, {
        area_prices,
        availability,
      })
      showToast('Item prices & availability updated successfully')
      onSaved()
      onClose()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update item',
      )
    } finally {
      setSaving(false)
    }
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
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-card shadow-xl"
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
            data-tooltip="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-4 text-sm font-medium text-ink">{brand.shopName}</p>

          {status !== 'ready' || sorted.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-md border border-line py-8 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              {status === 'loading'
                ? 'Loading channels...'
                : status === 'error'
                  ? 'Unable to load channels'
                  : 'No channels configured'}
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-line">
              <div className="max-h-[50vh] overflow-y-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 border-b border-line bg-page">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold text-ink">
                        Channel
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-ink">
                        Price <span className="text-primary">*</span>
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-ink">
                        Active
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-ink">
                        Available
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-3 py-2.5 font-medium text-ink">
                          {c.channel_label}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={prices[c.id] ?? ''}
                            onChange={(event) =>
                              setPrices((prev) => ({
                                ...prev,
                                [c.id]: event.target.value,
                              }))
                            }
                            className="h-9 w-24 rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={active[c.id] ?? true}
                            onChange={(event) =>
                              setActive((prev) => ({
                                ...prev,
                                [c.id]: event.target.checked,
                              }))
                            }
                            className="size-4 cursor-pointer accent-primary"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={available[c.id] ?? true}
                            onChange={(event) =>
                              setAvailable((prev) => ({
                                ...prev,
                                [c.id]: event.target.checked,
                              }))
                            }
                            className="size-4 cursor-pointer accent-primary"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
