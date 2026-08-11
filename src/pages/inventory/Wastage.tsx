import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  FileCog,
  FileText,
  Info,
  Plus,
  Search,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { WastageSettingsDrawer } from '../../components/inventory/WastageSettingsDrawer'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const VIEW_OPTIONS = ['Date wise', 'Category wise'] as const
const STATUS_OPTIONS = [
  'All',
  'Saved',
  'Cancelled',
  'Pending For Approval',
] as const
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
] as const

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

export default function Wastage() {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState('2026-08-04')
  const [endDate, setEndDate] = useState('2026-08-11')
  const [status, setStatus] = useState<string>('All')
  const [category, setCategory] = useState<string>('All')
  const [view, setView] = useState<string>('Date wise')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  return (
    <InventoryPageShell activeItem="wastage">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Wastage List</h1>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => navigate('/inventory/wastage/new')}>
            <Plus size={15} />
            Create New
          </PrimaryButton>
          <ExportMenu
            onExportPage={() => {
              setToast('Exported current page')
              window.setTimeout(() => setToast(null), 2400)
            }}
            onExportAll={() => {
              setToast('Exported all')
              window.setTimeout(() => setToast(null), 2400)
            }}
          />
          <button
            type="button"
            aria-label="Wastage settings"
            title="Wastage settings"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink"
          >
            <FileCog size={16} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[180px]">
          <SearchableSelect
            label="Status"
            value={status}
            options={[...STATUS_OPTIONS]}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setStatus}
          />
        </div>
        <div className="min-w-[220px]">
          <SearchableSelect
            label="Category"
            value={category}
            options={[...CATEGORY_OPTIONS]}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setCategory}
          />
        </div>
        <div className="min-w-[160px]">
          <SearchableSelect
            label={
              <>
                View
                <span title="Choose how wastage records are grouped in the list">
                  <Info size={13} className="text-muted" />
                </span>
              </>
            }
            value={view}
            options={[...VIEW_OPTIONS]}
            placeholder="Select view"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setView}
          />
        </div>
        <OutlineButton>Search</OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setStatus('All')
            setCategory('All')
            setView('Date wise')
            setStartDate('2026-08-04')
            setEndDate('2026-08-11')
          }}
        >
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
          We could not find what you searched for. Try searching again.
        </p>
      </div>

      <WastageSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </InventoryPageShell>
  )
}
