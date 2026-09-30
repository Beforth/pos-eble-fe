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
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const FROM_OPTIONS = [
  'All',
  'Local Suppliers',
  'Wholesale Market',
  'Dairy Vendors',
  'Packaging Vendors',
]

const DEFAULT_FROM = '2026-08-04'
const DEFAULT_TO = '2026-08-11'

export default function SupplierPaymentReport() {
  const [from, setFrom] = useState('All')
  const [fromDate, setFromDate] = useState(DEFAULT_FROM)
  const [toDate, setToDate] = useState(DEFAULT_TO)

  function handleClear() {
    setFrom('All')
    setFromDate(DEFAULT_FROM)
    setToDate(DEFAULT_TO)
  }

  function exportRows(
    rows: (string | number | null | undefined)[][],
    suffix: 'page' | 'all',
  ) {
    downloadCsv(
      `supplier-payment-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date', 'Supplier', 'Payment Mode', 'Paid Amount (₹)', 'Balance (₹)'],
      rows,
    )
    showToast(`Exported ${rows.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Supplier Payment Report</h1>
<<<<<<< HEAD
        <DisabledExportButton />
=======
        <ExportMenu
          onExportPage={() => exportRows([], 'page')}
          onExportAll={() => exportRows([], 'all')}
        />
>>>>>>> origin/main
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[180px]">
          <SearchableSelect
            label="From"
            value={from}
            options={FROM_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setFrom}
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
        <OutlineButton disabled title={REPORT_UNAVAILABLE_MESSAGE}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <ReportEmptyState title="Supplier Payment Report Record Not Found" />
    </InventoryPageShell>
  )
}
