import { useState } from 'react'

import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  REPORT_UNAVAILABLE_MESSAGE,
  ReportEmptyState,
  ReportUnavailableNotice,
} from '../../components/inventory/ReportUnavailableNotice'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const FROM_OPTIONS = ['Supplier/Third Party', 'Restaurant']

const DEFAULT_START = '2026-08-05'
const DEFAULT_END = '2026-08-12'

export default function PurchaseBillPayments() {
  const [from, setFrom] = useState('')
  const [startDate, setStartDate] = useState(DEFAULT_START)
  const [endDate, setEndDate] = useState(DEFAULT_END)

  function handleClear() {
    setFrom('')
    setStartDate(DEFAULT_START)
    setEndDate(DEFAULT_END)
  }

  return (
    <InventoryPageShell activeItem="purchase-bill-payments">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">
          Bulk Purchase Bill Payments
        </h1>
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[220px] flex-1">
          <SearchableSelect
            label="From"
            value={from}
            options={FROM_OPTIONS}
            placeholder="Select type"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setFrom}
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
          Clear
        </OutlineButton>
      </div>

      <ReportEmptyState title="Purchase Invoice Settlement Record Not Found" />
    </InventoryPageShell>
  )
}
