import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  baseMenuCategories,
  getMenuItemById,
} from '../mocks/menuItemsData'
import {
  isMenuChannelId,
  MENU_CHANNELS,
} from '../mocks/menuChannels'

function Section({
  title,
  children,
  note,
}: {
  title: string
  children: ReactNode
  note?: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-card">
      <div className="border-b border-line bg-primary/5 px-4 py-2.5 text-sm font-semibold text-ink">
        {title}
      </div>
      {note ? (
        <p className="border-b border-line px-4 py-2 text-sm text-primary">
          {note}
        </p>
      ) : null}
      <div className="space-y-5 p-4 sm:p-5">{children}</div>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-primary">{hint}</p> : null}
    </div>
  )
}

function inputClass() {
  return 'h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary'
}

function selectClass() {
  return 'h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary'
}

const GENERAL_TAGS = [
  {
    id: 'chef-special',
    label: 'chef-special',
    hint: 'This is applicable for online platforms only',
  },
  {
    id: 'vegan',
    label: 'vegan',
    hint: 'This is applicable for online platforms only',
  },
  {
    id: 'favorite',
    label: 'Set As Favorite',
    hint: 'Used for the offline PoS billing only',
  },
  { id: 'ignore-addon', label: 'Ignore Addon', hint: 'Used only for zomato' },
  { id: 'pos-eble-recommended', label: 'POS-Eble Recommended' },
  { id: 'set-as-combo', label: 'Set As Combo' },
  {
    id: 'mrp-item',
    label: 'mrp-item',
    hint: 'This is applicable for online platforms only',
  },
  {
    id: 'extra-spicy',
    label: 'extra-spicy',
    hint: 'This is applicable for online platforms only',
  },
  {
    id: 'ignore-tax',
    label: 'Ignore Tax',
    hint: 'If enabled, tax will not be calculated in all the platform',
  },
  {
    id: 'ignore-packing',
    label: 'Ignore Packing Charge',
    hint: 'This is applicable for both offline and online billing',
  },
  {
    id: 'alcohol',
    label: 'Contains Alcohol',
    hint: 'Considered under liquor item',
  },
  {
    id: 'spicy',
    label: 'spicy',
    hint: 'This is applicable for online platforms only',
  },
  {
    id: 'new',
    label: 'new',
    hint: 'This is applicable for online platforms only',
  },
  {
    id: 'open-qty',
    label: 'Open Quantity Popup',
    hint: 'Used for the offline PoS billing only',
  },
  {
    id: 'ignore-discount',
    label: 'Ignore Discount',
    hint: 'If enabled, discount will not be applicable in offline PoS billing',
  },
  { id: 'remove-dinein-qr', label: 'Remove From Dinein QR' },
  {
    id: 'open-item',
    label: 'Set As Open Item',
    hint: 'Used for the offline PoS billing only',
  },
] as const

const ZOMATO_TAGS = [
  'Beverage',
  'spicy',
  'seasonal',
  'chef-special',
  'Zomato treat item',
  'meal',
  'cake',
  'South Indian',
  'Party Order',
  'restaurant-recommended',
  'new',
  'holi-special',
  'vegan',
  'home-style-meal',
  'Ham',
  'bacon',
  'gluten-free',
  'dairy-free',
  'custom-photo-cake',
  'chef-table-collection',
  'BCRS',
] as const

