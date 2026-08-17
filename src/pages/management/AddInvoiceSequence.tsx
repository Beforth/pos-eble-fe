import { useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const SEQUENCE_TYPES = [
  'Group Wise',
  'Order Type Wise',
  'Virtual Brand Wise',
] as const

type SequenceType = (typeof SEQUENCE_TYPES)[number]

const ORDER_TYPE_OPTIONS = [
  'Dine In',
  'Delivery',
  'Takeaway',
  'Online',
] as const

const VIRTUAL_BRAND_OPTIONS = [
  'Main Brand',
  'Cloud Kitchen',
  'Partner Brand',
] as const

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function RequiredMark() {
  return <span className="text-primary">*</span>
}

function FormRow({
  label,
  required,
  children,
  align = 'start',
}: {
  label: string
  required?: boolean
  children: ReactNode
  align?: 'start' | 'center'
}) {
  return (
    <div
      className={`grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4 ${
        align === 'center' ? 'sm:items-center' : 'sm:items-start'
      }`}
    >
      <label className="text-sm font-medium text-ink sm:pt-2.5">
        {label} {required ? <RequiredMark /> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function padExampleNumber(length: number) {
  const safe = Math.max(1, Math.min(length || 2, 8))
  return '2'.padStart(safe, '0')
}

function resolveTokens(value: string, year = 2018, month = 1, day = 1) {
  const yy = String(year).slice(-2)
  const yyyy = String(year)
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return value
    .replaceAll('{yyyy}', yyyy)
    .replaceAll('{yy}', yy)
    .replaceAll('{mm}', mm)
    .replaceAll('{dd}', dd)
}

export default function AddInvoiceSequence() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [invoiceId, setInvoiceId] = useState('')
  const [name, setName] = useState('')
  const [prefix, setPrefix] = useState('')
  const [numberLength, setNumberLength] = useState('')
  const [suffix, setSuffix] = useState('')
  const [sequenceType, setSequenceType] =
    useState<SequenceType>('Group Wise')
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [active, setActive] = useState(true)

  const groups: string[] = []

  const liveExample = useMemo(() => {
    const length = Number(numberLength) || 2
    const mid = padExampleNumber(length)
    const p = resolveTokens(prefix.trim() || '{yy}/ABC')
    const s = resolveTokens(suffix.trim() || '2')
    return `${p}${mid}/${s}`
  }, [prefix, numberLength, suffix])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet/invoice-sequence')
  }

  function toggleInList(
    list: string[],
    value: string,
    setter: (next: string[]) => void,
  ) {
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value],
    )
  }

  function handleSave() {
    if (!invoiceId.trim() || !name.trim()) {
      showToast('Invoice Id and Name are required')
      return
    }
    if (sequenceType === 'Group Wise' && groups.length === 0) {
      showToast('Please add atleast one group to add into this.')
      return
    }
    if (
      sequenceType === 'Order Type Wise' &&
      selectedOrderTypes.length === 0
    ) {
      showToast('Please select atleast one order type')
      return
    }
    if (
      sequenceType === 'Virtual Brand Wise' &&
      selectedBrands.length === 0
    ) {
      showToast('Please select atleast one virtual brand')
      return
    }
    showToast('Invoice sequence saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title="Add Invoice Sequence"
      activeItem="config-outlet"
      actions={
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-6 p-5 sm:p-6">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">
              Provide Below Invoice Sequence Details
            </h2>
          </div>

          <FormRow label="Invoice Id" required>
            <input
              type="text"
              value={invoiceId}
              onChange={(event) => setInvoiceId(event.target.value)}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="Name" required>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="Invoice Structure" align="start">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium text-ink">
                  Prefix
                  <input
                    type="text"
                    value={prefix}
                    onChange={(event) => setPrefix(event.target.value)}
                    placeholder="{yy}/ABC"
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Number Length
                  <input
                    type="text"
                    inputMode="numeric"
                    value={numberLength}
                    onChange={(event) =>
                      setNumberLength(
                        event.target.value.replace(/[^\d]/g, ''),
                      )
                    }
                    placeholder="2"
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Suffix
                  <input
                    type="text"
                    value={suffix}
                    onChange={(event) => setSuffix(event.target.value)}
                    placeholder="2"
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
              </div>

              <div className="rounded-lg border border-line bg-page/60 px-3 py-3 text-xs leading-relaxed text-muted">
                <p>
                  Use these placeholders in Prefix / Suffix:{' '}
                  <span className="font-medium text-ink">{'{yy}'}</span> Current
                  year in 2 digits (Ex. 18),{' '}
                  <span className="font-medium text-ink">{'{yyyy}'}</span>{' '}
                  Current year in 4 digits (Ex. 2018),{' '}
                  <span className="font-medium text-ink">{'{mm}'}</span> Current
                  month (Ex. 01),{' '}
                  <span className="font-medium text-ink">{'{dd}'}</span> Current
                  day (Ex. 01).
                </p>
                <p className="mt-2">
                  Ex. If Prefix ={' '}
                  <span className="font-medium text-ink">{'{yy}/ABC'}</span>,
                  Number Length ={' '}
                  <span className="font-medium text-ink">2</span>, Suffix ={' '}
                  <span className="font-medium text-ink">2</span> then Invoice
                  will generate like{' '}
                  <span className="font-semibold text-primary">
                    {prefix || numberLength || suffix
                      ? liveExample
                      : '18/ABC02/2'}
                  </span>
                  .
                </p>
              </div>
            </div>
          </FormRow>

          <FormRow label="Sequence Type" align="start">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {SEQUENCE_TYPES.map((type) => (
                <label
                  key={type}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="sequence-type"
                    checked={sequenceType === type}
                    onChange={() => setSequenceType(type)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {type}
                </label>
              ))}
            </div>
          </FormRow>

          {sequenceType === 'Group Wise' ? (
            <FormRow label="Group" required align="start">
              {groups.length === 0 ? (
                <p className="pt-2 text-sm font-medium text-primary">
                  Please add atleast one group to add into this.
                </p>
              ) : (
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {groups.map((group) => (
                    <label
                      key={group}
                      className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer accent-primary"
                      />
                      {group}
                    </label>
                  ))}
                </div>
              )}
            </FormRow>
          ) : null}

          {sequenceType === 'Order Type Wise' ? (
            <FormRow label="Order Type" required align="start">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ORDER_TYPE_OPTIONS.map((type) => (
                  <label
                    key={type}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrderTypes.includes(type)}
                      onChange={() =>
                        toggleInList(
                          selectedOrderTypes,
                          type,
                          setSelectedOrderTypes,
                        )
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </FormRow>
          ) : null}

          {sequenceType === 'Virtual Brand Wise' ? (
            <FormRow label="Virtual Brand" required align="start">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {VIRTUAL_BRAND_OPTIONS.map((brand) => (
                  <label
                    key={brand}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() =>
                        toggleInList(selectedBrands, brand, setSelectedBrands)
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </FormRow>
          ) : null}

          <FormRow label="Active" align="center">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
              aria-label="Active"
            />
          </FormRow>
        </div>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-line bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
