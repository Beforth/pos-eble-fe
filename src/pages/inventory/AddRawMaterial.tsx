import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  Boxes,
  Check,
  ChevronDown,
  CirclePercent,
  Coins,
  FilePenLine,
  Info,
  MessageSquareText,
  Package,
  Settings2,
  X,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import {
  defaultPurchaseUnitsForCategory,
  getRawMaterialById,
  RAW_MATERIAL_CATEGORIES,
  type RawMaterialRow,
} from '../../mocks/rawMaterialsData'

const UNITS = [
  'Kg',
  'GM',
  'Gm',
  'Ltr',
  'Ml',
  'Pcs',
  'BOX',
  'Box',
  'pkt',
  'Packet',
  'TIN',
  'jar',
  'bottle',
  'Bottle',
  'Dozen',
  'Carton',
]

const CLOSING_CYCLES = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Yearly']

const CATEGORY_OPTIONS = [
  ...RAW_MATERIAL_CATEGORIES,
  'No Category',
]

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

function RadioYesNo({
  label,
  value,
  onChange,
}: {
  label: string
  value: 'yes' | 'no'
  onChange: (value: 'yes' | 'no') => void
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-5 pt-1">
        {(
          [
            { id: 'yes', label: 'Yes' },
            { id: 'no', label: 'No' },
          ] as const
        ).map((option) => (
          <label
            key={option.id}
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
          >
            <input
              type="radio"
              name={label}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="size-4 accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}

export default function AddRawMaterial() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const stateRow = (location.state as { row?: RawMaterialRow } | null)?.row
  const existing =
    stateRow ?? (id ? getRawMaterialById(id) : undefined)

  const [name, setName] = useState('')
  const [purchaseUnits, setPurchaseUnits] = useState<string[]>([])
  const [consumptionUnit, setConsumptionUnit] = useState('')
  const [conversionPurchaseUnit, setConversionPurchaseUnit] = useState('')
  const [conversionQty, setConversionQty] = useState('1000')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('0')
  const [transferPrice, setTransferPrice] = useState('0')
  const [reconciliationPrice, setReconciliationPrice] = useState('0')
  const [taxType, setTaxType] = useState<'gst' | 'vat'>('gst')
  const [taxPercent, setTaxPercent] = useState('0')
  const [minStockUnit, setMinStockUnit] = useState('')
  const [minStockLevel, setMinStockLevel] = useState('0')
  const [atParUnit, setAtParUnit] = useState('')
  const [atParLevel, setAtParLevel] = useState('0')
  const [closingCycles, setClosingCycles] = useState<string[]>(['Daily'])
  const [allowRestock, setAllowRestock] = useState(false)
  const [addOpeningStock, setAddOpeningStock] = useState(true)
  const [maxStockQty, setMaxStockQty] = useState('')
  const [maxStockUnit, setMaxStockUnit] = useState('')
  const [maxStockRows, setMaxStockRows] = useState<
    { id: string; qty: string; unit: string }[]
  >([])
  const [barcode, setBarcode] = useState('')
  const [hsnCode, setHsnCode] = useState('')
  const [exclusive, setExclusive] = useState('No')
  const [isExpiry, setIsExpiry] = useState('No')
  const [allowDecimal, setAllowDecimal] = useState<'yes' | 'no'>('yes')
  const [description, setDescription] = useState('')
  const [normalLoss, setNormalLoss] = useState('0')
  const [exciseQty, setExciseQty] = useState('0')
  const [gtin, setGtin] = useState('')
  const [brand, setBrand] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    if (!existing) {
      setError('Raw material not found')
      return
    }
    const units = defaultPurchaseUnitsForCategory(existing.category)
    setName(existing.name)
    setPurchaseUnits(units)
    setConsumptionUnit('GM')
    setConversionPurchaseUnit(units[0] ?? 'Kg')
    setConversionQty('1000')
    setCategory(existing.category)
    setSubCategory('')
    setPurchasePrice('0')
    setTransferPrice('0')
    setReconciliationPrice('0')
    setTaxType('gst')
    setTaxPercent('0')
    setMinStockLevel('0')
    setAtParLevel('0')
    setClosingCycles(['Daily'])
    setAddOpeningStock(true)
    setAllowDecimal('yes')
    setNormalLoss('0')
    setExciseQty('0')
    setExclusive('No')
    setIsExpiry('No')
  }, [isEdit, existing])

  const displayName = name.trim() || 'Raw Material'
  const pricesTitle = isEdit ? `${displayName} Prices` : 'Prices'
  const taxesTitle = isEdit ? `% ${displayName} Taxes` : '% Taxes'
  const levelsTitle = isEdit ? `${displayName} Levels` : 'Set levels'
  const codesTitle = isEdit ? `${displayName} Related Codes` : 'Related Codes'

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function addMaxStockRow() {
    if (!maxStockQty.trim() || !maxStockUnit) {
      setError('Enter maximum stock quantity and unit')
      return
    }
    setError('')
    setMaxStockRows((prev) => [
      ...prev,
      {
        id: `max-${Date.now()}`,
        qty: maxStockQty,
        unit: maxStockUnit,
      },
    ])
    setMaxStockQty('')
    setMaxStockUnit('')
  }

  function handleSave() {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (purchaseUnits.length === 0) {
      setError('Purchase unit is required')
      return
    }
    if (!consumptionUnit) {
      setError('Consumption unit is required')
      return
    }
    setError('')
    showToast(isEdit ? 'Raw material updated' : 'Raw material saved')
    window.setTimeout(() => navigate('/inventory/raw-materials'), 900)
  }

  return (
    <InventoryPageShell activeItem="raw-materials">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">
          {isEdit ? 'Edit Raw Material' : 'Add Raw Material'}
        </h1>
      </div>

      <SectionCard icon={<Package size={16} />} title="Basic Details">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <FieldLabel required>Name</FieldLabel>
            <TextInput value={name} onChange={setName} placeholder="Name" />
          </div>
          <MultiSelectTags
            label="Purchase Unit"
            required
            values={purchaseUnits}
            options={UNITS}
            placeholder="Select multiple unit"
            onChange={(values) => {
              setPurchaseUnits(values)
              if (
                values.length > 0 &&
                !values.includes(conversionPurchaseUnit)
              ) {
                setConversionPurchaseUnit(values[0])
              }
            }}
          />
          <SearchableSelect
            label="Consumption Unit"
            required
            value={consumptionUnit}
            options={UNITS}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setConsumptionUnit}
          />
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
          <Info size={13} className="mt-0.5 shrink-0 text-primary" />
          Transactional data may change if a purchase or consumption unit is
          changed.
        </p>

        {purchaseUnits.length > 0 && consumptionUnit ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-page px-3 py-3 text-sm text-ink">
            <span>One</span>
            <div className="min-w-[110px]">
              <SearchableSelect
                value={conversionPurchaseUnit || purchaseUnits[0]}
                options={purchaseUnits}
                placeholder="Unit"
                searchPlaceholder="Search"
                includePlaceholderOption={false}
                compact
                onChange={setConversionPurchaseUnit}
              />
            </div>
            <span>(Purchase unit) of {displayName} is equivalent to</span>
            <input
              type="text"
              value={conversionQty}
              onChange={(event) => setConversionQty(event.target.value)}
              className="h-9 w-24 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
            />
            <span>
              {consumptionUnit} (consumption unit).
            </span>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SearchableSelect
            label="Category"
            value={category}
            options={CATEGORY_OPTIONS}
            placeholder="Select/Add Category"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setCategory}
          />
          <SearchableSelect
            label="Sub Category"
            value={subCategory}
            options={['No Sub Category']}
            placeholder="Select/Add Sub Category"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setSubCategory}
          />
        </div>
      </SectionCard>

      <SectionCard icon={<Coins size={16} />} title={pricesTitle}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <FieldLabel>Purchase Price</FieldLabel>
            <TextInput
              value={purchasePrice}
              onChange={setPurchasePrice}
              placeholder="0.00"
            />
          </div>
          <div>
            <FieldLabel>Transfer Price</FieldLabel>
            <TextInput
              value={transferPrice}
              onChange={setTransferPrice}
              placeholder="0.00"
            />
          </div>
          <div>
            <FieldLabel>Reconciliation Price</FieldLabel>
            <TextInput
              value={reconciliationPrice}
              onChange={setReconciliationPrice}
              placeholder="0.00"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={<CirclePercent size={16} />} title={taxesTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>TAX Type</FieldLabel>
            <div className="flex flex-wrap gap-5 pt-1">
              {(
                [
                  { id: 'gst', label: 'GST' },
                  { id: 'vat', label: 'VAT' },
                ] as const
              ).map((option) => (
                <label
                  key={option.id}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="tax-type"
                    checked={taxType === option.id}
                    onChange={() => setTaxType(option.id)}
                    className="size-4 accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Tax(%)</FieldLabel>
            <TextInput
              value={taxPercent}
              onChange={setTaxPercent}
              placeholder="0"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={<Boxes size={16} />} title={levelsTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          <SearchableSelect
            label="Minimum Stock Level Unit"
            value={minStockUnit}
            options={UNITS}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setMinStockUnit}
          />
          <div>
            <FieldLabel>Minimum Stock Level</FieldLabel>
            <TextInput value={minStockLevel} onChange={setMinStockLevel} />
          </div>
          <SearchableSelect
            label="At Par Stock Level Unit"
            value={atParUnit}
            options={UNITS}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setAtParUnit}
          />
          <div>
            <FieldLabel>At Par Stock Level</FieldLabel>
            <TextInput value={atParLevel} onChange={setAtParLevel} />
          </div>
        </div>

        <div className="mt-4 max-w-xl">
          <MultiSelectTags
            label="Closing stock being updated on"
            values={closingCycles}
            options={CLOSING_CYCLES}
            placeholder="Select cycle"
            onChange={setClosingCycles}
          />
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={allowRestock}
              onChange={(event) => setAllowRestock(event.target.checked)}
              className="size-4 accent-primary"
            />
            Allow Restock Level
            <span title="Enable restock level alerts for this raw material">
              <Info size={13} className="text-muted" />
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={addOpeningStock}
              onChange={(event) => setAddOpeningStock(event.target.checked)}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              Add opening stock and Avg purchase price
              <span className="mt-1 block text-xs text-muted">
                The &apos;Opening Stock&apos; and &apos;Average Purchase
                Price&apos; fields are already added and therefore cannot be
                edited.
              </span>
            </span>
          </label>
        </div>
      </SectionCard>

      <SectionCard
        icon={<FilePenLine size={16} />}
        title="For Maximum Stock Level"
        collapsible
        defaultOpen
      >
        <div className="rounded-lg border border-line bg-primary/5 p-3">
          <div className="mb-2 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <FieldLabel>Maximum Stock Qty</FieldLabel>
              <TextInput
                value={maxStockQty}
                onChange={setMaxStockQty}
                placeholder="Qty"
              />
            </div>
            <SearchableSelect
              label="Maximum Stock Unit"
              value={maxStockUnit}
              options={UNITS}
              placeholder="Select Unit"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setMaxStockUnit}
            />
            <OutlineButton onClick={addMaxStockRow}>Add</OutlineButton>
          </div>
        </div>
        {maxStockRows.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {maxStockRows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm"
              >
                <span className="text-ink">
                  {row.qty} {row.unit}
                </span>
                <button
                  type="button"
                  aria-label="Remove max stock row"
                  onClick={() =>
                    setMaxStockRows((prev) =>
                      prev.filter((item) => item.id !== row.id),
                    )
                  }
                  className="rounded p-1 text-muted hover:bg-page hover:text-ink"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </SectionCard>

      <SectionCard
        icon={<MessageSquareText size={16} />}
        title={codesTitle}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Barcode/Short Code</FieldLabel>
            <TextInput value={barcode} onChange={setBarcode} />
          </div>
          <div>
            <FieldLabel>HSN Code</FieldLabel>
            <TextInput value={hsnCode} onChange={setHsnCode} />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={<Settings2 size={16} />} title="Other Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <SearchableSelect
              label="Exclusive to this restaurant"
              value={exclusive}
              options={['No', 'Yes']}
              placeholder="No"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setExclusive}
            />
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
              <Info size={13} className="mt-0.5 shrink-0 text-muted" />
              This raw material is restricted for use only by this specific
              restaurant and not shared with others.
            </p>
          </div>
          <SearchableSelect
            label="Is Expiry"
            value={isExpiry}
            options={['No', 'Yes']}
            placeholder="No"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setIsExpiry}
          />
          <RadioYesNo
            label="Allow Decimal Quantity"
            value={allowDecimal}
            onChange={setAllowDecimal}
          />
          <div>
            <FieldLabel>Normal loss (%)</FieldLabel>
            <TextInput value={normalLoss} onChange={setNormalLoss} />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={<FilePenLine size={16} />}
        title="For Excise Report"
        collapsible
        defaultOpen
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <FieldLabel>Quantity (in gm/ml)</FieldLabel>
            <TextInput value={exciseQty} onChange={setExciseQty} />
          </div>
          <div>
            <FieldLabel>GTIN</FieldLabel>
            <TextInput value={gtin} onChange={setGtin} />
          </div>
          <div>
            <FieldLabel>Brand</FieldLabel>
            <TextInput value={brand} onChange={setBrand} />
          </div>
        </div>
      </SectionCard>

      {error ? <p className="mb-3 text-sm text-primary">{error}</p> : null}

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/inventory/raw-materials')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
      </div>
    </InventoryPageShell>
  )
}