export default function EditMenuItem() {
  const { id = '', channel: channelParam } = useParams()
  const rawChannel = channelParam ?? ''
  const channelId = isMenuChannelId(rawChannel) ? rawChannel : 'base-menu'
  const channel = MENU_CHANNELS[channelId]
  const navigate = useNavigate()
  const item = useMemo(() => getMenuItemById(id), [id])

  const [categoryId, setCategoryId] = useState(item?.categoryId ?? 'c1')
  const [name, setName] = useState(item?.name ?? '')
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    item?.onlineDisplayName ?? '',
  )
  const [shortCode, setShortCode] = useState(item?.shortCode ?? '')
  const [shortCode2, setShortCode2] = useState('')
  const [basePrice, setBasePrice] = useState(
    item ? item.price.toFixed(2) : '0.00',
  )
  const [containerCharges, setContainerCharges] = useState('0')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('Select Unit')
  const [profitMargin, setProfitMargin] = useState('')
  const [dietary, setDietary] = useState({
    veg: true,
    nonVeg: false,
    egg: false,
  })
  const [orderTypes, setOrderTypes] = useState({
    parcel: true,
    dineIn: true,
    dineInAlt: true,
  })
  const [noDecimal, setNoDecimal] = useState(false)
  const [expose, setExpose] = useState({
    online: true,
    captain: true,
    kiosk: false,
    other: false,
  })
  const [gstType, setGstType] = useState<'Services' | 'Goods'>('Services')
  const [mfgDate, setMfgDate] = useState('')
  const [expDate, setExpDate] = useState('')
  const [itemSchedule, setItemSchedule] = useState(false)
  const [suggestCategory, setSuggestCategory] = useState('Select Category')
  const [spiceLevel, setSpiceLevel] = useState('Not Applicable')
  const [generalTags, setGeneralTags] = useState<Set<string>>(
    () => new Set(['favorite']),
  )
  const [swiggyPortion, setSwiggyPortion] = useState('')
  const [swiggyUnit, setSwiggyUnit] = useState('Select Unit')
  const [prepTime, setPrepTime] = useState('Select Preparation time')
  const [swiggySpice, setSwiggySpice] = useState('Not Applicable')
  const [sweetLevel, setSweetLevel] = useState('Not Applicable')
  const [gravy, setGravy] = useState('Not Applicable')
  const [accompaniments, setAccompaniments] = useState('')
  const [swiggyRecommended, setSwiggyRecommended] = useState(false)
  const [seasonalIngredients, setSeasonalIngredients] = useState(false)
  const [zomatoTags, setZomatoTags] = useState<Set<string>>(new Set())
  const [addonGroup, setAddonGroup] = useState(false)
  const [variation, setVariation] = useState(false)
  const [hsn, setHsn] = useState('')
  const [sap, setSap] = useState('')
  const [fsn, setFsn] = useState('')
  const [stockStatus, setStockStatus] = useState('Do Not Track')
  const [selfRecipe, setSelfRecipe] = useState(false)
  const [nutrition, setNutrition] = useState('')

  if (!item) {
    return <Navigate to={channel.path} replace />
  }

  function goBack() {
    navigate(channel.path)
  }

  function toggleSet(
    setter: Dispatch<SetStateAction<Set<string>>>,
    id: string,
  ) {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <MenuPageShell
      backTo={channel.path}
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to={channel.path} className="text-primary hover:underline">
            {channel.label}
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Edit {item.name}</span>
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

      <div className="space-y-4">
        <Section title="Configuration">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Category" required>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className={selectClass()}
                >
                  {baseMenuCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </Field>
            <Field label="Name" required>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Online Display Name">
              <input
                value={onlineDisplayName}
                onChange={(event) => setOnlineDisplayName(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Short Code" required>
              <input
                value={shortCode}
                onChange={(event) => setShortCode(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Short Code 2">
              <input
                value={shortCode2}
                onChange={(event) => setShortCode2(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Item base price" required>
              <input
                value={basePrice}
                onChange={(event) => setBasePrice(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Container Charges" required>
              <input
                value={containerCharges}
                onChange={(event) => setContainerCharges(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Weight/Portion">
              <div className="flex gap-2">
                <input
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  className={inputClass()}
                />
                <div className="relative w-36 shrink-0">
                  <select
                    value={weightUnit}
                    onChange={(event) => setWeightUnit(event.target.value)}
                    className={selectClass()}
                  >
                    <option>Select Unit</option>
                    <option>gm</option>
                    <option>ml</option>
                    <option>kg</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>
            </Field>
            <Field label="Profit Margin (%)">
              <input
                value={profitMargin}
                onChange={(event) => setProfitMargin(event.target.value)}
                className={inputClass()}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Dietary" required>
              <div className="flex flex-wrap gap-4 pt-1">
                {(
                  [
                    ['veg', 'veg'],
                    ['nonVeg', 'non-veg'],
                    ['egg', 'egg'],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={dietary[key]}
                      onChange={(event) =>
                        setDietary((prev) => ({
                          ...prev,
                          [key]: event.target.checked,
                        }))
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
            <Field
              label="Order Type"
              hint="Used for the offline PoS billing only"
            >
              <div className="flex flex-wrap gap-4 pt-1">
                {(
                  [
                    ['parcel', 'PARCEL'],
                    ['dineIn', 'DINE IN'],
                    ['dineInAlt', 'Dine In'],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={orderTypes[key]}
                      onChange={(event) =>
                        setOrderTypes((prev) => ({
                          ...prev,
                          [key]: event.target.checked,
                        }))
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
            <Field
              label="Decimal restriction"
              hint="Used for the restrict quantity in decimal"
            >
              <label className="inline-flex cursor-pointer items-center gap-2 pt-1 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={noDecimal}
                  onChange={(event) => setNoDecimal(event.target.checked)}
                  className="size-4 cursor-pointer accent-primary"
                />
                Don&apos;t allow decimal value for quantity
              </label>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Expose This Items In">
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                {(
                  [
                    ['online', 'Online Orders'],
                    ['captain', 'Captain App'],
                    ['kiosk', 'Kiosk'],
                    ['other', 'Other'],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={expose[key]}
                      onChange={(event) =>
                        setExpose((prev) => ({
                          ...prev,
                          [key]: event.target.checked,
                        }))
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="GST Type" required>
              <div className="flex flex-wrap gap-4 pt-1">
                {(['Services', 'Goods'] as const).map((option) => (
                  <label
                    key={option}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="radio"
                      name="gst-type"
                      checked={gstType === option}
                      onChange={() => setGstType(option)}
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Manufacturing Date">
              <div className="relative">
                <input
                  type="date"
                  value={mfgDate}
                  onChange={(event) => setMfgDate(event.target.value)}
                  className={inputClass()}
                />
                <Calendar
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </Field>
            <Field label="Expiration Date">
              <div className="relative">
                <input
                  type="date"
                  value={expDate}
                  onChange={(event) => setExpDate(event.target.value)}
                  className={inputClass()}
                />
                <Calendar
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </Field>
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={itemSchedule}
                onChange={(event) => setItemSchedule(event.target.checked)}
                className="mt-0.5 size-4 cursor-pointer accent-primary"
              />
              <span>
                <span className="font-medium">Item Schedule</span>
                <span className="mt-1 block text-xs text-primary">
                  If category scheduling is enabled, it will override item
                  scheduling. This feature is currently supported only for
                  offline POS billing.
                </span>
              </span>
            </label>
          </div>
        </Section>

        <Section
          title="Item Suggestions"
          note="This applies to offline billing with Electron PoS."
        >
          <Field
            label="Assign suggested item(s)"
            hint="Please note that items with addons are not eligible."
          >
            <div className="relative max-w-xl">
              <select
                value={suggestCategory}
                onChange={(event) => setSuggestCategory(event.target.value)}
                className={selectClass()}
              >
                <option>Select Category</option>
                {baseMenuCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          </Field>
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">
              Suggested Item(s)
            </p>
            <p className="text-sm text-muted">No item(s) assigned</p>
          </div>
        </Section>

        <Section title="Tags Information">
          <div className="rounded-md border border-line">
            <div className="border-b border-line bg-page px-4 py-2 text-sm font-semibold text-ink">
              General
            </div>
            <div className="space-y-4 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cuisine Tags">
                  <div className="relative">
                    <select className={selectClass()} defaultValue="">
                      <option value="" disabled>
                        Select multiple cuisine tags
                      </option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </Field>
                <Field label="Spice Level">
                  <div className="relative">
                    <select
                      value={spiceLevel}
                      onChange={(event) => setSpiceLevel(event.target.value)}
                      className={selectClass()}
                    >
                      <option>Not Applicable</option>
                      <option>Mild</option>
                      <option>Medium</option>
                      <option>Hot</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {GENERAL_TAGS.map((tag) => (
                  <label
                    key={tag.id}
                    className="inline-flex cursor-pointer items-start gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={generalTags.has(tag.id)}
                      onChange={() => toggleSet(setGeneralTags, tag.id)}
                      className="mt-0.5 size-4 cursor-pointer accent-primary"
                    />
                    <span>
                      <span className="font-medium">{tag.label}</span>
                      {'hint' in tag && tag.hint ? (
                        <span className="mt-0.5 block text-xs text-muted">
                          {tag.hint}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-line">
            <div className="border-b border-line bg-page px-4 py-2 text-sm font-semibold text-ink">
              Swiggy
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-3">
              <Field label="Portion Size Value">
                <div className="flex gap-2">
                  <input
                    value={swiggyPortion}
                    onChange={(event) => setSwiggyPortion(event.target.value)}
                    placeholder="Enter Qty"
                    className={inputClass()}
                  />
                  <div className="relative w-32 shrink-0">
                    <select
                      value={swiggyUnit}
                      onChange={(event) => setSwiggyUnit(event.target.value)}
                      className={selectClass()}
                    >
                      <option>Select Unit</option>
                      <option>gm</option>
                      <option>ml</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>
              </Field>
              <Field label="Minimum Preparation Time">
                <div className="relative">
                  <select
                    value={prepTime}
                    onChange={(event) => setPrepTime(event.target.value)}
                    className={selectClass()}
                  >
                    <option>Select Preparation time</option>
                    <option>5 min</option>
                    <option>10 min</option>
                    <option>15 min</option>
                    <option>20 min</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </Field>
              <Field label="Spice Level">
                <div className="relative">
                  <select
                    value={swiggySpice}
                    onChange={(event) => setSwiggySpice(event.target.value)}
                    className={selectClass()}
                  >
                    <option>Not Applicable</option>
                    <option>Mild</option>
                    <option>Medium</option>
                    <option>Hot</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </Field>
              <Field label="Sweet Level">
                <div className="relative">
                  <select
                    value={sweetLevel}
                    onChange={(event) => setSweetLevel(event.target.value)}
                    className={selectClass()}
                  >
                    <option>Not Applicable</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </Field>
              <Field label="Gravy Property">
                <div className="relative">
                  <select
                    value={gravy}
                    onChange={(event) => setGravy(event.target.value)}
                    className={selectClass()}
                  >
                    <option>Not Applicable</option>
                    <option>Dry</option>
                    <option>Gravy</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </Field>
              <Field label="Accompaniments">
                <input
                  value={accompaniments}
                  onChange={(event) => setAccompaniments(event.target.value)}
                  className={inputClass()}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-5 px-4 pb-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={swiggyRecommended}
                  onChange={(event) =>
                    setSwiggyRecommended(event.target.checked)
                  }
                  className="size-4 cursor-pointer accent-primary"
                />
                Swiggy-recommended
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={seasonalIngredients}
                  onChange={(event) =>
                    setSeasonalIngredients(event.target.checked)
                  }
                  className="size-4 cursor-pointer accent-primary"
                />
                Seasonal Ingredients
              </label>
            </div>
          </div>

          <div className="rounded-md border border-line">
            <div className="border-b border-line bg-page px-4 py-2 text-sm font-semibold text-ink">
              Zomato
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ZOMATO_TAGS.map((tag) => (
                <label
                  key={tag}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={zomatoTags.has(tag)}
                    onChange={() => toggleSet(setZomatoTags, tag)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Variation/Addon">
          <div className="flex flex-wrap gap-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={addonGroup}
                onChange={(event) => setAddonGroup(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              Addon Group
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={variation}
                onChange={(event) => setVariation(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              Variation
            </label>
          </div>
        </Section>

        <Section title="Inventory">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="HSN Code">
              <input
                value={hsn}
                onChange={(event) => setHsn(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Sap Code">
              <input
                value={sap}
                onChange={(event) => setSap(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="FSN Code">
              <input
                value={fsn}
                onChange={(event) => setFsn(event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Stock Status">
              <div className="relative">
                <select
                  value={stockStatus}
                  onChange={(event) => setStockStatus(event.target.value)}
                  className={selectClass()}
                >
                  <option>Do Not Track</option>
                  <option>In Stock</option>
                  <option>Out of Stock</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </Field>
            <div className="md:col-span-2">
              <label className="inline-flex cursor-pointer items-start gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={selfRecipe}
                  onChange={(event) => setSelfRecipe(event.target.checked)}
                  className="mt-0.5 size-4 cursor-pointer accent-primary"
                />
                <span>
                  <span className="font-medium">Create Self Item Recipe</span>
                  <span className="mt-1 block text-xs text-primary">
                    Yes [Applicable only when menu item is Purchased but does
                    not have any recipe.]
                  </span>
                </span>
              </label>
            </div>
          </div>
        </Section>

        <Section title="Nutrition">
          <textarea
            value={nutrition}
            onChange={(event) => setNutrition(event.target.value)}
            rows={5}
            className="w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </Section>

        <div className="flex flex-wrap justify-end gap-2 pb-2">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-primary bg-card px-4 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Change
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
