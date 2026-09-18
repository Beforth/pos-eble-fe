import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
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

function ExportMenu({
  onExportPage,
  onExportAll,
}: {
  onExportPage?: () => void
  onExportAll?: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        <FileText size={15} className="text-muted" />
        Export
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onExportPage?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export Current Page
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onExportAll?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export All
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export default function ExpiryBatchwiseInsightReport() {
  const [reportView, setReportView] = useState('Expire and batchwise')
  const [expiryIn, setExpiryIn] = useState('30 Days')
  const [rawMaterialName, setRawMaterialName] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [includeExpired, setIncludeExpired] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [applied, setApplied] = useState({
    reportView: 'Expire and batchwise',
    expiryIn: '30 Days',
    rawMaterialName: '',
    batchNo: '',
    includeExpired: false,
  })

  function handleSearch() {
    setApplied({
      reportView,
      expiryIn,
      rawMaterialName: rawMaterialName.trim(),
      batchNo: batchNo.trim(),
      includeExpired,
    })
    showToast('Search applied')
  }

  function handleClear() {
    setReportView('Expire and batchwise')
    setExpiryIn('30 Days')
    setRawMaterialName('')
    setBatchNo('')
    setIncludeExpired(false)
    setMoreFiltersOpen(false)
    setApplied({
      reportView: 'Expire and batchwise',
      expiryIn: '30 Days',
      rawMaterialName: '',
      batchNo: '',
      includeExpired: false,
    })
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Expiry & Batchwise Insight
        </h1>
        <ExportMenu
          onExportPage={() => {
            downloadCsv(
              [
                'report_view',
                'expiry_in',
                'raw_material',
                'batch_no',
                'include_expired',
              ],
              [
                [
                  applied.reportView,
                  applied.expiryIn,
                  applied.rawMaterialName,
                  applied.batchNo,
                  applied.includeExpired ? 'yes' : 'no',
                ],
              ],
              'expiry-batchwise-page.csv',
            )
            showToast('Exported current page')
          }}
          onExportAll={() => {
            downloadCsv(
              [
                'report_view',
                'expiry_in',
                'raw_material',
                'batch_no',
                'include_expired',
              ],
              [
                [
                  applied.reportView,
                  applied.expiryIn,
                  applied.rawMaterialName,
                  applied.batchNo,
                  applied.includeExpired ? 'yes' : 'no',
                ],
              ],
              'expiry-batchwise-all.csv',
            )
            showToast('Exported all')
          }}
        />
      </div>

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
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
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

      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <span className="relative mb-4 text-muted">
          <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
          <Search
            size={24}
            className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
          />
        </span>
        <p className="text-base font-semibold text-ink">No Records Found</p>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Filters: view={applied.reportView} · expiry={applied.expiryIn} ·
          material={applied.rawMaterialName || '—'} · batch=
          {applied.batchNo || '—'} · includeExpired=
          {applied.includeExpired ? 'yes' : 'no'}
        </p>
      </div>
    </InventoryPageShell>
  )
}
