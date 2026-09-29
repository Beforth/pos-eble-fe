import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Plus, Search, Trash2, X } from 'lucide-react'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type {
  Channel,
  ChannelPriceInput,
  VariationGroup,
  VariationInput,
} from '../../types/menu'
import {
  createVariationGroupApi,
  updateVariationGroupApi,
} from '../../services/menuService'
import { useMenuChannels } from '../../state/MenuChannelsContext'
import { showToast } from '../../utils/toast'

const DEPARTMENT_OPTIONS = [
  'Select',
  'Size',
  'Portion',
  'Quantity',
  'Portion Size',
  'Customisation',
  'Preparation',
] as const

interface VariationModalProps {
  open: boolean
  mode: 'add' | 'edit'
  variation: VariationGroup | null
  outletId: string
  onClose: () => void
  onSave: (variation: VariationGroup) => void
}

function VariationRowPrices({
  areaPrices,
  channels,
  errorChannelIds,
  onPriceChange,
  onClearPriceError,
}: {
  areaPrices: ChannelPriceInput[]
  channels: Channel[]
  errorChannelIds: string[]
  onPriceChange: (
    channelId: string,
    patch: Partial<ChannelPriceInput>,
  ) => void
  onClearPriceError: (channelId: string) => void
}) {
  const sorted = useMemo(
    () => [...channels].sort((a, b) => a.position - b.position),
    [channels],
  )

  if (sorted.length === 0) {
    return (
      <p className="mt-3 text-xs text-muted">No channels configured.</p>
    )
  }

  return (
    <div className="mt-3 overflow-hidden rounded-md border border-line">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-line bg-page">
          <tr>
            <th className="px-3 py-2 text-xs font-semibold text-ink">
              Channel
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-ink">
              Price
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-ink">
              Active
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((channel) => {
            const price = areaPrices.find(
              (item) => item.outlet_channel_id === channel.id,
            )
            return (
              <tr
                key={channel.id}
                className="border-b border-line last:border-b-0"
              >
                <td className="px-3 py-2 font-medium text-ink">
                  {channel.channel_label}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={String(price?.price ?? '')}
                    onChange={(event) => {
                      onPriceChange(channel.id, {
                        price: event.target.value,
                      })
                      onClearPriceError(channel.id)
                    }}
                    className={`h-8 w-24 rounded-md border px-2.5 text-sm outline-none focus:border-primary ${
                      errorChannelIds.includes(channel.id)
                        ? 'border-error'
                        : 'border-line'
                    }`}
                  />
                  {errorChannelIds.includes(channel.id) ? (
                    <p className="mt-1 text-xs text-error">
                      Enter a valid price
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={price?.is_active ?? true}
                    onChange={(event) =>
                      onPriceChange(channel.id, {
                        is_active: event.target.checked,
                      })
                    }
                    className="size-4 cursor-pointer accent-primary"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function VariationModal({
  open,
  mode,
  variation,
  outletId,
  onClose,
  onSave,
}: VariationModalProps) {
  const [name, setName] = useState('')
  const [onlineDisplayName, setOnlineDisplayName] = useState('')
  const [department, setDepartment] = useState('Select')
  const [status, setStatus] = useState(true)
  const [deptOpen, setDeptOpen] = useState(false)
  const [deptQuery, setDeptQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [variationInputs, setVariationInputs] = useState<VariationInput[]>([])
  const [pendingRemove, setPendingRemove] = useState<{ index: number; name: string } | null>(null)
  const [groupNameError, setGroupNameError] = useState(false)
  const [variationNameErrors, setVariationNameErrors] = useState<Set<number>>(
    new Set(),
  )
  const [priceErrorChannels, setPriceErrorChannels] = useState<
    Record<number, string[]>
  >({})
  const { channels } = useMenuChannels()
  const deptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && variation) {
      setName(variation.department_name)
      setOnlineDisplayName(variation.online_display_name)
      setDepartment(
        DEPARTMENT_OPTIONS.includes(variation.department_name as (typeof DEPARTMENT_OPTIONS)[number])
          ? variation.department_name
          : 'Select',
      )
      setStatus(variation.is_active)
      setVariationInputs(
        variation.variations.map((row) => ({
          id: row.id,
          name: row.name,
          online_display_name: row.online_display_name,
          is_active: row.is_active,
          area_prices: row.area_prices.map((price) => ({
            outlet_channel_id: price.outlet_channel_id,
            price: String(price.price),
            is_active: price.is_active,
          })),
        })),
      )
    } else {
      setName('')
      setOnlineDisplayName('')
      setDepartment('Select')
      setStatus(true)
      setVariationInputs([])
    }
    setDeptOpen(false)
    setDeptQuery('')
    setSaving(false)
    setGroupNameError(false)
    setVariationNameErrors(new Set())
    setPriceErrorChannels({})
  }, [open, mode, variation])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (deptOpen) setDeptOpen(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose, deptOpen])

  useEffect(() => {
    if (!deptOpen) {
      setDeptQuery('')
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setDeptOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [deptOpen])

  const filteredDepartments = useMemo(() => {
    const q = deptQuery.trim().toLowerCase()
    if (!q) return DEPARTMENT_OPTIONS
    return DEPARTMENT_OPTIONS.filter((option) =>
      option.toLowerCase().includes(q),
    )
  }, [deptQuery])

  if (!open) return null
  if (mode === 'edit' && !variation) return null

  function updateVariation(index: number, patch: Partial<VariationInput>) {
    setVariationInputs((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    )
  }

  function updateVariationAreaPrice(
    index: number,
    channelId: string,
    patch: Partial<ChannelPriceInput>,
  ) {
    setVariationInputs((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row
        const area_prices = [...(row.area_prices ?? [])]
        const at = area_prices.findIndex(
          (price) => price.outlet_channel_id === channelId,
        )
        if (at >= 0) {
          area_prices[at] = { ...area_prices[at], ...patch }
        } else {
          area_prices.push({
            outlet_channel_id: channelId,
            price: '',
            is_active: true,
            ...patch,
          })
        }
        return { ...row, area_prices }
      }),
    )
  }

  function removeVariation(index: number) {
    setVariationInputs((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    const trimmedName = name.trim()

    if (!trimmedName) {
      setGroupNameError(true)
      showToast('Name is required.')
      return
    }
    setGroupNameError(false)

    const emptyNameIndexes = variationInputs
      .map((row, index) => (row.name.trim() === '' ? index : -1))
      .filter((index) => index >= 0)
    if (emptyNameIndexes.length > 0) {
      setVariationNameErrors(new Set(emptyNameIndexes))
      showToast(`Variation #${emptyNameIndexes[0] + 1} name is required.`)
      return
    }
    setVariationNameErrors(new Set())

    const invalidPriceChannels: Record<number, string[]> = {}
    for (const [index, row] of variationInputs.entries()) {
      for (const price of row.area_prices ?? []) {
        const value = String(price.price).trim()
        if (value === '') continue
        const parsed = Number(value)
        if (Number.isNaN(parsed) || parsed < 0) {
          invalidPriceChannels[index] = [
            ...(invalidPriceChannels[index] ?? []),
            price.outlet_channel_id,
          ]
        }
      }
    }
    if (Object.keys(invalidPriceChannels).length > 0) {
      setPriceErrorChannels(invalidPriceChannels)
      const firstIndex = Number(Object.keys(invalidPriceChannels)[0])
      const channelLabel =
        channels.find(
          (channel) => channel.id === invalidPriceChannels[firstIndex][0],
        )?.channel_label ?? 'Channel'
      showToast(
        `Variation #${firstIndex + 1}: enter a valid price for ${channelLabel}.`,
      )
      return
    }
    setPriceErrorChannels({})

    setSaving(true)
    try {
      const variations = variationInputs.map((row) => ({
        ...(row.id ? { id: row.id } : {}),
        name: row.name.trim(),
        online_display_name: (row.online_display_name ?? '').trim(),
        is_active: row.is_active ?? true,
        area_prices: (row.area_prices ?? [])
          .filter((price) => String(price.price).trim() !== '')
          .map((price) => ({
            outlet_channel_id: price.outlet_channel_id,
            price: Number(price.price),
            is_active: price.is_active ?? true,
          })),
      }))

      const payload = {
        department_name: trimmedName,
        online_display_name: onlineDisplayName.trim(),
        is_active: status,
        variations,
      }

      if (mode === 'edit' && variation) {
        const updated = await updateVariationGroupApi(
          outletId,
          variation.id,
          payload,
        )
        onSave(updated)
      } else {
        const created = await createVariationGroupApi(outletId, payload)
        onSave(created)
      }
      onClose()
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to save variation',
      )
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'add' ? 'Add Variation' : 'Edit Variation'

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variation-modal-title"
        className="relative z-10 w-full max-w-3xl rounded-xl border border-line bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2
            id="variation-modal-title"
            className="text-base font-bold text-ink"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="variation-name"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Name <span className="text-primary">*</span>
              </label>
              <input
                id="variation-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (groupNameError) setGroupNameError(false)
                }}
                className={`h-10 w-full rounded-md border px-3 text-sm text-ink outline-none focus:border-primary ${
                  groupNameError ? 'border-error' : 'border-line'
                }`}
              />
              {groupNameError ? (
                <p className="mt-1 text-xs text-error">Name is required.</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="variation-online-name"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Online Display Name
              </label>
              <input
                id="variation-online-name"
                type="text"
                value={onlineDisplayName}
                onChange={(event) => setOnlineDisplayName(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm text-ink outline-none focus:border-primary"
              />
            </div>

            <div ref={deptRef} className="relative">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Department Name <span className="text-primary">*</span>
              </label>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={deptOpen}
                onClick={() => setDeptOpen((prev) => !prev)}
                className="flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-left text-sm text-ink hover:bg-page"
              >
                <span>{department}</span>
                <ChevronDown
                  size={14}
                  className={`text-muted transition-transform ${deptOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {deptOpen ? (
                <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
                  <div className="border-b border-line p-2">
                    <label className="flex h-9 items-center gap-2 rounded-md border border-line px-2.5">
                      <Search size={14} className="shrink-0 text-muted" />
                      <input
                        type="text"
                        value={deptQuery}
                        onChange={(event) => setDeptQuery(event.target.value)}
                        placeholder="Search"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                      />
                    </label>
                  </div>
                  <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
                    {filteredDepartments.map((option) => {
                      const active = option === department
                      return (
                        <li key={option}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setDepartment(option)
                              setDeptOpen(false)
                            }}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-page ${
                              active
                                ? 'bg-page font-medium text-ink'
                                : 'text-ink'
                            }`}
                          >
                            {option}
                            {active ? (
                              <Check size={14} className="text-success" />
                            ) : (
                              <span className="size-3.5" />
                            )}
                          </button>
                        </li>
                      )
                    })}
                    {filteredDepartments.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-muted">
                        No matches
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={status}
              onChange={(event) => setStatus(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            Status
          </label>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5">
              <label className="text-sm font-medium text-ink">Variations</label>
              <button
                type="button"
                onClick={() =>
                  setVariationInputs((prev) => [
                    ...prev,
                    {
                      name: '',
                      online_display_name: '',
                      is_active: true,
                      area_prices: [],
                    },
                  ])
                }
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-xs font-medium text-primary hover:bg-page"
              >
                <Plus size={13} />
                Add Variation
              </button>
            </div>

            {variationInputs.length === 0 ? (
              <p className="mt-3 rounded-md border border-dashed border-line py-5 text-center text-sm text-muted">
                No variations yet — click “Add Variation” to create options
                (e.g. Regular, Large).
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {variationInputs.map((row, index) => (
                  <div
                    key={row.id ?? `new-${index}`}
                    className="rounded-md border border-line p-3"
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink">
                          Name <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(event) => {
                            updateVariation(index, {
                              name: event.target.value,
                            })
                            setVariationNameErrors((prev) => {
                              const next = new Set(prev)
                              next.delete(index)
                              return next
                            })
                          }}
                          className={`h-9 w-full rounded-md border px-3 text-sm text-ink outline-none focus:border-primary ${
                            variationNameErrors.has(index)
                              ? 'border-error'
                              : 'border-line'
                          }`}
                        />
                        {variationNameErrors.has(index) ? (
                          <p className="mt-1 text-xs text-error">
                            Name is required.
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink">
                          Online Display Name
                        </label>
                        <input
                          type="text"
                          value={row.online_display_name ?? ''}
                          onChange={(event) =>
                            updateVariation(index, {
                              online_display_name: event.target.value,
                            })
                          }
                          className="h-9 w-full rounded-md border border-line px-3 text-sm text-ink outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex items-end pb-1.5">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink">
                          <input
                            type="checkbox"
                            checked={row.is_active ?? true}
                            onChange={(event) =>
                              updateVariation(index, {
                                is_active: event.target.checked,
                              })
                            }
                            className="size-4 cursor-pointer accent-primary"
                          />
                          Active
                        </label>
                      </div>
                      <div className="flex items-end pb-1.5">
                        <button
                          type="button"
                          aria-label={`Remove variation ${row.name || index + 1}`}
                          onClick={() => setPendingRemove({ index, name: row.name })}
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-line text-muted hover:border-error hover:text-error"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <VariationRowPrices
                      areaPrices={row.area_prices ?? []}
                      channels={channels}
                      errorChannelIds={priceErrorChannels[index] ?? []}
                      onPriceChange={(channelId, patch) =>
                        updateVariationAreaPrice(index, channelId, patch)
                      }
                      onClearPriceError={(channelId) =>
                        setPriceErrorChannels((prev) => {
                          const next = { ...prev }
                          const list = (next[index] ?? []).filter(
                            (id) => id !== channelId,
                          )
                          if (list.length > 0) next[index] = list
                          else delete next[index]
                          return next
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        <ConfirmDialog
          open={Boolean(pendingRemove)}
          compact
          title="Remove variation"
          target={pendingRemove?.name?.trim() || undefined}
          message="This variation line will be removed from the group being edited."
          note="Changes reach the menu only after you save — the variation can be re-added."
          confirmLabel="Remove"
          onConfirm={() => {
            if (pendingRemove) removeVariation(pendingRemove.index)
            setPendingRemove(null)
          }}
          onClose={() => setPendingRemove(null)}
        />
      </div>
    </div>
  )
}

/** @deprecated Use VariationModal */
export function EditVariationModal(
  props: Omit<VariationModalProps, 'mode'> & { variation: VariationGroup | null },
) {
  return <VariationModal {...props} mode="edit" />
}