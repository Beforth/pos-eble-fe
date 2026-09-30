import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Plus, Tag, Trash2 } from 'lucide-react'
import { SearchableSelect } from '../inventory/SearchableSelect'
import { PrimaryButton } from './MenuActionButtons'
import { showError } from '../../utils/toast'
import type {
  AddonGroup,
  Category,
  Channel,
  Item,
  ItemFlags,
  ItemPayload,
  Tax,
  VariationGroup,
} from '../../types/menu'

const TAG_OPTIONS = ['V+', 'NV', 'F', 'D', 'O', 'E']

const CHOICE_OPTIONS: Array<{ value: 'veg' | 'egg' | 'non-veg'; label: string }> = [
  { value: 'veg', label: 'Veg' },
  { value: 'egg', label: 'Egg' },
  { value: 'non-veg', label: 'Non-Veg' },
]

const ORDER_TYPE_OPTIONS = [
  { value: 'parcel', label: 'Parcel' },
  { value: 'dine-in', label: 'Dine In' },
  { value: 'dine-in-alt', label: 'Dine In (Alt)' },
]

const DAY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const STOCK_STATUS_OPTIONS = ['Do Not Track', 'In Stock', 'Out of Stock']

const FLAG_OPTIONS: Array<{ key: keyof ItemFlags; label: string; hint?: string }> = [
  {
    key: 'ignore_tax',
    label: 'Ignore Tax',
    hint: 'If enabled, tax will not be calculated on any platform.',
  },
  {
    key: 'ignore_discount',
    label: 'Ignore Discount',
    hint: 'If enabled, discount will not apply in offline POS billing.',
  },
  {
    key: 'set_as_favorite',
    label: 'Set As Favorite',
    hint: 'Used for the offline POS billing only.',
  },
  {
    key: 'open_item',
    label: 'Set As Open Item',
    hint: 'Used for the offline POS billing only.',
  },
  {
    key: 'open_quantity_popup',
    label: 'Open Quantity Popup',
    hint: 'Used for the offline POS billing only.',
  },
  {
    key: 'create_self_recipe',
    label: 'Create Self Item Recipe',
    hint: 'Applicable only when the menu item is purchased but has no recipe.',
  },
]

function defaultFlags(item?: Item | null): ItemFlags {
  return {
    ignore_tax: item?.flags?.ignore_tax ?? false,
    ignore_discount: item?.flags?.ignore_discount ?? false,
    set_as_favorite: item?.flags?.set_as_favorite ?? false,
    open_item: item?.flags?.open_item ?? false,
    open_quantity_popup: item?.flags?.open_quantity_popup ?? false,
    create_self_recipe: item?.flags?.create_self_recipe ?? false,
  }
}

function valueOr(value: string | number | null | undefined, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function initChannelPrices(
  channels: Channel[],
  item?: Item | null,
): Record<string, { price: string; isActive: boolean }> {
  const map: Record<string, { price: string; isActive: boolean }> = {}
  for (const channel of channels) {
    const area = item?.area_prices?.find((price) => price.outlet_channel_id === channel.id)
    map[channel.id] = {
      price: area ? valueOr(area.price) : '',
      isActive: area ? (area.is_active ?? true) : true,
    }
  }
  return map
}

function initAvailability(
  channels: Channel[],
  item?: Item | null,
): Record<string, boolean> {
  const map: Record<string, boolean> = {}
  for (const channel of channels) {
    map[channel.id] =
      item?.availability?.find((row) => row.outlet_channel_id === channel.id)
        ?.is_available ?? true
  }
  return map
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

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

const REQUIRED_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'short_code', label: 'Short Code' },
  { key: 'short_code_2', label: 'Short Code 2' },
  { key: 'item_unit', label: 'Item Unit' },
  { key: 'description', label: 'Description' },
  { key: 'long_description', label: 'Long Description' },
  { key: 'sap_code', label: 'SAP Code' },
  { key: 'hsn_code', label: 'HSN Code' },
  { key: 'fsn_code', label: 'FSN Code' },
]

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-danger">{message}</p>
}

