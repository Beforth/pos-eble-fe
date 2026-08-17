import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { RECIPE_ITEM_OPTIONS } from '../../mocks/itemRecipesData'

const MENU_OPTIONS = RECIPE_ITEM_OPTIONS.filter((item) => item !== 'All')

export default function AddRecipe() {
  const navigate = useNavigate()
  const [menuItem, setMenuItem] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  function handleSave() {
    if (!menuItem) {
      setError('Please select a menu item')
      return
    }
    setError('')
    setToast('Recipe saved')
    window.setTimeout(() => {
      setToast(null)
      navigate('/inventory/item-recipes')
    }, 900)
  }

  return (
    <InventoryPageShell activeItem="item-recipes">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Add Recipe</h1>
      </div>

      <div className="relative z-30 mb-4 rounded-xl border border-line bg-card p-4 sm:p-5">
        <div className="max-w-md">
          <SearchableSelect
            label="Select Menu"
            value={menuItem}
            options={MENU_OPTIONS}
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
        <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
      </div>
    </InventoryPageShell>
  )
}
