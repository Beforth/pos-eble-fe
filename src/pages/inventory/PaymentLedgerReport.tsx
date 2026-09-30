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

const FROM_OPTIONS = ['Supplier', 'Customer', 'Third Party', 'All']

const SUPPLIER_OPTIONS = [
  'All',
  'Local Fresh Mart',
  'Dairy Farm Co.',
  'Spice Traders',
  'Packaging Hub',
]

export default function PaymentLedgerReport() {
  const [from, setFrom] = useState('Supplier')
  const [supplier, setSupplier] = useState('')

  function handleClear() {
    setFrom('Supplier')
    setSupplier('')
  }

  function exportRows(
    rows: (string | number | null | undefined)[][],
    suffix: 'page' | 'all',
  ) {
    downloadCsv(
      `payment-ledger-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Vendor Name', 'Company Name', 'Payables', 'Receivables', 'Action'],
      rows,
    )
    showToast(`Exported ${rows.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Ledger Payment Report</h1>
<<<<<<< HEAD
        <DisabledExportButton />
=======
        <ExportMenu onExportAll={() => exportRows([], 'all')} />
>>>>>>> origin/main
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[160px]">
          <SearchableSelect
            label="From"
            value={from}
            options={FROM_OPTIONS}
            placeholder="Supplier"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setFrom}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <SearchableSelect
            label="Supplier/Third Party"
            value={supplier}
            options={SUPPLIER_OPTIONS}
            placeholder="Supplier/Third Party"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setSupplier}
          />
        </div>
        <OutlineButton disabled title={REPORT_UNAVAILABLE_MESSAGE}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
              <tr>
                <th className="px-3 py-2.5">Vendor Name</th>
                <th className="px-3 py-2.5">Company Name</th>
                <th className="px-3 py-2.5">Payables</th>
                <th className="px-3 py-2.5">Receivables</th>
                <th className="px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-3 py-16">
                  <ReportEmptyState
                    variant="plain"
                    title="Ledger Payment Report Record Not Found"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </InventoryPageShell>
  )
}
