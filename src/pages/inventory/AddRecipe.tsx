import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WRITE_PERMISSION,
  createRecipeApi,
  listRecipeMenuItemsApi,
  type MenuItemRef,
} from '../../services/inventoryService'

export default function AddRecipe() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const [menuItem, setMenuItem] = useState('')
  const [items, setItems] = useState<MenuItemRef[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!encryptedOutletId) return
    listRecipeMenuItemsApi(encryptedOutletId)
      .then(setItems)
      .catch((err) => {
        showToast(
          err instanceof ApiError ? err.message : 'Unable to load menu items',
        )
      })
  }, [encryptedOutletId])

  async function handleSave() {
    if (!canWrite || !encryptedOutletId) return
    const selected = items.find((item) => item.name === menuItem)
    if (!selected) {
      setError('Please select a menu item')
      return
    }
    setError('')
    setSaving(true)
    try {
      await createRecipeApi(encryptedOutletId, {
        item_id: selected.id,
        lines: [],
      })
      showToast('Recipe saved')
      navigate('/inventory/item-recipes')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save recipe')
    } finally {
      setSaving(false)
    }
  }

  return (
    <InventoryPageShell activeItem="item-recipes">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Add Recipe</h1>
      </div>

      <div className="relative z-30 mb-4 rounded-xl border border-line bg-card p-4 sm:p-5">
        <div className="max-w-md">
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
            {saving ? 'Saving…' : 'Save Changes'}
          </PrimaryButton>
        ) : null}
      </div>
    </InventoryPageShell>
  )
}
