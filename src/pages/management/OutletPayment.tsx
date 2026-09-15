import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import {
  Check,
  CreditCard,
  IndianRupee,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigFormRow,
  ConfigSaveBar,
  ConfigSectionCard,
  MutedHelp,
} from '../../components/management/ConfigSectionCard'
import { SettingsPageLoading } from '../../components/management/SettingsPageLoading'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { useOutletSettings } from '../../services/useOutletSettings'
import type { OutletSettingsRecord } from '../../services/outletService'

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

function currencyCodeFromLabel(label: string): string {
  return label.split(' - ')[1] || 'INR'
}

function currencyLabelForCode(code: string): string {
  return (
    CURRENCY_OPTIONS.find((option) => option.includes(` - ${code} - `)) ??
    CURRENCY_OPTIONS[0]
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

  const { loading, data, save } = useOutletSettings('payment')

  const loadedRef = { current: false }
  useEffect(() => {
    if (!data || loadedRef.current) return
    loadedRef.current = true
    if (typeof data.currency === 'string' && data.currency) {
      setCurrency(currencyLabelForCode(data.currency))
    }
    if (Array.isArray(data.payment_types)) {
      const types = data.payment_types as Array<Record<string, unknown>>
      const ordered = [...types].sort(
        (a, b) => Number(a.position ?? 0) - Number(b.position ?? 0),
      )
      setPaymentTypes(ordered.map((t) => String(t.name)))
      const enabled: Record<string, boolean> = {}
      for (const t of ordered) enabled[String(t.name)] = Boolean(t.is_enabled)
      setEnabledTypes(enabled)
    }
    if (Array.isArray(data.upi_sub_types) && data.upi_sub_types.length > 0) {
      const subtypes = data.upi_sub_types as Array<Record<string, unknown>>
      setUpiSubTypes((prev) => {
        const next: Record<string, boolean> = { ...prev }
        for (const s of subtypes) next[String(s.name)] = Boolean(s.is_enabled)
        return next
      })
    }
    if (Array.isArray(data.card_options) && data.card_options.length > 0) {
      const cards = data.card_options as Array<Record<string, unknown>>
      setCardOptions(cards.map((c) => String(c.name)))
      const enabled: Record<string, boolean> = {}
      for (const c of cards) enabled[String(c.name)] = Boolean(c.is_enabled)
      setEnabledCards(enabled)
    }
    if (Array.isArray(data.upi_providers)) {
      const providers = data.upi_providers as Array<Record<string, unknown>>
      setUpiProviders(
        providers.map((p, index) => ({
          id: `upi-load-${index}`,
          provider: String(p.provider),
          customName: String(p.custom_name ?? p.provider),
        })),
      )
    }
  }, [data])


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

  function deleteUpiProvider(id: string) {
    const row = upiProviders.find((r) => r.id === id)
    if (!row) return
    setUpiProviders((prev) => prev.filter((r) => r.id !== id))
    if (row.customName !== 'UPI' && row.customName !== 'HDFC UPI') {
      const stillUsed = upiProviders.some(
        (r) => r.id !== id && r.customName === row.customName,
      )
      if (!stillUsed) {
        setUpiSubTypes((prev) => {
          const next = { ...prev }
          delete next[row.customName]
          return next
        })
      }
    }
  }

  async function handleSave() {
    if (!currency) {
      showToast('Currency is required')
      return
    }
    const payload: OutletSettingsRecord = {
      currency: currencyCodeFromLabel(currency),
      payment_types: paymentTypes.map((name, index) => ({
        name,
        is_enabled: Boolean(enabledTypes[name]),
        position: index,
      })),
      upi_sub_types: Object.entries(upiSubTypes).map(([name, isEnabled]) => ({
        name,
        is_enabled: isEnabled,
      })),
      card_options: cardOptions.map((name) => ({
        name,
        is_enabled: Boolean(enabledCards[name]),
      })),
      upi_providers: upiProviders.map((row) => ({
        provider: row.provider,
        custom_name: row.customName,
      })),
    }
    try {
      await save(payload)
      showToast('Payment settings saved')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save payment settings',
      )
    }
  }

  if (loading && !data) {
    return <SettingsPageLoading />
  }

  const upiChipLabels = [
    ...Object.keys(upiSubTypes),
    ...upiProviders
      .map((row) => row.customName)
      .filter((name) => !(name in upiSubTypes)),
  ]
  const uniqueUpiChips = [...new Set(upiChipLabels)]

  return (
    <ReportsPageShell title={<ConfigBreadcrumb onNavigate={goBack} current="Payment" />} activeItem="config-outlet">

      <ConfigSectionCard
        icon={<IndianRupee size={16} />}
        title="Payment Information"
        description="Currency used across billing screen, reports and dashboard."
      >
        <ConfigFormRow label="Currency" required align="center">
          <>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className={`${selectClass} max-w-xs`}
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <MutedHelp>
              Choose Currency for your outlet. Based on the same, every amount
              will be displayed along with the currency chosen on Dashboard
              &amp; POS bill and reports.
            </MutedHelp>
          </>
        </ConfigFormRow>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Wallet size={16} />}
        title="Payment Types"
        description="Payment types available on the POS payment section."
      >
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
            <button
              type="button"
              onClick={addPaymentType}
              className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Add
            </button>
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
            Note: By disabling the Cash, Part Payment will be disabled too.
          </MutedHelp>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<CreditCard size={16} />}
        title="Payment Card Option"
        description="Card options available on the POS card payment section."
      >
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
            <button
              type="button"
              onClick={addCardOption}
              className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Add
            </button>
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
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Smartphone size={16} />}
        title="UPI Provider"
        description="UPI providers available on the POS UPI payment section."
      >
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
                This custom name will be reflected in all the relevant reports.
              </MutedHelp>
            </div>
            <button
              type="button"
              onClick={addUpiProvider}
              className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Add
            </button>
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
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upiProviders.map((row) => (
                    <tr key={row.id} className="border-t border-line">
                      <td className="px-3 py-2 font-medium text-ink">
                        {row.provider}
                      </td>
                      <td className="px-3 py-2 text-ink">{row.customName}</td>
                      <td className="px-3 py-2 text-left">
                        <button
                          type="button"
                          onClick={() => deleteUpiProvider(row.id)}
                          aria-label={`Delete ${row.customName} UPI provider`}
                          title="Remove UPI provider"
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />
    </ReportsPageShell>
  )
}
