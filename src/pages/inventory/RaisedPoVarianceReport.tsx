import { useState } from 'react'

import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  DisabledExportButton,
  REPORT_UNAVAILABLE_MESSAGE,
  ReportEmptyState,
  ReportUnavailableNotice,
} from '../../components/inventory/ReportUnavailableNotice'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const TO_OPTIONS = [
  'All',
  'Local Suppliers',
  'Wholesale Market',
  'Dairy Vendors',
  'Other Restaurant',
]

const DEFAULT_DATE = '2026-08-11'

export default function RaisedPoVarianceReport() {
  const [fromDate, setFromDate] = useState(DEFAULT_DATE)
  const [toDate, setToDate] = useState(DEFAULT_DATE)
  const [to, setTo] = useState('All')

  function handleClear() {
    setFromDate(DEFAULT_DATE)
    setToDate(DEFAULT_DATE)
    setTo('All')
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Purchase Order Variance Report
        </h1>
        <DisabledExportButton />
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
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
        <div className="min-w-[160px]">
          <SearchableSelect
            label="To"
            value={to}
            options={TO_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setTo}
          />
        </div>
        <OutlineButton disabled title={REPORT_UNAVAILABLE_MESSAGE}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <ReportEmptyState title="Purchase Order Variance Report Record Not Found" />
    </InventoryPageShell>
  )
}
