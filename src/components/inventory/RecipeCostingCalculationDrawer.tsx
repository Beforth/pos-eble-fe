import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Lightbulb, X } from 'lucide-react'

interface RecipeMaterial {
  name: string
  qty: string
  unit: string
  price: string
}

interface RecipeCostingCalculationDrawerProps {
  open: boolean
  onClose: () => void
  menuName: string
  sellingPrice: string
  recipeCosting: string
  margin: string
  materials?: RecipeMaterial[]
}

const DEFAULT_MATERIALS: RecipeMaterial[] = [
  { name: 'Jalapeno', qty: '0.000', unit: 'Kg', price: '0.000' },
  { name: 'Sandwich Bread', qty: '0.000', unit: 'Pcs', price: '0.000' },
  { name: 'Veg Patty', qty: '0.000', unit: 'Pcs', price: '0.000' },
  { name: 'Cheese Tikki', qty: '0.000', unit: 'Pcs', price: '0.000' },
  { name: 'Vegetable Sauce', qty: '0.000', unit: 'Kg', price: '0.000' },
]

export function RecipeCostingCalculationDrawer({
  open,
  onClose,
  menuName,
  sellingPrice,
  recipeCosting,
  margin,
  materials = DEFAULT_MATERIALS,
}: RecipeCostingCalculationDrawerProps) {
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

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close calculation"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-calculation-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <h2
            id="recipe-calculation-title"
            className="text-base font-semibold text-ink"
          >
            Recipe Costing Calculation ( {menuName} )
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-xs font-semibold text-ink">
                <tr>
                  <th className="px-3 py-2.5">Raw Material Name</th>
                  <th className="px-3 py-2.5">Qty</th>
                  <th className="px-3 py-2.5">Unit</th>
                  <th className="px-3 py-2.5 text-right">Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr
                    key={material.name}
                    className="border-t border-line bg-card"
                  >
                    <td className="px-3 py-2 text-ink">{material.name}</td>
                    <td className="px-3 py-2 text-ink">{material.qty}</td>
                    <td className="px-3 py-2 text-ink">{material.unit}</td>
                    <td className="px-3 py-2 text-right text-ink">
                      {material.price}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-line bg-secondary/25">
                  <td
                    colSpan={3}
                    className="px-3 py-2.5 font-semibold text-ink"
                  >
                    Recipe Costing (₹)
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-ink">
                    {recipeCosting}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm">
            <span className="font-semibold text-ink">Selling Price (₹)</span>
            <span className="font-semibold text-ink">{sellingPrice}</span>
          </div>

          <div className="rounded-lg border border-line bg-slate-100 px-3 py-3 text-sm">
            <p className="mb-2 font-semibold text-ink">Margin (%)</p>
            <p className="text-muted">
              Formula ={' '}
              <span className="text-ink">
                ((Selling Amount - Recipe Costing) / Selling Amount) x 100
              </span>
            </p>
            <p className="mt-2 font-medium text-ink">
              (({sellingPrice} - {recipeCosting}) / {sellingPrice}) x 100 ={' '}
              {margin} %
            </p>
          </div>

          <div className="flex gap-2.5 rounded-lg border border-secondary/50 bg-secondary/25 px-3 py-3 text-sm text-ink">
            <Lightbulb
              size={18}
              className="mt-0.5 shrink-0 text-accent"
            />
            <p className="leading-relaxed text-muted">
              Selling and raw material prices are excluding GST/Taxes. Also if
              we receive a zero price (in the latest average) for a certain raw
              material, the price added to the raw material master will be
              considered.
            </p>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
