import { useMemo, useSyncExternalStore, useState } from 'react'
import { Pencil, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import {
  deleteRows,
  getRows,
  setRowsActive,
  subscribe,
  type SubOrderTypeRow,
} from './subOrderTypeStore'

export default function SubOrderType() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [nameQuery, setNameQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const rows: SubOrderTypeRow[] = useSyncExternalStore(subscribe, getRows)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return rows.filter((row) => {
      const statusOk =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? row.active
            : !row.active
      const nameOk = !q || row.name.toLowerCase().includes(q)
      return statusOk && nameOk
    })
  }, [rows, appliedQuery, statusFilter])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setAppliedQuery(nameQuery.trim())
  }

  function handleShowAll() {
    setNameQuery('')
    setAppliedQuery('')
    setStatusFilter('all')
    showToast('Filters cleared')
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(filtered.map((row) => row.id)))
  }

  function setActive(active: boolean) {
    if (selectedIds.size === 0) {
      showToast('Please select at least one record')
      return
    }
    setRowsActive(Array.from(selectedIds), active)
    setSelectedIds(new Set())
    showToast(active ? 'Marked as Active' : 'Marked as Inactive')
  }

  function deleteSelected() {
    if (selectedIds.size === 0) {
      showToast('Please select at least one record')
      return
    }
    const selected = rows.filter((row) => selectedIds.has(row.id))
    const removable = selected.filter((row) => row.editable)
    const locked = selected.length - removable.length

    if (removable.length === 0) {
      showToast('Default / third-party types cannot be deleted')
      return
    }

    const removableIds = new Set(removable.map((row) => row.id))
    deleteRows(Array.from(removableIds))
    setSelectedIds(new Set())
    showToast(
      locked > 0
        ? `Deleted ${removable.length}; ${locked} protected type(s) skipped`
        : `Deleted ${removable.length} record(s)`,
    )
  }

  return (
    <ReportsPageShell title="Sub Order Type" activeItem="config-sub-order-type">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex items-center justify-end gap-2 border-b border-line px-4 py-3 sm:px-5">
          <PrimaryButton
            onClick={() =>
              navigate('/management/configuration/sub-order-type/add')
            }
          >
            <Plus size={15} />
            Add Sub Order Type
          </PrimaryButton>
          <ActionDropdown
            options={[
              { label: 'Active', onClick: () => setActive(true) },
              { label: 'Inactive', onClick: () => setActive(false) },
              { label: 'Delete', onClick: deleteSelected, danger: true },
            ]}
          />
        </div>
        <div className="border-b border-line p-4 sm:p-5">
          <label
            htmlFor="sub-order-type-name"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Sub Order Type Name
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="sub-order-type-name"
              type="search"
              value={nameQuery}
              onChange={(event) => setNameQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              className="h-9 min-w-[200px] flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary sm:max-w-xs"
            />
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Clear Filter
            </OutlineButton>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
            <Search
              size={48}
              strokeWidth={1.25}
              className="mb-4 text-muted/40"
            />
            <p className="text-base font-semibold text-ink">No Results Found.</p>
            <p className="mt-1 text-sm text-muted">
              We couldn&apos;t find a match for your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        selectedIds.size === filtered.length
                      }
                      onChange={toggleSelectAll}
                      className="size-4 cursor-pointer accent-primary"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Order Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-page/50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="size-4 cursor-pointer accent-primary"
                        aria-label={`Select ${row.name}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                    <td className="px-4 py-3 text-ink">{row.type}</td>
                    <td className="px-4 py-3 text-ink">{row.orderTypes}</td>
                    <td className="px-4 py-3">
                      <Badge variant={row.active ? 'success' : 'neutral'} size="md">
                        {row.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{row.created}</td>
                    <td className="px-4 py-3">
                      {row.editable ? (
                        <button
                          type="button"
                          aria-label={`Edit ${row.name}`}
                          onClick={() =>
                            navigate(
                              `/management/configuration/sub-order-type/edit/${row.id}`,
                            )
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={15} />
                        </button>
                      ) : (
                        <span className="inline-block w-8" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ReportsPageShell>
  )
}
