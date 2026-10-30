import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { newVariationRow, type VariationRowState } from '../../utils/itemVariationRows'

interface Option {
  id: string
  label: string
}

interface ItemVariationRowsProps {
  variationEnabled: boolean
  onVariationEnabledChange: (enabled: boolean) => void
  considerAddon: boolean
  onConsiderAddonChange: (consider: boolean) => void
  rows: VariationRowState[]
  onRowsChange: (rows: VariationRowState[]) => void
  variationOptions: Option[]
  addonOptions: Option[]
  /** Rows the user tried to save without choosing a variation. */
  showErrors: boolean
  highlight?: boolean
}

const FIELD =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block min-w-0 text-sm font-medium text-ink">
      {label}
      {required ? <span className="text-primary"> *</span> : null}
      <span className="mt-1 block">{children}</span>
    </label>
  )
}

/**
 * The item form's Variation / Add-on block: a Variation switch, a "consider
 * add-ons on item variations" switch, and one row per variation with its own
 * price, container charge, SAP code, profit margin and add-on groups.
 */
export function ItemVariationRows({
  variationEnabled,
  onVariationEnabledChange,
  considerAddon,
  onConsiderAddonChange,
  rows,
  onRowsChange,
  variationOptions,
  addonOptions,
  showErrors,
  highlight,
}: ItemVariationRowsProps) {
  function patch(key: string, change: Partial<VariationRowState>) {
    onRowsChange(rows.map((row) => (row.key === key ? { ...row, ...change } : row)))
  }

  function toggleAddonGroup(row: VariationRowState, groupId: string) {
    patch(row.key, {
      addonGroupIds: row.addonGroupIds.includes(groupId)
        ? row.addonGroupIds.filter((id) => id !== groupId)
        : [...row.addonGroupIds, groupId],
    })
  }

  return (
    <div
      id="item-form-variations"
      className={`rounded-xl border bg-card transition-colors ${
        highlight ? 'border-primary ring-2 ring-primary/30' : 'border-line'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={variationEnabled}
              onChange={(event) => {
                onVariationEnabledChange(event.target.checked)
                if (event.target.checked && rows.length === 0) {
                  onRowsChange([newVariationRow()])
                }
              }}
              className="size-4 accent-primary"
            />
            Variation
          </label>
          {variationEnabled ? (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={considerAddon}
                onChange={(event) => onConsiderAddonChange(event.target.checked)}
                className="size-4 accent-primary"
              />
              Consider Addon on Item Variations
            </label>
          ) : null}
        </div>
        {variationEnabled ? (
          <button
            type="button"
            onClick={() => onRowsChange([...rows, newVariationRow()])}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={14} />
            Add Variation
          </button>
        ) : null}
      </div>

      {variationEnabled ? (
        <div className="space-y-4 p-4">
          {variationOptions.length === 0 ? (
            <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              There are no variations to choose from yet. A variation group needs its
              variations (Regular, Large …) added first: open{' '}
              <Link to="/menu/variants" className="font-semibold underline">
                Menu &gt; Variants
              </Link>
              , edit a group and add them there.
            </p>
          ) : null}
          {rows.length === 0 ? (
            <p className="rounded-md border border-dashed border-line py-6 text-center text-sm text-muted">
              No variation yet. Click Add Variation to add one.
            </p>
          ) : null}
          {rows.map((row, index) => {
            const taken = new Set(
              rows.filter((other) => other.key !== row.key).map((other) => other.variationId),
            )
            const missing = showErrors && !row.variationId
            return (
              <div key={row.key} className="rounded-lg border border-line bg-page/40 p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
                  <Field label="Variation" required>
                    <select
                      value={row.variationId}
                      onChange={(event) => patch(row.key, { variationId: event.target.value })}
                      aria-invalid={missing}
                      className={`${FIELD} ${missing ? 'border-primary' : ''}`}
                    >
                      <option value="">Select variation</option>
                      {variationOptions
                        .filter((option) => option.id === row.variationId || !taken.has(option.id))
                        .map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                    {missing ? (
                      <span className="mt-1 block text-xs text-primary">Choose a variation.</span>
                    ) : null}
                  </Field>
                  <Field label="Price">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.price}
                      onChange={(event) => patch(row.key, { price: event.target.value })}
                      placeholder="Menu price"
                      className={FIELD}
                    />
                  </Field>
                  <Field label="Container Charges">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.containerCharge}
                      onChange={(event) => patch(row.key, { containerCharge: event.target.value })}
                      className={FIELD}
                    />
                  </Field>
                  <Field label="Sap Code">
                    <input
                      type="text"
                      value={row.sapCode}
                      onChange={(event) => patch(row.key, { sapCode: event.target.value })}
                      className={FIELD}
                    />
                  </Field>
                  <Field label="Profit Margin (%)">
                    <input
                      type="number"
                      step="0.01"
                      value={row.profitMargin}
                      onChange={(event) => patch(row.key, { profitMargin: event.target.value })}
                      className={FIELD}
                    />
                  </Field>
                  <div className="flex items-end">
                    <button
                      type="button"
                      aria-label={`Remove variation ${index + 1}`}
                      data-tooltip={`Remove variation ${index + 1}`}
                      onClick={() => onRowsChange(rows.filter((other) => other.key !== row.key))}
                      className="inline-flex size-10 items-center justify-center rounded-md border border-line text-muted hover:border-primary hover:text-primary"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {considerAddon ? (
                  <div className="mt-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                      <input
                        type="checkbox"
                        checked={row.allowAddon}
                        onChange={(event) =>
                          patch(row.key, {
                            allowAddon: event.target.checked,
                            ...(event.target.checked ? {} : { addonGroupIds: [] }),
                          })
                        }
                        className="size-4 accent-primary"
                      />
                      Allow Addon
                    </label>
                    {row.allowAddon ? (
                      <div className="mt-3 rounded-lg border border-line bg-card">
                        <p className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">
                          Addon Group
                        </p>
                        {addonOptions.length === 0 ? (
                          <p className="px-4 py-4 text-sm text-muted">
                            No add-on groups yet. Create them under Menu &gt; Addons first.
                          </p>
                        ) : (
                          <ul className="grid gap-x-6 gap-y-2 px-4 py-3 sm:grid-cols-2">
                            {addonOptions.map((option) => (
                              <li key={option.id}>
                                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                                  <input
                                    type="checkbox"
                                    checked={row.addonGroupIds.includes(option.id)}
                                    onChange={() => toggleAddonGroup(row, option.id)}
                                    className="size-4 accent-primary"
                                  />
                                  {option.label}
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
