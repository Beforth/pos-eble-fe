import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const FROM_OPTIONS = ['Supplier', 'Customer', 'Third Party', 'All']

const SUPPLIER_OPTIONS = [
  'All',
  'Local Fresh Mart',
  'Dairy Farm Co.',
  'Spice Traders',
  'Packaging Hub',
]

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

export default function PaymentLedgerReport() {
  const [from, setFrom] = useState('Supplier')
  const [supplier, setSupplier] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleClear() {
    setFrom('Supplier')
    setSupplier('')
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Ledger Payment Report</h1>
        <ExportMenu onExportAll={() => showToast('Exported all')} />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[160px]">
          <SearchableSelect
            label="From"
            value={from}
            options={FROM_OPTIONS}
            placeholder="Supplier"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setFrom}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <SearchableSelect
            label="Supplier/Third Party"
            value={supplier}
            options={SUPPLIER_OPTIONS}
            placeholder="Supplier/Third Party"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setSupplier}
          />
        </div>
        <OutlineButton onClick={() => showToast('Search applied')}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
              <tr>
                <th className="px-3 py-2.5">Vendor Name</th>
                <th className="px-3 py-2.5">Company Name</th>
                <th className="px-3 py-2.5">Payables</th>
                <th className="px-3 py-2.5">Receivables</th>
                <th className="px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-3 py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="relative mb-4 text-muted">
                      <FileText
                        size={56}
                        strokeWidth={1.25}
                        className="text-muted/50"
                      />
                      <Search
                        size={24}
                        className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
                      />
                    </span>
                    <p className="text-base font-semibold text-ink">
                      Ledger Payment Report Record Not Found
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </InventoryPageShell>
  )
}
