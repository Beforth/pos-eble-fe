import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  SelectDropdown,
  type SelectDropdownOption,
} from '../components/common/SelectDropdown'
import { getTaxApi, updateTaxApi } from '../services/menuService'
import type { TaxPayload } from '../types/menu'
import { useAuth } from '../auth/AuthContext'
import { showToast } from '../utils/toast'

/** GST buckets the printed bill groups by (Tax.tax_category). */
const GST_CATEGORIES = ['CGST', 'SGST', 'IGST', 'UTGST', 'CESS']

export default function EditTax() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()

  const [direction, setDirection] = useState<'Forward' | 'Backward'>('Backward')
  const [title, setTitle] = useState('')
  const [onlineDisplayName, setOnlineDisplayName] = useState('')
  const [taxCategory, setTaxCategory] = useState('')
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

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId || !id) return
    getTaxApi(encryptedOutletId, id)
      .then((row) => {
        if (cancelled) return
        setTitle(row.title)
        setOnlineDisplayName(row.online_display_name)
        setTaxCategory(row.tax_category ?? '')
        // backward_printing is the authoritative flag; tax_type is only a
        // human label, so it is the fallback for rows predating the boolean.
        setDirection(
          row.backward_printing === true
            ? 'Backward'
            : row.backward_printing === false
              ? 'Forward'
              : row.tax_type.toLowerCase().includes('backward')
                ? 'Backward'
                : 'Forward',
        )
        setTaxValue(row.type === 'Fixed' ? 'Fixed' : 'Percentage')
        setAmount(String(row.amount))
        setStatus(row.is_active ? 'Active' : 'Inactive')
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load tax',
          )
          navigate('/menu/taxes', { replace: true })
        }
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, id, navigate])

  function goBack() {
    navigate('/menu/taxes')
  }

  async function handleSave() {
    if (!encryptedOutletId || !id) return
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
        // Kept in sync with the label because the POS prices off the boolean.
        backward_printing: direction === 'Backward',
        tax_category: taxCategory,
        type: taxValue,
        amount,
        is_active: status === 'Active',
      }
      await updateTaxApi(encryptedOutletId, id, payload)
      showToast('Tax updated successfully')
      navigate('/menu/taxes')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save tax')
    } finally {
      setSaving(false)
    }
  }

  const copyNote = `This tax is applied to every item it is assigned to. ${
    direction === 'Backward'
      ? 'Backward (tax-inclusive) tax is already inside the item price, so it is reported on the bill but not added again.'
      : 'Forward tax is added on top of the item price when the bill is totalled.'
  }`

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
          <span className="font-semibold text-ink">Edit Tax</span>
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

      <div className="mb-4 flex items-start gap-2 rounded-md border border-secondary/40 bg-secondary/20 px-4 py-3 text-sm text-ink">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>{copyNote}</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-card">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-ink">Edit Tax</h2>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
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
                    name="tax-direction"
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
              onChange={(event) => setOnlineDisplayName(event.target.value)}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

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
              Printed bills list one line per category, so CGST and SGST are
              set up as two taxes.
            </p>
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
                    name="tax-value"
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
              onChange={(value) => setStatus(value as 'Active' | 'Inactive')}
              caption="Select status"
            />
            <p className="mt-1.5 text-xs text-muted">
              An inactive tax is configured but never priced on a bill.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 border-t border-line bg-primary/5 px-5 py-3 text-sm text-ink sm:px-6">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" />
          <span>
            This tax prints on the bill as{' '}
            <span className="font-semibold">
              {taxCategory || title} {amount || '0'}
              {taxValue === 'Percentage' ? ' %' : ''} ({direction.toLowerCase()}
              )
            </span>
            . Add a second tax for the matching GST bucket (e.g. SGST alongside
            CGST) — each is priced and printed on its own line.
          </span>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}