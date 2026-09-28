import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  RotateCcw,
  Search,
  Star,
  X,
} from 'lucide-react'
import { showToast } from '../../utils/toast'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { HistoryMenu } from '../../components/inventory/HistoryMenu'
import { ImportStockExcel } from '../../components/inventory/ImportStockExcel'
import { StockCountHistoryModal } from '../../components/inventory/StockCountHistoryModal'
import { StockStepGuideModal } from '../../components/inventory/StockStepGuideModal'
import {
  STOCK_COUNT_COPY,
  type ImportedStockRow,
  type StockCountKind,
} from '../../components/inventory/stockCountShared'
import {
  StockUpdateCycleSelect,
  type StockUpdateCycle,
} from '../../components/inventory/StockUpdateCycleSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_STOCK_COUNT_READ_PERMISSIONS,
  INV_STOCK_COUNT_WRITE_PERMISSIONS,
  createStockEntryApi,
  getStockCountContextApi,
  hasAnyPermission,
  listStockEntriesApi,
  updateStockEntryApi,
  type StockCountMaterial,
  type StockEntry,
} from '../../services/inventoryService'
import { downloadCsv } from '../../utils/downloadFile'

interface CountRow {
  id: string
  name: string
  unit: string
  category: string
  favourite: boolean
  bookQty: number
  minLevel: number
  parLevel: number
  price: number
}

type TabId = 'add' | 'import'

const CYCLES: readonly StockUpdateCycle[] = [
  'all',
  'daily',
  'weekly',
  'bi-weekly',
  'monthly',
  'yearly',
]

function isCycle(value: string | undefined | null): value is StockUpdateCycle {
  return CYCLES.includes(value as StockUpdateCycle)
}

function toNumber(value: string | number | undefined | null): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Trim a decimal for display: 12.500 -> 12.5, 12.000 -> 12. */
function trim(value: number, places = 3): string {
  const fixed = value.toFixed(places)
  return places > 0 ? fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : fixed
}

function signed(value: number): string {
  const text = trim(Math.abs(value))
  if (Math.abs(value) < 0.0005) return '0'
  return `${value > 0 ? '+' : '-'}${text}`
}

/** `null` means "not counted yet"; a string is the inline error. */
interface CountedPeriod {
  label: string
  start: string
  end: string
  countedEntryId: string | null
  countedDate: string | null
  lastCountedDate: string | null
}

function qtyError(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(/,/g, ''))
  if (!Number.isFinite(parsed)) return 'Enter a number'
  if (parsed <= 0) return 'Must be above 0'
  return null
}

interface ManualStockCountProps {
  kind: StockCountKind
}

