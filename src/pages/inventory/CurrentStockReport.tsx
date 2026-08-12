import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const CATEGORY_OPTIONS = [
  { id: 'all', name: 'All' },
  { id: 'no-category', name: 'No Category' },
  { id: 'rice-pulses-flours', name: 'Rice/pulses/flours' },
  { id: 'bread-dairy', name: 'Bread/dairy' },
  { id: 'oils-masala', name: 'Oils/masala/salt/sugar' },
  { id: 'ready-to-cook', name: 'Ready To Cook/ready To Eat' },
  { id: 'sauces', name: 'Sauces/dressings/marinades' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'packaging', name: 'Packaging/storage' },
  { id: 'fruits-vegetables', name: 'Fruits/vegetables' },
]

const CATEGORY_IDS = CATEGORY_OPTIONS.map((option) => option.id)
const CATEGORY_IDS_WITHOUT_ALL = CATEGORY_IDS.filter((id) => id !== 'all')

const STOCK_LEVEL_OPTIONS = [
  'All',
  'At-par stock',
  'Minimum stock',
  'Negative stock',
  'Maximum stock',
]

const STATUS_OPTIONS = ['Up to date', 'Lack of action']

function ExportMenu({
  onExportPage,
  onExportAll,
}: {
  onExportPage?: () => void
  onExportAll?: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        <FileText size={15} className="text-muted" />
        Export
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onExportPage?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export Current Page
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onExportAll?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export All
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

function CategoryMultiSelect({
  selectedIds,
  onChange,
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const display =
    selectedIds.length === 0
      ? 'Select Category'
      : selectedIds.includes('all') ||
          selectedIds.length === CATEGORY_IDS_WITHOUT_ALL.length
        ? 'All'
        : selectedIds.length === 1
          ? (CATEGORY_OPTIONS.find((o) => o.id === selectedIds[0])?.name ??
            '1 selected')
          : `${selectedIds.length} selected`

  function toggle(id: string) {
    if (id === 'all') {
      const selectingAll =
        !selectedIds.includes('all') &&
        selectedIds.length !== CATEGORY_IDS_WITHOUT_ALL.length
      onChange(selectingAll ? [...CATEGORY_IDS] : [])
      return
    }

    const withoutAll = selectedIds.filter((value) => value !== 'all')
    const next = withoutAll.includes(id)
      ? withoutAll.filter((value) => value !== id)
      : [...withoutAll, id]

    if (next.length === CATEGORY_IDS_WITHOUT_ALL.length) {
      onChange([...CATEGORY_IDS])
      return
    }
    onChange(next)
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-ink">
        Category
      </label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-left text-sm outline-none hover:bg-page focus:border-primary"
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selectedIds.length ? 'text-ink' : 'text-muted'
          }`}
        >
          {display}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 right-0 z-40 mt-1 max-h-56 overflow-y-auto rounded-md border border-line bg-card py-1 shadow-lg"
        >
          {CATEGORY_OPTIONS.map((option) => {
            const checked =
              option.id === 'all'
                ? selectedIds.includes('all') ||
                  selectedIds.length === CATEGORY_IDS_WITHOUT_ALL.length
                : selectedIds.includes(option.id) || selectedIds.includes('all')
            return (
              <li key={option.id} role="option" aria-selected={checked}>
                <label className="flex cursor-pointer items-start gap-2.5 px-3 py-2 text-sm text-ink hover:bg-page">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.id)}
                    className="mt-0.5 size-4 shrink-0 accent-primary"
                  />
                  <span className="leading-snug">{option.name}</span>
                </label>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default function CurrentStockReport() {
  const [rawMaterial, setRawMaterial] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [stockLevel, setStockLevel] = useState('All')
  const [status, setStatus] = useState('Up to date')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <InventoryPageShell activeItem="current-stock">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Current Stock Report</h1>
        <ExportMenu
          onExportPage={() => showToast('Exported current page')}
          onExportAll={() => showToast('Exported all')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Raw Material
          </label>
          <input
            type="text"
            value={rawMaterial}
            onChange={(event) => setRawMaterial(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <CategoryMultiSelect
            selectedIds={categories}
            onChange={setCategories}
          />
        </div>
        <div className="min-w-[150px]">
          <SearchableSelect
            label="Stock Level"
            value={stockLevel}
            options={STOCK_LEVEL_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setStockLevel}
          />
        </div>
        <div className="min-w-[150px]">
          <SearchableSelect
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            placeholder="Up to date"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setStatus}
          />
        </div>
        <OutlineButton onClick={() => showToast('Search applied')}>
          Search
        </OutlineButton>
      </div>

      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <span className="relative mb-4 text-muted">
          <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
          <Search
            size={24}
            className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
          />
        </span>
        <p className="text-base font-semibold text-ink">
          No Current Stock Report Found
        </p>
      </div>
    </InventoryPageShell>
  )
}