function Section({
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

function CheckboxList({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: Array<{ id: string; label: string }>
  selected: string[]
  onToggle: (id: string) => void
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected])
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <div className="max-h-48 overflow-y-auto rounded-md border border-line p-2">
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted">No options available</p>
        ) : (
          options.map((option) => {
            const checked = selectedSet.has(option.id)
            return (
              <label
                key={option.id}
                className="inline-flex w-full cursor-pointer items-center gap-2 py-1.5 pr-2 text-sm text-ink"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option.id)}
                  className="size-4 cursor-pointer accent-primary"
                />
                <span className="truncate">{option.label}</span>
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}

export interface MenuItemFormProps {
  mode: 'create' | 'edit'
  categories: Category[]
  taxes: Tax[]
  variationGroups: VariationGroup[]
  addonGroups: AddonGroup[]
  channels: Channel[]
  currentChannelSlug: string
  item?: Item | null
  initialCategoryId?: string
  saving: boolean
  serverError: string
  serverErrors?: Record<string, string>
  uploadingImage: boolean
  onSave: (payload: ItemPayload) => void
  onCancel: () => void
  onUploadImage?: (input: {
    image: File
    outlet_channel_id?: string
    position?: number
  }) => void
  onDeleteImage?: (imageId: string) => void
}

export function MenuItemForm({
  mode,
  categories,
  taxes,
  variationGroups,
  addonGroups,
  channels,
  currentChannelSlug,
  item,
  initialCategoryId,
  saving,
  serverError,
  serverErrors = {},
  uploadingImage,
  onSave,
  onCancel,
  onUploadImage,
  onDeleteImage,
}: MenuItemFormProps) {
  const [missingRequired, setMissingRequired] = useState<string[]>([])

  const [name, setName] = useState(item?.name ?? '')
  const [categoryId, setCategoryId] = useState(item?.category_id ?? initialCategoryId ?? '')
  const [shortCode, setShortCode] = useState(item?.short_code ?? '')
  const [shortCode2, setShortCode2] = useState(item?.short_code_2 ?? '')
  const [onlineDisplayName, setOnlineDisplayName] = useState(
    item?.online_display_name ?? '',
  )
  const [basePrice, setBasePrice] = useState(item ? valueOr(item.base_price) : '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [longDescription, setLongDescription] = useState(
    item?.long_description ?? '',
  )
  const [tags, setTags] = useState<string[]>(item?.tags ?? [])
  const [choice, setChoice] = useState<'veg' | 'egg' | 'non-veg'>(
    item?.choice === 'egg' || item?.choice === 'non-veg' ? item.choice : 'veg',
  )
  const [orderTypes, setOrderTypes] = useState<string[]>(item?.order_types ?? [])
  const [days, setDays] = useState<string[]>(item?.days ?? [])
  const [itemUnit, setItemUnit] = useState(item?.item_unit ?? '')
  const [stockStatus, setStockStatus] = useState(
    item?.stock_status || STOCK_STATUS_OPTIONS[0],
  )
  const [rank, setRank] = useState(item ? valueOr(item.rank, '0') : '0')
  const [isActive, setIsActive] = useState(item?.is_active ?? true)
  const [flags, setFlags] = useState<ItemFlags>(() => defaultFlags(item))
  const [sapCode, setSapCode] = useState(item?.sap_code ?? '')
  const [hsnCode, setHsnCode] = useState(item?.hsn_code ?? '')
  const [fsnCode, setFsnCode] = useState(item?.fsn_code ?? '')
  const [profitMargin, setProfitMargin] = useState(
    item?.profit_margin != null ? valueOr(item.profit_margin) : '',
  )
  const [weight, setWeight] = useState(
    item?.weight != null ? valueOr(item.weight) : '',
  )
  const [taxIds, setTaxIds] = useState<string[]>(
    item?.taxes?.map((tax) => tax.id) ?? [],
  )
  const [variationIds, setVariationIds] = useState<string[]>([])
  const [addonGroupIds, setAddonGroupIds] = useState<string[]>([])
  const [variationsTouched, setVariationsTouched] = useState(false)
  const [addonsTouched, setAddonsTouched] = useState(false)
  const [channelPrices, setChannelPrices] = useState(() =>
    initChannelPrices(channels, item),
  )
  const [channelAvailability, setChannelAvailability] = useState(() =>
    initAvailability(channels, item),
  )

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageChannelId, setImageChannelId] = useState('')
  const [imagePosition, setImagePosition] = useState('')

  const currentChannel = channels.find(
    (channel) => channel.channel_slug === currentChannelSlug,
  )
  const mirrorRef = useRef('')

  const requiredFieldValues: Record<string, string> = {
    short_code: shortCode,
    short_code_2: shortCode2,
    item_unit: itemUnit,
    description,
    long_description: longDescription,
    sap_code: sapCode,
    hsn_code: hsnCode,
    fsn_code: fsnCode,
  }

  function hasFieldError(key: string) {
    return missingRequired.includes(key) || Boolean(serverErrors[key])
  }

  function clearFieldError(key: string) {
    setMissingRequired((prev) =>
      prev.filter((existing) => existing !== key),
    )
  }

  function getInputClass(key: string) {
    return `${inputClass} ${hasFieldError(key) ? 'border-danger' : ''}`
  }

  useEffect(() => {
    if (mode !== 'create') return
    if (!currentChannel) return
    const channelId = currentChannel.id
    setChannelPrices((prev) => {
      const current = prev[channelId]?.price ?? ''
      const base = String(basePrice)
      if (base === '') return prev
      const shouldMirror = current === '' || current === mirrorRef.current
      if (!shouldMirror) return prev
      if (current === base) {
        mirrorRef.current = base
        return prev
      }
      mirrorRef.current = base
      return {
        ...prev,
        [channelId]: {
          price: base,
          isActive: prev[channelId]?.isActive ?? true,
        },
      }
    })
  }, [basePrice, mode, currentChannel])

  const categoryNames = useMemo(() => categories.map((category) => category.name), [categories])
  const categoryLabel = useMemo(
    () => categories.find((category) => category.id === categoryId)?.name ?? '',
    [categories, categoryId],
  )

  const taxOptions = useMemo(
    () => taxes.map((tax) => ({ id: tax.id, label: tax.title })),
    [taxes],
  )
  const variationOptions = useMemo(
    () =>
      variationGroups.flatMap((group) =>
        group.variations.map((variation) => ({
          id: variation.id,
          label: `${variation.name} · ${group.department_name}`,
        })),
      ),
    [variationGroups],
  )
  const addonOptions = useMemo(
    () => addonGroups.map((group) => ({ id: group.id, label: group.department_name })),
    [addonGroups],
  )

  function toggleArray(
    setter: (updater: (prev: string[]) => string[]) => void,
    value: string,
  ) {
    setter((prev) => {
      const next = prev.includes(value)
        ? prev.filter((existing) => existing !== value)
        : [...prev, value]
      return next
    })
  }

  function toggleFlag(key: keyof ItemFlags) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function updateChannelPrice(channelId: string, patch: Partial<{ price: string; isActive: boolean }>) {
    setChannelPrices((prev) => ({
      ...prev,
      [channelId]: { ...(prev[channelId] ?? { price: '', isActive: true }), ...patch },
    }))
  }

  function handleSubmit() {
    if (!name.trim()) {
      showError('Item name is required')
      return
    }
    if (!categoryId) {
      showError('Select a category')
      return
    }
    if (basePrice.trim() === '' || Number.isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
      showError('Enter a valid base price')
      return
    }

    const missing = REQUIRED_FIELDS.filter(
      (field) => requiredFieldValues[field.key].trim() === '',
    )
    if (missing.length > 0) {
      setMissingRequired(missing.map((field) => field.key))
      const names = missing.map((field) => field.label).join(', ')
      showError(`${names} ${missing.length === 1 ? 'is' : 'are'} required`)
      return
    }
    setMissingRequired([])
    const payload: ItemPayload = {
      category_id: categoryId,
      name: name.trim(),
      short_code: shortCode.trim(),
      short_code_2: shortCode2.trim(),
      online_display_name: onlineDisplayName.trim() || name.trim(),
      base_price: Number(basePrice),
      description: description.trim(),
      long_description: longDescription.trim(),
      tags,
      choice,
      order_types: orderTypes,
      days,
      item_unit: itemUnit.trim(),
      stock_status: stockStatus,
      rank: Number(rank) || 0,
      is_active: isActive,
      flags: { ...flags },
      sap_code: sapCode.trim(),
      hsn_code: hsnCode.trim(),
      fsn_code: fsnCode.trim(),
      profit_margin:
        profitMargin.trim() === '' ? null : Number(profitMargin),
      weight: weight.trim() === '' ? null : Number(weight),
      tax_ids: taxIds,
      ...(mode === 'edit'
        ? {
            ...(variationsTouched ? { variation_ids: variationIds } : {}),
            ...(addonsTouched ? { addon_group_ids: addonGroupIds } : {}),
          }
        : {
            variation_ids: variationIds,
            addon_group_ids: addonGroupIds,
          }),
      area_prices: channels.map((channel) => ({
        outlet_channel_id: channel.id,
        price:
          (channelPrices[channel.id]?.price ?? '').trim() === ''
            ? Number(basePrice)
            : channelPrices[channel.id].price,
        is_active: channelPrices[channel.id]?.isActive ?? true,
      })),
      availability: channels.map((channel) => ({
        outlet_channel_id: channel.id,
        is_available: channelAvailability[channel.id] ?? true,
      })),
    }
    onSave(payload)
  }

  const shownError = serverError

  return (
    <div className="space-y-4">
      {/* ── Item Details ── */}
      <Section icon={<Plus size={16} />} title="Item Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel required>Item Name</FieldLabel>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Masala Dabeli"
              className={inputClass}
            />
          </div>
          <div>
            <SearchableSelect
              label="Category"
              required
              value={categoryLabel}
              options={categoryNames}
              placeholder="Select a category"
              searchPlaceholder="Search categories..."
              dropdownPlacement="above"
              onChange={(nameValue) => {
                const category = categories.find((item) => item.name === nameValue)
                setCategoryId(category?.id ?? '')
              }}
            />
          </div>
          <div>
            <FieldLabel required>Short Code</FieldLabel>
            <input
              type="text"
              value={shortCode}
              onChange={(event) => {
                setShortCode(event.target.value)
                clearFieldError('short_code')
              }}
              placeholder="e.g. MD01"
              className={getInputClass('short_code')}
            />
            <FieldError message={serverErrors.short_code} />
          </div>
          <div>
            <FieldLabel required>Short Code 2</FieldLabel>
            <input
              type="text"
              value={shortCode2}
              onChange={(event) => {
                setShortCode2(event.target.value)
                clearFieldError('short_code_2')
              }}
              placeholder="e.g. MD01B"
              className={getInputClass('short_code_2')}
            />
            <FieldError message={serverErrors.short_code_2} />
          </div>
          <div>
            <FieldLabel>Online Display Name</FieldLabel>
            <input
              type="text"
              value={onlineDisplayName}
              onChange={(event) => setOnlineDisplayName(event.target.value)}
              placeholder="Defaults to item name"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted">
              If left blank, the item name will be used.
            </p>
          </div>
          <div>
            <FieldLabel required>Base Price</FieldLabel>
            <input
              type="text"
              inputMode="decimal"
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel required>Item Unit</FieldLabel>
            <input
              type="text"
              value={itemUnit}
              onChange={(event) => {
                setItemUnit(event.target.value)
                clearFieldError('item_unit')
              }}
              placeholder="e.g. pc, plate, gm"
              className={getInputClass('item_unit')}
            />
            <FieldError message={serverErrors.item_unit} />
          </div>
          <div>
            <FieldLabel>Rank</FieldLabel>
            <input
              type="text"
              inputMode="numeric"
              value={rank}
              onChange={(event) => setRank(event.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel required>Description</FieldLabel>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                clearFieldError('description')
              }}
              rows={3}
              placeholder="Optional short description..."
              className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary ${
                hasFieldError('description') ? 'border-danger' : 'border-line'
              }`}
            />
            <FieldError message={serverErrors.description} />
          </div>
          <div>
            <FieldLabel required>Long Description</FieldLabel>
            <textarea
              value={longDescription}
              onChange={(event) => {
                setLongDescription(event.target.value)
                clearFieldError('long_description')
              }}
              rows={3}
              placeholder="Optional detailed description..."
              className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary ${
                hasFieldError('long_description') ? 'border-danger' : 'border-line'
              }`}
            />
            <FieldError message={serverErrors.long_description} />
          </div>
        </div>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-4 cursor-pointer accent-primary"
          />
          Active
        </label>
      </Section>

      {/* ── Menu Options ── */}
      <Section icon={<Tag size={16} />} title="Menu Options">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <FieldLabel>Choice</FieldLabel>
            <div className="flex flex-wrap gap-4 pt-1">
              {CHOICE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="item-choice"
                    checked={choice === option.value}
                    onChange={() => setChoice(option.value)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Order Types</FieldLabel>
            <div className="flex flex-wrap gap-4 pt-1">
              {ORDER_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={orderTypes.includes(option.value)}
                    onChange={() => toggleArray(setOrderTypes, option.value)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Days</FieldLabel>
            <div className="flex flex-wrap gap-4 pt-1">
              {DAY_OPTIONS.map((day) => (
                <label
                  key={day}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={days.includes(day.toLowerCase())}
                    onChange={() => toggleArray(setDays, day.toLowerCase())}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Stock Status</FieldLabel>
            <select
              value={stockStatus}
              onChange={(event) => setStockStatus(event.target.value)}
              className={inputClass}
            >
              {STOCK_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <FieldLabel>Tags</FieldLabel>
          <div className="flex flex-wrap gap-2 pt-1">
            {TAG_OPTIONS.map((tag) => {
              const active = tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleArray(setTags, tag)}
                  className={`inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-line bg-card text-muted hover:border-muted'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ── Flags ── */}
      <Section icon={<span className="text-xs font-bold">F</span>} title="Flags">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FLAG_OPTIONS.map((flag) => (
            <label
              key={flag.key}
              className="inline-flex cursor-pointer items-start gap-2 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={flags[flag.key]}
                onChange={() => toggleFlag(flag.key)}
                className="mt-0.5 size-4 cursor-pointer accent-primary"
              />
              <span>
                <span className="font-medium">{flag.label}</span>
                {flag.hint ? (
                  <span className="mt-0.5 block text-xs text-muted">
                    {flag.hint}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Codes & Margins ── */}
      <Section icon={<span className="text-xs font-bold">§</span>} title="Codes & Margins">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <FieldLabel required>SAP Code</FieldLabel>
            <input
              type="text"
              value={sapCode}
              onChange={(event) => {
                setSapCode(event.target.value)
                clearFieldError('sap_code')
              }}
              className={getInputClass('sap_code')}
            />
            <FieldError message={serverErrors.sap_code} />
          </div>
          <div>
            <FieldLabel required>HSN Code</FieldLabel>
            <input
              type="text"
              value={hsnCode}
              onChange={(event) => {
                setHsnCode(event.target.value)
                clearFieldError('hsn_code')
              }}
              className={getInputClass('hsn_code')}
            />
            <FieldError message={serverErrors.hsn_code} />
          </div>
          <div>
            <FieldLabel required>FSN Code</FieldLabel>
            <input
              type="text"
              value={fsnCode}
              onChange={(event) => {
                setFsnCode(event.target.value)
                clearFieldError('fsn_code')
              }}
              className={getInputClass('fsn_code')}
            />
            <FieldError message={serverErrors.fsn_code} />
          </div>
          <div>
            <FieldLabel>Profit Margin (%)</FieldLabel>
            <input
              type="text"
              inputMode="decimal"
              value={profitMargin}
              onChange={(event) => setProfitMargin(event.target.value)}
              placeholder="Leave blank for none"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Weight</FieldLabel>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="Leave blank for none"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* ── Assignments ── */}
      <Section icon={<span className="text-xs font-bold">A</span>} title="Taxes, Variations & Addons">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CheckboxList
            label="Taxes"
            options={taxOptions}
            selected={taxIds}
            onToggle={(id) => toggleArray(setTaxIds, id)}
          />
          <CheckboxList
            label="Variations"
            options={variationOptions}
            selected={variationIds}
            onToggle={(id) => {
              setVariationsTouched(true)
              toggleArray(setVariationIds, id)
            }}
          />
          <CheckboxList
            label="Addon Groups"
            options={addonOptions}
            selected={addonGroupIds}
            onToggle={(id) => {
              setAddonsTouched(true)
              toggleArray(setAddonGroupIds, id)
            }}
          />
        </div>
        {mode === 'edit' && variationOptions.length > 0 ? (
          <p className="mt-3 text-xs text-muted">
            Variation and addon selections are not returned by the item detail
            endpoint, so they start unselected. Changes to these lists are only
            sent to the API after you toggle them here.
          </p>
        ) : null}
      </Section>

      {/* ── Channel Pricing & Availability ── */}
      <Section
        icon={<span className="text-xs font-bold">Ch</span>}
        title="Channel Pricing & Availability"
      >
        {channels.length === 0 ? (
          <p className="text-sm text-muted">No channels available.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {channels.map((channel) => {
              const row = channelPrices[channel.id] ?? { price: '', isActive: true }
              const available = channelAvailability[channel.id] ?? true
              const isCurrent = channel.channel_slug === currentChannelSlug
              return (
                <div
                  key={channel.id}
                  className={`rounded-md border p-3 ${
                    isCurrent ? 'border-primary bg-primary/5' : 'border-line bg-card'
                  }`}
                >
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ink">
                      {channel.channel_label}
                    </p>
                    <p className="text-xs text-muted">
                      {channel.channel_slug}
                      {isCurrent ? ' · current channel' : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="w-32">
                      <FieldLabel>Price</FieldLabel>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.price}
                        onChange={(event) =>
                          updateChannelPrice(channel.id, { price: event.target.value })
                        }
                        placeholder="Base price"
                        className={inputClass}
                      />
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 pb-2.5 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={(event) =>
                          updateChannelPrice(channel.id, { isActive: event.target.checked })
                        }
                        className="size-4 cursor-pointer accent-primary"
                      />
                      Active
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 pb-2.5 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={available}
                        onChange={(event) =>
                          setChannelAvailability((prev) => ({
                            ...prev,
                            [channel.id]: event.target.checked,
                          }))
                        }
                        className="size-4 cursor-pointer accent-primary"
                      />
                      Available
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* ── Images (edit only) ── */}
      {mode === 'edit' && item ? (
        <Section icon={<span className="text-xs font-bold">Img</span>} title="Images">
          {item.images.length === 0 ? (
            <p className="mb-3 text-sm text-muted">No images uploaded yet.</p>
          ) : (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {item.images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-md border border-line bg-card"
                >
                  <img
                    src={image.image}
                    alt={`Item image ${image.position + 1}`}
                    className="h-28 w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span className="truncate text-xs text-muted">
                      {image.channel_slug ?? 'base'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteImage?.(image.id)}
                      className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <FieldLabel>Image File</FieldLabel>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                className="text-sm text-ink file:mr-2 file:inline-flex file:h-9 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-card file:px-3 file:text-sm file:font-medium file:text-ink"
              />
            </div>
            <div className="w-40">
              <FieldLabel>Channel</FieldLabel>
              <select
                value={imageChannelId}
                onChange={(event) => setImageChannelId(event.target.value)}
                className={inputClass}
              >
                <option value="">Base</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.channel_label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <FieldLabel>Position</FieldLabel>
              <input
                type="text"
                inputMode="numeric"
                value={imagePosition}
                onChange={(event) => setImagePosition(event.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <PrimaryButton
              disabled={uploadingImage || !imageFile}
              onClick={() => {
                if (!imageFile) return
                onUploadImage?.({
                  image: imageFile,
                  outlet_channel_id: imageChannelId || undefined,
                  position: imagePosition.trim() === '' ? 0 : Number(imagePosition),
                })
                setImageFile(null)
              }}
            >
              {uploadingImage ? 'Uploading…' : 'Upload Image'}
            </PrimaryButton>
          </div>
        </Section>
      ) : null}

      {shownError ? <p className="mb-3 text-sm text-danger">{shownError}</p> : null}

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : mode === 'create' ? 'Create Item' : 'Save Changes'}
        </PrimaryButton>
      </div>
    </div>
  )
}