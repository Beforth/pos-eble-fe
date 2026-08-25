import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Plus,
  Receipt,
  Store,
  Trash2,
  X,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { PrimaryButton } from '../components/menu/MenuActionButtons'
import { addOutlet } from '../mocks/outletStore'

const OUTLET_TYPES = [
  'QSR',
  'Fine Dine',
  'Cloud Kitchen',
  'Food Court',
  'Take Away',
  'Other',
] as const

const TIMEZONE_OPTIONS = ['Asia/Kolkata', 'Asia/Dubai', 'UTC']

const SEATING_OPTIONS = ['1-10', '10-50', '50-100', '100-200', '200+']

const ONLINE_CHANNEL_OPTIONS = ['Zomato', 'Swiggy', 'Uber Eats', 'Other']

const CUISINE_OPTIONS = [
  'Indian',
  'Fast Food',
  'Chinese',
  'South Indian',
  'Maharashtrian',
  'Street Food',
  'Burger',
  'Pizza',
  'Continental',
  'Beverages',
]

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'AED', label: 'UAE Dirham (د.إ)' },
  { value: 'GBP', label: 'British Pound (£)' },
]

const PAYMENT_TYPE_OPTIONS = [
  'Cash',
  'Card',
  'UPI',
  'Due',
  'Part Payment',
  'Wallet',
  'Other',
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function SectionCard({
  icon,
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  icon: ReactNode
  title: string
  children?: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:z-30">
      <button
        type="button"
        disabled={!collapsible}
        onClick={() => {
          if (collapsible) setOpen((prev) => !prev)
        }}
        className={`flex w-full items-center gap-2.5 px-4 py-3 text-left ${
          collapsible ? 'cursor-pointer hover:bg-page/60' : 'cursor-default'
        }`}
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="flex-1 text-sm font-semibold text-ink">{title}</h2>
        {collapsible ? (
          <ChevronDown
            size={16}
            className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        ) : null}
      </button>
      {open && children ? (
        <div className="border-t border-line px-4 py-4">{children}</div>
      ) : null}
    </section>
  )
}

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required ? <span className="text-primary"> *</span> : null}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`${inputClass} ${disabled ? 'cursor-not-allowed bg-page text-muted' : ''}`}
    />
  )
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }> | string[]
  placeholder?: string
}) {
  const normalized = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  )
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm text-ink outline-none focus:border-primary"
      >
        {placeholder ? (
          <option value="">{placeholder}</option>
        ) : null}
        {normalized.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  )
}

