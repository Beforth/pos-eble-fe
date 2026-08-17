import { useState, type ReactNode } from 'react'
import { Crosshair, MapPin, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const CUISINE_OPTIONS = [
  'Indian',
  'Fast Food',
  'PIZZA HOUSE',
  'Maharashtrian',
  'Street Food',
  'Burger',
  'Chinese',
  'South Indian',
  'Continental',
  'Beverages',
]

const SEATING_OPTIONS = ['1-10', '10-50', '50-100', '100-200', '200+']

const TIMEZONE_OPTIONS = [
  'Asia/Calcutta',
  'Asia/Kolkata',
  'Asia/Dubai',
  'UTC',
]

const RESTAURANT_TYPES = [
  'QSR',
  'Fine Dine',
  'Only Take Away',
  'Dark Kitchen',
  'Food Court',
  'Other',
] as const

const ONLINE_CHANNELS = ['Zomato', 'Swiggy', 'Uber Eats', 'Other'] as const

const SERVING_TYPES = ['Service', 'Goods', 'Both'] as const

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-page disabled:text-muted'

const textareaClass =
  'min-h-[88px] w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary'

function RequiredMark() {
  return <span className="text-primary">*</span>
}

function HelpText({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-primary/90">{children}</p>
}

function MutedHelp({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
}

function FormRow({
  label,
  required,
  children,
  align = 'center',
}: {
  label: string
  required?: boolean
  children: ReactNode
  align?: 'center' | 'start'
}) {
  return (
    <div
      className={`grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4 ${
        align === 'start' ? 'sm:items-start' : 'sm:items-center'
      }`}
    >
      <label className="text-sm font-medium text-ink sm:pt-2.5">
        {label} {required ? <RequiredMark /> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="border-b border-line pb-3">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
    </div>
  )
}

export default function OutletDetails() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [outletName] = useState(brand.shopName)
  const [outletAlias, setOutletAlias] = useState<string>(brand.shopName)
  const [email, setEmail] = useState('deveshjobanputra143@gmail.com')

  const [landmark, setLandmark] = useState('Near Parijat Nagar Signal')
  const [zipCode, setZipCode] = useState('422005')
  const [fax, setFax] = useState('')
  const [tinNo, setTinNo] = useState('')
  const [country] = useState('India')
  const [state] = useState('Maharashtra')
  const [city] = useState('Nashik')
  const [timezone, setTimezone] = useState('Asia/Calcutta')
  const [address, setAddress] = useState(
    'Shop 01, Sunrich Apartment, Satpur, College Road, Nashik',
  )
  const [area, setArea] = useState('College Road')
  const [latitude, setLatitude] = useState('20.00326624')
  const [longitude, setLongitude] = useState('73.75414916')

  const [additionalInfo, setAdditionalInfo] = useState('')
  const [cuisines, setCuisines] = useState<string[]>([
    'Indian',
    'Fast Food',
    'PIZZA HOUSE',
    'Maharashtrian',
    'Street Food',
    'Burger',
  ])
  const [cuisineDraft, setCuisineDraft] = useState('')
  const [seatingCapacity, setSeatingCapacity] = useState('10-50')
  const [logoName, setLogoName] = useState('')
  const [imagesName, setImagesName] = useState('')
  const [restaurantTypes, setRestaurantTypes] = useState<string[]>(['QSR'])
  const [onlineChannels, setOnlineChannels] = useState<string[]>([
    'Zomato',
    'Swiggy',
  ])

  const [code, setCode] = useState('')
  const [fssai, setFssai] = useState('11523027000309')
  const [taxAuthority, setTaxAuthority] = useState('GST')
  const [hsnMandatory, setHsnMandatory] = useState(false)
  const [servingType, setServingType] =
    useState<(typeof SERVING_TYPES)[number]>('Service')
  const [validateSapcode, setValidateSapcode] = useState(false)
  const [variationWiseOnline, setVariationWiseOnline] = useState(true)
  const [kotForOnline, setKotForOnline] = useState(true)
  const [showSubpayment, setShowSubpayment] = useState(false)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
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

  function removeCuisine(value: string) {
    setCuisines((prev) => prev.filter((item) => item !== value))
  }

  function addCuisine(value: string) {
    const next = value.trim()
    if (!next || cuisines.includes(next)) return
    setCuisines((prev) => [...prev, next])
    setCuisineDraft('')
  }

  function handleSave() {
    if (!zipCode.trim() || !address.trim() || !area.trim()) {
      showToast('Please fill required address fields')
      return
    }
    if (!taxAuthority.trim()) {
      showToast('Tax Authority Name is required')
      return
    }
    showToast('Outlet details saved')
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
        Below are the configuration to manage your outlet information. Click on
        the Save button once you change the information.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-8 p-5 sm:p-6">
          <section className="space-y-5">
            <SectionTitle title="Outlet Information" />
            <FormRow label="Outlet Name" required>
              <input
                type="text"
                value={outletName}
                disabled
                className={inputClass}
              />
              <HelpText>
                You can not change the name of created outlet. Contact{' '}
                {brand.shortName} support for help.
              </HelpText>
            </FormRow>
            <FormRow label="Outlet Alias">
              <input
                type="text"
                value={outletAlias}
                onChange={(event) => setOutletAlias(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Email">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
              <HelpText>
                Enter Email ID through which you will receive all communications
                from {brand.shortName}.
              </HelpText>
            </FormRow>
          </section>

          <section className="space-y-5">
            <SectionTitle
              title="Address Information"
              description="Enter physical location of your outlet. Provide your ZipCode and State accurately for GST calculation whenever applicable."
            />
            <FormRow label="Landmark">
              <input
                type="text"
                value={landmark}
                onChange={(event) => setLandmark(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Zip Code" required>
              <input
                type="text"
                value={zipCode}
                onChange={(event) => setZipCode(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Fax">
              <input
                type="text"
                value={fax}
                onChange={(event) => setFax(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Tin No.">
              <input
                type="text"
                value={tinNo}
                onChange={(event) => setTinNo(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Country" required>
              <input type="text" value={country} disabled className={inputClass} />
            </FormRow>
            <FormRow label="State" required>
              <input type="text" value={state} disabled className={inputClass} />
            </FormRow>
            <FormRow label="City" required>
              <input type="text" value={city} disabled className={inputClass} />
            </FormRow>
            <FormRow label="Timezone">
              <select
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className={inputClass}
              >
                {TIMEZONE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Address" required align="start">
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className={textareaClass}
              />
            </FormRow>
            <FormRow label="Area" required align="start">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                <textarea
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  className={`${textareaClass} min-h-[72px] lg:flex-1`}
                />
                <div className="flex flex-wrap gap-2 lg:max-w-[280px] lg:flex-col">
                  <OutlineButton
                    variant="primary"
                    onClick={() =>
                      showToast('Finding current location…')
                    }
                  >
                    <Crosshair size={14} />
                    Find Current Location
                  </OutlineButton>
                  <OutlineButton
                    variant="primary"
                    onClick={() =>
                      showToast('Finding location from address…')
                    }
                  >
                    <MapPin size={14} />
                    Find Location From Address
                  </OutlineButton>
                </div>
              </div>
            </FormRow>
            <FormRow label="Latitude" required>
              <input
                type="text"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Longitude" required>
              <input
                type="text"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${encodeURIComponent(
                      `${latitude},${longitude}`,
                    )}`,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                className="mt-1.5 text-xs font-medium text-primary hover:underline"
              >
                See location on map
              </button>
            </FormRow>
          </section>

          <section className="space-y-5">
            <SectionTitle title="Additional Information" />
            <FormRow label="Additional Info" align="start">
              <textarea
                value={additionalInfo}
                onChange={(event) => setAdditionalInfo(event.target.value)}
                className={textareaClass}
                placeholder="Enter additional information"
              />
            </FormRow>
            <FormRow label="Cuisines" align="start">
              <div className="space-y-2">
                <div className="flex min-h-10 flex-wrap gap-1.5 rounded-md border border-line bg-card p-2">
                  {cuisines.map((cuisine) => (
                    <span
                      key={cuisine}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {cuisine}
                      <button
                        type="button"
                        aria-label={`Remove ${cuisine}`}
                        onClick={() => removeCuisine(cuisine)}
                        className="rounded hover:bg-primary/15"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    list="cuisine-options"
                    value={cuisineDraft}
                    onChange={(event) => setCuisineDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addCuisine(cuisineDraft)
                      }
                    }}
                    onBlur={() => addCuisine(cuisineDraft)}
                    placeholder="Add cuisine"
                    className="min-w-[120px] flex-1 border-0 bg-transparent px-1 text-sm outline-none"
                  />
                  <datalist id="cuisine-options">
                    {CUISINE_OPTIONS.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
              </div>
            </FormRow>
            <FormRow label="Seating Capacity">
              <select
                value={seatingCapacity}
                onChange={(event) => setSeatingCapacity(event.target.value)}
                className={inputClass}
              >
                {SEATING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Logo" align="start">
              <div>
                <input
                  type="file"
                  accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                  onChange={(event) =>
                    setLogoName(event.target.files?.[0]?.name ?? '')
                  }
                  className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-page file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-line/60"
                />
                {logoName ? (
                  <p className="mt-1 text-xs text-muted">{logoName}</p>
                ) : null}
                <MutedHelp>Upload only png, jpeg or jpg file</MutedHelp>
              </div>
            </FormRow>
            <FormRow label="Images" align="start">
              <div>
                <input
                  type="file"
                  accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                  multiple
                  onChange={(event) => {
                    const files = event.target.files
                    if (!files?.length) {
                      setImagesName('')
                      return
                    }
                    setImagesName(
                      Array.from(files)
                        .map((file) => file.name)
                        .join(', '),
                    )
                  }}
                  className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-page file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-line/60"
                />
                {imagesName ? (
                  <p className="mt-1 text-xs text-muted">{imagesName}</p>
                ) : null}
                <MutedHelp>Upload only png, jpeg or jpg file</MutedHelp>
              </div>
            </FormRow>
            <FormRow label="Restaurant Type" align="start">
              <div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {RESTAURANT_TYPES.map((type) => (
                    <label
                      key={type}
                      className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={restaurantTypes.includes(type)}
                        onChange={() =>
                          toggleInList(
                            restaurantTypes,
                            type,
                            setRestaurantTypes,
                          )
                        }
                        className="size-4 cursor-pointer accent-primary"
                      />
                      {type}
                    </label>
                  ))}
                </div>
                <MutedHelp>
                  Tell us on the type of an outlet which you are running. This
                  will help us to curate the marketplace services.
                </MutedHelp>
              </div>
            </FormRow>
            <FormRow label="Online Order Channel" align="start">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ONLINE_CHANNELS.map((channel) => (
                  <label
                    key={channel}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={onlineChannels.includes(channel)}
                      onChange={() =>
                        toggleInList(
                          onlineChannels,
                          channel,
                          setOnlineChannels,
                        )
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {channel}
                  </label>
                ))}
              </div>
            </FormRow>
            <FormRow label="Code">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className={inputClass}
                />
                <MutedHelp>
                  It will be used for communication with third party.
                </MutedHelp>
              </div>
            </FormRow>
            <FormRow label="FSSAI Lic No.">
              <input
                type="text"
                value={fssai}
                onChange={(event) => setFssai(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Tax Authority Name" required align="start">
              <div>
                <input
                  type="text"
                  value={taxAuthority}
                  onChange={(event) => setTaxAuthority(event.target.value)}
                  className={inputClass}
                />
                <MutedHelp>
                  The tax authority name is going to be utilised in PoS for the
                  biller to enter the relevant tax authority number for the
                  customer. For example, if GST is selected then in PoS it would
                  show Customer GST information.
                </MutedHelp>
              </div>
            </FormRow>
            <FormRow label="HSN Mandatory Item level">
              <input
                type="checkbox"
                checked={hsnMandatory}
                onChange={(event) => setHsnMandatory(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
                aria-label="HSN Mandatory Item level"
              />
            </FormRow>
            <FormRow label="Outlet Serving Type" align="start">
              <div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {SERVING_TYPES.map((type) => (
                    <label
                      key={type}
                      className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                    >
                      <input
                        type="radio"
                        name="serving-type"
                        checked={servingType === type}
                        onChange={() => setServingType(type)}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      {type}
                    </label>
                  ))}
                </div>
                <MutedHelp>
                  Note: In case if &quot;Both&quot; option is selected, then in
                  an invoice if both (goods and services) type of items are
                  available then the master tax of items tagged as service would
                  be calculated.
                </MutedHelp>
              </div>
            </FormRow>
            <FormRow label="Validate unique sapcode">
              <input
                type="checkbox"
                checked={validateSapcode}
                onChange={(event) => setValidateSapcode(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
                aria-label="Validate unique sapcode"
              />
            </FormRow>
            <FormRow label="Enable variation wise option in online menu on/off page">
              <input
                type="checkbox"
                checked={variationWiseOnline}
                onChange={(event) =>
                  setVariationWiseOnline(event.target.checked)
                }
                className="size-4 cursor-pointer accent-primary"
                aria-label="Enable variation wise option in online menu on/off page"
              />
            </FormRow>
            <FormRow label="Enable KOT for online order">
              <input
                type="checkbox"
                checked={kotForOnline}
                onChange={(event) => setKotForOnline(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
                aria-label="Enable KOT for online order"
              />
            </FormRow>
            <FormRow
              label="Show subpayment details in orders master report"
              align="start"
            >
              <div>
                <input
                  type="checkbox"
                  checked={showSubpayment}
                  onChange={(event) => setShowSubpayment(event.target.checked)}
                  className="size-4 cursor-pointer accent-primary"
                  aria-label="Show subpayment details in orders master report"
                />
                <MutedHelp>
                  Applicable when the orders are settled under part or due
                  payments, whether it&apos;s done once or several times.
                </MutedHelp>
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
