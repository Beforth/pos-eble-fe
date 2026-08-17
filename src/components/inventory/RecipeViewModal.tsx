import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface RecipeIngredient {
  name: string
  quantity: string
  unit: string
  area: string
}

interface RecipeViewModalProps {
  open: boolean
  recipeName: string | null
  ingredients: RecipeIngredient[]
  onClose: () => void
}

export function buildRecipeIngredients(recipeName: string): RecipeIngredient[] {
  const presets: Record<string, RecipeIngredient[]> = {
    'Chocolate Sandwich': [
      { name: 'Chocolate Cream', quantity: '50', unit: 'GM', area: '' },
      { name: 'Chocolate Spread', quantity: '30', unit: 'GM', area: '' },
      { name: 'Chocolate Chips', quantity: '15', unit: 'GM', area: '' },
      { name: 'Brioche Bread', quantity: '2', unit: 'pcs', area: '' },
      { name: 'Chocolate Essence', quantity: '5', unit: 'ML', area: '' },
    ],
    'Choclate Sandwich': [
      { name: 'Chocolate Cream', quantity: '50', unit: 'GM', area: '' },
      { name: 'Chocolate Spread', quantity: '30', unit: 'GM', area: '' },
      { name: 'Chocolate Chips', quantity: '15', unit: 'GM', area: '' },
      { name: 'Brioche Bread', quantity: '2', unit: 'pcs', area: '' },
      { name: 'Chocolate Essence', quantity: '5', unit: 'ML', area: '' },
    ],
  }

  if (presets[recipeName]) return presets[recipeName]

  if (recipeName.toLowerCase().includes('chocolate') || recipeName.toLowerCase().includes('choc')) {
    return presets['Chocolate Sandwich']
  }

  return [
    { name: 'Base Ingredient', quantity: '100', unit: 'GM', area: '' },
    { name: 'Seasoning Mix', quantity: '10', unit: 'GM', area: '' },
    { name: 'Oil', quantity: '5', unit: 'ML', area: '' },
  ]
}

export function RecipeViewModal({
  open,
  recipeName,
  ingredients,
  onClose,
}: RecipeViewModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !recipeName) return null

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
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Recipe
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-sm font-medium text-ink">{recipeName}</p>

          <div className="overflow-hidden rounded-lg border border-line">
            <div className="border-b border-line bg-page px-4 py-2.5">
              <h3 className="text-sm font-semibold text-ink">
                Recipe For {recipeName}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line bg-page/80 text-xs font-semibold text-ink">
                  <tr>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Quantity</th>
                    <th className="px-4 py-2.5">Unit</th>
                    <th className="px-4 py-2.5">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-sm text-muted"
                      >
                        No recipe ingredients found
                      </td>
                    </tr>
                  ) : (
                    ingredients.map((row) => (
                      <tr
                        key={`${row.name}-${row.unit}`}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-4 py-2.5 text-ink">{row.name}</td>
                        <td className="px-4 py-2.5 text-ink">{row.quantity}</td>
                        <td className="px-4 py-2.5 text-ink">{row.unit}</td>
                        <td className="px-4 py-2.5 text-muted">
                          {row.area || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
