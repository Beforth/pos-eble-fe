import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import {
  CircleCheck,
  CircleOff,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { TooltipWrapper } from '../../components/common/TooltipWrapper'
import {
  deleteSubOrderTypeApi,
  listSubOrderTypesApi,
  updateSubOrderTypeApi,
  type SubOrderTypeRecord,
} from '../../services/outletService'
import {
  KIND_LABEL,
  ORDER_TYPE_LABEL,
  createdText,
  orderTypesText,
} from './subOrderTypeLabels'

export default function SubOrderType() {
  const navigate = useNavigate()
  const [nameQuery, setNameQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const { encryptedOutletId } = useAuth()
  const [rows, setRows] = useState<SubOrderTypeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{
    rows: SubOrderTypeRecord[]
    skipped: number
  } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      setRows(await listSubOrderTypesApi(encryptedOutletId))
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load sub order types',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return rows.filter((row) => {
      const statusOk =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? row.is_active
            : !row.is_active
      const nameOk = !q || row.name.toLowerCase().includes(q)
      return statusOk && nameOk
    })
  }, [rows, appliedQuery, statusFilter])

  const { sortKey, sortDir, toggleSort, visible } = useListQuery(
    filtered,
    (row) => [
      row.name,
      KIND_LABEL[row.kind],
      orderTypesText(row.order_types),
      row.is_active,
      row.created_at,
    ],
    (row, key) => {
      if (key === 'type') return KIND_LABEL[row.kind]
      if (key === 'orderTypes') return orderTypesText(row.order_types)
      if (key === 'status') return row.is_active ? 1 : 0
      if (key === 'created') return row.created_at
      return row.name
    },
  )


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
    if (selectedIds.size === visible.length) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(visible.map((row) => row.id)))
  }

  async function setActive(active: boolean) {
    if (selectedIds.size === 0) {
      showToast('Please select at least one record')
      return
    }
    if (!encryptedOutletId || busy) return
    setBusy(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          updateSubOrderTypeApi(encryptedOutletId, id, { is_active: active }),
        ),
      )
      setSelectedIds(new Set())
      showToast(active ? 'Marked as Active' : 'Marked as Inactive')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update')
    } finally {
      setBusy(false)
      await load()
    }
  }

  function deleteSelected() {
    if (selectedIds.size === 0) {
      showToast('Please select at least one record')
      return
    }
    const removable = rows.filter(
      (row) => selectedIds.has(row.id) && row.kind === 'manual',
    )
    if (removable.length === 0) {
      showToast('Default / third-party types cannot be deleted')
      return
    }
    setConfirmDelete({ rows: removable, skipped: selectedIds.size - removable.length })
  }

  async function confirmDeleteRows() {
    if (!confirmDelete || !encryptedOutletId || busy) return
    const { rows: doomed, skipped } = confirmDelete
    setBusy(true)
    try {
      await Promise.all(
        doomed.map((row) => deleteSubOrderTypeApi(encryptedOutletId, row.id)),
      )
      setSelectedIds(new Set())
      showToast(
        skipped > 0
          ? `Deleted ${doomed.length}; ${skipped} protected type(s) skipped`
          : `Deleted ${doomed.length} record(s)`,
      )
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setBusy(false)
      setConfirmDelete(null)
      await load()
    }
  }

  const stats = {
    total: rows.length,
    active: rows.filter((row) => row.is_active).length,
    inactive: rows.filter((row) => !row.is_active).length,
  }

  const statCards: {
    key: 'all' | 'active' | 'inactive'
    label: string
    value: number
    tone: string
    icon: ReactNode
  }[] = [
    {
      key: 'all',
      label: 'All sub order types',
      value: stats.total,
      tone: 'bg-primary/10 text-primary',
      icon: <Layers size={18} />,
    },
    {
      key: 'active',
      label: 'Active',
      value: stats.active,
      tone: 'bg-success/10 text-success',
      icon: <CircleCheck size={18} />,
    },
    {
      key: 'inactive',
      label: 'Inactive',
      value: stats.inactive,
      tone: 'bg-page text-muted',
      icon: <CircleOff size={18} />,
    },
  ]

  const kindVariant = {
    default: 'primary',
    third_party: 'accent',
    manual: 'neutral',
  } as const

  return (
    <ReportsPageShell title="Sub Order Type" activeItem="config-sub-order-type">
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete sub order type"
        target={confirmDelete?.rows.map((row) => row.name).join(', ')}
        message="They stop appearing in this list and in billing."
        note="Archived, not erased. Default and third-party types are never deleted."
        confirmLabel={busy ? 'Deleting…' : 'Delete'}
        loading={busy}
        onClose={() => {
          if (!busy) setConfirmDelete(null)
        }}
        onConfirm={() => void confirmDeleteRows()}
      />

      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <PrimaryButton
            onClick={() => navigate('/management/configuration/sub-order-type/add')}
          >
            <Plus size={15} />
            Add Sub Order Type
          </PrimaryButton>
          <ActionDropdown
            options={[
              { label: 'Mark selected Active', onClick: () => void setActive(true) },
              { label: 'Mark selected Inactive', onClick: () => void setActive(false) },
              { label: 'Delete selected', onClick: deleteSelected, danger: true },
            ]}
          />
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {statCards.map((card) => {
          const active = statusFilter === card.key
          return (
            <button
              key={card.key}
              type="button"
              aria-pressed={active}
              onClick={() => setStatusFilter(card.key)}
              className={`flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors ${
                active ? 'border-primary shadow-sm' : 'border-line hover:border-muted'
              }`}
            >
              <span
                className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${card.tone}`}
              >
                {card.icon}
              </span>
              <span>
                <span className="block text-2xl font-bold tabular-nums text-ink">
                  {card.value}
                </span>
                <span className="block text-xs font-medium text-muted">{card.label}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3 sm:p-4">
          <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="sub-order-type-name"
              type="search"
              value={nameQuery}
              onChange={(event) => setNameQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              placeholder="Search by name"
              aria-label="Sub order type name"
              className="h-9 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
          <OutlineButton onClick={handleSearch}>Search</OutlineButton>
          <OutlineButton variant="gray" onClick={handleShowAll}>
            Clear Filter
          </OutlineButton>
          {selectedIds.size > 0 ? (
            <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {selectedIds.size} selected
            </span>
          ) : null}
        </div>

        {loading && rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted">
            Loading sub order types…
          </div>
        ) : visible.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-16 text-center">
            <Search size={44} strokeWidth={1.25} className="mb-4 text-muted/40" />
            <p className="text-base font-semibold text-ink">No Results Found.</p>
            <p className="mt-1 text-sm text-muted">
              We couldn&apos;t find a match for your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={visible.length > 0 && selectedIds.size === visible.length}
                      onChange={toggleSelectAll}
                      className="size-4 cursor-pointer accent-primary"
                      aria-label="Select all"
                    />
                  </th>
                  <SortableTh
                    columnKey="name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-3"
                  >
                    Name
                  </SortableTh>
                  <SortableTh
                    columnKey="type"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-3"
                  >
                    Type
                  </SortableTh>
                  <SortableTh
                    columnKey="orderTypes"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-3"
                  >
                    Order Type
                  </SortableTh>
                  <SortableTh
                    columnKey="status"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-3"
                  >
                    Status
                  </SortableTh>
                  <SortableTh
                    columnKey="created"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-3"
                  >
                    Created
                  </SortableTh>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const manual = row.kind === 'manual'
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-line last:border-0 hover:bg-page/60 ${
                        selectedIds.has(row.id) ? 'bg-primary/5' : ''
                      }`}
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
                      <td className="px-4 py-3 font-semibold text-ink">{row.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={kindVariant[row.kind]} size="md">
                          {KIND_LABEL[row.kind]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {row.order_types.length === 0 ? (
                            <span className="text-muted">—</span>
                          ) : (
                            row.order_types.map((type) => (
                              <span
                                key={type}
                                className="inline-flex h-6 items-center rounded-full bg-page px-2.5 text-xs font-medium text-ink ring-1 ring-line"
                              >
                                {ORDER_TYPE_LABEL[type] ?? type}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={row.is_active ? 'success' : 'neutral'} size="md" dot>
                          {row.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{createdText(row.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            aria-label={`Edit ${row.name}`}
                            data-tooltip={manual ? 'Edit' : 'Switch on or off'}
                            onClick={() =>
                              navigate(
                                `/management/configuration/sub-order-type/edit/${row.id}`,
                              )
                            }
                            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-line text-ink hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil size={14} />
                          </button>
                          <TooltipWrapper
                            label={
                              manual ? 'Delete' : 'Standard types cannot be deleted'
                            }
                          >
                            <button
                              type="button"
                              aria-label={`Delete ${row.name}`}
                              disabled={!manual}
                              onClick={() => setConfirmDelete({ rows: [row], skipped: 0 })}
                              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-line text-ink hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
                            >
                              <Trash2 size={14} />
                            </button>
                          </TooltipWrapper>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ReportsPageShell>
  )
}
