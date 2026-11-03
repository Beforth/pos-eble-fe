import { useCallback, useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ReportEmptyState } from '../../components/inventory/ReportUnavailableNotice'
import { DateTimeField } from '../../components/common/DateTimeField'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { PaginationControls } from '../../components/common/PaginationControls'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_REPORT_PERMISSION,
  categoryIdByName,
  listStockTimewiseReportApi,
  type StockTimewiseRow,
} from '../../services/inventoryService'

const UNIT_OPTIONS = ['Purchase Unit', 'Consumption Unit']

function defaultFromDate() {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  date.setHours(0, 0, 0, 0)
  return date
}

function defaultToDate() {
  const date = new Date()
  date.setHours(23, 59, 59, 0)
  return date
}

export default function StockReportTimewise() {
  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const { categories, loadMasters } = useInventoryMasters()
  const [rawMaterial, setRawMaterial] = useState('')
  const [unit, setUnit] = useState('Purchase Unit')
  const [category, setCategory] = useState('All')
  const [fromDateTime, setFromDateTime] = useState(defaultFromDate)
  const [toDateTime, setToDateTime] = useState(defaultToDate)
  const [applied, setApplied] = useState({
    query: '',
    unit: 'Purchase Unit',
    category: 'All',
    from: defaultFromDate(),
    to: defaultToDate(),
  })
  const [rows, setRows] = useState<StockTimewiseRow[]>([])
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
        await listStockTimewiseReportApi(encryptedOutletId, {
          search: applied.query.trim() || undefined,
          categoryId,
          fromDateTime: applied.from,
          toDateTime: applied.to,
          unitType:
            applied.unit === 'Purchase Unit' ? 'purchase' : 'consumption',
        }),
      )
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to load stock report',
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
    setApplied({
      query: rawMaterial,
      unit,
      category,
      from: fromDateTime,
      to: toDateTime,
    })
    setPage(1)
  }

  function handleClear() {
    setRawMaterial('')
    setUnit('Purchase Unit')
    setCategory('All')
    setFromDateTime(defaultFromDate())
    setToDateTime(defaultToDate())
    setApplied({
      query: '',
      unit: 'Purchase Unit',
      category: 'All',
      from: defaultFromDate(),
      to: defaultToDate(),
    })
    setPage(1)
  }

  function exportAll() {
    downloadCsv(
      ['Raw Material', 'Category', 'Unit', 'Opening Stock', 'Closing Stock', 'Difference'],
      rows.map((row) => [
        row.raw_material_name,
        row.category_name,
        row.unit_name,
        row.opening,
        row.closing,
        row.difference,
      ]),
      `stock-report-timewise-${new Date().toISOString().slice(0, 10)}.csv`,
    )
    showToast(`Exported ${rows.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Stock Report Timewise</h1>
        <OutlineButton onClick={exportAll}>Export</OutlineButton>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[150px] flex-1">
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
        <div className="min-w-[150px]">
          <SearchableSelect
            label="Unit"
            value={unit}
            options={UNIT_OPTIONS}
            placeholder="Purchase Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setUnit}
          />
        </div>
        <div className="min-w-[150px]">
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
        <DateTimeField
          label="From Date & Time"
          value={fromDateTime}
          onChange={setFromDateTime}
          defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
        />
        <DateTimeField
          label="To Date & Time"
          value={toDateTime}
          onChange={setToDateTime}
          defaultTime={{ hours: 23, minutes: 59, seconds: 59 }}
        />
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
                <th className="px-3 py-2.5">Raw Material</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5 text-right">Opening Stock</th>
                <th className="px-3 py-2.5 text-right">Closing Stock</th>
                <th className="px-3 py-2.5 text-right">Difference</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center">
                    {loading ? (
                      <span className="text-sm text-muted">Loading report…</span>
                    ) : (
                      <ReportEmptyState title="No Record Found" variant="plain" />
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
                    <td className="px-3 py-2">{row.category_name || '-'}</td>
                    <td className="px-3 py-2">{row.unit_name}</td>
                    <td className="px-3 py-2 text-right">{row.opening}</td>
                    <td className="px-3 py-2 text-right">{row.closing}</td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${
                        Number.parseFloat(row.difference) < 0
                          ? 'text-danger'
                          : 'text-ink'
                      }`}
                    >
                      {row.difference}
                    </td>
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
