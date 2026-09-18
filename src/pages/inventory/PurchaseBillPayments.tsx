import { useState } from 'react'

import { showToast } from '../../utils/toast'
import { FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const FROM_OPTIONS = ['Supplier/Third Party', 'Restaurant']

const DEFAULT_START = '2026-08-05'
const DEFAULT_END = '2026-08-12'

export default function PurchaseBillPayments() {
  const [from, setFrom] = useState('')
  const [startDate, setStartDate] = useState(DEFAULT_START)
  const [endDate, setEndDate] = useState(DEFAULT_END)
  const [applied, setApplied] = useState({
    from: '',
    startDate: DEFAULT_START,
    endDate: DEFAULT_END,
  })

  function handleSearch() {
    setApplied({ from, startDate, endDate })
    showToast('Search applied')
  }

  function handleClear() {
    setFrom('')
    setStartDate(DEFAULT_START)
    setEndDate(DEFAULT_END)
    setApplied({
      from: '',
      startDate: DEFAULT_START,
      endDate: DEFAULT_END,
    })
  }

  return (
    <InventoryPageShell activeItem="purchase-bill-payments">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">
          Bulk Purchase Bill Payments
        </h1>
      </div>

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
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <span className="relative mb-4 text-muted">
          <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
          <Search
            size={24}
            className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
          />
        </span>
        <p className="text-base font-semibold text-ink">
          Purchase Invoice Settlement Record Not Found
        </p>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Filters: from={applied.from || '—'} · start={applied.startDate} · end=
          {applied.endDate}
        </p>
      </div>
    </InventoryPageShell>
  )
}
