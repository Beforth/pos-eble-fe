import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { useMenuChannels } from '../../state/MenuChannelsContext'
import type { VariationGroup } from '../../types/menu'

interface VariationGroupDetailsModalProps {
  open: boolean
  group: VariationGroup | null
  onClose: () => void
}

function DetailCell({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div className="flex gap-3 border-b border-line px-4 py-2.5 text-sm">
      <span className="w-[42%] shrink-0 font-medium text-ink sm:w-44">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-ink">{value || '—'}</span>
    </div>
  )
}

function StatusText({ active }: { active: boolean }) {
  return (
    <span className={active ? 'font-medium text-success' : 'text-muted'}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export function VariationGroupDetailsModal({
  open,
  group,
  onClose,
}: VariationGroupDetailsModalProps) {
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
    () => [...channels].sort((a, b) => a.position - b.position),
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
        aria-labelledby="variation-group-details-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="variation-group-details-title"
            className="min-w-0 truncate text-base font-semibold text-ink"
          >
            Variation Details
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid sm:grid-cols-2">
            <DetailCell label="Department Name" value={group.department_name} />
            <DetailCell
              label="Online Display Name"
              value={group.online_display_name}
            />
            <DetailCell
              label="Status"
              value={group.is_active ? 'Active' : 'Inactive'}
            />
            <DetailCell label="Rank" value={group.position} />
            <DetailCell label="Variations" value={group.variations.length} />
          </div>

          <div className="border-t border-line px-4 py-3">
            <h3 className="mb-3 text-sm font-semibold text-ink">
              Variation Prices
            </h3>

            {channelsPending ? (
              <div className="flex items-center justify-center gap-2 rounded-md border border-line py-8 text-sm text-muted">
                {status === 'error' ? null : (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {status === 'error'
                  ? 'Unable to load channels'
                  : 'Loading channels...'}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-primary/5 text-ink">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Variation</th>
                      <th className="px-3 py-2 font-semibold">
                        Online Display Name
                      </th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      {sortedChannels.map((channel) => (
                        <th
                          key={channel.id}
                          className="px-3 py-2 font-semibold"
                        >
                          {channel.channel_label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.variations.length > 0 ? (
                      group.variations.map((row, index) => (
                        <tr
                          key={row.id}
                          className={`border-t border-line ${
                            index % 2 === 1 ? 'bg-page/60' : 'bg-card'
                          }`}
                        >
                          <td className="px-3 py-2 font-medium text-ink">
                            {row.name}
                          </td>
                          <td className="px-3 py-2 text-muted">
                            {row.online_display_name || '—'}
                          </td>
                          <td className="px-3 py-2">
                            <StatusText active={row.is_active} />
                          </td>
                          {sortedChannels.map((channel) => {
                            const price = row.area_prices.find(
                              (item) =>
                                item.outlet_channel_id === channel.id,
                            )
                            const channelActive = price?.is_active ?? true
                            return (
                              <td
                                key={channel.id}
                                data-tooltip={
                                  channelActive
                                    ? undefined
                                    : `Inactive for ${channel.channel_label}`
                                }
                                className={`px-3 py-2 tabular-nums ${
                                  channelActive ? 'text-ink' : 'text-muted'
                                }`}
                              >
                                {price?.price ?? '—'}
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
                          No variations configured
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {sortedChannels.length === 0 ? (
              <p className="mt-2 text-xs text-muted">
                No channels configured — only the variation details are shown.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
