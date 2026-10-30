import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { AlertCircle, ArrowDown, ArrowUp, Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { useNavigate } from '../../utils/inventoryRouter'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
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
  deleteRecipeApi,
  listAllRawMaterialsApi,
  listAllRecipesApi,
  listRecipeMenuItemsApi,
  updateRecipeApi,
  type ItemRecipe,
  type MenuItemRef,
  type RawMaterial,
} from '../../services/inventoryService'
import { listItemsApi } from '../../services/menuService'

const AREA_OPTIONS = ['', 'Kitchen', 'Counter', 'Store']

interface EditableIngredient {
  id: string
  name: string
  quantity: string
  unit: string
  area: string
  createdAt: number
}

type SortKey = 'name' | 'quantity' | 'unit' | 'area' | 'order'

export default function AddRecipe() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const { units, loadMasters } = useInventoryMasters()
  const [menuItem, setMenuItem] = useState('')
  const [items, setItems] = useState<MenuItemRef[]>([])
  const [existingRecipes, setExistingRecipes] = useState<ItemRecipe[]>([])
  const [existingRecipe, setExistingRecipe] = useState<ItemRecipe | null>(null)
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [rows, setRows] = useState<EditableIngredient[]>([])
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
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
    Promise.all([
      listRecipeMenuItemsApi(encryptedOutletId).catch(() => []),
      listItemsApi(encryptedOutletId, { page_size: 250 })
        .then((res) => res.results)
        .catch(() => []),
    ])
      .then(([recipeItems, menuItems]) => {
        const mergedMap = new Map<string, MenuItemRef>()
        for (const item of recipeItems) {
          mergedMap.set(item.id, item)
        }
        for (const item of menuItems) {
          if (!mergedMap.has(item.id)) {
            mergedMap.set(item.id, {
              id: item.id,
              name: item.name,
              category_name: item.category_name ?? '',
            })
          }
        }
        setItems(Array.from(mergedMap.values()))
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

    void listAllRecipesApi(encryptedOutletId)
      .then(setExistingRecipes)
      .catch(() => setExistingRecipes([]))
  }, [encryptedOutletId])

  const materialOptions = useMemo(() => {
    const current = rows.map((row) => row.name).filter(Boolean)
    return Array.from(
      new Set([...rawMaterials.map((row) => row.name), ...current]),
    )
  }, [rows, rawMaterials])

  const unitNames = units.filter((row) => row.is_active).map((row) => row.name)

  function handleMenuItemSelect(selectedName: string) {
    setMenuItem(selectedName)
    setError('')
    const matchedItem = items.find((item) => item.name === selectedName)
    if (!matchedItem) {
      setExistingRecipe(null)
      return
    }

    const foundRecipe = existingRecipes.find(
      (r) => r.item_id === matchedItem.id,
    )
    if (foundRecipe) {
      setExistingRecipe(foundRecipe)
      setRows(
        foundRecipe.lines.map((line, idx) => ({
          id: `ing-${line.raw_material_id}-${idx}`,
          name: line.raw_material_name,
          quantity: String(line.qty),
          unit: line.unit_name,
          area: line.area ?? '',
          createdAt: Date.now() + idx,
        })),
      )
    } else {
      setExistingRecipe(null)
      setRows([])
    }
  }

  function updateRow(rowId: string, patch: Partial<EditableIngredient>) {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    )
  }

  function addRawMaterial() {
    setRows((prev) => [
      ...prev,
      {
        id: `ing-${Date.now()}-${Math.random()}`,
        name: '',
        quantity: '',
        unit: unitNames[0] ?? '',
        area: '',
        createdAt: Date.now(),
      },
    ])
  }

  function removeRow(rowId: string) {
    setRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else setSortKey(null)
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((a, b) => {
      let valA: string | number = a[sortKey as keyof EditableIngredient] ?? ''
      let valB: string | number = b[sortKey as keyof EditableIngredient] ?? ''
      if (sortKey === 'quantity') {
        valA = Number(valA) || 0
        valB = Number(valB) || 0
        return sortDir === 'asc' ? valA - valB : valB - valA
      }
      if (sortKey === 'order') {
        valA = a.createdAt
        valB = b.createdAt
        return sortDir === 'asc' ? valA - valB : valB - valA
      }
      const cmp = String(valA).localeCompare(String(valB))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  async function handleSave() {
    if (!canWrite || !encryptedOutletId) return
    const selected = items.find((item) => item.name === menuItem)
    if (!selected) {
      setError('Please select a menu item')
      return
    }
    if (rows.length === 0) {
      setError('Please add at least one ingredient line')
      return
    }
    if (rows.some((row) => !row.name || !row.quantity.trim() || !row.unit)) {
      setError('Complete raw material name, quantity, and unit for all rows')
      return
    }
    setError('')
    setSaving(true)
    try {
      const payload = {
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
      }

      if (existingRecipe) {
        await updateRecipeApi(encryptedOutletId, existingRecipe.id, payload)
        showToast('Recipe updated successfully')
      } else {
        await createRecipeApi(encryptedOutletId, payload)
        showToast('Recipe created successfully')
      }
      navigate('/inventory/item-recipes')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Unable to save recipe',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRecipe() {
    if (!existingRecipe || !encryptedOutletId) return
    setDeleting(true)
    try {
      await deleteRecipeApi(encryptedOutletId, existingRecipe.id)
      showToast(`Recipe for ${menuItem} deleted`)
      setExistingRecipes((prev) =>
        prev.filter((r) => r.id !== existingRecipe.id),
      )
      setExistingRecipe(null)
      setRows([])
      setPendingDelete(false)
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to delete recipe',
      )
    } finally {
      setDeleting(false)
    }
  }

  function renderSortIcon(key: SortKey) {
    if (sortKey !== key) return null
    return sortDir === 'asc' ? (
      <ArrowUp size={13} className="text-primary" />
    ) : (
      <ArrowDown size={13} className="text-primary" />
    )
  }

  return (
    <InventoryPageShell activeItem="item-recipes">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">
          {existingRecipe ? 'Edit Existing Recipe' : 'Add Recipe'}
        </h1>
        {existingRecipe ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Existing Recipe Loaded
          </span>
        ) : null}
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

      {existingRecipe ? (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <h3 className="font-semibold">
                  Recipe for &quot;{menuItem}&quot; Already Exists!
                </h3>
                <p className="mt-1 text-xs text-amber-800">
                  The ingredients for this recipe have been loaded automatically. You can edit the quantities, add/remove ingredients, or delete this recipe below.
                </p>
              </div>
            </div>
            {canWrite ? (
              <button
                type="button"
                onClick={() => setPendingDelete(true)}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete Recipe
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="relative z-30 mb-6 rounded-xl border border-line bg-card p-4 pb-12 sm:p-5">
        <div className="max-w-md">
          <SearchableSelect
            label="Select Menu Item"
            value={menuItem}
            options={items.map((item) => item.name)}
            placeholder="Select Menu Item"
            searchPlaceholder="Search menu item"
            includePlaceholderOption={false}
            onChange={handleMenuItemSelect}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Recipe Ingredients</h2>
            <p className="text-xs text-muted">
              Specify the raw materials required per 1 portion of this menu item.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryButton type="button" onClick={addRawMaterial}>
              <Plus size={15} />
              Add Ingredients
            </PrimaryButton>
            {canWrite ? (
              <OutlineButton
                type="button"
                onClick={() =>
                  quickAdd.open('raw-material', (created) =>
                    setRawMaterials((prev) => prependById(prev, created)),
                  )
                }
              >
                <Plus size={15} />
                Add New Raw-Material
              </OutlineButton>
            ) : null}
          </div>
        </div>

        <div className="mt-4 overflow-visible rounded-xl border border-line bg-card">
          <div className="grid grid-cols-[minmax(0,1fr)_120px_130px_140px_48px] gap-2 border-b border-line bg-page px-3 py-2.5 text-xs font-semibold text-muted">
            <button
              type="button"
              onClick={() => toggleSort('name')}
              className="flex items-center gap-1 text-left font-semibold hover:text-ink"
            >
              <span>Raw Material</span>
              {renderSortIcon('name')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('quantity')}
              className="flex items-center gap-1 text-left font-semibold hover:text-ink"
            >
              <span>Quantity</span>
              {renderSortIcon('quantity')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('unit')}
              className="flex items-center gap-1 text-left font-semibold hover:text-ink"
            >
              <span>Unit</span>
              {renderSortIcon('unit')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('area')}
              className="flex items-center gap-1 text-left font-semibold hover:text-ink"
            >
              <span>Kitchen Area</span>
              {renderSortIcon('area')}
            </button>
            <span className="text-right">Action</span>
          </div>

          <ul className="divide-y divide-line">
            {sortedRows.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">
                No raw materials added yet. Click &quot;Add Ingredients&quot; above or below.
              </li>
            ) : (
              sortedRows.map((row, index) => (
                <li
                  key={row.id}
                  style={{ zIndex: sortedRows.length - index }}
                  className="relative grid grid-cols-[minmax(0,1fr)_120px_130px_140px_48px] items-center gap-2 p-3"
                >
                  <SearchableSelect
                    value={row.name}
                    options={materialOptions}
                    placeholder="Select raw material"
                    searchPlaceholder="Search raw material"
                    dropdownPlacement={index >= sortedRows.length - 2 ? 'above' : 'below'}
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
                    dropdownPlacement={index >= sortedRows.length - 2 ? 'above' : 'below'}
                    onChange={(val) => updateRow(row.id, { unit: val })}
                  />
                  <SearchableSelect
                    value={row.area}
                    options={AREA_OPTIONS}
                    placeholder="Area"
                    searchPlaceholder="Search area"
                    dropdownPlacement={index >= sortedRows.length - 2 ? 'above' : 'below'}
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

          <div className="flex flex-wrap items-center justify-between border-t border-line bg-page/50 p-3">
            <OutlineButton type="button" onClick={addRawMaterial}>
              <Plus size={15} />
              Add Ingredients
            </OutlineButton>
            <span className="text-xs font-medium text-muted">
              Total Ingredients: {rows.length}
            </span>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-primary">{error}</p> : null}

        <div className="sticky bottom-0 z-40 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-5 py-3.5 shadow-lg">
          <div className="text-xs text-muted">
            {existingRecipe ? 'Updating existing recipe' : 'Creating new recipe'}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/inventory/item-recipes')}
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Cancel
            </button>
            {existingRecipe && canWrite ? (
              <button
                type="button"
                onClick={() => setPendingDelete(true)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete Recipe
              </button>
            ) : null}
            {canWrite ? (
              <PrimaryButton onClick={() => void handleSave()}>
                {saving
                  ? 'Saving…'
                  : existingRecipe
                    ? 'Update Recipe'
                    : 'Save Recipe'}
              </PrimaryButton>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={pendingDelete}
        title="Delete Recipe"
        target={menuItem}
        message={`Are you sure you want to delete the recipe for "${menuItem}"?`}
        consequences={[
          'The recipe ingredients will be permanently removed.',
          'Stock consumption for sales of this menu item will stop tracking until a new recipe is created.',
        ]}
        confirmLabel={deleting ? 'Deleting…' : 'Delete Recipe'}
        onConfirm={() => void handleDeleteRecipe()}
        onClose={() => setPendingDelete(false)}
      />

      {quickAdd.host}
    </InventoryPageShell>
  )
}


