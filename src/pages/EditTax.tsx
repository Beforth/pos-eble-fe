import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Info } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { getTaxById, menuAreas } from '../mocks/menuSectionData'

const AREA_OPTIONS = menuAreas.map((area) => area.name)
const ORDER_TYPES = ['Delivery', 'Pick Up', 'Dine In'] as const

export default function EditTax() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const tax = useMemo(() => getTaxById(id), [id])

  const [direction, setDirection] = useState<'Forward' | 'Backward'>(
    tax?.taxType.toLowerCase().includes('forward') ? 'Forward' : 'Backward',
  )
  const [title, setTitle] = useState(tax?.title ?? '')
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    tax?.onlineDisplayName === tax?.title ? '' : (tax?.onlineDisplayName ?? ''),
  )
  const [areas, setAreas] = useState<Set<string>>(
    () => new Set(AREA_OPTIONS),
  )
  const [taxValue, setTaxValue] = useState<'Percentage' | 'Fixed'>(
    tax?.type === 'Fixed' ? 'Fixed' : 'Percentage',
  )
  const [amount, setAmount] = useState(tax?.amount ?? '')
  const [orderTypes, setOrderTypes] = useState<Set<string>>(
    () => new Set(['Delivery', 'Pick Up']),
  )
  const [status, setStatus] = useState(tax?.status ?? 'Active')
  const [coreAmount, setCoreAmount] = useState(false)
  const [sapCode, setSapCode] = useState('')
  const [description, setDescription] = useState('')

  if (!tax) {
    return <Navigate to="/menu/taxes" replace />
  }

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

  const copyNote = `Tax configuration automatically be copied to SGST ${amount || '2.5'} % (${direction.toLowerCase()}).`

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

          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={coreAmount}
                onChange={(event) => setCoreAmount(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              Consider this in core amount calculation
            </label>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-primary">
              Check this box only if you are taking taxes on certain applied
              taxes. Eg: If you want to take 18% service charge on items
              purchase and want to calculate GST on item + service charge than
              mark this box.
            </p>
          </div>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              SAP Code
            </label>
            <input
              type="text"
              value={sapCode}
              onChange={(event) => setSapCode(event.target.value)}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="rounded-md border border-line bg-page/60 p-4 opacity-70">
            <label className="inline-flex cursor-not-allowed items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                disabled
                className="size-4 accent-primary"
              />
              Do not print e-Commerce operators. GST levied on the bills printed.
            </label>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Note: If enabled, the GST amount deducted by e-commerce operators
              will not be included in the invoices generated.
            </p>
          </div>

          <p className="text-sm font-medium text-primary">
            Note: This configuration has been migrated to the marketplace and is
            now available on individual third-party platform.
          </p>
        </div>

        <div className="flex items-start gap-2 border-t border-line bg-primary/5 px-5 py-3 text-sm text-ink sm:px-6">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" />
          <span>
            Tax configuration automatically be copied to{' '}
            <span className="font-semibold">
              SGST {amount || '2.5'} % ({direction.toLowerCase()})
            </span>
            .
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
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
