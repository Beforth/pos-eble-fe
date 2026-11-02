import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import { CircleDollarSign, Layers, Pencil, Plus, Route, Search, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import {
  deleteDeliveryDistanceApi,
  listDeliveryDistancesApi,
  type DeliveryDistanceRecord,
} from '../../services/outletService'
import { formatINR } from '../../utils/format'

/** `3.00` -> `3`, `2.50` -> `2.5` */
function km(value: string): string {
  return String(Number(value))
}

export default function DeliveryDistance() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [rows, setRows] = useState<DeliveryDistanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<DeliveryDistanceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      setRows(await listDeliveryDistancesApi(encryptedOutletId))
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load distances')
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  const hasRows = useMemo(() => rows.length > 0, [rows])
  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      rows,
      (row) => [row.from_km, row.to_km, row.charge],
      (row, key) => (key === 'charge' ? Number(row.charge) : Number(row.from_km)),
    )

  const summary = useMemo(() => {
    if (rows.length === 0) return null
    const charges = rows.map((row) => Number(row.charge))
    return {
      count: rows.length,
      reach: Math.max(...rows.map((row) => Number(row.to_km))),
      lowest: Math.min(...charges),
      highest: Math.max(...charges),
    }
  }, [rows])

  async function confirmDelete() {
    if (!deleteTarget || !encryptedOutletId || deleting) return
    setDeleting(true)
    try {
      await deleteDeliveryDistanceApi(encryptedOutletId, deleteTarget.id)
      showToast('Distance removed')
      setDeleteTarget(null)
      await load()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const goAdd = () => navigate('/management/configuration/delivery-distance/add')

  const stats: { label: string; value: string; tone: string; icon: ReactNode }[] = summary
    ? [
        {
          label: 'Distance ranges',
          value: String(summary.count),
          tone: 'bg-primary/10 text-primary',
          icon: <Layers size={18} />,
        },
        {
          label: 'Delivers up to',
          value: `${km(String(summary.reach))} km`,
          tone: 'bg-accent/15 text-accent',
          icon: <Route size={18} />,
        },
        {
          label: 'Charge range',
          value:
            summary.lowest === summary.highest
              ? formatINR(summary.lowest)
              : `${formatINR(summary.lowest)} – ${formatINR(summary.highest)}`,
          tone: 'bg-success/10 text-success',
          icon: <CircleDollarSign size={18} />,
        },
      ]
    : []

  return (
    <ReportsPageShell
      title="Delivery Distance"
      activeItem="config-delivery-distance"
      actions={
        <PrimaryButton onClick={goAdd}>
          <Plus size={15} />
          Add Distance
        </PrimaryButton>
      }
    >
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete distance"
        target={
          deleteTarget ? `${km(deleteTarget.from_km)} - ${km(deleteTarget.to_km)} km` : undefined
        }
        message="Orders in this range will no longer get this delivery charge."
        note="Archived, not erased."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        onConfirm={() => void confirmDelete()}
      />

      {loading && !hasRows ? (
        <div className="rounded-xl border border-line bg-card px-6 py-16 text-center text-sm text-muted">
          Loading distances…
        </div>
      ) : !hasRows ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card px-6 py-16 text-center">
          <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Route size={28} />
          </span>
          <p className="text-base font-semibold text-ink">No delivery distances yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Add a distance range and the charge for it, for example 0 – 3 km for ₹30.
          </p>
          <div className="mt-5">
            <PrimaryButton onClick={goAdd}>
              <Plus size={15} />
              Add Distance
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {stats.map((card) => (
              <div
                key={card.label}
                className="flex items-center gap-3 rounded-xl border border-line bg-card p-4"
              >
                <span
                  className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${card.tone}`}
                >
                  {card.icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xl font-bold tabular-nums text-ink">
                    {card.value}
                  </span>
                  <span className="block text-xs font-medium text-muted">{card.label}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="border-b border-line p-4">
              <ListSearch
                value={search}
                onChange={setSearch}
                placeholder="Search distances"
              />
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
                        columnKey="fromKm"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={toggleSort}
                        className="px-4 py-3"
                      >
                        Distance range
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
                          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-primary/10 px-3 text-sm font-semibold tabular-nums text-primary">
                            <Route size={13} />
                            {km(row.from_km)} – {km(row.to_km)} km
                          </span>
                        </td>
                        <td className="px-4 py-3 text-base font-bold tabular-nums text-ink">
                          {formatINR(Number(row.charge), 2)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              aria-label="Edit distance"
                              data-tooltip="Edit distance"
                              onClick={() =>
                                navigate(
                                  `/management/configuration/delivery-distance/edit/${row.id}`,
                                )
                              }
                              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-line text-ink hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete distance"
                              data-tooltip="Delete distance"
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
