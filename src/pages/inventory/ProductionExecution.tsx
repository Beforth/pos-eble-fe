import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'

const PRODUCTION_TYPES = [
  'Direct Production',
  'Production against PO',
] as const

function DropdownMenu({
  label,
  icon,
  items,
}: {
  label: string
  icon?: ReactNode
  items: { label: string; onClick?: () => void }[]
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
        {icon}
        {label}
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[200px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function EmptyPanel({ title }: { title?: string }) {
  return (
    <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <span className="relative mb-4 text-muted">
        <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
        <Search
          size={24}
          className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
        />
      </span>
      <p className="text-base font-semibold text-ink">
        {title ?? 'No Data Available'}
      </p>
    </div>
  )
}

export default function ProductionExecution() {
  const navigate = useNavigate()
  const [productionType, setProductionType] =
    useState<string>('Direct Production')
  const [processQuery, setProcessQuery] = useState('')
  const [withPrice, setWithPrice] = useState(false)
  const [noRecordAlertOpen, setNoRecordAlertOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <InventoryPageShell activeItem="production-execution">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px]">
            <SearchableSelect
              label="Production Type"
              value={productionType}
              options={[...PRODUCTION_TYPES]}
              placeholder="Select type"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setProductionType}
            />
          </div>
          <OutlineButton variant="gray">More Filters</OutlineButton>
          <OutlineButton onClick={() => showToast('Search applied')}>
            Search
          </OutlineButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu
            label="Production Via Excel"
            icon={<FileText size={15} className="text-muted" />}
            items={[
              {
                label: 'Download',
                onClick: () => showToast('Template downloaded'),
              },
              {
                label: 'Upload',
                onClick: () => showToast('Upload started'),
              },
            ]}
          />
          <DropdownMenu
            label="Generate Production Plan"
            icon={<FileText size={15} className="text-muted" />}
            items={[
              {
                label: 'Export PDF',
                onClick: () => showToast('Exported PDF'),
              },
              {
                label: 'Export Excel',
                onClick: () => showToast('Exported Excel'),
              },
            ]}
          />
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-4 py-3">
            <h2 className="mb-3 text-sm font-semibold text-ink">
              Select Production Processes
            </h2>
            <label className="relative block">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={processQuery}
                onChange={(event) => setProcessQuery(event.target.value)}
                placeholder="Search"
                className="h-9 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
          <EmptyPanel />
        </section>

        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">
              Ready For Production
            </h2>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  withPrice ? 'bg-primary' : 'bg-line'
                }`}
              >
                <input
                  type="checkbox"
                  checked={withPrice}
                  onChange={(event) => {
                    const enabled = event.target.checked
                    if (enabled) {
                      setNoRecordAlertOpen(true)
                      return
                    }
                    setWithPrice(false)
                  }}
                  className="sr-only"
                />
                <span
                  className={`absolute left-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                    withPrice ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
              With Price
            </label>
          </div>
          <EmptyPanel />
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <OutlineButton
          variant="gray"
          onClick={() => showToast('Raise Direct PO')}
        >
          Raise Direct PO
        </OutlineButton>
        <PrimaryButton onClick={() => showToast('Converted to production')}>
          Convert To Production
        </PrimaryButton>
      </div>

      <SelectRecordAlert
        open={noRecordAlertOpen}
        message="No record found."
        onClose={() => setNoRecordAlertOpen(false)}
      />
    </InventoryPageShell>
  )
}