function MultiSelectTags({
  label,
  required,
  values,
  options,
  placeholder,
  onChange,
}: {
  label: string
  required?: boolean
  values: string[]
  options: string[]
  placeholder: string
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((item) => item !== option))
    } else {
      onChange([...values, option])
    }
  }

  return (
    <div ref={rootRef}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-line bg-card px-3 py-1.5 text-left text-sm outline-none hover:bg-page focus:border-primary"
        >
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {values.length === 0 ? (
              <span className="text-muted">{placeholder}</span>
            ) : (
              values.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {value}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${value}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onChange(values.filter((item) => item !== value))
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        event.stopPropagation()
                        onChange(values.filter((item) => item !== value))
                      }
                    }}
                    className="inline-flex size-3.5 items-center justify-center rounded-sm hover:bg-primary/20"
                  >
                    <X size={10} />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown
            size={14}
            className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open ? (
          <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border border-line bg-card shadow-lg">
            <div className="border-b border-line p-2">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-9 w-full rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
              {filtered.map((option) => {
                const selected = values.includes(option)
                return (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => toggle(option)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-page ${
                        selected ? 'font-semibold text-ink' : 'text-ink'
                      }`}
                    >
                      <span>{option}</span>
                      {selected ? (
                        <Check size={15} className="shrink-0 text-success" />
                      ) : (
                        <span className="size-[15px]" />
                      )}
                    </button>
                  </li>
                )
              })}
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted">No matches</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-line bg-card text-muted hover:border-muted'
      }`}
    >
      {label}
    </button>
  )
}

export default function AddOutlet() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [outletName, setOutletName] = useState('')
  const [outletAlias, setOutletAlias] = useState('')
  const [outletType, setOutletType] = useState('QSR')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [seatingCapacity, setSeatingCapacity] = useState('')
  const [onlineChannels, setOnlineChannels] = useState<string[]>([])
  const [cuisines, setCuisines] = useState<string[]>([])

  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [landmark, setLandmark] = useState('')
  const [area, setArea] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country] = useState('India')
  const [zipCode, setZipCode] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const [open24x7, setOpen24x7] = useState(true)
  const [daySlots, setDaySlots] = useState<
    Record<string, { from: string; to: string }[]>
  >(() =>
    Object.fromEntries(
      DAYS.map((day) => [day, [{ from: '09:00', to: '22:00' }]]),
    ),
  )
  const [holidays, setHolidays] = useState<string[]>([])

  const [currency, setCurrency] = useState('INR')
  const [paymentTypes, setPaymentTypes] = useState<string[]>([
    'Cash',
    'Card',
    'UPI',
  ])

  const [gstin, setGstin] = useState('')
  const [fssai, setFssai] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [taxAuthority, setTaxAuthority] = useState('')

  const [invoicePrefix, setInvoicePrefix] = useState('')
  const [startingNumber, setStartingNumber] = useState('1')
  const [termsConditions, setTermsConditions] = useState('')

  type OutletTab = 'basic' | 'address' | 'timings' | 'payment' | 'tax' | 'invoice'
  const [activeTab, setActiveTab] = useState<OutletTab>('basic')

  const TABS: { id: OutletTab; label: string; icon: ReactNode }[] = [
    { id: 'basic', label: 'Basic Info', icon: <Store size={14} /> },
    { id: 'address', label: 'Address', icon: <MapPin size={14} /> },
    { id: 'timings', label: 'Timings', icon: <Clock size={14} /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard size={14} /> },
    { id: 'tax', label: 'Tax & License', icon: <Receipt size={14} /> },
    { id: 'invoice', label: 'Invoice', icon: <FileText size={14} /> },
  ]

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function togglePaymentType(type: string) {
    setPaymentTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type],
    )
  }

  function addHoliday() {
    setHolidays((prev) => [...prev, ''])
  }

  function updateHoliday(index: number, value: string) {
    setHolidays((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    )
  }

  function removeHoliday(index: number) {
    setHolidays((prev) => prev.filter((_, i) => i !== index))
  }

  function addDaySlot(day: string) {
    setDaySlots((prev) => ({
      ...prev,
      [day]: [...(prev[day] ?? []), { from: '09:00', to: '22:00' }],
    }))
  }

  function updateDaySlot(
    day: string,
    index: number,
    field: 'from' | 'to',
    value: string,
  ) {
    setDaySlots((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    }))
  }

  function removeDaySlot(day: string, index: number) {
    setDaySlots((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).filter((_, i) => i !== index),
    }))
  }

  function handleSave() {
    if (!outletName.trim()) {
      setError('Outlet name is required')
      return
    }
    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }
    if (!addressLine1.trim()) {
      setError('Address line 1 is required')
      return
    }
    if (!city.trim()) {
      setError('City is required')
      return
    }
    if (!state.trim()) {
      setError('State is required')
      return
    }
    if (!zipCode.trim()) {
      setError('Zip code is required')
      return
    }
    setError('')
    addOutlet({
      outletName,
      outletAlias,
      outletType,
      phone,
      email,
      timezone,
      seatingCapacity,
      onlineChannels,
      cuisines,
      addressLine1,
      addressLine2,
      landmark,
      area,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      open24x7,
      daySlots,
      holidays,
      currency,
      paymentTypes,
      gstin,
      fssai,
      panNumber,
      taxAuthority,
      invoicePrefix,
      startingNumber,
      termsConditions,
    })
    showToast('Outlet created successfully')
    window.setTimeout(() => navigate('/menu'), 800)
  }

  return (
    <MenuPageShell
      backTo="/menu"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/menu')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/menu')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Menu Management
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Outlet</span>
        </span>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 border-b border-line">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab.icon}
                {tab.label}
                {active ? (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'basic' ? (
        <SectionCard icon={<Store size={16} />} title="Basic Information">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>Outlet Name</FieldLabel>
              <TextInput
                value={outletName}
                onChange={setOutletName}
                placeholder="e.g. Rajubhai Dadar"
              />
            </div>
            <div>
              <FieldLabel>Outlet Alias</FieldLabel>
              <TextInput
                value={outletAlias}
                onChange={setOutletAlias}
                placeholder="e.g. Dadar Branch"
              />
            </div>
            <div>
              <FieldLabel required>Outlet Type</FieldLabel>
              <SelectInput
                value={outletType}
                onChange={setOutletType}
                options={[...OUTLET_TYPES]}
                placeholder="Select type"
              />
            </div>
            <div>
              <FieldLabel required>Phone</FieldLabel>
              <TextInput
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
                type="tel"
              />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <TextInput
                value={email}
                onChange={setEmail}
                placeholder="Enter email address"
                type="email"
              />
            </div>
            <div>
              <FieldLabel>Timezone</FieldLabel>
              <SelectInput
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONE_OPTIONS}
                placeholder="Select timezone"
              />
            </div>
            <div>
              <FieldLabel>Seating Capacity</FieldLabel>
              <SelectInput
                value={seatingCapacity}
                onChange={setSeatingCapacity}
                options={SEATING_OPTIONS}
                placeholder="Select capacity"
              />
            </div>
          </div>
          <div className="mt-4">
            <MultiSelectTags
              label="Online Channels"
              values={onlineChannels}
              options={ONLINE_CHANNEL_OPTIONS}
              placeholder="Select channels"
              onChange={setOnlineChannels}
            />
          </div>
          <div className="mt-4">
            <MultiSelectTags
              label="Cuisine"
              values={cuisines}
              options={CUISINE_OPTIONS}
              placeholder="Select cuisines"
              onChange={setCuisines}
            />
          </div>
        </SectionCard>
      ) : null}

      {activeTab === 'address' ? (
        <SectionCard icon={<MapPin size={16} />} title="Address">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel required>Address Line 1</FieldLabel>
              <TextInput
                value={addressLine1}
                onChange={setAddressLine1}
                placeholder="Street address"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Address Line 2</FieldLabel>
              <TextInput
                value={addressLine2}
                onChange={setAddressLine2}
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div>
              <FieldLabel>Landmark</FieldLabel>
              <TextInput
                value={landmark}
                onChange={setLandmark}
                placeholder="Nearby landmark"
              />
            </div>
            <div>
              <FieldLabel required>Area</FieldLabel>
              <TextInput
                value={area}
                onChange={setArea}
                placeholder="Area or locality"
              />
            </div>
            <div>
              <FieldLabel required>City</FieldLabel>
              <TextInput value={city} onChange={setCity} placeholder="City" />
            </div>
            <div>
              <FieldLabel required>State</FieldLabel>
              <TextInput value={state} onChange={setState} placeholder="State" />
            </div>
            <div>
              <FieldLabel required>Country</FieldLabel>
              <TextInput value={country} onChange={() => {}} disabled />
            </div>
            <div>
              <FieldLabel required>Zip Code</FieldLabel>
              <TextInput
                value={zipCode}
                onChange={setZipCode}
                placeholder="6-digit zip code"
              />
            </div>
            <div>
              <FieldLabel>Latitude</FieldLabel>
              <TextInput
                value={latitude}
                onChange={setLatitude}
                placeholder="e.g. 20.0032"
              />
            </div>
            <div>
              <FieldLabel>Longitude</FieldLabel>
              <TextInput
                value={longitude}
                onChange={setLongitude}
                placeholder="e.g. 73.7541"
              />
            </div>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === 'timings' ? (
        <SectionCard icon={<Clock size={16} />} title="Timings">
          <div className="mb-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={open24x7}
                onChange={(event) => setOpen24x7(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              Open 24/7
            </label>
          </div>

          {!open24x7 ? (
            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day} className="flex flex-wrap items-center gap-3">
                  <span className="w-10 text-sm font-medium text-ink">
                    {day}
                  </span>
                  {(daySlots[day] ?? []).map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.from}
                        onChange={(event) =>
                          updateDaySlot(day, index, 'from', event.target.value)
                        }
                        className="h-9 w-32 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                      />
                      <span className="text-muted">to</span>
                      <input
                        type="time"
                        value={slot.to}
                        onChange={(event) =>
                          updateDaySlot(day, index, 'to', event.target.value)
                        }
                        className="h-9 w-32 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                      />
                      {index > 0 ? (
                        <button
                          type="button"
                          onClick={() => removeDaySlot(day, index)}
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addDaySlot(day)}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-primary"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2 flex items-center justify-between">
              <FieldLabel>Holiday Dates</FieldLabel>
              <button
                type="button"
                onClick={addHoliday}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-card px-2.5 text-xs font-medium text-ink hover:bg-page"
              >
                <Plus size={12} />
                Add Date
              </button>
            </div>
            {holidays.length === 0 ? (
              <p className="text-xs text-muted">No holidays added.</p>
            ) : (
              <div className="space-y-2">
                {holidays.map((date, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="date"
                      value={date}
                      onChange={(event) =>
                        updateHoliday(index, event.target.value)
                      }
                      className="h-9 w-48 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeHoliday(index)}
                      className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      ) : null}

      {activeTab === 'payment' ? (
        <SectionCard icon={<CreditCard size={16} />} title="Payment Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>Currency</FieldLabel>
              <SelectInput
                value={currency}
                onChange={setCurrency}
                options={CURRENCY_OPTIONS}
                placeholder="Select currency"
              />
            </div>
          </div>
          <div className="mt-4">
            <FieldLabel required>Payment Types</FieldLabel>
            <div className="flex flex-wrap gap-2 pt-1">
              {PAYMENT_TYPE_OPTIONS.map((type) => (
                <ToggleChip
                  key={type}
                  label={type}
                  active={paymentTypes.includes(type)}
                  onClick={() => togglePaymentType(type)}
                />
              ))}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === 'tax' ? (
        <SectionCard icon={<Receipt size={16} />} title="Tax & License Info">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>GSTIN</FieldLabel>
              <TextInput
                value={gstin}
                onChange={setGstin}
                placeholder="GST Identification Number"
              />
            </div>
            <div>
              <FieldLabel>FSSAI License</FieldLabel>
              <TextInput
                value={fssai}
                onChange={setFssai}
                placeholder="FSSAI License Number"
              />
            </div>
            <div>
              <FieldLabel>PAN Number</FieldLabel>
              <TextInput
                value={panNumber}
                onChange={setPanNumber}
                placeholder="PAN Number"
              />
            </div>
            <div>
              <FieldLabel>Tax Authority</FieldLabel>
              <TextInput
                value={taxAuthority}
                onChange={setTaxAuthority}
                placeholder="e.g. GST"
              />
            </div>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === 'invoice' ? (
        <SectionCard icon={<FileText size={16} />} title="Invoice Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Invoice Prefix</FieldLabel>
              <TextInput
                value={invoicePrefix}
                onChange={setInvoicePrefix}
                placeholder="e.g. INV-"
              />
            </div>
            <div>
              <FieldLabel>Starting Number</FieldLabel>
              <TextInput
                value={startingNumber}
                onChange={setStartingNumber}
                placeholder="1"
                type="number"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Terms & Conditions</FieldLabel>
              <textarea
                value={termsConditions}
                onChange={(event) => setTermsConditions(event.target.value)}
                rows={4}
                placeholder="Default terms and conditions for invoices..."
                className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </SectionCard>
      ) : null}

      {error ? <p className="mb-3 text-sm text-primary">{error}</p> : null}

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Outlet</PrimaryButton>
      </div>
    </MenuPageShell>
  )
}
