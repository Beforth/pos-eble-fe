import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
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
  getRecipeApi,
  listAllRawMaterialsApi,
  listRecipeMenuItemsApi,
  updateRecipeApi,
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

export default function EditRecipe() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const { units, loadMasters } = useInventoryMasters()
  const [menuItem, setMenuItem] = useState('')
  const [items, setItems] = useState<MenuItemRef[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [rows, setRows] = useState<EditableIngredient[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const quickAdd = useInventoryQuickAdd({
    onRawMaterialCreated: (row) =>
      setRawMaterials((prev) => prependById(prev, row)),
  })

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    if (!encryptedOutletId) return
    void listRecipeMenuItemsApi(encryptedOutletId)
      .then(setItems)
      .catch(() => setItems([]))
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

  useEffect(() => {
    if (!id || !encryptedOutletId) return
    getRecipeApi(encryptedOutletId, id)
      .then((recipe) => {
        setMenuItem(recipe.item_name)
        setRows(
          recipe.lines.map((line, index) => ({
            id: `ing-${index}-${line.raw_material_id}`,
            name: line.raw_material_name,
            quantity: line.qty,
            unit: line.unit_name,
            area: line.area,
          })),
        )
      })
      .catch((err) => {
        showToast(err instanceof ApiError ? err.message : 'Unable to load recipe')
      })
  }, [id, encryptedOutletId])

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

  function handlePreserve() {
    showToast('Recipe preserved')
  }

  async function handleSave() {
    if (!canWrite || !encryptedOutletId || !id) return
    const selected = items.find((item) => item.name === menuItem)
    if (!selected) {
      setError('Please select a menu item')
      return
    }
    if (rows.some((row) => !row.name || !row.quantity.trim() || !row.unit)) {
      setError('Complete raw material name, quantity, and unit for all rows')
      return
    }
    setError('')
    setSaving(true)
    try {
      await updateRecipeApi(encryptedOutletId, id, {
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
      showToast('Recipe updated')
      navigate('/inventory/item-recipes')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save recipe')
    } finally {
      setSaving(false)
    }
  }

  return (
    <InventoryPageShell activeItem="item-recipes">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Edit Recipe</h1>
          <div className="relative z-30 mt-3 max-w-md">
            <SearchableSelect
              label="Select Menu"
              value={menuItem}
              options={items.map((item) => item.name)}
              placeholder="Select Item"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={(value) => {
                setMenuItem(value)
                setError('')
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <OutlineButton onClick={addRawMaterial}>
              <Plus size={15} />
              Add New Raw-Material
            </OutlineButton>
          ) : null}
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
                        onChange={(value) => {
                          const material = rawMaterials.find(
                            (item) => item.name === value,
                          )
                          updateRow(row.id, {
                            name: value,
                            unit: material?.consumption_unit.name ?? row.unit,
                          })
                        }}
                        onAddNew={quickAdd.handler('raw-material', (created) =>
                          updateRow(row.id, {
                            name: created.name,
                            unit: created.consumption_unit.name,
                          }),
                        )}
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
                        options={unitNames}
                        placeholder="Unit"
                        searchPlaceholder="Search"
                        includePlaceholderOption={false}
                        compact
                        dropdownPlacement={
                          index > rows.length - 3 ? 'above' : 'below'
                        }
                        onChange={(value) => updateRow(row.id, { unit: value })}
                        onAddNew={quickAdd.handler('unit', (created) =>
                          updateRow(row.id, { unit: created.name }),
                        )}
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
                      {canWrite ? (
                        <button
                          type="button"
                          aria-label="Remove raw material"
                          onClick={() => removeRow(row.id)}
                          className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : null}
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
        {canWrite ? (
          <PrimaryButton onClick={() => void handleSave()}>
            {saving ? 'Saving…' : 'Save Changes'}
          </PrimaryButton>
        ) : null}
      </div>
      {quickAdd.host}
    </InventoryPageShell>
  )
}
