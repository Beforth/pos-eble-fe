import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { DateTimeField } from '../../components/common/DateTimeField'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const UNIT_OPTIONS = ['Purchase Unit', 'Consumption Unit']

const CATEGORY_OPTIONS = [
  'All',
  'Rice/pulses/flours',
  'Bread/dairy',
  'Oils/masala/salt/sugar',
  'Ready To Cook/ready To Eat',
  'Sauces/dressings/marinades',
  'Snacks',
  'Packaging/storage',
  'Fruits/vegetables',
  'No Category',
]

function defaultFromDate() {
  return new Date(2026, 7, 11, 0, 0, 0)
}

function defaultToDate() {
  return new Date(2026, 7, 11, 23, 59, 59)
}

export default function StockReportTimewise() {
  const [rawMaterial, setRawMaterial] = useState('')
  const [unit, setUnit] = useState('Purchase Unit')
  const [category, setCategory] = useState('All')
  const [fromDateTime, setFromDateTime] = useState(defaultFromDate)
  const [toDateTime, setToDateTime] = useState(defaultToDate)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleClear() {
    setRawMaterial('')
    setUnit('Purchase Unit')
    setCategory('All')
    setFromDateTime(defaultFromDate())
    setToDateTime(defaultToDate())
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Stock Report Timewise</h1>
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
            options={CATEGORY_OPTIONS}
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
        <OutlineButton onClick={() => showToast('Search applied')}>
          Search
        </OutlineButton>
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
        <p className="text-base font-semibold text-ink">No Record Found</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          We could not find what you searched for Try searching again
        </p>
      </div>
    </InventoryPageShell>
  )
}
