import { useCallback, useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { Plus, RotateCcw, Search, Star, X } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { HistoryMenu } from '../../components/inventory/HistoryMenu'
import { ImportStockExcel } from '../../components/inventory/ImportStockExcel'
import { StockStepGuideModal } from '../../components/inventory/StockStepGuideModal'
import {
  StockUpdateCycleSelect,
  type StockUpdateCycle,
} from '../../components/inventory/StockUpdateCycleSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  getInventorySettingsApi,
  listAllRawMaterialsApi,
  updateInventorySettingsApi,
  type RawMaterial,
} from '../../services/inventoryService'
import { downloadCsv } from '../../utils/downloadFile'

interface StockRow {
  id: string
  name: string
  unit: string
  category: string
  favourite?: boolean
}

type TabId = 'add' | 'import'

function draftKey(outletId: string, kind: string) {
  return `rajubhai.inv.${kind}.${outletId}`
}

export default function ClosingStock() {
  const { encryptedOutletId } = useAuth()
  const { categories, loadMasters } = useInventoryMasters()
  const [tab, setTab] = useState<TabId>('add')
  const [stockDate, setStockDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  )
  const [query, setQuery] = useState('')
  const [cycle, setCycle] = useState<StockUpdateCycle>('daily')
  const [category, setCategory] = useState('All categories')
  const [favouritesOnly, setFavouritesOnly] = useState(false)
  const [enteredTodayOnly, setEnteredTodayOnly] = useState(false)
  const [stockValues, setStockValues] = useState<Record<string, string>>({})
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    if (!encryptedOutletId) return
    getInventorySettingsApi(encryptedOutletId)
      .then((settings) => {
        const value = settings.stock_update_cycle
        if (
          value === 'all' ||
          value === 'daily' ||
          value === 'weekly' ||
          value === 'bi-weekly' ||
          value === 'monthly' ||
          value === 'yearly'
        ) {
          setCycle(value)
        }
      })
      .catch(() => undefined)
  }, [encryptedOutletId])

  const loadMaterials = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    try {
      const rows = await listAllRawMaterialsApi(encryptedOutletId)
      setMaterials(rows)
      const raw = localStorage.getItem(
        draftKey(encryptedOutletId, 'closingStock'),
      )
      if (raw) {
        const parsed = JSON.parse(raw) as {
          date?: string
          values?: Record<string, string>
        }
        if (parsed.date) setStockDate(parsed.date)
        if (parsed.values) setStockValues(parsed.values)
      }
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Unable to load raw materials',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    void loadMaterials()
  }, [loadMaterials])

  const categoryOptions = useMemo(
    () => [
      'All categories',
      'No category',
      ...categories.map((row) => row.name),
    ],
    [categories],
  )

  const rows: StockRow[] = useMemo(
    () =>
      materials.map((row) => ({
        id: row.id,
        name: row.name,
        unit: row.consumption_unit?.name ?? '',
        category: row.category?.name || 'No category',
        favourite: row.is_favourite,
      })),
    [materials],
  )

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (category !== 'All categories' && row.category !== category) return false
      if (favouritesOnly && !row.favourite) return false
      if (enteredTodayOnly && !stockValues[row.id]?.trim()) return false
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q) ||
        row.unit.toLowerCase().includes(q)
      )
    })
  }, [rows, query, category, favouritesOnly, enteredTodayOnly, stockValues])

  const enteredRows = useMemo(
    () =>
      rows.filter((row) => (stockValues[row.id] || '').trim().length > 0),
    [rows, stockValues],
  )

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

  function exportDraft() {
    downloadCsv(
      ['raw_material', 'unit', 'category', 'qty', 'stock_date', 'cycle'],
      enteredRows.map((row) => [
        row.name,
        row.unit,
        row.category,
        stockValues[row.id] ?? '',
        stockDate,
        cycle,
      ]),
      `closing-stock-${stockDate}.csv`,
    )
    showToast('Closing Stock PDF exported')
  }

  async function persistCycle(next: StockUpdateCycle) {
    setCycle(next)
    if (!encryptedOutletId) return
    try {
      await updateInventorySettingsApi(encryptedOutletId, {
        stock_update_cycle: next,
      })
    } catch {
      /* keep local cycle even if settings PATCH fails */
    }
  }

  function quickSave() {
    if (!encryptedOutletId) return
    localStorage.setItem(
      draftKey(encryptedOutletId, 'closingStock'),
      JSON.stringify({ date: stockDate, values: stockValues, cycle }),
    )
    showToast(
      enteredRows.length
        ? `Quick save completed (${enteredRows.length} entries)`
        : 'Quick save completed (empty draft)',
    )
  }

  return (
    <InventoryPageShell activeItem="closing-stock">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Closing Stock</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={stockDate}
            onChange={(event) => setStockDate(event.target.value)}
            className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
          <HistoryMenu
            exportLabel="Closing Stock CSV"
            onExport={exportDraft}
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
          <OutlineButton variant="gray" onClick={() => setGuideOpen(true)}>
            Step-By-Step Guide
          </OutlineButton>
        </div>
      </div>

      <div className="mb-4 flex gap-1 border-b border-line">
        {(
          [
            { id: 'add', label: 'Add Closing Stock' },
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
          entityLabel="Closing Stock"
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
                placeholder="Search raw material"
                className="h-9 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <StockUpdateCycleSelect value={cycle} onChange={persistCycle} />
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
                {categoryOptions.map((item) => {
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
                {loading ? (
                  <li className="px-4 py-12 text-center text-sm text-muted">
                    Loading…
                  </li>
                ) : filteredRows.length === 0 ? (
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
            <OutlineButton onClick={quickSave}>Quick Save</OutlineButton>
            <PrimaryButton onClick={() => setReviewOpen(true)}>
              Review →
            </PrimaryButton>
          </div>
        </>
      )}

      <StockStepGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Closing Stock guide"
      />

      <StockStepGuideModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review stock entries"
        steps={[
          {
            title: `${enteredRows.length} entries ready`,
            body: enteredRows.length
              ? enteredRows
                  .slice(0, 8)
                  .map(
                    (row) =>
                      `${row.name}: ${stockValues[row.id]} ${row.unit}`,
                  )
                  .join(' · ') +
                (enteredRows.length > 8
                  ? ` · +${enteredRows.length - 8} more`
                  : '')
              : 'No quantities entered yet. Fill New Stock values, then Review again.',
          },
          {
            title: 'Date & cycle',
            body: `Stock date ${stockDate}, update cycle “${cycle}”. Use Quick Save to keep a local draft until the stock-entry API is connected.`,
          },
        ]}
      />
    </InventoryPageShell>
  )
}
