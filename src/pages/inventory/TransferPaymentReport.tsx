import { useState } from 'react'

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

const TO_OPTIONS = [
  'All',
  'Main Kitchen',
  'Storage Room',
  'Dadar Outlet',
  'Other Restaurant',
]

const DEFAULT_FROM = '2026-08-04'
const DEFAULT_TO = '2026-08-11'

export default function TransferPaymentReport() {
  const [to, setTo] = useState('All')
  const [fromDate, setFromDate] = useState(DEFAULT_FROM)
  const [toDate, setToDate] = useState(DEFAULT_TO)

  function handleClear() {
    setTo('All')
    setFromDate(DEFAULT_FROM)
    setToDate(DEFAULT_TO)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Transfer Payment Report</h1>
        <DisabledExportButton />
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
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
        <PrimaryButton disabled title={REPORT_UNAVAILABLE_MESSAGE}>
          Search
        </PrimaryButton>
        <OutlineButton onClick={handleClear}>Clear Filter</OutlineButton>
      </div>

      <ReportEmptyState title="Transfer Payment Report Record Not Found" />
    </InventoryPageShell>
  )
}
