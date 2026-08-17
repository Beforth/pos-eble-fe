import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import {
  buildRecipeIngredients,
  type RecipeIngredient,
} from '../../components/inventory/RecipeViewModal'
import {
  ITEM_RECIPES,
  RECIPE_ITEM_OPTIONS,
  type RecipeRow,
} from '../../mocks/itemRecipesData'
import { RAW_MATERIALS } from '../../mocks/rawMaterialsData'

const MENU_OPTIONS = RECIPE_ITEM_OPTIONS.filter((item) => item !== 'All')
const RAW_MATERIAL_OPTIONS = Array.from(
  new Set(RAW_MATERIALS.map((row) => row.name)),
).slice(0, 80)
const UNITS = ['GM', 'ML', 'pcs', 'Kg', 'Ltr', 'BOX', 'pkt']
const AREA_OPTIONS = ['', 'Kitchen', 'Counter', 'Store']

interface EditableIngredient extends RecipeIngredient {
  id: string
}

function toEditable(rows: RecipeIngredient[]): EditableIngredient[] {
  return rows.map((row, index) => ({
    ...row,
    id: `ing-${index}-${row.name}`,
  }))
}

export default function EditRecipe() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const stateRow = (location.state as { row?: RecipeRow } | null)?.row
  const existing =
    stateRow ?? ITEM_RECIPES.find((row) => row.id === id) ?? null

  const [menuItem, setMenuItem] = useState(existing?.name ?? '')
  const [rows, setRows] = useState<EditableIngredient[]>(() =>
    toEditable(buildRecipeIngredients(existing?.name ?? '')),
  )
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!existing) return
    setMenuItem(existing.name)
    setRows(toEditable(buildRecipeIngredients(existing.name)))
  }, [existing])

  const materialOptions = useMemo(() => {
    const current = rows.map((row) => row.name).filter(Boolean)
    return Array.from(new Set([...RAW_MATERIAL_OPTIONS, ...current]))
  }, [rows])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function updateRow(id: string, patch: Partial<EditableIngredient>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  function addRawMaterial() {
    setRows((prev) => [
      ...prev,
      {
        id: `ing-${Date.now()}`,
        name: '',
        quantity: '',
        unit: 'GM',
        area: '',
      },
    ])
  }

  function removeRow(rowId: string) {
    setRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  function handlePreserve() {
    showToast('Recipe preserved')
  }

  function handleSave() {
    if (!menuItem) {
      setError('Please select a menu item')
      return
    }
    if (rows.some((row) => !row.name || !row.quantity.trim() || !row.unit)) {
      setError('Complete raw material name, quantity, and unit for all rows')
      return
    }
    setError('')
    showToast('Recipe updated')
    window.setTimeout(() => navigate('/inventory/item-recipes'), 900)
  }

  return (
    <InventoryPageShell activeItem="item-recipes">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Edit Recipe</h1>
          <div className="relative z-30 mt-3 max-w-md">
            <SearchableSelect
              label="Select Menu"
              value={menuItem}
              options={MENU_OPTIONS}
              placeholder="Select Item"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={(value) => {
                setMenuItem(value)
                setRows(toEditable(buildRecipeIngredients(value)))
                setError('')
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <OutlineButton onClick={addRawMaterial}>
            <Plus size={15} />
            Add New Raw-Material
          </OutlineButton>
          <OutlineButton variant="gray" onClick={handlePreserve}>
            Preserve
          </OutlineButton>
        </div>
      </div>

      <div className="relative z-20 overflow-visible rounded-xl border border-line bg-card">
        <div className="border-b border-line bg-page px-4 py-2.5">
          <h2 className="text-sm font-semibold text-ink">
            Recipe For {menuItem || 'Selected Item'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page/80 text-xs font-semibold text-ink">
              <tr>
                <th className="px-3 py-2.5">Raw Material Name</th>
                <th className="w-[120px] px-3 py-2.5">Quantity</th>
                <th className="w-[140px] px-3 py-2.5">Unit</th>
                <th className="w-[160px] px-3 py-2.5">Area</th>
                <th className="w-[80px] px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-12 text-center text-sm text-muted"
                  >
                    No raw materials added. Click Add New Raw-Material.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-b-0 ${
                      index % 2 === 1 ? 'bg-page/40' : 'bg-card'
                    }`}
                  >
                    <td className="relative z-10 px-3 py-2">
                      <SearchableSelect
                        value={row.name}
                        options={materialOptions}
                        placeholder="Select raw material"
                        searchPlaceholder="Search"
                        includePlaceholderOption={false}
                        compact
                        dropdownPlacement={
                          index > rows.length - 3 ? 'above' : 'below'
                        }
                        onChange={(value) => updateRow(row.id, { name: value })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.quantity}
                        onChange={(event) =>
                          updateRow(row.id, { quantity: event.target.value })
                        }
                        className="h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="relative z-10 px-3 py-2">
                      <SearchableSelect
                        value={row.unit}
                        options={UNITS}
                        placeholder="Unit"
                        searchPlaceholder="Search"
                        includePlaceholderOption={false}
                        compact
                        dropdownPlacement={
                          index > rows.length - 3 ? 'above' : 'below'
                        }
                        onChange={(value) => updateRow(row.id, { unit: value })}
                      />
                    </td>
                    <td className="relative z-10 px-3 py-2">
                      <SearchableSelect
                        value={row.area}
                        options={AREA_OPTIONS.filter(Boolean)}
                        placeholder="Select Area"
                        searchPlaceholder="Search"
                        includePlaceholderOption
                        compact
                        dropdownPlacement={
                          index > rows.length - 3 ? 'above' : 'below'
                        }
                        onChange={(value) => updateRow(row.id, { area: value })}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        aria-label="Remove raw material"
                        onClick={() => removeRow(row.id)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-primary">{error}</p> : null}

      <div className="sticky bottom-0 z-20 -mx-1 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/inventory/item-recipes')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
      </div>
    </InventoryPageShell>
  )
}
