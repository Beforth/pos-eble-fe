import { useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ClipboardList,
  CloudUpload,
  Info,
  List,
  MapPin,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const GST_OPTIONS = ['Yes', 'No']

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
]

const CITY_OPTIONS: Record<string, string[]> = {
  Maharashtra: [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Thane',
    'Bhiwandi',
    'Aurangabad',
    'Kolhapur',
  ],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  Delhi: ['New Delhi', 'Delhi'],
  Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur'],
  Telangana: ['Hyderabad', 'Warangal'],
  'West Bengal': ['Kolkata', 'Howrah'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Kanpur'],
  Goa: ['Panaji', 'Margao'],
}

const TYPE_OPTIONS = ['Both', 'Purchase', 'Sale'] as const

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:z-30">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      <div className="border-t border-line px-4 py-4">{children}</div>
    </section>
  )
}

function CollapsibleBlock({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children?: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-line">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-page/60"
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && children ? (
        <div className="border-t border-line px-3 py-3">{children}</div>
      ) : null}
    </div>
  )
}

function FieldLabel({
  children,
  required,
  info,
}: {
  children: ReactNode
  required?: boolean
  info?: string
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
      <span>
        {children}
        {required ? <span className="text-primary"> *</span> : null}
      </span>
      {info ? (
        <span title={info} className="inline-flex text-muted">
          <Info size={13} />
        </span>
      ) : null}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
    />
  )
}

