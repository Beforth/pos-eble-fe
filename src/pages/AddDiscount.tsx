import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { useAuth } from '../auth/AuthContext'
import { showToast } from '../utils/toast'
import { createDiscountApi } from '../services/menuService'

export default function AddDiscount() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [name, setName] = useState('')
  const [discountType, setDiscountType] = useState<
    'Percentage' | 'Fixed'
  >('Percentage')
  const [value, setValue] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)

  function goBack() {
    navigate('/menu/discounts')
  }

  const canSave = name.trim().length > 0

  async function handleSave() {
    if (!name.trim()) {
      showToast('Name is required')
      return
    }
    if (!encryptedOutletId) {
      showToast('No active outlet selected')
      return
    }
    setSaving(true)
    try {
      await createDiscountApi(encryptedOutletId, {
        name: name.trim(),
        discount_type: discountType,
        value: value.trim(),
        max_amount: maxAmount.trim() ? maxAmount.trim() : null,
        is_active: active,
      })
      showToast('Discount created')
      window.setTimeout(goBack, 700)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save discount',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <MenuPageShell
      backTo="/menu/discounts"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/discounts" className="text-primary hover:underline">
            Discount Configuration
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Discount</span>
        </span>
      }
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-card">
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Discount Type <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <select
                value={discountType}
                onChange={(event) =>
                  setDiscountType(
                    event.target.value as 'Percentage' | 'Fixed',
                  )
                }
                className="h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          </div>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Value <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
            <p className="mt-2 text-sm text-muted">
              {discountType === 'Percentage'
                ? 'Enter percentage value (e.g. 10 for 10%).'
                : 'Enter a fixed amount.'}
            </p>
          </div>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Max Amount
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={maxAmount}
              onChange={(event) => setMaxAmount(event.target.value)}
              placeholder="Leave blank for no limit"
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            Active
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-page/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          {canSave ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save Changes
            </button>
          ) : null}
        </div>
      </div>
    </MenuPageShell>
  )
}