export function ManualStockCount({ kind }: ManualStockCountProps) {
  const copy = STOCK_COUNT_COPY[kind]
  const { encryptedOutletId, hasPermission } = useAuth()
const canRead = hasAnyPermission(hasPermission, INV_STOCK_COUNT_READ_PERMISSIONS[kind])
const canWrite = hasAnyPermission(hasPermission, INV_STOCK_COUNT_WRITE_PERMISSIONS[kind])


  const [tab, setTab] = useState<TabId>('add')
  const [stockDate, setStockDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  )
  const [query, setQuery] = useState('')
  const [cycle, setCycle] = useState<StockUpdateCycle>('daily')
  const [category, setCategory] = useState('All categories')
  const [favouritesOnly, setFavouritesOnly] = useState(false)
  const [enteredOnly, setEnteredOnly] = useState(false)
  const [showZeroBook, setShowZeroBook] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [lineNotes, setLineNotes] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')
  const [materials, setMaterials] = useState<StockCountMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingEntry, setLoadingEntry] = useState(false)
  const [saving, setSaving] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [savedEntry, setSavedEntry] = useState<StockEntry | null>(null)
  const [period, setPeriod] = useState<CountedPeriod | null>(null)
  const inputRefs = useRef(new Map<string, HTMLInputElement>())

  const draftKey = useCallback(
    (outletId: string) => `rajubhai.inv.${copy.draftKey}.${outletId}`,
    [copy.draftKey],
  )

  // Count-sheet bootstrap from the stock-count endpoint only: a role that may
  // count stock has no raw-material master or settings access, so the page must
  // not depend on either. Re-fetched when the counted period changes (date or
  // cycle) so the server decides which window the operator is filling.
  useEffect(() => {
    if (!encryptedOutletId || !canRead) return
    let cancelled = false
    setLoading(true)
    getStockCountContextApi(encryptedOutletId, kind, {
      stockDate,
      cycle,
    })
      .then((data) => {
        if (cancelled) return
        setMaterials(data.materials)
        setPeriod({
          label: data.period_label,
          start: data.period_start,
          end: data.period_end,
          countedEntryId: data.counted_entry_id,
          countedDate: data.counted_date,
          lastCountedDate: data.last_counted_date,
        })
        if (isCycle(data.cycle)) setCycle(data.cycle)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        showToast(
          err instanceof ApiError
            ? err.message
            : 'Unable to load the stock count sheet',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, kind, canRead, stockDate, cycle])

  // The server is the single source of truth for a saved count. Only when no
  // entry exists for the date do we fall back to the local draft / outlet default.
  useEffect(() => {
    if (!encryptedOutletId || !canRead) return
    const outletId = encryptedOutletId
    const key = draftKey(outletId)
    let cancelled = false

    async function load() {
      setLoadingEntry(true)
      try {
        const saved = await listStockEntriesApi(outletId, {
          kind,
          dateFrom: stockDate,
          dateTo: stockDate,
        })
        if (cancelled) return
        const entry = saved.results?.[0]
        if (entry) {
          const nextValues: Record<string, string> = {}
          const nextNotes: Record<string, string> = {}
          for (const line of entry.lines) {
            if (!line.raw_material_id) continue
            nextValues[line.raw_material_id] = line.qty
            if (line.reason) nextNotes[line.raw_material_id] = line.reason
          }
          setSavedEntry(entry)
          setValues(nextValues)
          setLineNotes(nextNotes)
          setNote(entry.note ?? '')
          if (isCycle(entry.cycle)) setCycle(entry.cycle)
          return
        }

        setSavedEntry(null)
        let restored = false
        const raw = localStorage.getItem(key)
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as {
              date?: string
              values?: Record<string, string>
              notes?: Record<string, string>
              note?: string
            }
            if (parsed.date === stockDate) {
              setValues(parsed.values ?? {})
              setLineNotes(parsed.notes ?? {})
              setNote(parsed.note ?? '')
              restored = true
            }
          } catch {
            localStorage.removeItem(key)
          }
        }
        if (!restored) {
          setValues({})
          setLineNotes({})
          setNote('')
        }
      } catch (err) {
        if (cancelled) return
        showToast(
          err instanceof ApiError ? err.message : 'Unable to load stock entry',
        )
      } finally {
        if (!cancelled) setLoadingEntry(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, kind, stockDate, canRead, draftKey])

  const categoryOptions = useMemo(() => {
    const names = new Set<string>()
    for (const row of materials) {
      if (row.category_name) names.add(row.category_name)
    }
    return ['All categories', 'No category', ...[...names].sort()]
  }, [materials])

  const rows: CountRow[] = useMemo(
    () =>
      materials.map((row) => ({
        id: row.id,
        name: row.name,
        unit: row.unit_name,
        category: row.category_name || 'No category',
        favourite: row.is_favourite,
        bookQty: toNumber(row.book_qty),
        minLevel: toNumber(row.min_stock_level),
        parLevel: toNumber(row.at_par_level),
        price: toNumber(row.reconciliation_price),
      })),
    [materials],
  )

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (category !== 'All categories' && row.category !== category) return false
      if (favouritesOnly && !row.favourite) return false
      if (!showZeroBook && row.bookQty === 0 && !values[row.id]?.trim()) {
        return false
      }
      if (enteredOnly && !values[row.id]?.trim()) return false
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q) ||
        row.unit.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
      )
    })
  }, [rows, query, category, favouritesOnly, enteredOnly, showZeroBook, values])

  const enteredRows = useMemo(
    () => rows.filter((row) => (values[row.id] || '').trim().length > 0),
    [rows, values],
  )

  const invalidRows = useMemo(
    () => enteredRows.filter((row) => qtyError(values[row.id] ?? '')),
    [enteredRows, values],
  )

  const summary = useMemo(() => {
    let up = 0
    let down = 0
    let value = 0
    let belowMin = 0
    let belowPar = 0
    for (const row of enteredRows) {
      const error = qtyError(values[row.id] ?? '')
      if (error) continue
      const diff = Number(values[row.id].replace(/,/g, '')) - row.bookQty
      if (diff > 0) up += diff
      else down += Math.abs(diff)
      value += Math.abs(diff) * row.price
      const counted = row.bookQty + diff
      if (row.minLevel > 0 && counted < row.minLevel) belowMin += 1
      else if (row.parLevel > 0 && counted < row.parLevel) belowPar += 1
    }
    return { up, down, value, belowMin, belowPar }
  }, [enteredRows, values])

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  function setLineNote(id: string, value: string) {
    setLineNotes((prev) => ({ ...prev, [id]: value }))
  }

  function clearAll() {
    setValues({})
    setLineNotes({})
    setExpandedRow(null)
    if (encryptedOutletId) {
      localStorage.removeItem(draftKey(encryptedOutletId))
    }
  }

  function resetRow(id: string) {
    setValues((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setLineNotes((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function bumpRow(id: string) {
    const current = Number((values[id] || '0').replace(/,/g, '')) || 0
    setValue(id, trim(current + 1))
  }

  function focusNext(id: string) {
    const index = filteredRows.findIndex((row) => row.id === id)
    for (let i = index + 1; i < filteredRows.length; i += 1) {
      const next = inputRefs.current.get(filteredRows[i].id)
      if (next) {
        next.focus()
        next.select()
        return
      }
    }
  }

  function varianceFor(row: CountRow) {
    const error = qtyError(values[row.id] ?? '')
    if (error) return null
    if (!(values[row.id] ?? '').trim()) return null
    return Number(values[row.id].replace(/,/g, '')) - row.bookQty
  }

  function exportDraft() {
    downloadCsv(
      [
        'raw_material',
        'unit',
        'category',
        'book_qty',
        'counted_qty',
        'variance',
        'variance_value',
        'notes',
        'stock_date',
        'cycle',
      ],
      enteredRows.map((row) => {
        const diff = varianceFor(row)
        return [
          row.name,
          row.unit,
          row.category,
          trim(row.bookQty),
          values[row.id] ?? '',
          diff === null ? '' : signed(diff),
          diff === null ? '' : (Math.abs(diff) * row.price).toFixed(2),
          lineNotes[row.id] ?? '',
          stockDate,
          cycle,
        ]
      }),
      `${kind}-stock-${stockDate}.csv`,
    )
    showToast(`${copy.title} CSV exported`)
  }

  // The cycle belongs to the count entry, not to the outlet. A count must never
  // silently edit an outlet-wide setting it may not be allowed to change, so
  // this only updates local/draft state; the value is sent with the entry.
  function persistCycle(next: StockUpdateCycle) {
    setCycle(next)
  }

  function buildLines() {
    return enteredRows.map((row) => {
      const diff = varianceFor(row) ?? 0
      return {
        raw_material_id: row.id,
        qty: Number(values[row.id].replace(/,/g, '')).toFixed(3),
        value: (Math.abs(diff) * row.price).toFixed(2),
        reason: (lineNotes[row.id] ?? '').trim(),
      }
    })
  }

  async function saveCount(): Promise<boolean> {
    if (!encryptedOutletId) return false
    const firstInvalid = invalidRows[0]
    if (firstInvalid) {
      showToast(
        `${firstInvalid.name}: ${qtyError(values[firstInvalid.id] ?? '')}`,
      )
      return false
    }
    if (enteredRows.length === 0) {
      showToast('Enter at least one quantity before saving')
      return false
    }
    setSaving(true)
    const payload = {
      kind,
      stock_date: stockDate,
      cycle,
      note: note.trim(),
      lines: buildLines(),
    }
    try {
      const entry = savedEntry
        ? await updateStockEntryApi(encryptedOutletId, savedEntry.id, payload)
        : await createStockEntryApi(encryptedOutletId, payload)
      setSavedEntry(entry)
      localStorage.removeItem(draftKey(encryptedOutletId))
      showToast(
        `${copy.title} saved for ${stockDate} (${enteredRows.length} lines, ${cycle})`,
      )
      return true
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to save stock entries',
      )
      return false
    } finally {
      setSaving(false)
    }
  }

  function keepDraft() {
    if (!encryptedOutletId) return
    if (enteredRows.length === 0) {
      localStorage.removeItem(draftKey(encryptedOutletId))
      return
    }
    localStorage.setItem(
      draftKey(encryptedOutletId),
      JSON.stringify({
        date: stockDate,
        values,
        notes: lineNotes,
        note,
        cycle,
      }),
    )
  }

  function applyImportedRows(imported: ImportedStockRow[]) {
    const byName = new Map(
      rows.map((row) => [row.name.trim().toLowerCase(), row.id]),
    )
    const nextValues = { ...values }
    const nextNotes = { ...lineNotes }
    let applied = 0
    let skipped = 0
    for (const row of imported) {
      const id = byName.get(row.raw_material_name.trim().toLowerCase())
      if (!id) {
        skipped += 1
        continue
      }
      const error = qtyError(row.qty)
      if (error) {
        skipped += 1
        continue
      }
      nextValues[id] = row.qty
      if (row.notes) nextNotes[id] = row.notes
      applied += 1
    }
    setValues(nextValues)
    setLineNotes(nextNotes)
    if (encryptedOutletId) {
      localStorage.setItem(
        draftKey(encryptedOutletId),
        JSON.stringify({
          date: stockDate,
          values: nextValues,
          notes: nextNotes,
          note,
          cycle,
        }),
      )
    }
    if (skipped) {
      showToast(
        `Applied ${applied} rows to the count sheet, skipped ${skipped}`,
      )
    }
  }

  function openEntryFromHistory(entry: StockEntry) {
    setHistoryOpen(false)
    setTab('add')
    setStockDate(entry.stock_date)
    // The cycle is part of the entry identity: without it the context lookup
    // would resolve a different period and never find the entry being opened.
    if (isCycle(entry.cycle)) setCycle(entry.cycle)
  }

  if (!canRead) {
    return (
      <InventoryPageShell activeItem={copy.activeItem}>
        <div className="rounded-xl border border-line bg-card p-8 text-center">
          <h1 className="text-lg font-bold text-ink">{copy.title}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            You do not have permission to view {copy.entityLabel}. Ask an
            administrator for the {copy.rightLabel} right.
          </p>
        </div>
      </InventoryPageShell>
    )
  }

  return (
    <InventoryPageShell activeItem={copy.activeItem}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">{copy.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={stockDate}
            onChange={(event) => setStockDate(event.target.value)}
            className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
          <HistoryMenu
            exportLabel={copy.exportLabel}
            onExport={exportDraft}
            onHistory={() => setHistoryOpen(true)}
          />
          <OutlineButton variant="gray" onClick={clearAll}>
            <X size={15} />
            Reset
          </OutlineButton>
          <OutlineButton variant="gray" onClick={() => setGuideOpen(true)}>
            Step-By-Step Guide
          </OutlineButton>
        </div>
      </div>

      {period ? (
        <div
          className={`mb-4 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            period.countedEntryId
              ? 'border-success/30 bg-success/5'
              : 'border-line bg-card'
          }`}
        >
          <span className="font-semibold text-ink">Counting period</span>
          <span className="text-ink">{period.label}</span>
          <span className="text-xs text-muted">
            {period.countedEntryId
              ? `Already counted on ${period.countedDate}. Saving again replaces that count.`
              : period.lastCountedDate
                ? `Last counted ${period.lastCountedDate}.`
                : 'Not counted yet.'}
          </span>
        </div>
      ) : null}

      {savedEntry ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-ink">
          <span className="font-semibold text-success">Saved</span>
          <span>
            {copy.title} posted for {savedEntry.stock_date} · {savedEntry.cycle} ·{' '}
            {savedEntry.lines.length} lines
          </span>
          <span className="text-xs text-muted">
            Editing and saving again will replace this count.
          </span>
        </div>
      ) : null}

      <div className="mb-4 flex gap-1 border-b border-line">
        {(
          [
            { id: 'add', label: copy.addTab },
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
          entityLabel={copy.entityLabel}
          onToast={showToast}
          onApply={applyImportedRows}
          sampleNames={rows.slice(0, 25).map((row) => row.name)}
          resolveId={(name) =>
            rows.find(
              (row) => row.name.trim().toLowerCase() === name.trim().toLowerCase(),
            )?.id
          }
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
            <ToggleChip active={favouritesOnly} onClick={() => setFavouritesOnly((p) => !p)}>
              <Star size={14} />
              Favourites
            </ToggleChip>
            <ToggleChip active={enteredOnly} onClick={() => setEnteredOnly((p) => !p)}>
              Entered
            </ToggleChip>
            <ToggleChip active={showZeroBook} onClick={() => setShowZeroBook((p) => !p)}>
              Show zero stock
            </ToggleChip>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-4 rounded-lg border border-line bg-card px-3 py-2 text-sm">
            <Stat label="Rows" value={String(enteredRows.length)} />
            <Stat
              label="Shortage"
              value={trim(summary.down)}
              tone={summary.down > 0 ? 'bad' : undefined}
            />
            <Stat
              label="Surplus"
              value={trim(summary.up)}
              tone={summary.up > 0 ? 'good' : undefined}
            />
            <Stat label="Variance value" value={summary.value.toFixed(2)} />
            <Stat
              label="Below min"
              value={String(summary.belowMin)}
              tone={summary.belowMin > 0 ? 'bad' : undefined}
            />
            <Stat
              label="Below par"
              value={String(summary.belowPar)}
              tone={summary.belowPar > 0 ? 'warn' : undefined}
            />
            {invalidRows.length > 0 ? (
              <span className="text-xs font-semibold text-primary">
                {invalidRows.length} row(s) need a valid quantity
              </span>
            ) : null}
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
              <div className="grid grid-cols-[minmax(0,1fr)_92px_120px_84px_76px] gap-2 border-b border-line bg-page px-4 py-2.5 text-xs font-semibold text-muted">
                <span>Raw Material</span>
                <span className="text-right">Book</span>
                <span>{copy.title.split(' ')[0]} Qty</span>
                <span className="text-right">Variance</span>
                <span className="text-right">Action</span>
              </div>
              <ul className="max-h-[520px] divide-y divide-line overflow-y-auto">
                {loading || loadingEntry ? (
                  <li className="px-4 py-12 text-center text-sm text-muted">
                    Loading…
                  </li>
                ) : filteredRows.length === 0 ? (
                  <li className="px-4 py-12 text-center text-sm text-muted">
                    No raw materials found
                  </li>
                ) : (
                  filteredRows.map((row) => {
                    const rawValue = values[row.id] ?? ''
                    const error = qtyError(rawValue)
                    const diff = varianceFor(row)
                    const expanded = expandedRow === row.id
                    const low = row.minLevel > 0 && diff !== null && row.bookQty + diff < row.minLevel
                    return (
                      <li key={row.id}>
                        <div
                          className={`grid grid-cols-[minmax(0,1fr)_92px_120px_84px_76px] items-center gap-2 px-4 py-2.5 ${
                            error ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRow((prev) => (prev === row.id ? null : row.id))
                              }
                              className="flex w-full cursor-pointer items-center gap-1 text-left"
                            >
                              {expanded ? (
                                <ChevronDown size={14} className="shrink-0 text-muted" />
                              ) : (
                                <ChevronRight size={14} className="shrink-0 text-muted" />
                              )}
                              <span className="truncate text-sm font-medium text-ink">
                                {row.name}
                              </span>
                            </button>
                            <p className="pl-5 text-xs text-muted">
                              / {row.unit}
                              {row.category !== 'No category' ? ` · ${row.category}` : ''}
                              {row.minLevel > 0 ? ` · min ${trim(row.minLevel)}` : ''}
                              {row.parLevel > 0 ? ` · par ${trim(row.parLevel)}` : ''}
                            </p>
                          </div>
                          <span className="text-right text-sm text-muted">
                            {trim(row.bookQty)}
                          </span>
                          <div>
                            <input
                              ref={(element) => {
                                if (element) inputRefs.current.set(row.id, element)
                                else inputRefs.current.delete(row.id)
                              }}
                              type="text"
                              inputMode="decimal"
                              aria-label={`${copy.title} quantity for ${row.name}`}
                              aria-invalid={Boolean(error)}
                              value={rawValue}
                              onChange={(event) => setValue(row.id, event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  focusNext(row.id)
                                }
                              }}
                              placeholder="0"
                              className={`h-9 w-full rounded-md border px-2.5 text-sm outline-none focus:border-primary ${
                                error ? 'border-primary bg-primary/5' : 'border-line'
                              }`}
                            />
                            {error ? (
                              <p className="mt-0.5 text-[11px] font-medium text-primary">
                                {error}
                              </p>
                            ) : null}
                          </div>
                          <span
                            className={`text-right text-sm font-medium ${
                              diff === null || Math.abs(diff) < 0.0005
                                ? 'text-muted'
                                : diff > 0
                                  ? 'text-success'
                                  : 'text-primary'
                            }`}
                          >
                            {diff === null ? '—' : signed(diff)}
                            {low ? (
                              <span className="ml-1 text-[10px] font-semibold uppercase text-primary">
                                low
                              </span>
                            ) : null}
                          </span>
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
                        </div>
                        {expanded ? (
                          <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-line bg-page/60 px-4 py-2.5 pl-10">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                              Variance value
                            </span>
                            <span className="text-sm font-medium text-ink">
                              {diff === null
                                ? '—'
                                : (Math.abs(diff) * row.price).toFixed(2)}
                            </span>
                            <span className="text-xs text-muted">
                              ({Math.abs(diff ?? 0).toFixed(3)} × {trim(row.price, 2)})
                            </span>
                            <label className="ml-auto flex min-w-[220px] flex-1 items-center gap-2">
                              <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted">
                                Note
                              </span>
                              <input
                                type="text"
                                value={lineNotes[row.id] ?? ''}
                                onChange={(event) => setLineNote(row.id, event.target.value)}
                                placeholder="Reason for this variance"
                                className="h-8 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                              />
                            </label>
                          </div>
                        ) : null}
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-ink">
              Count note
              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="e.g. Monthly physical count by store team"
                className="mt-1.5 h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
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
              onClick={() => {
                keepDraft()
                showToast('Draft kept on this device')
              }}
              disabled={enteredRows.length === 0}
            >
              Save Draft
            </OutlineButton>
            <OutlineButton
              onClick={async () => {
                const ok = await saveCount()
                if (ok) setReviewOpen(false)
              }}
              disabled={!canWrite || saving || enteredRows.length === 0}
              title={
                canWrite
                  ? invalidRows.length
                    ? 'Fix the highlighted rows first'
                    : undefined
                  : 'You do not have write access'
              }
            >
              {saving ? 'Saving…' : 'Quick Save'}
            </OutlineButton>
            <PrimaryButton
              onClick={() => setReviewOpen(true)}
              disabled={enteredRows.length === 0}
            >
              Review →
            </PrimaryButton>
          </div>
        </>
      )}

      <StockStepGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={copy.guideTitle}
        steps={[
          {
            title: 'Pick the count date',
            body: 'Every quantity on this sheet is saved as one counted entry for the selected date and stock update cycle. Changing the date loads that date instead.',
          },
          {
            title: 'Compare book against counted',
            body: 'Book is the balance the system currently holds. Enter what is physically on the shelf; Variance is counted minus book, so a shortage shows negative.',
          },
          {
            title: 'Review, then post',
            body: 'Review shows the totals and a Post button. Quick Save posts immediately. Posting sets the book balance to your counted quantity and writes a stock movement for the difference.',
          },
          {
            title: 'Correcting a mistake',
            body: 'Pick the same date again and save — the earlier count is replaced and its stock movements are reversed. Use History to find a past entry, or delete it outright.',
          },
        ]}
      />

      <StockStepGuideModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title={`Review ${copy.entityLabel}`}
        steps={[
          {
            title: `${enteredRows.length} rows · ${trim(summary.down)} short · ${trim(summary.up)} surplus`,
            body: enteredRows.length
              ? `${enteredRows
                  .slice(0, 8)
                  .map(
                    (row) =>
                      `${row.name}: book ${trim(row.bookQty)} → ${
                        values[row.id] || '0'
                      } ${row.unit} (${signed(varianceFor(row) ?? 0)})`,
                  )
                  .join(' · ')}${
                  enteredRows.length > 8 ? ` · +${enteredRows.length - 8} more` : ''
                }`
              : 'No quantities entered yet. Fill in the count column, then Review again.',
          },
          {
            title: `Variance value ${summary.value.toFixed(2)}`,
            body: `${summary.belowMin} row(s) fall below the minimum level and ${summary.belowPar} below the par level after this count. ${
              note.trim() ? `Note: ${note.trim()}` : 'No count note added.'
            }`,
          },
          {
            title: `${stockDate} · ${cycle} · ${
              savedEntry ? 'replaces the saved count' : 'new count'
            }`,
            body: `Posting sets the book balance for each row to the counted quantity and records a ${kind === 'available' ? 'opening' : 'closing'} stock movement for the difference. Save Draft keeps it on this device without touching the ledger.`,
          },
        ]}
        footerActions={
          <PrimaryButton
            disabled={!canWrite || saving || invalidRows.length > 0}
            onClick={async () => {
              const ok = await saveCount()
              if (ok) setReviewOpen(false)
            }}
          >
            {saving ? 'Posting…' : 'Post Count'}
          </PrimaryButton>
        }
      />

      {encryptedOutletId ? (
        <StockCountHistoryModal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          outletId={encryptedOutletId}
          kind={kind}
          canWrite={canWrite}
          onOpenEntry={openEntryFromHistory}
        />
      ) : null}
    </InventoryPageShell>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'good' | 'bad' | 'warn'
}) {
  const toneClass =
    tone === 'bad'
      ? 'text-primary'
      : tone === 'good'
        ? 'text-success'
        : tone === 'warn'
          ? 'text-warning'
          : 'text-ink'
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className={`text-sm font-semibold ${toneClass}`}>{value}</span>
    </span>
  )
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium ${
        active
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-line bg-card text-ink hover:bg-page'
      }`}
    >
      {children}
    </button>
  )
}
