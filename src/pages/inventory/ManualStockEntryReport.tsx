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
  listAllManualStockEntryReportApi,
  type ManualStockEntryReportRow,
} from '../../services/inventoryService'

const todayIso = () => new Date().toISOString().slice(0, 10)
// Default window: the last 90 days.
const defaultFromIso = () =>
  new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

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

export default function ManualStockEntryReport() {
  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const { categories, loadMasters } = useInventoryMasters()
  const [startDate, setStartDate] = useState(defaultFromIso)
  const [endDate, setEndDate] = useState(todayIso)
  const [rawMaterial, setRawMaterial] = useState('')
  const [category, setCategory] = useState('All')
  const [applied, setApplied] = useState({
    startDate: defaultFromIso(),
    endDate: todayIso(),
    query: '',
    category: 'All',
  })
  const [rows, setRows] = useState<ManualStockEntryReportRow[]>([])
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
      setRows(
        await listAllManualStockEntryReportApi(encryptedOutletId, {
          search: applied.query.trim() || undefined,
          categoryId,
          dateFrom: applied.startDate,
          dateTo: applied.endDate,
        }),
      )
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Unable to load manual adjustments',
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
    setApplied({ startDate, endDate, query: rawMaterial, category })
    setPage(1)
  }

  function handleClear() {
    setStartDate(defaultFromIso())
    setEndDate(todayIso())
    setRawMaterial('')
    setCategory('All')
    setApplied({
      startDate: defaultFromIso(),
      endDate: todayIso(),
      query: '',
      category: 'All',
    })
    setPage(1)
  }

  function exportRows(list: ManualStockEntryReportRow[], suffix: 'page' | 'all') {
    downloadCsv(
      `manual-stock-entry-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'Date',
        'Raw Material',
        'Unit',
        'Category',
        'Adjustment Type',
        'Qty',
        'Value (₹)',
        'Reason',
      ],
      list.map((row) => [
        row.stock_date,
        row.raw_material_name,
        row.unit_name,
        row.category_name,
        row.kind_label,
        row.qty,
        row.value,
        row.reason,
      ]),
    )
    showToast(`Exported ${list.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="other-reports">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Manual Adjustment List</h1>
        <ExportMenu
          onExportPage={() => exportRows(pageRows, 'page')}
          onExportAll={() => exportRows(rows, 'all')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
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
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Raw Material</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Adjustment Type</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5 text-right">Value (₹)</th>
                <th className="px-3 py-2.5">Reason</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-16 text-center">
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
                          Manual Adjustment Report Record Not Found
                        </span>
                      </span>
                    )}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => (
                  <tr
                    key={`${row.entry_id}-${row.raw_material_id}`}
                    className={`border-b border-line last:border-b-0 ${
                      index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-2">{row.stock_date}</td>
                    <td className="px-3 py-2 font-medium text-ink">
                      {row.raw_material_name}
                    </td>
                    <td className="px-3 py-2">{row.unit_name}</td>
                    <td className="px-3 py-2">{row.category_name || '-'}</td>
                    <td className="px-3 py-2">{row.kind_label}</td>
                    <td className="px-3 py-2 text-right">{row.qty}</td>
                    <td className="px-3 py-2 text-right">{row.value}</td>
                    <td className="px-3 py-2">{row.reason || '-'}</td>
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
