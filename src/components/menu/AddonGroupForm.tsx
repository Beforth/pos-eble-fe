import { useMemo, useRef, useState } from 'react'
import { Info, Plus, Trash2 } from 'lucide-react'
import { showToast } from '../../utils/toast'
import { useMenuChannels } from '../../state/MenuChannelsContext'
import type {
  AddonChoice,
  AddonGroup,
  AddonGroupPayload,
  AddonInput,
} from '../../types/menu'

const DEFAULT_ROWS = 5
const MAX_QTY = 1000

const CHOICES: Array<{ value: AddonChoice; label: string }> = [
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non Veg' },
  { value: 'egg', label: 'Egg' },
]

const BASE_SLUG = 'base'

interface AddonRow {
  key: number
  id?: string
  name: string
  /** Price typed per menu, keyed by the outlet channel id. Blank = not sold there. */
  prices: Record<string, string>
  sapCode: string
  choice: AddonChoice
  active: boolean
}

interface AddonGroupFormProps {
  /** The group being edited; omit for a new group. */
  initial?: AddonGroup | null
  saving: boolean
  onSubmit: (payload: AddonGroupPayload) => void
  onCancel: () => void
}

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function wholeNumber(value: string): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : Number.NaN
}

/**
 * The rows are built once from the menus (channels) the outlet has, so the form
 * waits for them: building it first would leave the price columns empty.
 */
export function AddonGroupForm(props: AddonGroupFormProps) {
  const { status } = useMenuChannels()
  if (status === 'idle' || status === 'loading') {
    return <p className="p-6 text-sm text-muted">Loading menus…</p>
  }
  return <AddonGroupFormBody {...props} />
}

