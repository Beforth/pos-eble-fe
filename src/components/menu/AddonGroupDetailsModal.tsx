import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { useMenuChannels } from '../../state/MenuChannelsContext'
import type { AddonGroup } from '../../types/menu'

interface AddonGroupDetailsModalProps {
  open: boolean
  group: AddonGroup | null
  onClose: () => void
}

const CHOICE_LABEL = { veg: 'Veg', 'non-veg': 'Non Veg', egg: 'Egg' } as const

/** "₹40", "₹37.5" - the price as saved, without forced decimals. */
function money(value: number | string): string {
  const n = Number(value)
  return Number.isFinite(n) ? `₹${Number(n.toFixed(2))}` : '—'
}

/** Every add-on of a group with its price on each menu (Base, Dine In, Zomato ...). */
export function AddonGroupDetailsModal({
  open,
  group,
  onClose,
}: AddonGroupDetailsModalProps) {
  const { channels, status } = useMenuChannels()

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

  const sortedChannels = useMemo(
    () =>
      [...channels]
        .filter((channel) => channel.is_active)
        .sort((a, b) => a.position - b.position),
    [channels],
  )

  if (!open || !group) return null

  const channelsPending = status !== 'ready'

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
        aria-labelledby="addon-group-details-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="addon-group-details-title"
            className="min-w-0 truncate text-base font-semibold text-ink"
          >
            {group.department_name} · Addon prices
          </h2>
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 text-xs text-muted">
            Each add-on has its own price on every menu. A dash means it is not
            sold on that menu.
          </p>
          {channelsPending ? (
            <div className="flex items-center justify-center gap-2 rounded-md border border-line py-8 text-sm text-muted">
              {status === 'error' ? null : (
                <Loader2 size={16} className="animate-spin" />
              )}
              {status === 'error' ? 'Unable to load menus' : 'Loading menus...'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-line">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-primary/5 text-ink">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Addon</th>
                    <th className="px-3 py-2 font-semibold">Type</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    {sortedChannels.map((channel) => (
                      <th
                        key={channel.id}
                        className="whitespace-nowrap px-3 py-2 font-semibold"
                      >
                        {channel.channel_label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.addons.length > 0 ? (
                    group.addons.map((addon, index) => (
                      <tr
                        key={addon.id}
                        className={`border-t border-line ${
                          index % 2 === 1 ? 'bg-page/60' : 'bg-card'
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-ink">
                          {addon.name}
                        </td>
                        <td className="px-3 py-2 text-muted">
                          {CHOICE_LABEL[addon.choice] ?? addon.choice}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              addon.is_active
                                ? 'font-medium text-success'
                                : 'text-muted'
                            }
                          >
                            {addon.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {sortedChannels.map((channel) => {
                          const price = addon.area_prices.find(
                            (item) => item.outlet_channel_id === channel.id,
                          )
                          return (
                            <td
                              key={channel.id}
                              className="px-3 py-2 tabular-nums text-ink"
                            >
                              {price ? money(price.price) : '—'}
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3 + sortedChannels.length}
                        className="px-3 py-4 text-center text-sm text-muted"
                      >
                        No add-ons in this group
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
