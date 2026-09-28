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

const REPORT_VIEW_OPTIONS = [
  'Expire and batchwise',
  'Expire only',
  'Batchwise only',
]

const EXPIRY_IN_OPTIONS = [
  '7 Days',
  '15 Days',
  '30 Days',
  '60 Days',
  '90 Days',
  'All',
]

export default function ExpiryBatchwiseInsightReport() {
  const [reportView, setReportView] = useState('Expire and batchwise')
  const [expiryIn, setExpiryIn] = useState('30 Days')
  const [rawMaterialName, setRawMaterialName] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [includeExpired, setIncludeExpired] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)

  function handleClear() {
    setReportView('Expire and batchwise')
    setExpiryIn('30 Days')
    setRawMaterialName('')
    setBatchNo('')
    setIncludeExpired(false)
    setMoreFiltersOpen(false)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Expiry & Batchwise Insight
        </h1>
        <DisabledExportButton />
      </div>

      <ReportUnavailableNotice />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[180px]">
          <SearchableSelect
            label="Report view"
            value={reportView}
            options={REPORT_VIEW_OPTIONS}
            placeholder="Expire and batchwise"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setReportView}
          />
        </div>
        <div className="min-w-[140px]">
          <SearchableSelect
            label="Expiry in"
            value={expiryIn}
            options={EXPIRY_IN_OPTIONS}
            placeholder="30 Days"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setExpiryIn}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Raw Material Name
          </label>
          <input
            type="text"
            value={rawMaterialName}
            onChange={(event) => setRawMaterialName(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <OutlineButton
          variant="gray"
          onClick={() => setMoreFiltersOpen((prev) => !prev)}
        >
          {moreFiltersOpen ? 'Hide Filters' : 'More Filters'}
        </OutlineButton>
        <OutlineButton disabled title={REPORT_UNAVAILABLE_MESSAGE}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      {moreFiltersOpen ? (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-line bg-page/40 p-4">
          <div className="min-w-[160px] flex-1">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Batch No.
            </label>
            <input
              type="text"
              value={batchNo}
              onChange={(event) => setBatchNo(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <label className="mb-1 inline-flex h-10 cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={includeExpired}
              onChange={(event) => setIncludeExpired(event.target.checked)}
              className="size-4 rounded border-line"
            />
            Include already expired
          </label>
        </div>
      ) : null}

      <ReportEmptyState title="No Records Found" />
    </InventoryPageShell>
  )
}