function AddonGroupFormBody({
  initial,
  saving,
  onSubmit,
  onCancel,
}: AddonGroupFormProps) {
  const { channels } = useMenuChannels()
  // One price column per menu (Base, Dine In, Parcel, Home Delivery, Zomato,
  // Swiggy ...), Base first because it is the add-on's main price.
  const priceChannels = useMemo(
    () =>
      [...channels]
        .filter((channel) => channel.is_active)
        .sort((a, b) => {
          if (a.channel_slug === BASE_SLUG) return -1
          if (b.channel_slug === BASE_SLUG) return 1
          return a.position - b.position
        }),
    [channels],
  )
  const baseChannel =
    priceChannels.find((channel) => channel.channel_slug === BASE_SLUG) ??
    priceChannels[0]

  const nextKey = useRef(0)
  const newRow = (): AddonRow => ({
    key: nextKey.current++,
    name: '',
    prices: baseChannel ? { [baseChannel.id]: '0' } : {},
    sapCode: '',
    choice: 'veg',
    active: true,
  })

  const [departmentName, setDepartmentName] = useState(
    initial?.department_name ?? '',
  )
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    initial?.online_display_name ?? '',
  )
  const [addonMin, setAddonMin] = useState(String(initial?.addon_min ?? 0))
  const [addonMax, setAddonMax] = useState(String(initial?.addon_max ?? 0))
  const [selectionMode, setSelectionMode] = useState(
    initial?.selection_mode ?? 'single',
  )
  const [maxPerAddon, setMaxPerAddon] = useState(
    String(initial?.max_selection_per_addon ?? 1),
  )
  const [showInOnline, setShowInOnline] = useState(
    initial?.show_in_online ?? true,
  )
  const [showInDineinQr, setShowInDineinQr] = useState(
    initial?.show_in_dinein_qr ?? true,
  )
  const [allowOpenQuantity, setAllowOpenQuantity] = useState(
    initial?.allow_open_quantity ?? false,
  )
  const [status, setStatus] = useState(initial?.is_active ?? true)
  // One Price column (the Base menu) unless an add-on already has its own prices
  // on other menus, or the cashier switches the per-menu prices on.
  const [perMenuPrices, setPerMenuPrices] = useState(() =>
    (initial?.addons ?? []).some((addon) =>
      (addon.area_prices ?? []).some(
        (price) =>
          price.outlet_channel_id !== baseChannel?.id &&
          Number(price.price) !== Number(addon.base_price),
      ),
    ),
  )
  const shownChannels =
    perMenuPrices || !baseChannel ? priceChannels : [baseChannel]
  /** The add-on's saved prices as text per menu; Base falls back to `base_price`. */
  function pricesOf(addon: NonNullable<AddonGroup['addons']>[number]) {
    const out: Record<string, string> = {}
    for (const price of addon.area_prices ?? []) {
      out[price.outlet_channel_id] = String(Number(price.price))
    }
    if (baseChannel && out[baseChannel.id] === undefined) {
      out[baseChannel.id] = String(Number(addon.base_price))
    }
    return out
  }

  const [rows, setRows] = useState<AddonRow[]>(() => {
    const existing = (initial?.addons ?? []).map(
      (addon): AddonRow => ({
        key: nextKey.current++,
        id: addon.id,
        name: addon.name,
        prices: pricesOf(addon),
        sapCode: addon.sap_code ?? '',
        choice: addon.choice ?? 'veg',
        active: addon.is_active,
      }),
    )
    const blanks = Math.max(DEFAULT_ROWS - existing.length, 0)
    return [
      ...existing,
      ...Array.from({ length: blanks }, () => newRow()),
    ]
  })

  function patchRow(key: number, patch: Partial<AddonRow>) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    )
  }

  /**
   * Typing a price. Changing Base carries the new value to every other menu that
   * is still blank or equal to the old Base, so the common "same price
   * everywhere" case is one entry; a price set apart on purpose is left alone.
   */
  function setPrice(key: number, channelId: string, value: string) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row
        const prices = { ...row.prices, [channelId]: value }
        if (baseChannel && channelId === baseChannel.id) {
          const oldBase = row.prices[baseChannel.id] ?? ''
          for (const channel of priceChannels) {
            if (channel.id === baseChannel.id) continue
            const current = prices[channel.id] ?? ''
            if (current === '' || current === oldBase) {
              prices[channel.id] = value
            }
          }
        }
        return { ...row, prices }
      }),
    )
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((row) => row.key !== key))
  }

  function handleSubmit() {
    if (!departmentName.trim()) {
      showToast('Please enter a department name')
      return
    }
    const min = wholeNumber(addonMin)
    const max = wholeNumber(addonMax)
    const perAddon = wholeNumber(maxPerAddon)
    if (Number.isNaN(min) || Number.isNaN(max) || min > MAX_QTY || max > MAX_QTY) {
      showToast('Addon Min and Addon Max must be whole numbers')
      return
    }
    if (max > 0 && min > max) {
      showToast('Addon Min cannot be greater than Addon Max')
      return
    }
    if (Number.isNaN(perAddon) || perAddon < 1 || perAddon > MAX_QTY) {
      showToast('Max Selection Per Addon Allowed must be at least 1')
      return
    }

    const addons: AddonInput[] = []
    for (const row of rows) {
      const name = row.name.trim()
      const typed = priceChannels
        .map((channel) => ({
          channel,
          text: (row.prices[channel.id] ?? '').trim(),
        }))
        .filter((entry) => entry.text !== '')
      const untouched =
        !name &&
        !row.sapCode.trim() &&
        typed.every((entry) => Number(entry.text) === 0)
      if (untouched) continue
      if (!name) {
        showToast('Enter a name for every addon row that has a price or code')
        return
      }
      const baseText = baseChannel ? (row.prices[baseChannel.id] ?? '').trim() : ''
      const basePrice = Number(baseText)
      if (baseText === '' || !Number.isFinite(basePrice) || basePrice < 0) {
        showToast(`Enter a valid Base price for ${name}`)
        return
      }
      const area_prices: NonNullable<AddonInput['area_prices']> = []
      for (const entry of typed) {
        const value = Number(entry.text)
        if (!Number.isFinite(value) || value < 0) {
          showToast(
            `Enter a valid ${entry.channel.channel_label} price for ${name}`,
          )
          return
        }
        area_prices.push({
          outlet_channel_id: entry.channel.id,
          price: value,
          is_active: true,
        })
      }
      addons.push({
        ...(row.id ? { id: row.id } : {}),
        name,
        base_price: basePrice,
        sap_code: row.sapCode.trim(),
        choice: row.choice,
        is_active: row.active,
        area_prices,
      })
    }

    onSubmit({
      department_name: departmentName.trim(),
      online_display_name: onlineDisplayName.trim(),
      is_active: status,
      addon_min: min,
      addon_max: max,
      selection_mode: selectionMode,
      max_selection_per_addon: perAddon,
      show_in_online: showInOnline,
      show_in_dinein_qr: showInDineinQr,
      allow_open_quantity: allowOpenQuantity,
      addons,
    })
  }

  const label = 'text-sm font-semibold text-ink'

  return (
    <div>
      <section className="rounded-lg border border-line bg-card">
        <h2 className="border-b border-line px-5 py-4 text-base font-bold text-ink sm:px-6">
          Department Details:
        </h2>

        <div className="grid items-start gap-x-6 gap-y-5 px-5 py-5 sm:px-6 md:grid-cols-[190px_1fr_230px_1fr]">
          <label htmlFor="addon-department" className={`${label} md:pt-2.5`}>
            Department Name <span className="text-primary">*</span>
          </label>
          <input
            id="addon-department"
            type="text"
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
            className={inputClass}
          />
          <label htmlFor="addon-online-name" className={`${label} md:pt-2.5`}>
            Online Display Name
          </label>
          <input
            id="addon-online-name"
            type="text"
            value={onlineDisplayName}
            onChange={(event) => setOnlineDisplayName(event.target.value)}
            className={inputClass}
          />

          <label htmlFor="addon-min" className={`${label} md:pt-2.5`}>
            Addon Min
          </label>
          <input
            id="addon-min"
            type="number"
            min={0}
            value={addonMin}
            onChange={(event) => setAddonMin(event.target.value)}
            className={inputClass}
          />
          <label htmlFor="addon-max" className={`${label} md:pt-2.5`}>
            Addon Max
          </label>
          <div>
            <input
              id="addon-max"
              type="number"
              min={0}
              value={addonMax}
              onChange={(event) => setAddonMax(event.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted">0 means no limit</p>
          </div>

          <label htmlFor="addon-selection" className={`${label} md:pt-2.5`}>
            Addon Item Selection
          </label>
          <div>
            <select
              id="addon-selection"
              value={selectionMode}
              onChange={(event) =>
                setSelectionMode(event.target.value as 'single' | 'multiple')
              }
              className={inputClass}
            >
              <option value="single">Allow Single Selection</option>
              <option value="multiple">Allow Multiple Selection</option>
            </select>
            <p className="mt-1 text-xs text-muted">Used only for POS</p>
          </div>
          <label htmlFor="addon-per-addon" className={`${label} md:pt-2.5`}>
            Max Selection Per Addon Allowed
          </label>
          <div>
            <div className="flex items-center gap-2">
              <input
                id="addon-per-addon"
                type="number"
                min={1}
                value={maxPerAddon}
                onChange={(event) => setMaxPerAddon(event.target.value)}
                className={inputClass}
              />
              <span
                tabIndex={0}
                role="img"
                aria-label="How many times the same addon can be picked"
                data-tooltip="How many times the same addon can be picked"
                className="inline-flex shrink-0 text-muted"
              >
                <Info size={18} />
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">Used only for Zomato</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 pb-5 sm:px-6">
          {(
            [
              ['Show in Online', showInOnline, setShowInOnline],
              ['Show in DineIn QR', showInDineinQr, setShowInDineinQr],
              ['Allow Open Quantity', allowOpenQuantity, setAllowOpenQuantity],
              // A new group is always active; Status only matters once it exists.
              ...(initial ? ([['Status', status, setStatus]] as const) : []),
            ] as const
          ).map(([text, checked, set]) => (
            <label
              key={text}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => set(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              {text}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 sm:px-6">
          <h2 className="text-base font-bold text-ink">Addon Group Item Details</h2>
          {priceChannels.length > 1 ? (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={perMenuPrices}
                onChange={(event) => setPerMenuPrices(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              Set a different price for each menu
            </label>
          ) : null}
        </div>

        <div className="overflow-x-auto px-5 pb-5 sm:px-6">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-primary/5 text-sm font-semibold text-ink">
                <th className="px-3 py-3">
                  Addon Name <span className="text-primary">*</span>
                </th>
                {shownChannels.map((channel) => (
                  <th key={channel.id} className="w-32 px-3 py-3">
                    {perMenuPrices || shownChannels.length > 1
                      ? channel.channel_label
                      : 'Price'}
                    {channel.id === baseChannel?.id ? (
                      <span className="text-primary"> *</span>
                    ) : null}
                  </th>
                ))}
                <th className="w-56 px-3 py-3">Sap Code</th>
                <th className="w-72 px-3 py-3">
                  Attributes <span className="text-primary">*</span>
                </th>
                <th className="w-28 px-3 py-3">Available</th>
                <th className="w-20 px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.key} className="border-t border-line">
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      aria-label={`Addon name ${index + 1}`}
                      value={row.name}
                      onChange={(event) =>
                        patchRow(row.key, { name: event.target.value })
                      }
                      className={inputClass}
                    />
                  </td>
                  {shownChannels.map((channel) => (
                    <td key={channel.id} className="px-3 py-2.5">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="—"
                        aria-label={`${channel.channel_label} price, addon ${index + 1}`}
                        value={row.prices[channel.id] ?? ''}
                        onChange={(event) =>
                          setPrice(row.key, channel.id, event.target.value)
                        }
                        className={inputClass}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      aria-label={`Sap code ${index + 1}`}
                      value={row.sapCode}
                      onChange={(event) =>
                        patchRow(row.key, { sapCode: event.target.value })
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div
                      role="radiogroup"
                      aria-label={`Attribute ${index + 1}`}
                      className="flex items-center gap-4"
                    >
                      {CHOICES.map((choice) => (
                        <label
                          key={choice.value}
                          className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink"
                        >
                          <input
                            type="radio"
                            name={`addon-choice-${row.key}`}
                            checked={row.choice === choice.value}
                            onChange={() =>
                              patchRow(row.key, { choice: choice.value })
                            }
                            className="size-4 cursor-pointer accent-primary"
                          />
                          {choice.label}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      aria-pressed={row.active}
                      onClick={() => patchRow(row.key, { active: !row.active })}
                      className={`inline-flex h-7 cursor-pointer items-center rounded-md px-3 text-xs font-semibold ${
                        row.active
                          ? 'bg-success/10 text-success'
                          : 'bg-page text-muted'
                      }`}
                    >
                      {row.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      aria-label={`Remove addon row ${index + 1}`}
                      data-tooltip="Remove row"
                      onClick={() => removeRow(row.key)}
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, newRow()])}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-primary px-3 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <Plus size={14} />
            Add Addon Row
          </button>
        </div>
      </section>

      {/* Save stays in reach while the page scrolls. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex flex-wrap justify-end gap-2 border-t border-line bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:-mx-5 sm:px-5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
