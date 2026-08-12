import { useMemo, useState } from 'react'
import {
  Plus,
  RotateCcw,
  Search,
  Star,
  X,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { HistoryMenu } from '../../components/inventory/HistoryMenu'
import { ImportStockExcel } from '../../components/inventory/ImportStockExcel'
import {
  StockUpdateCycleSelect,
  type StockUpdateCycle,
} from '../../components/inventory/StockUpdateCycleSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface StockRow {
  id: string
  name: string
  unit: string
  category: string
  favourite?: boolean
}

const CATEGORIES = [
  'All categories',
  'No category',
  'Bread/dairy',
  'Fruits/vegetables',
  'Grocery',
  'Oils & spices',
  'Packaging',
  'Snacks',
]

const RAW_MATERIALS: StockRow[] = [
  {
    id: '1',
    name: 'Bhel Mixture',
    unit: 'carton',
    category: 'Snacks',
    favourite: true,
  },
  { id: '2', name: 'Bhel Mixture', unit: 'BOX', category: 'Snacks' },
  { id: '3', name: 'Bhel Mixture', unit: 'pkt', category: 'Snacks' },
  { id: '4', name: 'Bhel Mixture', unit: 'Bag', category: 'Snacks' },
  { id: '5', name: 'Bhel Mixture', unit: 'Kg', category: 'Snacks' },
  { id: '6', name: 'Bhujia Namkeen', unit: 'carton', category: 'Snacks' },
  { id: '7', name: 'Bhujia Namkeen', unit: 'BOX', category: 'Snacks' },
  { id: '8', name: 'Bhujia Namkeen', unit: 'pkt', category: 'Snacks' },
  { id: '9', name: 'Bhujia Namkeen', unit: 'Bag', category: 'Snacks' },
  {
    id: '10',
    name: 'Bhujia Namkeen',
    unit: 'Kg',
    category: 'Snacks',
    favourite: true,
  },
  { id: '11', name: 'Milk', unit: 'Ltr', category: 'Bread/dairy' },
  { id: '12', name: 'Butter', unit: 'Kg', category: 'Bread/dairy' },
  { id: '13', name: 'Tomato', unit: 'Kg', category: 'Fruits/vegetables' },
  { id: '14', name: 'Onion', unit: 'Kg', category: 'Fruits/vegetables' },
  { id: '15', name: 'Flour', unit: 'Kg', category: 'Grocery' },
]

type TabId = 'add' | 'import'

export default function AvailableStock() {
  const [tab, setTab] = useState<TabId>('add')
  const [stockDate, setStockDate] = useState('2026-08-11')
  const [query, setQuery] = useState('')
  const [cycle, setCycle] = useState<StockUpdateCycle>('daily')
  const [category, setCategory] = useState('All categories')
  const [favouritesOnly, setFavouritesOnly] = useState(false)
  const [enteredTodayOnly, setEnteredTodayOnly] = useState(false)
  const [stockValues, setStockValues] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return RAW_MATERIALS.filter((row) => {
      if (category !== 'All categories' && row.category !== category) return false
      if (favouritesOnly && !row.favourite) return false
      if (enteredTodayOnly && !stockValues[row.id]?.trim()) return false
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q) ||
        row.unit.toLowerCase().includes(q) ||
        row.id.includes(q)
      )
    })
  }, [query, category, favouritesOnly, enteredTodayOnly, stockValues])

  function setValue(id: string, value: string) {
    setStockValues((prev) => ({ ...prev, [id]: value }))
  }

  function clearAll() {
    setStockValues({})
  }

  function resetRow(id: string) {
    setStockValues((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function bumpRow(id: string) {
    const current = Number(stockValues[id] || 0)
    setValue(id, String(Number.isFinite(current) ? current + 1 : 1))
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <InventoryPageShell activeItem="available-stock">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Available Stock</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={stockDate}
            onChange={(event) => setStockDate(event.target.value)}
            className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
          <HistoryMenu
            exportLabel="Available stock PDF"
            onExport={() => showToast('Available stock PDF exported')}
          />
          <OutlineButton
            variant="gray"
            onClick={() => {
              clearAll()
              showToast('Entries reset')
            }}
          >
            <X size={15} />
            Reset
          </OutlineButton>
        </div>
      </div>

      <div className="mb-4 flex gap-1 border-b border-line">
        {(
          [
            { id: 'add', label: 'Add Available Stock' },
            { id: 'import', label: 'Import Via Excel' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`relative -mb-px px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === item.id
                ? 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'import' ? (
        <ImportStockExcel
          entityLabel="available stock"
          onToast={showToast}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="relative min-w-[220px] flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search raw material or barcode"
                className="h-9 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <StockUpdateCycleSelect value={cycle} onChange={setCycle} />
            <button
              type="button"
              onClick={() => setFavouritesOnly((prev) => !prev)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium ${
                favouritesOnly
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-line bg-card text-ink hover:bg-page'
              }`}
            >
              <Star size={14} />
              Favourites
            </button>
            <button
              type="button"
              onClick={() => setEnteredTodayOnly((prev) => !prev)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium ${
                enteredTodayOnly
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-line bg-card text-ink hover:bg-page'
              }`}
            >
              Entered Today
            </button>
          </div>

          <div className="flex min-h-[420px] overflow-hidden rounded-xl border border-line bg-card">
            <aside className="hidden w-52 shrink-0 border-r border-line md:block">
              <p className="border-b border-line px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Categories
              </p>
              <ul className="max-h-[520px] overflow-y-auto py-1">
                {CATEGORIES.map((item) => {
                  const active = category === item
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`w-full px-3 py-2 text-left text-sm ${
                          active
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'text-ink hover:bg-page'
                        }`}
                      >
                        {item}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-[1fr_140px_88px] gap-2 border-b border-line bg-page px-4 py-2.5 text-xs font-semibold text-muted">
                <span>Raw Material</span>
                <span>New Stock</span>
                <span className="text-right">Action</span>
              </div>
              <ul className="max-h-[520px] divide-y divide-line overflow-y-auto">
                {filteredRows.length === 0 ? (
                  <li className="px-4 py-12 text-center text-sm text-muted">
                    No raw materials found
                  </li>
                ) : (
                  filteredRows.map((row) => (
                    <li
                      key={row.id}
                      className="grid grid-cols-[1fr_140px_88px] items-center gap-2 px-4 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {row.name}
                        </p>
                        <p className="text-xs text-muted">/ {row.unit}</p>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={stockValues[row.id] ?? ''}
                        onChange={(event) =>
                          setValue(row.id, event.target.value)
                        }
                        placeholder="0"
                        className="h-9 w-full rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                      />
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Increase ${row.name}`}
                          onClick={() => bumpRow(row.id)}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-line text-muted hover:bg-page hover:text-ink"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Reset ${row.name}`}
                          onClick={() => resetRow(row.id)}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-line text-muted hover:bg-page hover:text-ink"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                clearAll()
                showToast('All entries cleared')
              }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Clear All Entries
            </button>
            <OutlineButton
              onClick={() => showToast('Quick save completed')}
            >
              Quick Save
            </OutlineButton>
            <PrimaryButton onClick={() => showToast('Review stock entries')}>
              Review →
            </PrimaryButton>
          </div>
        </>
      )}
    </InventoryPageShell>
  )
}
