import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const ORDER_TYPE_OPTIONS = ['Orders', 'Production Execution']

const DEFAULT_DATE = '2026-08-11'

function ExportMenu({ onExportAll }: { onExportAll?: () => void }) {
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
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[140px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
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

export default function OrderwiseConsumptionReport() {
  const [orderNumber, setOrderNumber] = useState('')
  const [fromDate, setFromDate] = useState(DEFAULT_DATE)
  const [toDate, setToDate] = useState(DEFAULT_DATE)
  const [orderType, setOrderType] = useState('Orders')
  const [applied, setApplied] = useState({
    orderNumber: '',
    fromDate: DEFAULT_DATE,
    toDate: DEFAULT_DATE,
    orderType: 'Orders',
  })

  function handleSearch() {
    setApplied({
      orderNumber: orderNumber.trim(),
      fromDate,
      toDate,
      orderType,
    })
    showToast('Search applied')
  }

  function handleClear() {
    setOrderNumber('')
    setFromDate(DEFAULT_DATE)
    setToDate(DEFAULT_DATE)
    setOrderType('Orders')
    setApplied({
      orderNumber: '',
      fromDate: DEFAULT_DATE,
      toDate: DEFAULT_DATE,
      orderType: 'Orders',
    })
  }

  return (
    <InventoryPageShell activeItem="orderwise-consumption">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Orderwise Consumption Report
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md border border-line bg-page px-3 text-sm font-medium text-muted"
          >
            In Queue Orders
          </button>
          <ExportMenu
            onExportAll={() => {
              downloadCsv(
                ['order_number', 'from_date', 'to_date', 'order_type'],
                [
                  [
                    applied.orderNumber,
                    applied.fromDate,
                    applied.toDate,
                    applied.orderType,
                  ],
                ],
                'orderwise-consumption-all.csv',
              )
              showToast('Exported all')
            }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Order Number
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
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
        <div className="min-w-[180px]">
          <SearchableSelect
            label="Order Type"
            value={orderType}
            options={ORDER_TYPE_OPTIONS}
            placeholder="Orders"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setOrderType}
          />
        </div>
        <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
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
          Orderwise Consumption Report Record Not Found
        </p>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Filters: order={applied.orderNumber || '—'} · from={applied.fromDate}{' '}
          · to={applied.toDate} · type={applied.orderType}
        </p>
      </div>
    </InventoryPageShell>
  )
}
