import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const inputClass =
  'h-10 w-full max-w-xs rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

const ORDER_TYPES = ['Delivery', 'Pick Up', 'Dine In'] as const

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4 border-b border-line pb-8 last:border-b-0 last:pb-0">
      <div>
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
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
      className={`grid gap-2 sm:grid-cols-[280px_minmax(0,1fr)] sm:gap-4 ${
        align === 'center' ? 'sm:items-center' : 'sm:items-start'
      }`}
    >
      <div className="text-sm font-medium text-ink sm:pt-2">
        {label} {required ? <span className="text-primary">*</span> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function Help({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
}

function CheckRow({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  help?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
      />
      <span>
        <span className="font-medium">{label}</span>
        {help ? <Help>{help}</Help> : null}
      </span>
    </label>
  )
}

export default function CustomerSettings() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [phoneValidationTypes, setPhoneValidationTypes] = useState<string[]>(
    [],
  )
  const [minPhoneLength, setMinPhoneLength] = useState('10')
  const [maxPhoneLength, setMaxPhoneLength] = useState('10')
  const [showCustomerEmail, setShowCustomerEmail] = useState(false)
  const [createBillsWithTaxId, setCreateBillsWithTaxId] = useState(true)
  const [phoneMandatoryOnDue, setPhoneMandatoryOnDue] = useState(true)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function toggleType(value: string) {
    setPhoneValidationTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    )
  }

  function handleSave() {
    const min = Number(minPhoneLength)
    const max = Number(maxPhoneLength)
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max < 1) {
      showToast('Enter valid phone number lengths')
      return
    }
    if (min > max) {
      showToast('Minimum length cannot exceed maximum length')
      return
    }
    showToast('Customer settings saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        The Following Settings Can Be Used To Configure Customer Settings.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-8 p-5 sm:p-6">
          <Section
            title="Customer Settings"
            description="Configure the customer entry on billing screen."
          >
            <FormRow label="Customer phone validation on billing screen" align="start">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ORDER_TYPES.map((type) => (
                  <label
                    key={type}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={phoneValidationTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
              <Help>
                This settings enables validation of phone number of customer.
              </Help>
            </FormRow>

            <FormRow
              label="Minimum length for phone number (in digits)"
              required
            >
              <input
                type="text"
                inputMode="numeric"
                value={minPhoneLength}
                onChange={(event) =>
                  setMinPhoneLength(event.target.value.replace(/[^\d]/g, ''))
                }
                className={inputClass}
              />
            </FormRow>

            <FormRow
              label="Maximum length for phone number (in digits)"
              required
            >
              <input
                type="text"
                inputMode="numeric"
                value={maxPhoneLength}
                onChange={(event) =>
                  setMaxPhoneLength(event.target.value.replace(/[^\d]/g, ''))
                }
                className={inputClass}
              />
            </FormRow>

            <div className="space-y-3">
              <CheckRow
                checked={showCustomerEmail}
                onChange={setShowCustomerEmail}
                label="Show customer email on billing screen"
              />
              <CheckRow
                checked={createBillsWithTaxId}
                onChange={setCreateBillsWithTaxId}
                label="Create bills with the tax authority with the TAX ID number available"
              />
            </div>
          </Section>

          <Section
            title="Due Payment Settings"
            description="Configures the Due Payment module in billing screen."
          >
            <CheckRow
              checked={phoneMandatoryOnDue}
              onChange={setPhoneMandatoryOnDue}
              label="Customer Phone number mandatory when the due payment is selected"
            />
          </Section>
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
