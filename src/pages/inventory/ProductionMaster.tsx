import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Info, Plus, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

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

function DropdownMenu({
  label,
  icon,
  items,
  sections,
}: {
  label: string
  icon?: ReactNode
  items?: { label: string; onClick?: () => void }[]
  sections?: {
    title: string
    items: { label: string; onClick?: () => void }[]
  }[]
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

  function renderItem(item: { label: string; onClick?: () => void }) {
    return (
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
    )
  }

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
          {sections
            ? sections.map((section, index) => (
                <li key={section.title}>
                  {index > 0 ? (
                    <div className="my-1 border-t border-line" />
                  ) : null}
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    {section.title}
                  </p>
                  <ul>{section.items.map(renderItem)}</ul>
                </li>
              ))
            : items?.map(renderItem)}
        </ul>
      ) : null}
    </div>
  )
}

export default function ProductionMaster() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <InventoryPageShell activeItem="production-master">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Production List</h1>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => navigate('/inventory/production-master/new')}
          >
            <Plus size={15} />
            Create New
          </PrimaryButton>
          <DropdownMenu
            label="Action"
            items={[
              {
                label: 'Copy Production',
                onClick: () => showToast('Copy Production'),
              },
              {
                label: 'Delete Multiple Production',
                onClick: () => showToast('Delete Multiple Production'),
              },
            ]}
          />
          <DropdownMenu
            label="Files"
            icon={<FileText size={15} className="text-muted" />}
            sections={[
              {
                title: 'Import',
                items: [
                  {
                    label: 'Download',
                    onClick: () => showToast('Template downloaded'),
                  },
                  {
                    label: 'Upload',
                    onClick: () => showToast('Upload started'),
                  },
                ],
              },
              {
                title: 'Export',
                items: [
                  {
                    label: 'Export Current Page',
                    onClick: () => showToast('Exported current page'),
                  },
                  {
                    label: 'Export All',
                    onClick: () => showToast('Exported all'),
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Search Production
          </label>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Production"
            className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[200px]">
          <SearchableSelect
            label={
              <>
                Category
                <span title="Filter production records by category">
                  <Info size={13} className="text-muted" />
                </span>
              </>
            }
            value={category}
            options={[...CATEGORY_OPTIONS]}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setCategory}
          />
        </div>
        <OutlineButton
          onClick={() => showToast('Search applied')}
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setSearch('')
            setCategory('All')
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
        <p className="text-base font-semibold text-ink">
          Convert Raw Material Management Record Not Found
        </p>
      </div>
    </InventoryPageShell>
  )
}
