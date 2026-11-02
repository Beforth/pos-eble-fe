import { useCallback, useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { useListQuery } from '../../hooks/useListQuery'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import {
  deleteAreaDeliveryChargeApi,
  listAreaDeliveryChargesApi,
  updateAreaDeliveryChargeApi,
  type AreaDeliveryChargeRecord,
} from '../../services/outletService'
import { formatINR } from '../../utils/format'

type StatusFilter = 'all' | 'active' | 'inactive'

export default function AreaLocalityDeliveryCharges() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [rows, setRows] = useState<AreaDeliveryChargeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [deleteTarget, setDeleteTarget] = useState<AreaDeliveryChargeRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      setRows(await listAreaDeliveryChargesApi(encryptedOutletId))
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load delivery charges')
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return rows
    return rows.filter((row) => row.is_active === (statusFilter === 'active'))
  }, [rows, statusFilter])

  const { search, setSearch, sortKey, sortDir, toggleSort, visible } = useListQuery(
    filtered,
    (row) => [row.name, row.charge, row.is_active],
    (row, key) => {
      if (key === 'charge') return Number(row.charge)
      if (key === 'status') return row.is_active ? 1 : 0
      return row.name
    },
  )

  const counts = {
    all: rows.length,
    active: rows.filter((row) => row.is_active).length,
    inactive: rows.filter((row) => !row.is_active).length,
  }
  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
  ]

  /** Switch a row on or off straight from the list. */
  async function toggleActive(row: AreaDeliveryChargeRecord) {
    if (!encryptedOutletId) return
    const next = !row.is_active
    setRows((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, is_active: next } : item)),
    )
    try {
      await updateAreaDeliveryChargeApi(encryptedOutletId, row.id, { is_active: next })
    } catch (error) {
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, is_active: !next } : item)),
      )
      showToast(error instanceof Error ? error.message : 'Failed to update')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !encryptedOutletId || deleting) return
    setDeleting(true)
    try {
      await deleteAreaDeliveryChargeApi(encryptedOutletId, deleteTarget.id)
      showToast('Delivery charge removed')
      setDeleteTarget(null)
      await load()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const goAdd = () => navigate('/management/configuration/area-locality-delivery/add')

  return (
    <ReportsPageShell
      title="Area/Locality Wise Delivery Charges"
      activeItem="config-area-locality-delivery"
      actions={
        <PrimaryButton onClick={goAdd}>
          <Plus size={15} />
          Add Area/Locality
        </PrimaryButton>
      }
    >
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete delivery charge"
        target={deleteTarget?.name}
        message="Deliveries to this area will no longer get this charge."
        note="Archived, not erased."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        onConfirm={() => void confirmDelete()}
      />

      {loading && rows.length === 0 ? (
        <div className="rounded-xl border border-line bg-card px-6 py-16 text-center text-sm text-muted">
          Loading delivery charges…
        </div>
      ) : rows.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card px-6 py-16 text-center">
          <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin size={28} />
          </span>
          <p className="text-base font-semibold text-ink">No area charges yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Add an area or locality and the delivery charge for it, for example College
            Road for ₹40.
          </p>
          <div className="mt-5">
            <PrimaryButton onClick={goAdd}>
              <Plus size={15} />
              Add Area/Locality
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
              <ListSearch value={search} onChange={setSearch} placeholder="Search areas" />
              <div
                className="inline-flex rounded-xl border border-line bg-page p-1"
                role="tablist"
                aria-label="Filter by status"
              >
                {tabs.map((tab) => {
                  const active = statusFilter === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setStatusFilter(tab.key)}
                      className={`inline-flex h-8 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                        active ? 'bg-primary text-white shadow-sm' : 'text-ink hover:bg-card'
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 text-xs tabular-nums ${
                          active ? 'bg-white/25' : 'bg-card text-muted'
                        }`}
                      >
                        {counts[tab.key]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
                <Search size={40} strokeWidth={1.25} className="mb-3 text-muted/40" />
                <p className="text-base font-semibold text-ink">No Results Found.</p>
                <p className="mt-1 text-sm text-muted">
                  We couldn&apos;t find a match for your search.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                    <tr>
                      <SortableTh
                        columnKey="name"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        className="px-4 py-3"
                      >
                        Area / Locality
                      </SortableTh>
                      <SortableTh
                        columnKey="charge"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        className="px-4 py-3"
                      >
                        Delivery charge
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
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-line last:border-0 hover:bg-page/60"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2 font-semibold text-ink">
                            <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <MapPin size={13} />
                            </span>
                            {row.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-base font-bold tabular-nums text-ink">
                          {formatINR(Number(row.charge), 2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={row.is_active}
                              aria-label={`${row.name} active`}
                              onClick={() => void toggleActive(row)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                                row.is_active ? 'bg-primary' : 'bg-line'
                              }`}
                            >
                              <span
                                className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
                                  row.is_active ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-xs font-medium ${
                                row.is_active ? 'text-success' : 'text-muted'
                              }`}
                            >
                              {row.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              aria-label={`Edit ${row.name}`}
                              data-tooltip="Edit"
                              onClick={() =>
                                navigate(
                                  `/management/configuration/area-locality-delivery/edit/${row.id}`,
                                )
                              }
                              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-line text-ink hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${row.name}`}
                              data-tooltip="Delete"
                              onClick={() => setDeleteTarget(row)}
                              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-line text-ink hover:bg-primary/10 hover:text-primary"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </ReportsPageShell>
  )
}
