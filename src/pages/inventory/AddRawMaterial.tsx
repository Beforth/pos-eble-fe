import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
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
import { AddNewMenuRow, SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  useInventoryQuickAdd,
} from '../../components/inventory/InventoryQuickAdd'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WRITE_PERMISSION,
  categoryIdByName,
  createRawMaterialApi,
  getRawMaterialApi,
  unitIdByName,
  updateRawMaterialApi,
  type RawMaterialPayload,
} from '../../services/inventoryService'

const CLOSING_CYCLES = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Yearly']

function noneLabel(value: string): boolean {
  const needle = value.trim().toLowerCase()
  return !needle || needle === 'no category' || needle === 'no sub category'
}

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
  onAddNew,
}: {
  label: string
  required?: boolean
  values: string[]
  options: string[]
  placeholder: string
  onChange: (values: string[]) => void
  onAddNew?: () => void
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
            {onAddNew ? (
              <AddNewMenuRow
                onClick={() => {
                  setOpen(false)
                  onAddNew()
                }}
              />
            ) : null}
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
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const { units, categories, loadMasters } = useInventoryMasters()
  const quickAdd = useInventoryQuickAdd()

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
  const [saving, setSaving] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(isEdit)

  const unitNames = useMemo(() => {
    const names = units.filter((row) => row.is_active).map((row) => row.name)
    const extras = [
      consumptionUnit,
      conversionPurchaseUnit,
      minStockUnit,
      atParUnit,
      maxStockUnit,
      ...purchaseUnits,
      ...maxStockRows.map((row) => row.unit),
    ]
    for (const name of extras) {
      if (name && !names.includes(name)) names.push(name)
    }
    return names
  }, [
    units,
    consumptionUnit,
    conversionPurchaseUnit,
    minStockUnit,
    atParUnit,
    maxStockUnit,
    purchaseUnits,
    maxStockRows,
  ])

  const categoryOptions = useMemo(
    () => [...categories.map((row) => row.name), 'No Category'],
    [categories],
  )

  const selectedCategoryId = categoryIdByName(categories, category) ?? null
  const subCategoryOptions = useMemo(() => {
    const children = categories
      .filter((row) => row.parent_id && row.parent_id === selectedCategoryId)
      .map((row) => row.name)
    return [...children, 'No Sub Category']
  }, [categories, selectedCategoryId])

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    if (!isEdit || !id) {
      setLoadingExisting(false)
      return
    }
    if (!encryptedOutletId) {
      setError('Select an outlet before editing a raw material')
      setLoadingExisting(false)
      return
    }
    let cancelled = false
    setLoadingExisting(true)
    getRawMaterialApi(encryptedOutletId, id)
      .then((existing) => {
        if (cancelled) return
        setName(existing.name)
        setPurchaseUnits(existing.purchase_units.map((unit) => unit.name))
        setConsumptionUnit(existing.consumption_unit.name)
        setConversionPurchaseUnit(
          existing.conversion_purchase_unit?.name ??
            existing.purchase_units[0]?.name ??
            '',
        )
        setConversionQty(existing.conversion_qty)
        setCategory(existing.category?.name ?? '')
        setSubCategory(existing.sub_category?.name ?? '')
        setPurchasePrice(existing.purchase_price)
        setTransferPrice(existing.transfer_price)
        setReconciliationPrice(existing.reconciliation_price)
        setTaxType(existing.tax_type === 'vat' ? 'vat' : 'gst')
        setTaxPercent(existing.tax_percent)
        setMinStockUnit(existing.min_stock_unit?.name ?? '')
        setMinStockLevel(existing.min_stock_level)
        setAtParUnit(existing.at_par_unit?.name ?? '')
        setAtParLevel(existing.at_par_level)
        setClosingCycles(
          existing.closing_cycles.length > 0
            ? existing.closing_cycles
            : ['Daily'],
        )
        setAllowRestock(existing.allow_restock)
        setMaxStockRows(
          existing.max_stock_rows.map((row, index) => ({
            id: `max-${index}-${row.unit_id}`,
            qty: row.qty,
            unit: row.unit_name,
          })),
        )
        setBarcode(existing.barcode)
        setHsnCode(existing.hsn_code)
        setExclusive(existing.exclusive_to_outlet ? 'Yes' : 'No')
        setIsExpiry(existing.is_expiry ? 'Yes' : 'No')
        setAllowDecimal(existing.allow_decimal ? 'yes' : 'no')
        setDescription(existing.description)
        setNormalLoss(existing.normal_loss_percent)
        setExciseQty(existing.excise_qty)
        setGtin(existing.gtin)
        setBrand(existing.brand)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Raw material not found',
        )
      })
      .finally(() => {
        if (!cancelled) setLoadingExisting(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, id, isEdit])

  const displayName = name.trim() || 'Raw Material'
  const pricesTitle = isEdit ? `${displayName} Prices` : 'Prices'
  const taxesTitle = isEdit ? `% ${displayName} Taxes` : '% Taxes'
  const levelsTitle = isEdit ? `${displayName} Levels` : 'Set levels'
  const codesTitle = isEdit ? `${displayName} Related Codes` : 'Related Codes'


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

  async function handleSave() {
    if (!canWrite) return
    if (!encryptedOutletId) {
      setError('Select an outlet before saving a raw material')
      return
    }
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
    const purchaseIds = purchaseUnits
      .map((unitName) => unitIdByName(units, unitName))
      .filter((unitId): unitId is string => Boolean(unitId))
    const consumptionId = unitIdByName(units, consumptionUnit)
    if (purchaseIds.length === 0 || !consumptionId) {
      setError('Create a unit before saving a raw material')
      return
    }
    const conversionId =
      unitIdByName(units, conversionPurchaseUnit) ?? purchaseIds[0]
    const minId = minStockUnit ? unitIdByName(units, minStockUnit) : undefined
    const atParId = atParUnit ? unitIdByName(units, atParUnit) : undefined
    const payload: RawMaterialPayload = {
      name: name.trim(),
      purchase_unit_ids: purchaseIds,
      consumption_unit_id: consumptionId,
      conversion_purchase_unit_id: conversionId,
      conversion_qty: conversionQty || '1',
      category_id: noneLabel(category)
        ? null
        : (categoryIdByName(categories, category) ?? null),
      sub_category_id: noneLabel(subCategory)
        ? null
        : (categoryIdByName(categories, subCategory) ?? null),
      purchase_price: purchasePrice || '0',
      transfer_price: transferPrice || '0',
      reconciliation_price: reconciliationPrice || '0',
      tax_type: taxType,
      tax_percent: taxPercent || '0',
      min_stock_unit_id: minId ?? null,
      min_stock_level: minStockLevel || '0',
      at_par_unit_id: atParId ?? null,
      at_par_level: atParLevel || '0',
      closing_cycles: closingCycles,
      allow_restock: allowRestock,
      barcode,
      hsn_code: hsnCode,
      exclusive_to_outlet: exclusive === 'Yes',
      is_expiry: isExpiry === 'Yes',
      allow_decimal: allowDecimal === 'yes',
      description,
      normal_loss_percent: normalLoss || '0',
      excise_qty: exciseQty || '0',
      gtin,
      brand,
      max_stock_rows: maxStockRows.map((row) => {
        const unitId = unitIdByName(units, row.unit)
        return { qty: row.qty, unit_id: unitId ?? '' }
      }).filter((row) => row.unit_id),
    }
    setError('')
    setSaving(true)
    try {
      if (isEdit && id) {
        await updateRawMaterialApi(encryptedOutletId, id, payload)
        showToast('Raw material updated')
      } else {
        await createRawMaterialApi(encryptedOutletId, payload)
        showToast('Raw material saved')
      }
      navigate('/inventory/raw-materials')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to save raw material',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <InventoryPageShell activeItem="raw-materials">

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
            options={unitNames}
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
            onAddNew={quickAdd.handler('unit', (row) => {
              setPurchaseUnits((prev) =>
                prev.includes(row.name) ? prev : [...prev, row.name],
              )
              if (!conversionPurchaseUnit) setConversionPurchaseUnit(row.name)
            })}
          />
          <SearchableSelect
            label="Consumption Unit"
            required
            value={consumptionUnit}
            options={unitNames}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setConsumptionUnit}
            onAddNew={quickAdd.handler('unit', (row) =>
              setConsumptionUnit(row.name),
            )}
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
            options={categoryOptions}
            placeholder="Select/Add Category"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={(value) => {
              setCategory(value)
              setSubCategory('')
            }}
            onAddNew={quickAdd.handler('category', (row) => {
              setCategory(row.name)
              setSubCategory('')
            })}
          />
          <SearchableSelect
            label="Sub Category"
            value={subCategory}
            options={subCategoryOptions}
            placeholder="Select/Add Sub Category"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setSubCategory}
            onAddNew={quickAdd.handler('category', (row) =>
              setSubCategory(row.name),
            )}
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
            options={unitNames}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setMinStockUnit}
            onAddNew={quickAdd.handler('unit', (row) =>
              setMinStockUnit(row.name),
            )}
          />
          <div>
            <FieldLabel>Minimum Stock Level</FieldLabel>
            <TextInput value={minStockLevel} onChange={setMinStockLevel} />
          </div>
          <SearchableSelect
            label="At Par Stock Level Unit"
            value={atParUnit}
            options={unitNames}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setAtParUnit}
            onAddNew={quickAdd.handler('unit', (row) =>
              setAtParUnit(row.name),
            )}
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
              options={unitNames}
              placeholder="Select Unit"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setMaxStockUnit}
              onAddNew={quickAdd.handler('unit', (row) =>
                setMaxStockUnit(row.name),
              )}
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
        {canWrite ? (
          <PrimaryButton
            disabled={saving || loadingExisting}
            onClick={() => void handleSave()}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </PrimaryButton>
        ) : null}
      </div>
      {quickAdd.host}
    </InventoryPageShell>
  )
}
