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

const FROM_OPTIONS = [
  'All',
  'Local Suppliers',
  'Wholesale Market',
  'Dairy Vendors',
  'Other Restaurant',
]

const STATUS_OPTIONS = [
  'All',
  'Saved & Approved',
  'Approved',
  'Sent & Email',
  'Processed',
  'Cancelled',
  'Pending for Approval',
  'Payment Pending',
]

const DEFAULT_DATE = '2026-08-11'

export default function PurchaseOrderReceivedReport() {
  const [from, setFrom] = useState('All')
  const [poNumber, setPoNumber] = useState('')
  const [status, setStatus] = useState('Saved & Approved')
  const [startDate, setStartDate] = useState(DEFAULT_DATE)
  const [endDate, setEndDate] = useState(DEFAULT_DATE)

  function handleClear() {
    setFrom('All')
    setPoNumber('')
    setStatus('Saved & Approved')
    setStartDate(DEFAULT_DATE)
    setEndDate(DEFAULT_DATE)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Purchase Order Received Report
        </h1>
        <DisabledExportButton />
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[140px]">
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
        <div className="min-w-[140px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            PO Number
          </label>
          <input
            type="text"
            value={poNumber}
            onChange={(event) => setPoNumber(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[160px]">
          <SearchableSelect
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            placeholder="Saved & Approved"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setStatus}
          />
        </div>
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
        <OutlineButton disabled title={REPORT_UNAVAILABLE_MESSAGE}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear Filter
        </OutlineButton>
      </div>

      <ReportEmptyState title="No Record Found" />
    </InventoryPageShell>
  )
}
