import { useState } from 'react'

<<<<<<< HEAD
=======
import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/exportCsv'
import { ChevronDown, FileText, Search } from 'lucide-react'
>>>>>>> origin/main
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  DisabledExportButton,
  REPORT_UNAVAILABLE_MESSAGE,
  ReportEmptyState,
  ReportUnavailableNotice,
} from '../../components/inventory/ReportUnavailableNotice'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const ORDER_TYPE_OPTIONS = ['Orders', 'Production Execution']

const DEFAULT_DATE = '2026-08-11'

export default function OrderwiseConsumptionReport() {
  const [orderNumber, setOrderNumber] = useState('')
  const [fromDate, setFromDate] = useState(DEFAULT_DATE)
  const [toDate, setToDate] = useState(DEFAULT_DATE)
  const [orderType, setOrderType] = useState('Orders')

  function handleClear() {
    setOrderNumber('')
    setFromDate(DEFAULT_DATE)
    setToDate(DEFAULT_DATE)
    setOrderType('Orders')
  }

  function exportRows(
    rows: (string | number | null | undefined)[][],
    suffix: 'page' | 'all',
  ) {
    downloadCsv(
      `orderwise-consumption-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Order Number', 'Order Type', 'Date', 'Raw Material', 'Consumption Qty', 'Unit'],
      rows,
    )
    showToast(`Exported ${rows.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="orderwise-consumption">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Orderwise Consumption Report
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md border border-line bg-page px-3 text-sm font-medium text-muted"
          >
            In Queue Orders
          </button>
<<<<<<< HEAD
          <DisabledExportButton />
=======
          <ExportMenu onExportAll={() => exportRows([], 'all')} />
>>>>>>> origin/main
        </div>
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Order Number
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
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
        <div className="min-w-[180px]">
          <SearchableSelect
            label="Order Type"
            value={orderType}
            options={ORDER_TYPE_OPTIONS}
            placeholder="Orders"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setOrderType}
          />
        </div>
        <PrimaryButton disabled title={REPORT_UNAVAILABLE_MESSAGE}>
          Search
        </PrimaryButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <ReportEmptyState title="Orderwise Consumption Report Record Not Found" />
    </InventoryPageShell>
  )
}
