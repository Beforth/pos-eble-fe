import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { ChevronDown, FileText, Lightbulb, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const CATEGORY_OPTIONS = [
  'All',
  'Vegetable Sandwich',
  'Beverages',
  'Snacks',
  'Dabeli',
  'Chaat',
  'Pizza Mania',
  'South Indian',
  'Chinese',
  'Main Course',
  'Combos',
  'No Category',
]

const ORDER_TYPE_OPTIONS = ['All', 'Dine In', 'Delivery', 'Pick Up']

const DEFAULT_FROM = '2026-08-10'
const DEFAULT_TO = '2026-08-11'

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

export default function FoodCostingReport() {
  const [menuItem, setMenuItem] = useState('')
  const [category, setCategory] = useState('All')
  const [orderType, setOrderType] = useState('All')
  const [fromDate, setFromDate] = useState(DEFAULT_FROM)
  const [toDate, setToDate] = useState(DEFAULT_TO)
  const [applied, setApplied] = useState({
    menuItem: '',
    category: 'All',
    orderType: 'All',
    fromDate: DEFAULT_FROM,
    toDate: DEFAULT_TO,
  })

  function handleSearch() {
    setApplied({
      menuItem: menuItem.trim(),
      category,
      orderType,
      fromDate,
      toDate,
    })
    showToast('Search applied')
  }

  function handleClear() {
    setMenuItem('')
    setCategory('All')
    setOrderType('All')
    setFromDate(DEFAULT_FROM)
    setToDate(DEFAULT_TO)
    setApplied({
      menuItem: '',
      category: 'All',
      orderType: 'All',
      fromDate: DEFAULT_FROM,
      toDate: DEFAULT_TO,
    })
  }

  const exportRow = [
    applied.menuItem,
    applied.category,
    applied.orderType,
    applied.fromDate,
    applied.toDate,
  ]

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Food Costing Report</h1>
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton onClick={() => showToast('Help Center')}>
            <Lightbulb size={15} />
            Help Center
          </OutlineButton>
          <ExportMenu
            onExportPage={() => {
              downloadCsv(
                [
                  'menu_item',
                  'category',
                  'order_type',
                  'from_date',
                  'to_date',
                ],
                [exportRow],
                'food-costing-page.csv',
              )
              showToast('Exported current page')
            }}
            onExportAll={() => {
              downloadCsv(
                [
                  'menu_item',
                  'category',
                  'order_type',
                  'from_date',
                  'to_date',
                ],
                [exportRow],
                'food-costing-all.csv',
              )
              showToast('Exported all')
            }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[150px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Menu Item
          </label>
          <input
            type="text"
            value={menuItem}
            onChange={(event) => setMenuItem(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[150px]">
          <SearchableSelect
            label="Category"
            value={category}
            options={CATEGORY_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setCategory}
          />
        </div>
        <div className="min-w-[150px]">
          <SearchableSelect
            label="Order Type"
            value={orderType}
            options={ORDER_TYPE_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setOrderType}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
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
          No Food Costing Report Found
        </p>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Filters: menu={applied.menuItem || '—'} · category={applied.category}{' '}
          · orderType={applied.orderType} · from={applied.fromDate} · to=
          {applied.toDate}
        </p>
      </div>
    </InventoryPageShell>
  )
}
