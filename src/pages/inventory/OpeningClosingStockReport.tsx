import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/exportCsv'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { PaginationControls } from '../../components/common/PaginationControls'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_REPORT_PERMISSION,
  categoryIdByName,
  getOpeningClosingReportApi,
  type OpeningClosingRow,
} from '../../services/inventoryService'

const todayIso = () => new Date().toISOString().slice(0, 10)

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

export default function OpeningClosingStockReport() {
  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const { categories, loadMasters } = useInventoryMasters()
  const [rawMaterial, setRawMaterial] = useState('')
  const [category, setCategory] = useState('All')
  const [fromDate, setFromDate] = useState(todayIso)
  const [toDate, setToDate] = useState(todayIso)
  const [applied, setApplied] = useState({
    query: '',
    category: 'All',
    fromDate: todayIso(),
    toDate: todayIso(),
  })
  const [rows, setRows] = useState<OpeningClosingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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
      const report = await getOpeningClosingReportApi(encryptedOutletId, {
        search: applied.query.trim() || undefined,
        categoryId,
        dateFrom: applied.fromDate,
        dateTo: applied.toDate,
      })
      setRows(report.rows)
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Unable to load opening/closing report',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, canRead, applied, categories])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const activePage = Math.min(page, totalPages)
  const pageRows = rows.slice((activePage - 1) * pageSize, activePage * pageSize)

  function handleSearch() {
    setApplied({ query: rawMaterial, category, fromDate, toDate })
    setPage(1)
  }

  function handleClear() {
    setRawMaterial('')
    setCategory('All')
    setFromDate(todayIso())
    setToDate(todayIso())
    setApplied({
      query: '',
      category: 'All',
      fromDate: todayIso(),
      toDate: todayIso(),
    })
    setPage(1)
  }

  function exportRows(list: OpeningClosingRow[], suffix: 'page' | 'all') {
    downloadCsv(
      `opening-closing-stock-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'Raw Material',
        'Unit',
        'Opening Stock Qty',
        'Opening Stock Value (₹)',
        'Avg Purchase Price (₹)',
        'Closing Stock Qty',
        'Closing Stock Value (₹)',
      ],
      list.map((row) => [
        row.raw_material_name,
        row.unit_name,
        row.opening_qty,
        row.opening_value,
        row.avg_price,
        row.closing_qty,
        row.closing_value,
      ]),
    )
    showToast(`Exported ${list.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="other-reports">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Opening - Closing Stock Report
        </h1>
        <ExportMenu
          onExportPage={() => exportRows(pageRows, 'page')}
          onExportAll={() => exportRows(rows, 'all')}
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
        <div className="min-w-[180px] flex-1">
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
        <OutlineButton onClick={handleSearch}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
                <th className="px-3 py-2.5">Raw Material</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5 text-right">Opening Qty</th>
                <th className="px-3 py-2.5 text-right">Opening Value (₹)</th>
                <th className="px-3 py-2.5 text-right">Avg Purchase Price (₹)</th>
                <th className="px-3 py-2.5 text-right">Closing Qty</th>
                <th className="px-3 py-2.5 text-right">Closing Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-16 text-center">
                    {loading ? (
                      <span className="text-sm text-muted">
                        Loading report…
                      </span>
                    ) : (
                      <span className="flex flex-col items-center">
                        <span className="relative mb-4 text-muted">
                          <FileText
                            size={56}
                            strokeWidth={1.25}
                            className="text-muted/50"
                          />
                          <Search
                            size={24}
                            className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
                          />
                        </span>
                        <span className="text-base font-semibold text-ink">
                          Opening/Closing Report Record Not Found
                        </span>
                      </span>
                    )}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => (
                  <tr
                    key={row.raw_material_id}
                    className={`border-b border-line last:border-b-0 ${
                      index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-ink">
                      {row.raw_material_name}
                    </td>
                    <td className="px-3 py-2">{row.unit_name}</td>
                    <td className="px-3 py-2 text-right">{row.opening_qty}</td>
                    <td className="px-3 py-2 text-right">{row.opening_value}</td>
                    <td className="px-3 py-2 text-right">{row.avg_price}</td>
                    <td className="px-3 py-2 text-right">{row.closing_qty}</td>
                    <td className="px-3 py-2 text-right">{row.closing_value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          totalRecords={rows.length}
          currentPage={activePage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </InventoryPageShell>
  )
}
