import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
<<<<<<< HEAD
import { downloadCsv } from '../../utils/downloadFile'
=======
import { downloadCsv } from '../../utils/exportCsv'
>>>>>>> origin/main
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_REPORT_PERMISSION,
  categoryIdByName,
  listAllManualStockEntryReportApi,
  type ManualStockEntryReportRow,
} from '../../services/inventoryService'

const KIND_OPTIONS = ['All', 'Available', 'Closing']

function ExportMenu({ onExportReport }: { onExportReport?: () => void }) {
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
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[280px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onExportReport?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export Manual Adjustment List
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export default function ManualStockEntryReport() {
  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const { categories, loadMasters } = useInventoryMasters()
  const [rawMaterial, setRawMaterial] = useState('')
  const [category, setCategory] = useState('All')
  const [kind, setKind] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [applied, setApplied] = useState({
    search: '',
    category: 'All',
    kind: 'All',
    fromDate: '',
    toDate: '',
  })
  const [rows, setRows] = useState<ManualStockEntryReportRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  const categoryOptions = useMemo(
    () => ['All', ...categories.map((row) => row.name), 'No Category'],
    [categories],
  )

  const load = useCallback(async () => {
    if (!encryptedOutletId || !canRead) return
    setLoading(true)
    try {
      const categoryId =
        applied.category === 'All'
          ? undefined
          : applied.category === 'No Category'
            ? 'no-category'
            : categoryIdByName(categories, applied.category)
      const data = await listAllManualStockEntryReportApi(encryptedOutletId, {
        search: applied.search || undefined,
        categoryId,
        kind: applied.kind,
        dateFrom: applied.fromDate || undefined,
        dateTo: applied.toDate || undefined,
      })
      setRows(data)
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Unable to load manual stock entry report',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, canRead, applied, categories])

  useEffect(() => {
    void load()
  }, [load])

  function exportRows(
    rows: (string | number | null | undefined)[][],
    suffix: 'page' | 'all',
  ) {
    downloadCsv(
      `manual-stock-entry-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date', 'Raw Material', 'Unit', 'Category', 'Adjustment Type', 'Qty'],
      rows,
    )
    showToast(`Exported ${rows.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Manual Adjustment List</h1>
        <ExportMenu
<<<<<<< HEAD
          onExportReport={() => {
            downloadCsv(
              [
                'date',
                'type',
                'cycle',
                'raw_material',
                'category',
                'qty',
                'unit',
                'value',
                'reason',
              ],
              rows.map((row) => [
                row.stock_date,
                row.kind_label,
                row.cycle,
                row.raw_material_name,
                row.category_name || '',
                row.qty,
                row.unit_name,
                row.value,
                row.reason,
              ]),
              'manual-stock-entry-report.csv',
            )
            showToast('Exported report')
          }}
=======
          onExportPage={() => exportRows([], 'page')}
          onExportAll={() => exportRows([], 'all')}
>>>>>>> origin/main
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[160px] flex-1">
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
        <div className="min-w-[160px]">
          <SearchableSelect
            label="Category"
            value={category}
            options={categoryOptions}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setCategory}
          />
        </div>
        <div className="min-w-[160px]">
          <SearchableSelect
            label="Type"
            value={kind}
            options={KIND_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setKind}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <OutlineButton
          onClick={() =>
            setApplied({
              search: rawMaterial.trim(),
              category,
              kind,
              fromDate,
              toDate,
            })
          }
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setRawMaterial('')
            setCategory('All')
            setKind('All')
            setFromDate('')
            setToDate('')
            setApplied({
              search: '',
              category: 'All',
              kind: 'All',
              fromDate: '',
              toDate: '',
            })
          }}
        >
          Clear
        </OutlineButton>
      </div>

      {!canRead ? (
        <div className="rounded-xl border border-line bg-card px-6 py-16 text-center text-sm text-muted">
          You do not have permission to view inventory reports.
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-line bg-card px-6 py-16 text-center text-sm text-muted">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
          <span className="relative mb-4 text-muted">
            <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
            <Search
              size={24}
              className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
            />
          </span>
          <p className="text-base font-semibold text-ink">No records found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Cycle</th>
                <th className="px-3 py-2.5">Raw Material</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Qty</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.entry_id}-${row.raw_material_id}`}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-3 py-2.5 text-ink">{row.stock_date}</td>
                  <td className="px-3 py-2.5 text-ink">{row.kind_label}</td>
                  <td className="px-3 py-2.5 text-ink">{row.cycle}</td>
                  <td className="px-3 py-2.5 text-ink">
                    {row.raw_material_name}
                  </td>
                  <td className="px-3 py-2.5 text-ink">
                    {row.category_name || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-ink">{row.qty}</td>
                  <td className="px-3 py-2.5 text-ink">{row.unit_name}</td>
                  <td className="px-3 py-2.5 text-ink">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </InventoryPageShell>
  )
}