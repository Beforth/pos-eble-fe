import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  prependById,
  useInventoryQuickAdd,
} from '../../components/inventory/InventoryQuickAdd'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WRITE_PERMISSION,
  createRecipeApi,
  listAllRawMaterialsApi,
  listRecipeMenuItemsApi,
  type MenuItemRef,
  type RawMaterial,
} from '../../services/inventoryService'

const AREA_OPTIONS = ['', 'Kitchen', 'Counter', 'Store']

interface EditableIngredient {
  id: string
  name: string
  quantity: string
  unit: string
  area: string
}

export default function AddRecipe() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const { units, loadMasters } = useInventoryMasters()
  const [menuItem, setMenuItem] = useState('')
  const [items, setItems] = useState<MenuItemRef[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [rows, setRows] = useState<EditableIngredient[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingItems, setLoadingItems] = useState(true)

  const quickAdd = useInventoryQuickAdd({
    onRawMaterialCreated: (row) =>
      setRawMaterials((prev) => prependById(prev, row)),
  })

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    if (!encryptedOutletId) return
    setLoadingItems(true)
    void listRecipeMenuItemsApi(encryptedOutletId)
      .then((data) => {
        setItems(data)
      })
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false))

    void listAllRawMaterialsApi(encryptedOutletId)
      .then(setRawMaterials)
      .catch((err) => {
        setRawMaterials([])
        showToast(
          err instanceof ApiError
            ? err.message
            : 'Unable to load raw materials',
        )
      })
  }, [encryptedOutletId])

  const materialOptions = useMemo(() => {
    const current = rows.map((row) => row.name).filter(Boolean)
    return Array.from(
      new Set([...rawMaterials.map((row) => row.name), ...current]),
    )
  }, [rows, rawMaterials])

  const unitNames = units.filter((row) => row.is_active).map((row) => row.name)

  function updateRow(rowId: string, patch: Partial<EditableIngredient>) {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    )
  }

  function addRawMaterial() {
    setRows((prev) => [
      ...prev,
      {
        id: `ing-${Date.now()}`,
        name: '',
        quantity: '',
        unit: unitNames[0] ?? '',
        area: '',
      },
    ])
  }

  function removeRow(rowId: string) {
    setRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  async function handleSave() {
    if (!canWrite || !encryptedOutletId) return
    const selected = items.find((item) => item.name === menuItem)
    if (!selected) {
      setError('Please select a menu item')
      return
    }
    if (rows.length > 0 && rows.some((row) => !row.name || !row.quantity.trim() || !row.unit)) {
      setError('Complete raw material name, quantity, and unit for all rows')
      return
    }
    setError('')
    setSaving(true)
    try {
      await createRecipeApi(encryptedOutletId, {
        item_id: selected.id,
        lines: rows.map((row) => {
          const raw = rawMaterials.find((item) => item.name === row.name)
          const unit = units.find((item) => item.name === row.unit)
          if (!raw || !unit) {
            throw new Error('Select a saved raw material and unit')
          }
          return {
            raw_material_id: raw.id,
            qty: row.quantity,
            unit_id: unit.id,
            area: row.area,
          }
        }),
      })
      showToast('Recipe created successfully')
      navigate('/inventory/item-recipes')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Unable to save recipe')
    } finally {
      setSaving(false)
    }
  }

  return (
    <InventoryPageShell activeItem="item-recipes">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Add Recipe</h1>
      </div>

      {!loadingItems && items.length === 0 ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-start gap-3">
            <UtensilsCrossed size={20} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold">No Menu Items Found</h3>
              <p className="mt-1 text-sm text-amber-800">
                Recipes must be attached to a Menu Item (e.g. Dabeli, Sandwich, Coffee). No menu items exist in this outlet yet.
              </p>
              <button
                type="button"
                onClick={() => navigate('/menu/base-menu')}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-700"
              >
                Go to Menu Management →
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative z-30 mb-4 rounded-xl border border-line bg-card p-4 sm:p-5">
        <div className="max-w-md">
          <SearchableSelect
            label="Select Menu Item"
            value={menuItem}
            options={items.map((item) => item.name)}
            placeholder="Select Menu Item"
            searchPlaceholder="Search menu item"
            includePlaceholderOption={false}
            onChange={(value) => {
              setMenuItem(value)
              setError('')
            }}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Recipe Ingredients</h2>
            <p className="text-xs text-muted">
              Specify the raw materials required per 1 portion of this menu item.
            </p>
          </div>
          <OutlineButton
            type="button"
            onClick={quickAdd.handler('raw-material', (created) =>
              setRawMaterials((prev) => prependById(prev, created)),
            )}
          >
            Add New Raw-Material
          </OutlineButton>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-card">
          <div className="grid grid-cols-[minmax(0,1fr)_120px_130px_140px_48px] gap-2 border-b border-line bg-page px-3 py-2.5 text-xs font-semibold text-muted">
            <span>Raw Material</span>
            <span>Quantity</span>
            <span>Unit</span>
            <span>Kitchen Area</span>
            <span className="text-right">Action</span>
          </div>

          <ul className="divide-y divide-line">
            {rows.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">
                No raw materials added yet. Click &quot;Add Ingredients&quot; below.
              </li>
            ) : (
              rows.map((row) => (
                <li
                  key={row.id}
                  className="grid grid-cols-[minmax(0,1fr)_120px_130px_140px_48px] items-center gap-2 p-3"
                >
                  <SearchableSelect
                    value={row.name}
                    options={materialOptions}
                    placeholder="Select raw material"
                    searchPlaceholder="Search raw material"
                    onChange={(val) => updateRow(row.id, { name: val })}
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                    placeholder="e.g. 0.200"
                    className="h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                  />
                  <SearchableSelect
                    value={row.unit}
                    options={unitNames}
                    placeholder="Unit"
                    searchPlaceholder="Search unit"
                    onChange={(val) => updateRow(row.id, { unit: val })}
                  />
                  <SearchableSelect
                    value={row.area}
                    options={AREA_OPTIONS}
                    placeholder="Area"
                    searchPlaceholder="Search area"
                    onChange={(val) => updateRow(row.id, { area: val })}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="inline-flex size-8 items-center justify-center rounded text-muted hover:bg-page hover:text-primary"
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-line bg-page/50 p-3">
            <OutlineButton type="button" onClick={addRawMaterial}>
              <Plus size={15} />
              Add Ingredients
            </OutlineButton>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-primary">{error}</p> : null}
      </div>

      <div className="sticky bottom-0 z-20 -mx-1 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/inventory/item-recipes')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        {canWrite ? (
          <PrimaryButton onClick={() => void handleSave()}>
            {saving ? 'Saving…' : 'Save Recipe'}
          </PrimaryButton>
        ) : null}
      </div>
    </InventoryPageShell>
  )
}
