import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Package, Scale, X } from 'lucide-react'
import { SearchableSelect } from './SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../menu/MenuActionButtons'
import {
  RAW_MATERIAL_CATEGORIES,
  type RawMaterialCategory,
} from '../../mocks/rawMaterialsData'

const UNITS = [
  'Kg',
  'Gm',
  'Ltr',
  'Ml',
  'Pcs',
  'Box',
  'Packet',
  'Bottle',
  'Dozen',
  'Carton',
]

const CATEGORY_OPTIONS = [...RAW_MATERIAL_CATEGORIES, 'No Category']

export interface QuickAddRawMaterialValues {
  name: string
  category: string
  purchaseUnits: string[]
  consumptionUnit: string
}

interface QuickAddRawMaterialModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: QuickAddRawMaterialValues) => void
}

function MultiUnitSelect({
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

  return (
    <div ref={rootRef}>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
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
            <ul role="listbox" className="max-h-48 overflow-y-auto py-1">
              {filtered.map((option) => {
                const selected = values.includes(option)
                return (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(
                          selected
                            ? values.filter((item) => item !== option)
                            : [...values, option],
                        )
                      }}
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

function UnitHint({
  icon,
  children,
}: {
  icon: ReactNode
  children: string
}) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-line bg-page px-3 py-2.5 text-xs leading-relaxed text-muted">
      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <p>{children}</p>
    </div>
  )
}

export function QuickAddRawMaterialModal({
  open,
  onClose,
  onSave,
}: QuickAddRawMaterialModalProps) {
  const titleId = useId()
  const nameId = useId()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [purchaseUnits, setPurchaseUnits] = useState<string[]>([])
  const [consumptionUnit, setConsumptionUnit] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setCategory('')
    setPurchaseUnits([])
    setConsumptionUnit('')
    setError('')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Raw material name is required')
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
    onSave({
      name: trimmed,
      category,
      purchaseUnits,
      consumptionUnit,
    })
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-base font-semibold text-ink">
                Add Basic Raw Material Details
              </h2>
              <p className="mt-1 text-sm text-muted">
                Quickly add raw materials by selecting and inputting the
                required components. The raw materials will be added seamlessly
                to your inventory.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="shrink-0 rounded-md p-1 text-muted hover:bg-page hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label
              htmlFor={nameId}
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Raw material name <span className="text-primary">*</span>
            </label>
            <input
              id={nameId}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <SearchableSelect
            label="Category"
            value={category}
            options={CATEGORY_OPTIONS}
            placeholder="Select/Add Category"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setCategory}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <MultiUnitSelect
                label="Purchase Units"
                required
                values={purchaseUnits}
                options={UNITS}
                placeholder="Select multiple unit"
                onChange={setPurchaseUnits}
              />
              <UnitHint icon={<Package size={14} />}>
                A purchase unit in inventory is the unit used to order or
                receive goods from a supplier. (Example kg, ltr).
              </UnitHint>
            </div>
            <div>
              <SearchableSelect
                label="Consumption Units"
                required
                value={consumptionUnit}
                options={UNITS}
                placeholder="Select Unit"
                searchPlaceholder="Search"
                includePlaceholderOption={false}
                onChange={setConsumptionUnit}
              />
              <UnitHint icon={<Scale size={14} />}>
                A consumption unit in inventory is the unit in which goods are
                used or consumed. (Example Gram, ml).
              </UnitHint>
            </div>
          </div>

          {error ? <p className="text-sm text-primary">{error}</p> : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <OutlineButton variant="gray" onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function resolveQuickAddCategory(
  category: string,
): RawMaterialCategory {
  if (
    (RAW_MATERIAL_CATEGORIES as readonly string[]).includes(category)
  ) {
    return category as RawMaterialCategory
  }
  return 'Oils/masala/salt/sugar'
}
