import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Plus, Trash2, X } from 'lucide-react'
import type { MenuItemRow } from '../../mocks/menuItemsData'

interface NutrientRow {
  id: string
  label: string
  qty: string
  unit: string
  units: string[]
}

interface DynamicRow {
  id: string
  name: string
  qty: string
}

interface AllergenRow {
  id: string
  allergen: string
  description: string
}

interface UpdateNutritionModalProps {
  open: boolean
  item: MenuItemRow | null
  onClose: () => void
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const INITIAL_NUTRIENTS: Omit<NutrientRow, 'id' | 'qty'>[] = [
  { label: 'FoodAmount / ServingSize', unit: 'G', units: ['G', 'Mg', 'Ml'] },
  { label: 'Calorie Count', unit: 'Kcal', units: ['Kcal', 'Cal'] },
  { label: 'Protein', unit: 'G', units: ['G', 'Mg'] },
  { label: 'Sodium', unit: 'Mg', units: ['Mg', 'G'] },
  { label: 'Carbohydrate', unit: 'G', units: ['G', 'Mg'] },
  { label: 'Total Sugar', unit: 'G', units: ['G', 'Mg'] },
  { label: 'Added Sugar', unit: 'G', units: ['G', 'Mg'] },
  { label: 'Saturated Fat', unit: 'G', units: ['G', 'Mg'] },
  { label: 'Trans Fat', unit: 'G', units: ['G', 'Mg'] },
  { label: 'Cholesterol', unit: 'G', units: ['G', 'Mg'] },
  { label: 'Total Fat', unit: 'G', units: ['G', 'Mg'] },
  { label: 'Fiber', unit: 'G', units: ['G', 'Mg'] },
]

function QtyUnitRow({
  label,
  qty,
  unit,
  units,
  onQty,
  onUnit,
}: {
  label: string
  qty: string
  unit: string
  units: string[]
  onQty: (value: string) => void
  onUnit: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-44 shrink-0 text-sm font-medium text-ink sm:w-52">
        {label} :
      </span>
      <input
        type="text"
        value={qty}
        onChange={(event) => onQty(event.target.value)}
        placeholder="Enter Qty"
        className="h-9 min-w-[120px] flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
      />
      <div className="relative w-24 shrink-0">
        <select
          value={unit}
          onChange={(event) => onUnit(event.target.value)}
          className="h-9 w-full appearance-none rounded-md border border-line bg-card px-2 pr-7 text-sm outline-none focus:border-primary"
        >
          {units.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  )
}

function DynamicGroup({
  title,
  rows,
  onChange,
  onAdd,
  onRemove,
  namePlaceholder = 'Enter Name',
}: {
  title: string
  rows: DynamicRow[]
  onChange: (id: string, patch: Partial<DynamicRow>) => void
  onAdd: () => void
  onRemove: (id: string) => void
  namePlaceholder?: string
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={row.name}
              onChange={(event) =>
                onChange(row.id, { name: event.target.value })
              }
              placeholder={namePlaceholder}
              className="h-9 min-w-[120px] flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
            <input
              type="text"
              value={row.qty}
              onChange={(event) =>
                onChange(row.id, { qty: event.target.value })
              }
              placeholder="Enter Qty"
              className="h-9 w-28 rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
            <span className="w-8 text-center text-sm text-ink">G</span>
            <button
              type="button"
              onClick={() => onRemove(row.id)}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-primary"
              aria-label="Remove"
            >
              <Trash2 size={15} />
            </button>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover"
              aria-label="Add"
            >
              <Plus size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UpdateNutritionModal({
  open,
  item,
  onClose,
}: UpdateNutritionModalProps) {
  const [nutrients, setNutrients] = useState<NutrientRow[]>([])
  const [servingInfo, setServingInfo] = useState('Select Serving Info')
  const [minerals, setMinerals] = useState<DynamicRow[]>([])
  const [vitamins, setVitamins] = useState<DynamicRow[]>([])
  const [additives, setAdditives] = useState<DynamicRow[]>([])
  const [allergens, setAllergens] = useState<AllergenRow[]>([])
  const [info, setInfo] = useState('')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    if (!open) return
    setNutrients(
      INITIAL_NUTRIENTS.map((row) => ({
        ...row,
        id: newId(),
        qty: '',
      })),
    )
    setServingInfo('Select Serving Info')
    setMinerals([{ id: newId(), name: '', qty: '' }])
    setVitamins([{ id: newId(), name: '', qty: '' }])
    setAdditives([{ id: newId(), name: 'Polyols', qty: '' }])
    setAllergens([{ id: newId(), allergen: 'Select Allergen', description: '' }])
    setInfo('')
    setRemark('')
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

  function updateNutrient(id: string, patch: Partial<NutrientRow>) {
    setNutrients((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  function updateDynamic(
    setter: Dispatch<SetStateAction<DynamicRow[]>>,
    id: string,
    patch: Partial<DynamicRow>,
  ) {
    setter((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  function addDynamic(
    setter: Dispatch<SetStateAction<DynamicRow[]>>,
    defaults: Partial<DynamicRow> = {},
  ) {
    setter((prev) => [
      ...prev,
      { id: newId(), name: '', qty: '', ...defaults },
    ])
  }

  function removeDynamic(
    setter: Dispatch<SetStateAction<DynamicRow[]>>,
    id: string,
  ) {
    setter((prev) =>
      prev.length <= 1 ? prev : prev.filter((row) => row.id !== id),
    )
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
        aria-labelledby="update-nutrition-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-line px-5 py-3.5">
          <div>
            <h2
              id="update-nutrition-title"
              className="text-base font-semibold text-ink"
            >
              Update Nutritional Data For &apos;{item.name}&apos;
            </h2>
            <p className="mt-0.5 text-sm text-primary">
              Applicable on Zomato, Swiggy
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {nutrients.map((row) => (
            <QtyUnitRow
              key={row.id}
              label={row.label}
              qty={row.qty}
              unit={row.unit}
              units={row.units}
              onQty={(value) => updateNutrient(row.id, { qty: value })}
              onUnit={(value) => updateNutrient(row.id, { unit: value })}
            />
          ))}

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-44 shrink-0 text-sm font-medium text-ink sm:w-52">
              ServingInfo :
            </span>
            <div className="relative min-w-[200px] flex-1">
              <select
                value={servingInfo}
                onChange={(event) => setServingInfo(event.target.value)}
                className="h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
              >
                <option>Select Serving Info</option>
                <option>Per serving</option>
                <option>Per 100g</option>
                <option>Per plate</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          </div>

          <DynamicGroup
            title="Mineral Details"
            rows={minerals}
            onChange={(id, patch) => updateDynamic(setMinerals, id, patch)}
            onAdd={() => addDynamic(setMinerals)}
            onRemove={(id) => removeDynamic(setMinerals, id)}
          />

          <DynamicGroup
            title="Vitamin Details"
            rows={vitamins}
            onChange={(id, patch) => updateDynamic(setVitamins, id, patch)}
            onAdd={() => addDynamic(setVitamins)}
            onRemove={(id) => removeDynamic(setVitamins, id)}
          />

          <DynamicGroup
            title="Additive Map"
            rows={additives}
            onChange={(id, patch) => updateDynamic(setAdditives, id, patch)}
            onAdd={() => addDynamic(setAdditives, { name: '' })}
            onRemove={(id) => removeDynamic(setAdditives, id)}
          />

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">Allergen</h3>
            <div className="space-y-2">
              {allergens.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[160px] flex-1">
                    <select
                      value={row.allergen}
                      onChange={(event) =>
                        setAllergens((prev) =>
                          prev.map((itemRow) =>
                            itemRow.id === row.id
                              ? { ...itemRow, allergen: event.target.value }
                              : itemRow,
                          ),
                        )
                      }
                      className="h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
                    >
                      <option>Select Allergen</option>
                      <option>Milk</option>
                      <option>Nuts</option>
                      <option>Gluten</option>
                      <option>Soy</option>
                      <option>Egg</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(event) =>
                      setAllergens((prev) =>
                        prev.map((itemRow) =>
                          itemRow.id === row.id
                            ? {
                                ...itemRow,
                                description: event.target.value,
                              }
                            : itemRow,
                        ),
                      )
                    }
                    placeholder="Enter Description"
                    className="h-9 min-w-[160px] flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAllergens((prev) =>
                        prev.length <= 1
                          ? prev
                          : prev.filter((itemRow) => itemRow.id !== row.id),
                      )
                    }
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-primary"
                    aria-label="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAllergens((prev) => [
                        ...prev,
                        {
                          id: newId(),
                          allergen: 'Select Allergen',
                          description: '',
                        },
                      ])
                    }
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover"
                    aria-label="Add"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">
              Additional Info
            </h3>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-16 shrink-0 text-sm font-medium text-ink">
                  Info :
                </span>
                <input
                  type="text"
                  value={info}
                  onChange={(event) => setInfo(event.target.value)}
                  placeholder="Enter Info"
                  className="h-9 min-w-[180px] flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-16 shrink-0 text-sm font-medium text-ink">
                  Remark :
                </span>
                <input
                  type="text"
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  placeholder="Enter Remark"
                  className="h-9 min-w-[180px] flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
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
