import { useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const CURRENCY_OPTIONS = [
  'India rupee - INR - ₹',
  'US Dollar - USD - $',
  'Euro - EUR - €',
  'UAE Dirham - AED - د.إ',
  'British Pound - GBP - £',
]

const DEFAULT_PAYMENT_TYPES = [
  'Not Paid',
  'Cash',
  'Card',
  'Due',
  'UPI',
  'Part Payment',
  'Other',
] as const

const UPI_PROVIDER_OPTIONS = [
  'Select UPI Provider',
  'UPI',
  'HDFC UPI',
  'PhonePe',
  'Google Pay',
  'Paytm',
  'BharatPe',
  'Other',
]

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
const selectClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function HelpText({ children }: { children: string }) {
  return (
    <p className="mt-1.5 text-xs leading-relaxed text-primary/90">{children}</p>
  )
}

function MutedHelp({ children }: { children: string }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-line pb-3">
      <h2 className="text-base font-bold text-ink">{title}</h2>
    </div>
  )
}

function FormRow({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-4">
      <label className="text-sm font-medium text-ink sm:pt-2.5">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function ToggleChip({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-success/30 bg-success/10 text-ink'
          : 'border-line bg-page text-muted'
      }`}
    >
      <span
        className={`inline-flex size-4 items-center justify-center rounded-full ${
          active ? 'bg-success text-white' : 'bg-line text-transparent'
        }`}
      >
        <Check size={10} strokeWidth={3} />
      </span>
      {label}
    </button>
  )
}

export default function OutletPayment() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0])

  const [paymentTypeDraft, setPaymentTypeDraft] = useState('')
  const [paymentTypes, setPaymentTypes] = useState<string[]>([
    ...DEFAULT_PAYMENT_TYPES,
  ])
  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>({
    'Not Paid': true,
    Cash: true,
    Card: true,
    Due: true,
    UPI: true,
    'Part Payment': true,
    Other: true,
  })

  const [upiSubTypes, setUpiSubTypes] = useState<Record<string, boolean>>({
    UPI: true,
    'HDFC UPI': true,
  })

  const [cardOptionDraft, setCardOptionDraft] = useState('')
  const [cardOptions, setCardOptions] = useState<string[]>([])
  const [enabledCards, setEnabledCards] = useState<Record<string, boolean>>({})

  const [upiProvider, setUpiProvider] = useState(UPI_PROVIDER_OPTIONS[0])
  const [upiCustomName, setUpiCustomName] = useState('')
  const [upiProviders, setUpiProviders] = useState<
    { id: string; provider: string; customName: string }[]
  >([])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function togglePaymentType(type: string) {
    setEnabledTypes((prev) => {
      const nextActive = !prev[type]
      const next = { ...prev, [type]: nextActive }
      if (type === 'Cash' && !nextActive) {
        next['Part Payment'] = false
      }
      return next
    })
  }

  function addPaymentType() {
    const name = paymentTypeDraft.trim()
    if (!name) {
      showToast('Enter a payment type')
      return
    }
    if (paymentTypes.some((t) => t.toLowerCase() === name.toLowerCase())) {
      showToast('Payment type already exists')
      return
    }
    setPaymentTypes((prev) => [...prev, name])
    setEnabledTypes((prev) => ({ ...prev, [name]: true }))
    setPaymentTypeDraft('')
  }

  function addCardOption() {
    const name = cardOptionDraft.trim()
    if (!name) {
      showToast('Enter a card option')
      return
    }
    if (cardOptions.some((t) => t.toLowerCase() === name.toLowerCase())) {
      showToast('Card option already exists')
      return
    }
    setCardOptions((prev) => [...prev, name])
    setEnabledCards((prev) => ({ ...prev, [name]: true }))
    setCardOptionDraft('')
  }

  function addUpiProvider() {
    if (upiProvider === 'Select UPI Provider') {
      showToast('Select a UPI provider')
      return
    }
    const custom = upiCustomName.trim() || upiProvider
    if (
      upiProviders.some(
        (row) =>
          row.provider === upiProvider &&
          row.customName.toLowerCase() === custom.toLowerCase(),
      )
    ) {
      showToast('UPI provider already added')
      return
    }
    setUpiProviders((prev) => [
      ...prev,
      {
        id: `upi-${Date.now()}`,
        provider: upiProvider,
        customName: custom,
      },
    ])
    setUpiSubTypes((prev) => ({ ...prev, [custom]: true }))
    setUpiProvider(UPI_PROVIDER_OPTIONS[0])
    setUpiCustomName('')
  }

  function handleSave() {
    if (!currency) {
      showToast('Currency is required')
      return
    }
    showToast('Payment settings saved')
    window.setTimeout(goBack, 700)
  }

  const upiChipLabels = [
    ...Object.keys(upiSubTypes),
    ...upiProviders
      .map((row) => row.customName)
      .filter((name) => !(name in upiSubTypes)),
  ]
  const uniqueUpiChips = [...new Set(upiChipLabels)]

  return (
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-8 p-5 sm:p-6">
          <section className="space-y-5">
            <SectionTitle title="Payment Information" />
            <FormRow label="Currency" required>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className={selectClass}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <HelpText>
                Choose Currency for your outlet. Based on the same, every amount
                will be displayed along with the currency chosen on Dashboard
                &amp; POS bill and reports.
              </HelpText>
            </FormRow>
          </section>

          <section className="space-y-4">
            <FormRow label="Payment Types">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={paymentTypeDraft}
                    onChange={(event) => setPaymentTypeDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addPaymentType()
                      }
                    }}
                    className={`${inputClass} max-w-md flex-1`}
                    placeholder="Enter payment type"
                  />
                  <PrimaryButton onClick={addPaymentType}>Add</PrimaryButton>
                </div>
                <MutedHelp>
                  Select Payment Type to add on POS in Other section of Payment.
                </MutedHelp>

                <div className="flex flex-wrap gap-2 pt-1">
                  {paymentTypes.map((type) => (
                    <ToggleChip
                      key={type}
                      label={type}
                      active={Boolean(enabledTypes[type])}
                      onToggle={() => togglePaymentType(type)}
                    />
                  ))}
                </div>

                {enabledTypes.UPI ? (
                  <div className="flex flex-wrap gap-2 border-l-2 border-line pl-3">
                    {uniqueUpiChips.map((label) => (
                      <ToggleChip
                        key={label}
                        label={label}
                        active={Boolean(upiSubTypes[label])}
                        onToggle={() =>
                          setUpiSubTypes((prev) => ({
                            ...prev,
                            [label]: !prev[label],
                          }))
                        }
                      />
                    ))}
                  </div>
                ) : null}

                <MutedHelp>
                  Note: By disabling the Cash, Part Payment will be disabled
                  too.
                </MutedHelp>
              </div>
            </FormRow>
          </section>

          <section className="space-y-4">
            <FormRow label="Payment Card Option">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={cardOptionDraft}
                    onChange={(event) => setCardOptionDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addCardOption()
                      }
                    }}
                    className={`${inputClass} max-w-md flex-1`}
                    placeholder="Enter card option"
                  />
                  <PrimaryButton onClick={addCardOption}>Add</PrimaryButton>
                </div>
                <MutedHelp>
                  Select Payment card options to add on POS in Card section of
                  Payment.
                </MutedHelp>
                {cardOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cardOptions.map((option) => (
                      <ToggleChip
                        key={option}
                        label={option}
                        active={Boolean(enabledCards[option])}
                        onToggle={() =>
                          setEnabledCards((prev) => ({
                            ...prev,
                            [option]: !prev[option],
                          }))
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </FormRow>
          </section>

          <section className="space-y-4">
            <FormRow label="UPI Provider">
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start">
                  <select
                    value={upiProvider}
                    onChange={(event) => setUpiProvider(event.target.value)}
                    className={`${selectClass} sm:max-w-[220px]`}
                    aria-label="Select UPI Provider"
                  >
                    {UPI_PROVIDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="min-w-0 flex-1 sm:max-w-xs">
                    <input
                      type="text"
                      value={upiCustomName}
                      onChange={(event) => setUpiCustomName(event.target.value)}
                      placeholder="UPI custom name"
                      className={inputClass}
                    />
                    <MutedHelp>
                      This custom name will be reflected in all the relevant
                      reports.
                    </MutedHelp>
                  </div>
                  <PrimaryButton onClick={addUpiProvider}>Add</PrimaryButton>
                </div>
                <MutedHelp>
                  Select UPI Provider to add on POS in UPI section of Payment.
                </MutedHelp>
                {upiProviders.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-line">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-page/80">
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted">
                            Provider
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted">
                            Custom Name
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {upiProviders.map((row) => (
                          <tr key={row.id} className="border-t border-line">
                            <td className="px-3 py-2 text-ink">{row.provider}</td>
                            <td className="px-3 py-2 text-ink">
                              {row.customName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            </FormRow>
          </section>
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
