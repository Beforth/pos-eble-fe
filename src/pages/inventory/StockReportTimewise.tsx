import { useState } from 'react'

import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  REPORT_UNAVAILABLE_MESSAGE,
  ReportEmptyState,
  ReportUnavailableNotice,
} from '../../components/inventory/ReportUnavailableNotice'
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

  function handleClear() {
    setRawMaterial('')
    setUnit('Purchase Unit')
    setCategory('All')
    setFromDateTime(defaultFromDate())
    setToDateTime(defaultToDate())
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Stock Report Timewise</h1>
      </div>

      <ReportUnavailableNotice />

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
        <OutlineButton disabled title={REPORT_UNAVAILABLE_MESSAGE}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <ReportEmptyState title="No Record Found" />
    </InventoryPageShell>
  )
}
