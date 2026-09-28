import { useState } from 'react'

import { showToast } from '../../utils/toast'
import { Lightbulb } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  DisabledExportButton,
  REPORT_UNAVAILABLE_MESSAGE,
  ReportEmptyState,
  ReportUnavailableNotice,
} from '../../components/inventory/ReportUnavailableNotice'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const CATEGORY_OPTIONS = [
  'All',
  'Vegetable Sandwich',
  'Beverages',
  'Snacks',
  'Dabeli',
  'Chaat',
  'Pizza Mania',
  'South Indian',
  'Chinese',
  'Main Course',
  'Combos',
  'No Category',
]

const ORDER_TYPE_OPTIONS = ['All', 'Dine In', 'Delivery', 'Pick Up']

const DEFAULT_FROM = '2026-08-10'
const DEFAULT_TO = '2026-08-11'

export default function FoodCostingReport() {
  const [menuItem, setMenuItem] = useState('')
  const [category, setCategory] = useState('All')
  const [orderType, setOrderType] = useState('All')
  const [fromDate, setFromDate] = useState(DEFAULT_FROM)
  const [toDate, setToDate] = useState(DEFAULT_TO)

  function handleClear() {
    setMenuItem('')
    setCategory('All')
    setOrderType('All')
    setFromDate(DEFAULT_FROM)
    setToDate(DEFAULT_TO)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Food Costing Report</h1>
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton onClick={() => showToast('Help Center')}>
            <Lightbulb size={15} />
            Help Center
          </OutlineButton>
          <DisabledExportButton />
        </div>
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[150px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Menu Item
          </label>
          <input
            type="text"
            value={menuItem}
            onChange={(event) => setMenuItem(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
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
        <div className="min-w-[150px]">
          <SearchableSelect
            label="Order Type"
            value={orderType}
            options={ORDER_TYPE_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setOrderType}
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

      <ReportEmptyState title="No Food Costing Report Found" />
    </InventoryPageShell>
  )
}
