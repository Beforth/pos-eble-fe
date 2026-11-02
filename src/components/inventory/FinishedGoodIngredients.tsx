import { Plus, Trash2 } from 'lucide-react'
import { SearchableSelect } from './SearchableSelect'
import type {
  FinishedGoodLinePayload,
  InventoryUnit,
  RawMaterial,
} from '../../services/inventoryService'

export interface IngredientRow {
  key: string
  rawMaterial: string
  qty: string
  unit: string
}

export function newIngredientRow(
  partial: Partial<IngredientRow> = {},
): IngredientRow {
  return {
    key: `row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    rawMaterial: '',
    qty: '',
    unit: '',
    ...partial,
  }
}

/** Turn the editable rows into API lines, or say what is wrong with them. */
export function buildIngredientLines(
  rows: IngredientRow[],
  materials: RawMaterial[],
  units: InventoryUnit[],
): { lines: FinishedGoodLinePayload[]; error: string } {
  const lines: FinishedGoodLinePayload[] = []
  for (const row of rows) {
    if (!row.rawMaterial && !row.qty) continue
    const raw = materials.find(
      (item) => item.name.toLowerCase() === row.rawMaterial.trim().toLowerCase(),
    )
    const unit = units.find(
      (item) => item.name.toLowerCase() === row.unit.trim().toLowerCase(),
    )
    if (!raw) return { lines: [], error: 'Choose a raw material on every row.' }
    if (!(Number(row.qty) > 0)) {
      return { lines: [], error: `Enter a quantity for ${raw.name}.` }
    }
    if (!unit) return { lines: [], error: `Choose a unit for ${raw.name}.` }
    lines.push({ raw_material_id: raw.id, qty: row.qty, unit_id: unit.id })
  }
  return { lines, error: '' }
}

export function FinishedGoodIngredients({
  rows,
  onChange,
  materials,
  units,
  excludeName,
  disabled = false,
}: {
  rows: IngredientRow[]
  onChange: (rows: IngredientRow[]) => void
  materials: RawMaterial[]
  units: InventoryUnit[]
  /** The item being made; it cannot be its own ingredient. */
  excludeName?: string
  disabled?: boolean
}) {
  const materialNames = materials
    .filter((item) => !item.is_finished_good && item.name !== excludeName)
    .map((item) => item.name)

  /**
   * Units a row may use: the raw material's own consumption unit (the default)
   * and, when set, the purchase unit it is converted from (e.g. bag -> gm).
   * Nothing else converts, so nothing else is offered.
   */
  function unitOptionsFor(row: IngredientRow): string[] {
    const raw = materials.find((item) => item.name === row.rawMaterial)
    if (!raw) return []
    const names = [raw.consumption_unit.name]
    const bulk = raw.conversion_purchase_unit?.name
    if (bulk && !names.includes(bulk)) names.push(bulk)
    return names.filter((name) => units.some((unit) => unit.name === name))
  }

  function update(key: string, patch: Partial<IngredientRow>) {
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function pickMaterial(key: string, name: string) {
    const raw = materials.find((item) => item.name === name)
    update(key, {
      rawMaterial: name,
      unit: raw?.consumption_unit.name ?? '',
    })
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
          No raw materials added yet.
        </p>
      ) : (
        <div className="hidden grid-cols-[1fr_120px_140px_36px] gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
          <span>Raw material</span>
          <span>Quantity</span>
          <span>Unit</span>
          <span />
        </div>
      )}
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid items-center gap-2 sm:grid-cols-[1fr_120px_140px_36px]"
        >
          <SearchableSelect
            value={row.rawMaterial}
            options={materialNames}
            placeholder="Select raw material"
            disabled={disabled}
            onChange={(name) => pickMaterial(row.key, name)}
          />
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={row.qty}
            disabled={disabled}
            onChange={(event) => update(row.key, { qty: event.target.value })}
            placeholder="Qty"
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary disabled:bg-page"
          />
          <SearchableSelect
            value={row.unit}
            options={unitOptionsFor(row)}
            placeholder={row.rawMaterial ? 'Unit' : 'Pick material first'}
            disabled={disabled || !row.rawMaterial}
            onChange={(name) => update(row.key, { unit: name })}
          />
          {disabled ? (
            <span />
          ) : (
            <button
              type="button"
              aria-label="Remove row"
              data-tooltip="Remove row"
              onClick={() => onChange(rows.filter((item) => item.key !== row.key))}
              className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-primary"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ))}
      {disabled ? null : (
        <button
          type="button"
          onClick={() => onChange([...rows, newIngredientRow()])}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Plus size={15} />
          Add raw material
        </button>
      )}
    </div>
  )
}
