import { useRef, useState } from 'react'
import { Info, Plus, Trash2 } from 'lucide-react'
import { showToast } from '../../utils/toast'
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

interface AddonRow {
  key: number
  id?: string
  name: string
  price: string
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

export function AddonGroupForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: AddonGroupFormProps) {
  const nextKey = useRef(0)
  const newRow = (): AddonRow => ({
    key: nextKey.current++,
    name: '',
    price: '0',
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
  const [rows, setRows] = useState<AddonRow[]>(() => {
    const existing = (initial?.addons ?? []).map(
      (addon): AddonRow => ({
        key: nextKey.current++,
        id: addon.id,
        name: addon.name,
        price: String(Number(addon.base_price)),
        sapCode: addon.sap_code ?? '',
        choice: addon.choice ?? 'veg',
        active: addon.is_active,
      }),
    )
    const blanks = Math.max(DEFAULT_ROWS - existing.length, 0)
    return [
      ...existing,
      ...Array.from({ length: blanks }, () => ({
        key: nextKey.current++,
        name: '',
        price: '0',
        sapCode: '',
        choice: 'veg' as AddonChoice,
        active: true,
      })),
    ]
  })

  function patchRow(key: number, patch: Partial<AddonRow>) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
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
      const price = Number(row.price)
      const untouched =
        !name && !row.sapCode.trim() && (row.price === '' || price === 0)
      if (untouched) continue
      if (!name) {
        showToast('Enter a name for every addon row that has a price or code')
        return
      }
      if (row.price.trim() === '' || !Number.isFinite(price) || price < 0) {
        showToast(`Enter a valid price for ${name}`)
        return
      }
      addons.push({
        ...(row.id ? { id: row.id } : {}),
        name,
        base_price: price,
        sap_code: row.sapCode.trim(),
        choice: row.choice,
        is_active: row.active,
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
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-card p-5 sm:p-6">
        <h2 className="mb-5 text-base font-bold text-ink">Department Details:</h2>

        <div className="grid items-start gap-x-6 gap-y-4 md:grid-cols-[170px_1fr_200px_1fr]">
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

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          {(
            [
              ['Show in Online', showInOnline, setShowInOnline],
              ['Show in DineIn QR', showInDineinQr, setShowInDineinQr],
              ['Allow Open Quantity', allowOpenQuantity, setAllowOpenQuantity],
              ['Status', status, setStatus],
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
      </section>

      <section className="rounded-lg border border-line bg-card p-5 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-ink">
          Addon Group Item Details
        </h2>

        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-primary/5 text-sm font-semibold text-ink">
                <th className="px-3 py-3">
                  Addon Name <span className="text-primary">*</span>
                </th>
                <th className="w-36 px-3 py-3">
                  Price <span className="text-primary">*</span>
                </th>
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
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      aria-label={`Addon price ${index + 1}`}
                      value={row.price}
                      onChange={(event) =>
                        patchRow(row.key, { price: event.target.value })
                      }
                      className={inputClass}
                    />
                  </td>
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

        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, newRow()])}
          className="mt-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-primary px-3 text-sm font-medium text-primary hover:bg-primary/5"
        >
          <Plus size={14} />
          Add Addon Row
        </button>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
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
