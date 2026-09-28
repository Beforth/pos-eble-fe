import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
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
  listCurrentStockReportApi,
  type CurrentStockRow,
} from '../../services/inventoryService'

const STOCK_LEVEL_OPTIONS = [
  'All',
  'At-par stock',
  'Minimum stock',
  'Negative stock',
]

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

export default function CurrentStockReport() {
  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const { categories, loadMasters } = useInventoryMasters()
  const [rawMaterial, setRawMaterial] = useState('')
  const [category, setCategory] = useState('All')
  const [stockLevel, setStockLevel] = useState('All')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedCategory, setAppliedCategory] = useState('All')
  const [appliedStockLevel, setAppliedStockLevel] = useState('All')
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
        appliedCategory === 'All'
          ? undefined
          : appliedCategory === 'No Category'
            ? 'no-category'
            : categoryIdByName(categories, appliedCategory)
      const data = await listCurrentStockReportApi(encryptedOutletId, {
        search: appliedSearch || undefined,
        categoryId,
      })
      setRows(data)
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to load current stock',
      )
    } finally {
      setLoading(false)
    }
  }, [
    encryptedOutletId,
    canRead,
    appliedSearch,
    appliedCategory,
    categories,
  ])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const qty = Number(row.stock_qty)
      const min = Number(row.min_stock ?? NaN)
      const atPar = Number(row.at_par_stock ?? NaN)
      if (appliedStockLevel === 'Negative stock') return qty < 0
      if (appliedStockLevel === 'Minimum stock') {
        return Number.isFinite(min) && qty <= min
      }
      if (appliedStockLevel === 'At-par stock') {
        return Number.isFinite(atPar) && qty <= atPar
      }
      return true
    })
  }, [rows, appliedStockLevel])

  return (
    <InventoryPageShell activeItem="current-stock">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Current Stock Report</h1>
        <ExportMenu
          onExportPage={() => {
            downloadCsv(
              [
                'raw_material',
                'category',
                'stock_qty',
                'unit',
                'min_stock',
                'at_par_stock',
              ],
              filtered.map((row) => [
                row.raw_material_name,
                row.category_name || '',
                row.stock_qty,
                row.consumption_unit_name,
                row.min_stock,
                row.at_par_stock,
              ]),
              'current-stock-page.csv',
            )
            showToast('Exported current page')
          }}
          onExportAll={() => {
            downloadCsv(
              [
                'raw_material',
                'category',
                'stock_qty',
                'unit',
                'min_stock',
                'at_par_stock',
              ],
              filtered.map((row) => [
                row.raw_material_name,
                row.category_name || '',
                row.stock_qty,
                row.consumption_unit_name,
                row.min_stock,
                row.at_par_stock,
              ]),
              'current-stock-all.csv',
            )
            showToast('Exported all')
          }}
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
            options={STOCK_LEVEL_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setStockLevel}
          />
        </div>
        <OutlineButton
          onClick={() => {
            setAppliedSearch(rawMaterial.trim())
            setAppliedCategory(category)
            setAppliedStockLevel(stockLevel)
          }}
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setRawMaterial('')
            setCategory('All')
            setStockLevel('All')
            setAppliedSearch('')
            setAppliedCategory('All')
            setAppliedStockLevel('All')
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
      ) : filtered.length === 0 ? (
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
                <th className="px-3 py-2.5">Stock Qty</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5">Min</th>
                <th className="px-3 py-2.5">At Par</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
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
                  <td className="px-3 py-2.5 text-ink">{row.stock_qty}</td>
                  <td className="px-3 py-2.5 text-ink">
                    {row.consumption_unit_name}
                  </td>
                  <td className="px-3 py-2.5 text-ink">
                    {row.min_stock ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-ink">
                    {row.at_par_stock ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </InventoryPageShell>
  )
}
