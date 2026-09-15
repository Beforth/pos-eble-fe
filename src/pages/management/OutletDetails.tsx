import { useEffect, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import { Building2, MapPin, Settings2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'
import { useAuth } from '../../auth/AuthContext'
import {
  getOutletApi,
  updateOutletApi,
  type OutletSummary,
} from '../../services/outletService'

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

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] [&:has([aria-expanded=true])]:z-30">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="border-t border-line px-4 py-4">{children}</div>
      ) : null}
    </section>
  )
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

export default function OutletDetails() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [loading, setLoading] = useState(true)

  const [outletName, setOutletName] = useState<string>(brand.shopName)
  const [outletAlias, setOutletAlias] = useState<string>(brand.shopName)
  const [email, setEmail] = useState('')

  const [landmark, setLandmark] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [fax, setFax] = useState('')
  const [tinNo, setTinNo] = useState('')
  const [country] = useState('India')
  const [state] = useState('Maharashtra')
  const [city] = useState('Nashik')
  const [timezone, setTimezone] = useState('Asia/Calcutta')
  const [address, setAddress] = useState('')
  const [area, setArea] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const [additionalInfo, setAdditionalInfo] = useState('')
  const [cuisines, setCuisines] = useState<string[]>([])
  const [cuisineDraft, setCuisineDraft] = useState('')
  const [seatingCapacity, setSeatingCapacity] = useState('')
  const [logoName, setLogoName] = useState('')
  const [imagesName, setImagesName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [restaurantTypes, setRestaurantTypes] = useState<string[]>([])
  const [onlineChannels, setOnlineChannels] = useState<string[]>([])

  const [code, setCode] = useState('')
  const [fssai, setFssai] = useState('')
  const [taxAuthority, setTaxAuthority] = useState('')
  const [hsnMandatory, setHsnMandatory] = useState(false)
  const [servingType, setServingType] =
    useState<(typeof SERVING_TYPES)[number]>('Service')
  const [validateSapcode, setValidateSapcode] = useState(false)
  const [variationWiseOnline, setVariationWiseOnline] = useState(true)
  const [kotForOnline, setKotForOnline] = useState(true)
  const [showSubpayment, setShowSubpayment] = useState(false)


  function applyOutlet(value: OutletSummary) {
    setOutletName(value.name)
    setOutletAlias(value.alias ?? '')
    setEmail(value.email ?? '')
    setLandmark(value.landmark ?? '')
    setZipCode(value.zip_code ?? '')
    setFax(value.fax ?? '')
    setTinNo(value.tin_no ?? '')
    setTimezone(value.timezone || 'Asia/Calcutta')
    setAddress(value.address_line1 ?? '')
    setArea(value.area ?? '')
    setLatitude(value.latitude ?? '')
    setLongitude(value.longitude ?? '')
    setAdditionalInfo(value.additional_info ?? '')
    setCuisines(value.cuisines ?? [])
    setSeatingCapacity(value.seating_capacity ?? '')
    setRestaurantTypes(value.restaurant_types ?? [])
    setOnlineChannels(value.online_channels ?? [])
    setCode(value.code ?? '')
    setFssai(value.fssai_no ?? '')
    setTaxAuthority(value.tax_authority ?? '')
    setHsnMandatory(Boolean(value.hsn_mandatory_item_level))
    setServingType(
      (SERVING_TYPES as readonly string[]).includes(value.serving_type)
        ? (value.serving_type as (typeof SERVING_TYPES)[number])
        : 'Service',
    )
    setValidateSapcode(Boolean(value.validate_unique_sapcode))
    setVariationWiseOnline(Boolean(value.variation_wise_online_menu))
    setKotForOnline(Boolean(value.enable_kot_for_online_order))
    setShowSubpayment(Boolean(value.show_subpayment_details))
  }

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) {
      setLoading(false)
      return
    }
    getOutletApi(encryptedOutletId)
      .then((value) => {
        if (!cancelled) applyOutlet(value)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load outlet',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

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
    if (!zipCode.trim()) {
      showToast('Zip Code is required')
      return
    }
    if (!address.trim()) {
      showToast('Address is required')
      return
    }
    if (!area.trim()) {
      showToast('Area is required')
      return
    }
    if (!taxAuthority.trim()) {
      showToast('Tax Authority Name is required')
      return
    }
    if (!encryptedOutletId) {
      showToast('No active outlet selected')
      return
    }
    const payload = {
      alias: outletAlias,
      email,
      landmark,
      zip_code: zipCode,
      fax,
      tin_no: tinNo,
      timezone,
      address_line1: address,
      area,
      latitude,
      longitude,
      additional_info: additionalInfo,
      cuisines,
      seating_capacity: seatingCapacity,
      restaurant_types: restaurantTypes,
      online_channels: onlineChannels,
      code,
      fssai_no: fssai,
      tax_authority: taxAuthority,
      hsn_mandatory_item_level: hsnMandatory,
      serving_type: servingType,
      validate_unique_sapcode: validateSapcode,
      variation_wise_online_menu: variationWiseOnline,
      enable_kot_for_online_order: kotForOnline,
      show_subpayment_details: showSubpayment,
    }
    const files = {
      logo: logoFile ?? undefined,
      images: imageFiles.length ? imageFiles : undefined,
    }
    updateOutletApi(encryptedOutletId, payload, files)
      .then(() => {
        showToast('Outlet details saved')
      })
      .catch((error: unknown) => {
        showToast(
          error instanceof Error ? error.message : 'Failed to save outlet',
        )
      })
  }

  if (loading) {
    return (
      <ReportsPageShell
        title={
          <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
            <span
              role="button"
              tabIndex={0}
              onClick={() => navigate('/management/configuration/outlet')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/management/configuration/outlet')
                }
              }}
              className="cursor-pointer text-primary hover:underline"
            >
              Outlet Configuration
            </span>
            <span className="font-normal text-muted">&gt;</span>
            <span className="font-semibold text-ink">Outlet Information</span>
          </span>
        }
        activeItem="config-outlet"
      >
        <div className="py-16 text-center text-sm text-muted">
          Loading outlet details…
        </div>
      </ReportsPageShell>
    )
  }

  return (
    <ReportsPageShell
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/management/configuration/outlet')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/management/configuration/outlet')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Outlet Configuration
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Outlet Information</span>
        </span>
      }
      activeItem="config-outlet"
    >

      <SectionCard
        icon={<Building2 size={16} />}
        title="Outlet Information"
      >
        <div className="space-y-4">
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
        </div>
      </SectionCard>

      <SectionCard
        icon={<MapPin size={16} />}
        title="Address Information"
        description="Enter physical location of your outlet. Provide your ZipCode and State accurately for GST calculation whenever applicable."
      >
        <div className="space-y-4">
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
                  onClick={() => showToast('Finding current location…')}
                >
                  Find Current Location
                </OutlineButton>
                <OutlineButton
                  variant="primary"
                  onClick={() => showToast('Finding location from address…')}
                >
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
        </div>
      </SectionCard>

      <SectionCard
        icon={<Settings2 size={16} />}
        title="Additional Info & Settings"
      >
        <div className="space-y-4">
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
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setLogoFile(file)
                  setLogoName(file?.name ?? '')
                }}
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
                    setImageFiles([])
                    return
                  }
                  const next = Array.from(files)
                  setImageFiles(next)
                  setImagesName(next.map((file) => file.name).join(', '))
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
        </div>
      </SectionCard>

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
      </div>
    </ReportsPageShell>
  )
}