export default function AddSupplier() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [registeredUnderGst, setRegisteredUnderGst] = useState('Yes')
  const [gstNo, setGstNo] = useState('')

  const [registerAddress, setRegisterAddress] = useState('')
  const [state, setState] = useState('Maharashtra')
  const [city, setCity] = useState('Bhiwandi')
  const [pinCode, setPinCode] = useState('')

  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingState, setShippingState] = useState('Maharashtra')
  const [shippingCity, setShippingCity] = useState('Bhiwandi')
  const [shippingPinCode, setShippingPinCode] = useState('')

  const [fssai, setFssai] = useState('')
  const [pan, setPan] = useState('')
  const [msme, setMsme] = useState('')
  const [tan, setTan] = useState('')
  const [cin, setCin] = useState('')
  const [tcs, setTcs] = useState('')
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>('Both')
  const [fileName, setFileName] = useState<string | null>(null)

  const [paymentTerms, setPaymentTerms] = useState('')
  const [deliveryTerms, setDeliveryTerms] = useState('')

  const [toast, setToast] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ name?: string; company?: string }>({})

  const cities = CITY_OPTIONS[state] ?? ['Other']
  const shippingCities = CITY_OPTIONS[shippingState] ?? ['Other']

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  function handleSave() {
    const nextErrors: { name?: string; company?: string } = {}
    if (!name.trim()) nextErrors.name = 'Name is required'
    if (!company.trim()) nextErrors.company = 'Company is required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showToast('Please fill required fields')
      return
    }
    showToast('Supplier saved')
    window.setTimeout(() => navigate('/inventory/suppliers'), 600)
  }

  return (
    <InventoryPageShell activeItem="suppliers-third-party">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Add Supplier/Third Party</h1>
      </div>

      <SectionCard icon={<ClipboardList size={16} />} title="Basic Details">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <FieldLabel required>Name</FieldLabel>
            <TextInput value={name} onChange={setName} />
            {errors.name ? (
              <p className="mt-1 text-xs text-primary">{errors.name}</p>
            ) : null}
          </div>
          <div>
            <FieldLabel required>Company</FieldLabel>
            <TextInput value={company} onChange={setCompany} />
            {errors.company ? (
              <p className="mt-1 text-xs text-primary">{errors.company}</p>
            ) : null}
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput value={email} onChange={setEmail} type="email" />
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <TextInput value={phone} onChange={setPhone} type="tel" />
          </div>
          <div>
            <SearchableSelect
              label="Registered Under GST"
              required
              value={registeredUnderGst}
              options={GST_OPTIONS}
              placeholder="Please select"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setRegisteredUnderGst}
            />
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
              <Info size={13} className="mt-0.5 shrink-0 text-muted" />
              Select Yes if the supplier is registered under GST.
            </p>
          </div>
          <div>
            <FieldLabel>GST No</FieldLabel>
            <TextInput value={gstNo} onChange={setGstNo} />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={<MapPin size={16} />} title="Address">
        <div className="space-y-4">
          <div>
            <FieldLabel>Register Address</FieldLabel>
            <textarea
              value={registerAddress}
              onChange={(event) => setRegisterAddress(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <SearchableSelect
              label="State"
              value={state}
              options={INDIAN_STATES}
              placeholder="Please select"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={(value) => {
                setState(value)
                const nextCities = CITY_OPTIONS[value] ?? ['Other']
                setCity(nextCities[0] ?? '')
              }}
            />
            <SearchableSelect
              label="City"
              value={city}
              options={cities}
              placeholder="Please select"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setCity}
            />
            <div>
              <FieldLabel>Pin Code</FieldLabel>
              <TextInput value={pinCode} onChange={setPinCode} />
            </div>
          </div>

          <CollapsibleBlock title="Shipping Address">
            <div className="space-y-4">
              <div>
                <FieldLabel>Shipping Address</FieldLabel>
                <textarea
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <SearchableSelect
                  label="State"
                  value={shippingState}
                  options={INDIAN_STATES}
                  placeholder="Please select"
                  searchPlaceholder="Search"
                  includePlaceholderOption={false}
                  onChange={(value) => {
                    setShippingState(value)
                    const nextCities = CITY_OPTIONS[value] ?? ['Other']
                    setShippingCity(nextCities[0] ?? '')
                  }}
                />
                <SearchableSelect
                  label="City"
                  value={shippingCity}
                  options={shippingCities}
                  placeholder="Please select"
                  searchPlaceholder="Search"
                  includePlaceholderOption={false}
                  onChange={setShippingCity}
                />
                <div>
                  <FieldLabel>Pin Code</FieldLabel>
                  <TextInput
                    value={shippingPinCode}
                    onChange={setShippingPinCode}
                  />
                </div>
              </div>
            </div>
          </CollapsibleBlock>
        </div>
      </SectionCard>

      <SectionCard icon={<List size={16} />} title="Other Details">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <FieldLabel>FSSAI Lic No.</FieldLabel>
            <TextInput value={fssai} onChange={setFssai} />
          </div>
          <div>
            <FieldLabel info="Permanent Account Number issued by Income Tax Department">
              PAN
            </FieldLabel>
            <TextInput value={pan} onChange={setPan} />
          </div>
          <div>
            <FieldLabel info="Micro, Small and Medium Enterprises registration number">
              MSME Number
            </FieldLabel>
            <TextInput value={msme} onChange={setMsme} />
          </div>
          <div>
            <FieldLabel info="Tax Deduction and Collection Account Number">
              TAN
            </FieldLabel>
            <TextInput value={tan} onChange={setTan} />
          </div>
          <div>
            <FieldLabel info="Corporate Identification Number">CIN</FieldLabel>
            <TextInput value={cin} onChange={setCin} />
          </div>
          <div>
            <FieldLabel>Tax collected at source (TCS %)</FieldLabel>
            <TextInput value={tcs} onChange={setTcs} />
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel>Type</FieldLabel>
          <div className="flex flex-wrap gap-5">
            {TYPE_OPTIONS.map((option) => (
              <label
                key={option}
                className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
              >
                <input
                  type="radio"
                  name="supplier-type"
                  checked={type === option}
                  onChange={() => setType(option)}
                  className="size-4 accent-primary"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel info="Upload supporting documents for this supplier">
            Files
          </FieldLabel>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                setFileName(file?.name ?? null)
              }}
            />
            <OutlineButton
              variant="gray"
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload size={15} />
              Upload File
            </OutlineButton>
            <span className="text-sm text-muted">
              {fileName ?? 'No file chosen'}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <CollapsibleBlock title="If needed, set payment terms and delivery terms for the selected supplier in the purchase order.">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Payment Terms</FieldLabel>
                <textarea
                  value={paymentTerms}
                  onChange={(event) => setPaymentTerms(event.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <FieldLabel>Delivery Terms</FieldLabel>
                <textarea
                  value={deliveryTerms}
                  onChange={(event) => setDeliveryTerms(event.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </CollapsibleBlock>
        </div>
      </SectionCard>

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <OutlineButton
          variant="gray"
          onClick={() => navigate('/inventory/suppliers')}
        >
          Cancel
        </OutlineButton>
        <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
      </div>
    </InventoryPageShell>
  )
}
