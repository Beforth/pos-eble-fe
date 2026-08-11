import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  ClipboardList,
  Pencil,
  Plus,
  Search,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../components/menu/MenuActionButtons'
import { EditVariationModal, VariationModal } from '../components/menu/EditVariationModal'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'
import { ShowChangesModal } from '../components/menu/ShowChangesModal'
import {
  menuVariations,
  type MenuVariation,
} from '../mocks/menuSectionData'

const SEARCH_BY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'not-assigned', label: 'Not Assigned' },
] as const

type SearchByValue = (typeof SEARCH_BY_OPTIONS)[number]['value']

function SearchByDropdown({
  value,
  onChange,
}: {
  value: SearchByValue
  onChange: (value: SearchByValue) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedLabel =
    SEARCH_BY_OPTIONS.find((option) => option.value === value)?.label ?? 'All'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SEARCH_BY_OPTIONS
    return SEARCH_BY_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-left text-sm text-ink hover:bg-page"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
          <div className="border-b border-line p-2">
            <label className="flex h-9 items-center gap-2 rounded-md border border-line px-2.5">
              <Search size={14} className="shrink-0 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </label>
          </div>
          <ul role="listbox" className="py-1">
            {filtered.map((option) => {
              const active = option.value === value
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-page ${
                      active ? 'bg-page font-medium text-ink' : 'text-ink'
                    }`}
                  >
                    {option.label}
                    {active ? (
                      <Check size={14} className="shrink-0 text-success" />
                    ) : (
                      <span className="size-3.5 shrink-0" />
                    )}
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No matches</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default function VariantsManagement() {
  const [variations, setVariations] = useState(menuVariations)
  const [nameQuery, setNameQuery] = useState('')
  const [searchBy, setSearchBy] = useState<SearchByValue>('all')
  const [appliedName, setAppliedName] = useState('')
  const [appliedSearchBy, setAppliedSearchBy] =
    useState<SearchByValue>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [changesName, setChangesName] = useState<string | null>(null)
  const [editing, setEditing] = useState<MenuVariation | null>(null)
  const [adding, setAdding] = useState(false)

  const rows = useMemo(() => {
    const q = appliedName.trim().toLowerCase()
    return variations.filter((row) => {
      const matchesName =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.departmentName.toLowerCase().includes(q)

      const matchesFilter =
        appliedSearchBy === 'all'
          ? true
          : appliedSearchBy === 'active'
            ? row.status === 'Active'
            : appliedSearchBy === 'inactive'
              ? row.status === 'Inactive'
              : appliedSearchBy === 'assigned'
                ? Boolean(row.departmentName.trim())
                : !row.departmentName.trim()

      return matchesName && matchesFilter
    })
  }, [appliedName, appliedSearchBy, variations])

  const allSelected =
    rows.length > 0 && rows.every((row) => selected.has(row.id))

  function setSelectedStatus(status: 'Active' | 'Inactive') {
    if (selected.size === 0) return
    setVariations((prev) =>
      prev.map((row) =>
        selected.has(row.id) ? { ...row, status } : row,
      ),
    )
  }

  function handleSearch() {
    setAppliedName(nameQuery)
    setAppliedSearchBy(searchBy)
  }

  function handleShowAll() {
    setNameQuery('')
    setAppliedName('')
    setSearchBy('all')
    setAppliedSearchBy('all')
  }

  return (
    <MenuPageShell
      backTo="/menu"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Variation</span>
        </span>
      }
    >
      <MenuSectionNav activeTab="variants" />

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <PrimaryButton onClick={() => setAdding(true)}>
          <Plus size={15} />
          Add Variation
        </PrimaryButton>
        <ActionDropdown
          options={[
            { label: 'Active', onClick: () => setSelectedStatus('Active') },
            { label: 'Inactive', onClick: () => setSelectedStatus('Inactive') },
          ]}
        />
        <OutlineButton variant="gray">Bulk Update</OutlineButton>
      </div>

      <div className="mb-4 rounded-lg border border-line bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_auto]">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Variation Name
            </label>
            <input
              type="text"
              value={nameQuery}
              onChange={(event) => setNameQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Search By
            </label>
            <SearchByDropdown value={searchBy} onChange={setSearchBy} />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Show All
            </OutlineButton>
            <OutlineButton>Update Variation</OutlineButton>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Note:{' '}
          <span className="font-medium text-primary">Drag row</span> to change
          order/rank variations.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-page text-sm font-semibold text-ink">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(
                      allSelected ? new Set() : new Set(rows.map((r) => r.id)),
                    )
                  }
                  className="cursor-pointer accent-primary"
                />
              </th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Online Display Name</th>
              <th className="px-3 py-3">Department Name</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3">Modified</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line last:border-b-0 hover:bg-page/80"
              >
                <td className="px-3 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev)
                        if (next.has(row.id)) next.delete(row.id)
                        else next.add(row.id)
                        return next
                      })
                    }
                    className="cursor-pointer accent-primary"
                  />
                </td>
                <td className="px-3 py-3.5 font-medium text-ink">{row.name}</td>
                <td className="px-3 py-3.5 text-muted">
                  {row.onlineDisplayName || '—'}
                </td>
                <td className="px-3 py-3.5 text-ink">{row.departmentName}</td>
                <td
                  className={`px-3 py-3.5 font-medium ${
                    row.status === 'Active' ? 'text-success' : 'text-muted'
                  }`}
                >
                  {row.status}
                </td>
                <td className="px-3 py-3.5 text-muted">{row.created}</td>
                <td className="px-3 py-3.5 text-muted">{row.modified}</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1">
                    <RowActionButton
                      label="Edit"
                      onClick={() => setEditing(row)}
                    >
                      <Pencil size={16} />
                    </RowActionButton>
                    <RowActionButton
                      label="Show Changes"
                      onClick={() => setChangesName(row.name)}
                    >
                      <ClipboardList size={16} />
                    </RowActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <VariationModal
        open={adding}
        mode="add"
        variation={null}
        onClose={() => setAdding(false)}
        onSave={(created) => {
          setVariations((prev) => [created, ...prev])
        }}
      />

      <EditVariationModal
        open={Boolean(editing)}
        variation={editing}
        onClose={() => setEditing(null)}
        onSave={(updated) => {
          setVariations((prev) =>
            prev.map((row) => (row.id === updated.id ? updated : row)),
          )
        }}
      />

      <ShowChangesModal
        open={Boolean(changesName)}
        name={changesName}
        onClose={() => setChangesName(null)}
      />
    </MenuPageShell>
  )
}
