import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Loader2, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { updateItemApi } from '../../services/menuService'
import { showToast } from '../../utils/toast'
import type { Item, ItemPayload } from '../../types/menu'

interface UpdateNutritionModalProps {
  open: boolean
  item: Item | null
  onClose: () => void
  onSaved: () => void
}

const STOCK_STATUS_OPTIONS = ['Do Not Track', 'In Stock', 'Out of Stock']

export function UpdateNutritionModal({
  open,
  item,
  onClose,
  onSaved,
}: UpdateNutritionModalProps) {
  const { encryptedOutletId } = useAuth()
  const [saving, setSaving] = useState(false)
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [itemUnit, setItemUnit] = useState('')
  const [stockStatus, setStockStatus] = useState('Do Not Track')
  const [sapCode, setSapCode] = useState('')
  const [hsnCode, setHsnCode] = useState('')
  const [fsnCode, setFsnCode] = useState('')
  const [profitMargin, setProfitMargin] = useState('')
  const [weight, setWeight] = useState('')

  useEffect(() => {
    if (!open || !item) return
    setDescription(item.description ?? '')
    setLongDescription(item.long_description ?? '')
    setItemUnit(item.item_unit ?? '')
    setStockStatus(item.stock_status || 'Do Not Track')
    setSapCode(item.sap_code ?? '')
    setHsnCode(item.hsn_code ?? '')
    setFsnCode(item.fsn_code ?? '')
    setProfitMargin(item.profit_margin == null ? '' : String(item.profit_margin))
    setWeight(item.weight == null ? '' : String(item.weight))
    setSaving(false)
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

  async function handleSave() {
    if (!item || !encryptedOutletId) return

    const payload: Partial<ItemPayload> = {
      description: description.trim(),
      long_description: longDescription.trim(),
      item_unit: itemUnit.trim(),
      stock_status: stockStatus,
      sap_code: sapCode.trim(),
      hsn_code: hsnCode.trim(),
      fsn_code: fsnCode.trim(),
      profit_margin: profitMargin.trim() === '' ? null : Number(profitMargin),
      weight: weight.trim() === '' ? null : Number(weight),
    }

    setSaving(true)
    try {
      await updateItemApi(encryptedOutletId, item.id, payload)
      showToast('Item nutrition & info updated successfully')
      onSaved()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update item')
    } finally {
      setSaving(false)
    }
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
            data-tooltip="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Item Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter item description"
                rows={2}
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Long Description
              </label>
              <textarea
                value={longDescription}
                onChange={(event) => setLongDescription(event.target.value)}
                placeholder="Enter long description"
                rows={3}
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Item Unit
                </label>
                <input
                  type="text"
                  value={itemUnit}
                  onChange={(event) => setItemUnit(event.target.value)}
                  placeholder="Enter item unit"
                  className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Stock Status
                </label>
                <div className="relative">
                  <select
                    value={stockStatus}
                    onChange={(event) => setStockStatus(event.target.value)}
                    className="h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
                  >
                    {STOCK_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  SAP Code
                </label>
                <input
                  type="text"
                  value={sapCode}
                  onChange={(event) => setSapCode(event.target.value)}
                  placeholder="Enter SAP code"
                  className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  HSN Code
                </label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(event) => setHsnCode(event.target.value)}
                  placeholder="Enter HSN code"
                  className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  FSN Code
                </label>
                <input
                  type="text"
                  value={fsnCode}
                  onChange={(event) => setFsnCode(event.target.value)}
                  placeholder="Enter FSN code"
                  className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Profit Margin (%)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={profitMargin}
                  onChange={(event) => setProfitMargin(event.target.value)}
                  placeholder="Enter profit margin"
                  className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Weight (In grams/ml)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="Enter weight"
                  className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
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
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}