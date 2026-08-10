import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ChevronDown } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { menuAreas } from '../mocks/menuSectionData'

type TaxKind = 'gst' | 'vat' | 'other'

const TAX_KINDS: {
  id: TaxKind
  title: string
  subtitle: string
}[] = [
  {
    id: 'gst',
    title: 'GST Slab',
    subtitle: 'Recommended for Indian market',
  },
  {
    id: 'vat',
    title: 'VAT',
    subtitle: 'Recommended for global market',
  },
  {
    id: 'other',
    title: 'Other',
    subtitle: 'Custom Taxes (Cess, Corporate Tax...etc)',
  },
]

const AREA_OPTIONS = menuAreas.map((area) => area.name)
const ORDER_TYPES = ['Delivery', 'Pick Up', 'Dine In'] as const

export default function AddTax() {
  const navigate = useNavigate()
  const [kind, setKind] = useState<TaxKind | null>(null)
  const [direction, setDirection] = useState<'Forward' | 'Backward'>('Backward')
  const [title, setTitle] = useState('')
  const [onlineDisplayName, setOnlineDisplayName] = useState('')
  const [areas, setAreas] = useState<Set<string>>(() => new Set(AREA_OPTIONS))
  const [taxValue, setTaxValue] = useState<'Percentage' | 'Fixed'>('Percentage')
  const [amount, setAmount] = useState('')
  const [orderTypes, setOrderTypes] = useState<Set<string>>(
    () => new Set(['Delivery', 'Pick Up']),
  )
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  function goBack() {
    navigate('/menu/taxes')
  }

  function toggleArea(name: string) {
    setAreas((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function toggleOrderType(name: string) {
    setOrderTypes((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <MenuPageShell
      backTo="/menu/taxes"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/taxes" className="text-primary hover:underline">
            Tax Configuration
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Tax</span>
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
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-ink">Add Tax</h2>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {TAX_KINDS.map((option) => {
              const selected = kind === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setKind(option.id)}
                  className={`relative cursor-pointer rounded-lg border px-4 py-4 text-left transition-colors ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-line bg-card hover:border-primary/40 hover:bg-page'
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border ${
                      selected
                        ? 'border-primary bg-primary text-white'
                        : 'border-line bg-card'
                    }`}
                  >
                    {selected ? <Check size={12} strokeWidth={3} /> : null}
                  </span>
                  <p className="pr-7 text-sm font-semibold text-ink">
                    {option.title}
                  </p>
                  <p className="mt-1 pr-7 text-xs leading-relaxed text-muted">
                    {option.subtitle}
                  </p>
                </button>
              )
            })}
          </div>

          <div
            className={`mt-5 min-h-[180px] rounded-lg border border-dashed ${
              kind
                ? 'border-line bg-card p-4 sm:p-5'
                : 'border-primary/20 bg-primary/5'
            }`}
          >
            {kind ? (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Tax Type</p>
                  <div className="flex flex-wrap gap-5">
                    {(['Forward', 'Backward'] as const).map((option) => (
                      <label
                        key={option}
                        className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                      >
                        <input
                          type="radio"
                          name="add-tax-direction"
                          checked={direction === option}
                          onChange={() => setDirection(option)}
                          className="size-4 cursor-pointer accent-primary"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

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
                    Online Display Name
                  </label>
                  <input
                    type="text"
                    value={onlineDisplayName}
                    onChange={(event) =>
                      setOnlineDisplayName(event.target.value)
                    }
                    className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Areas</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {AREA_OPTIONS.map((name) => (
                      <label
                        key={name}
                        className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                      >
                        <input
                          type="checkbox"
                          checked={areas.has(name)}
                          onChange={() => toggleArea(name)}
                          className="size-4 cursor-pointer accent-primary"
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Tax Value</p>
                  <div className="flex flex-wrap gap-5">
                    {(['Percentage', 'Fixed'] as const).map((option) => (
                      <label
                        key={option}
                        className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                      >
                        <input
                          type="radio"
                          name="add-tax-value"
                          checked={taxValue === option}
                          onChange={() => setTaxValue(option)}
                          className="size-4 cursor-pointer accent-primary"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="max-w-xl">
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Amount <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Order Type</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {ORDER_TYPES.map((name) => (
                      <label
                        key={name}
                        className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                      >
                        <input
                          type="checkbox"
                          checked={orderTypes.has(name)}
                          onChange={() => toggleOrderType(name)}
                          className="size-4 cursor-pointer accent-primary"
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as 'Active' | 'Inactive')
                      }
                      className="h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          {kind ? (
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
