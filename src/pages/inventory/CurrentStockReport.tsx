import { useCallback, useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_REPORT_PERMISSION,
  categoryIdByName,
  listCurrentStockReportApi,
  type CurrentStockRow,
} from '../../services/inventoryService'

const STOCK_LEVELS: Record<string, string> = {
  All: 'all',
  'At-par stock': 'at_par',
  'Minimum stock': 'minimum',
  'Negative stock': 'negative',
}

const LEVEL_BADGE: Record<
  CurrentStockRow['stock_level'],
  { label: string; className: string }
> = {
  ok: { label: 'OK', className: 'bg-green-100 text-green-700' },
  at_par: { label: 'At par', className: 'bg-amber-100 text-amber-700' },
  minimum: { label: 'Minimum', className: 'bg-orange-100 text-orange-700' },
  negative: { label: 'Negative', className: 'bg-red-100 text-red-700' },
}

const EMPTY_FILTERS = { search: '', category: 'All', stockLevel: 'All' }

export default function CurrentStockReport() {
  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const { categories, loadMasters } = useInventoryMasters()
  const [rawMaterial, setRawMaterial] = useState('')
  const [category, setCategory] = useState('All')
  const [stockLevel, setStockLevel] = useState('All')
  const [applied, setApplied] = useState(EMPTY_FILTERS)
  const [rows, setRows] = useState<CurrentStockRow[]>([])
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
      setRows(
        await listCurrentStockReportApi(encryptedOutletId, {
          search: applied.search || undefined,
          categoryId,
          stockLevel: STOCK_LEVELS[applied.stockLevel],
        }),
      )
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to load current stock',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, canRead, applied, categories])

  useEffect(() => {
    void load()
  }, [load])

  function exportCsv() {
    downloadCsv(
      [
        'Raw Material',
        'Category',
        'Unit',
        'Current Stock Qty',
        'Min Stock',
        'At-par Stock',
        'Stock Level',
      ],
      rows.map((row) => [
        row.raw_material_name,
        row.category_name,
        row.consumption_unit_name,
        row.stock_qty,
        row.min_stock,
        row.at_par_stock,
        LEVEL_BADGE[row.stock_level].label,
      ]),
      `current-stock-${new Date().toISOString().slice(0, 10)}.csv`,
    )
    showToast(`Exported ${rows.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="current-stock">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Current Stock Report</h1>
        <button
          type="button"
          disabled={rows.length === 0}
          onClick={exportCsv}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page disabled:opacity-50"
        >
          <FileText size={15} className="text-muted" />
          Export
        </button>
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
        <div className="min-w-[180px]">
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
        <div className="min-w-[150px]">
          <SearchableSelect
            label="Stock Level"
            value={stockLevel}
            options={Object.keys(STOCK_LEVELS)}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setStockLevel}
          />
        </div>
        <OutlineButton
          onClick={() =>
            setApplied({ search: rawMaterial.trim(), category, stockLevel })
          }
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setRawMaterial('')
            setCategory('All')
            setStockLevel('All')
            setApplied(EMPTY_FILTERS)
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
          <p className="text-base font-semibold text-ink">
            No Current Stock Report Found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
              <tr>
                <th className="px-3 py-2.5">Raw Material</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5 text-right">Current Stock</th>
                <th className="px-3 py-2.5 text-right">Min Stock</th>
                <th className="px-3 py-2.5 text-right">At-par Stock</th>
                <th className="px-3 py-2.5">Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const badge = LEVEL_BADGE[row.stock_level]
                return (
                  <tr
                    key={row.raw_material_id}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-3 py-2.5 text-ink">
                      {row.raw_material_name}
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      {row.category_name || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      {row.consumption_unit_name || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-ink">
                      {row.stock_qty}
                    </td>
                    <td className="px-3 py-2.5 text-right text-ink">
                      {row.min_stock ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-ink">
                      {row.at_par_stock ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </InventoryPageShell>
  )
}
