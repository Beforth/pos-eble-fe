import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { SelectDropdown, type SelectDropdownOption } from '../components/common/SelectDropdown'
import { createTaxApi } from '../services/menuService'
import type { TaxPayload } from '../types/menu'
import { useAuth } from '../auth/AuthContext'
import { showToast } from '../utils/toast'

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

/** GST buckets the printed bill groups by (Tax.tax_category). */
const GST_CATEGORIES = ['CGST', 'SGST', 'IGST', 'UTGST', 'CESS']

export default function AddTax() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [kind, setKind] = useState<TaxKind | null>(null)
  const [direction, setDirection] = useState<'Forward' | 'Backward'>('Backward')
  const [title, setTitle] = useState('')
  const [onlineDisplayName, setOnlineDisplayName] = useState('')
  const [taxCategory, setTaxCategory] = useState('CGST')
  const [taxValue, setTaxValue] = useState<'Percentage' | 'Fixed'>('Percentage')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')
  const [saving, setSaving] = useState(false)

  const categoryOptions = useMemo<SelectDropdownOption[]>(
    () => [
      ...GST_CATEGORIES.map((value) => ({ value, label: value })),
      { value: '', label: 'No category' },
    ],
    [],
  )

  const statusOptions = useMemo<SelectDropdownOption[]>(
    () => [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ],
    [],
  )

  function goBack() {
    navigate('/menu/taxes')
  }

  async function handleSave() {
    if (!encryptedOutletId) return
    if (!title.trim()) {
      showToast('Tax title is required')
      return
    }
    setSaving(true)
    try {
      const payload: TaxPayload = {
        title,
        online_display_name: onlineDisplayName,
        tax_type: direction === 'Forward' ? 'Forward Tax' : 'Backward Tax',
        // The boolean is authoritative: tax_type is only the human label, and
        // the POS reads this to know whether the slab is added on top of the
        // price or already inside it.
        backward_printing: direction === 'Backward',
        tax_category: kind === 'gst' ? taxCategory : '',
        type: taxValue,
        amount,
        is_active: status === 'Active',
      }
      await createTaxApi(encryptedOutletId, payload)
      showToast('Tax created successfully')
      navigate('/menu/taxes')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save tax')
    } finally {
      setSaving(false)
    }
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

                {kind === 'gst' ? (
                  <div className="max-w-xs">
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      GST Category
                    </label>
                    <SelectDropdown
                      value={taxCategory}
                      options={categoryOptions}
                      onChange={setTaxCategory}
                      caption="Select GST category"
                    />
                    <p className="mt-1.5 text-xs text-muted">
                      Printed bills list one line per category, so CGST and SGST
                      are set up as two taxes.
                    </p>
                  </div>
                ) : null}

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

                <div className="max-w-xs">
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Status
                  </label>
                  <SelectDropdown
                    value={status}
                    options={statusOptions}
                    onChange={(value) =>
                      setStatus(value as 'Active' | 'Inactive')
                    }
                    caption="Select status"
                  />
                  <p className="mt-1.5 text-xs text-muted">
                    An inactive tax is configured but never priced on a bill.
                  </p>
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
              onClick={() => void handleSave()}
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