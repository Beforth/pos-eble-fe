import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'

const DISCOUNT_ON_OPTIONS = [
  'Select',
  'Item',
  'Category',
  'Order',
  'Bill',
] as const

export default function AddDiscount() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [discountOn, setDiscountOn] = useState<(typeof DISCOUNT_ON_OPTIONS)[number]>(
    'Select',
  )

  function goBack() {
    navigate('/menu/discounts')
  }

  const canSave = title.trim().length > 0 && discountOn !== 'Select'

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
              Title <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Discount on <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <select
                value={discountOn}
                onChange={(event) =>
                  setDiscountOn(
                    event.target.value as (typeof DISCOUNT_ON_OPTIONS)[number],
                  )
                }
                className="h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
              >
                {DISCOUNT_ON_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                    disabled={option === 'Select'}
                  >
                    {option === 'Select' ? '' : option}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            <p className="mt-2 text-sm text-primary">
              This is one time configuration you will not able to change later
              on.
            </p>
          </div>
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
              onClick={goBack}
              className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Save Changes
            </button>
          ) : null}
        </div>
      </div>
    </MenuPageShell>
  )
}
