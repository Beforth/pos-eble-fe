import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../components/common/Badge'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

interface AreaChargeRow {
  id: string
  area: string
  locality: string
  charge: string
  active: boolean
}

export default function AreaLocalityDeliveryCharges() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [status, setStatus] = useState('All')
  const [appliedStatus, setAppliedStatus] = useState('All')
  const [rows, setRows] = useState<AreaChargeRow[]>([])

  const filtered = useMemo(() => {
    if (appliedStatus === 'All') return rows
    const wantActive = appliedStatus === 'Active'
    return rows.filter((row) => row.active === wantActive)
  }, [rows, appliedStatus])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setAppliedStatus(status)
  }

  function handleShowAll() {
    setStatus('All')
    setAppliedStatus('All')
    showToast('Filters cleared')
  }

  function handleDelete(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id))
    showToast('Delivery charge removed')
  }

  return (
    <ReportsPageShell
      title="Area/Locality Wise Delivery Charges"
      activeItem="config-area-locality-delivery"
      actions={
        <PrimaryButton
          onClick={() =>
            navigate('/management/configuration/area-locality-delivery/add')
          }
        >
          <Plus size={15} />
          Add Area/Locality Wise Delivery Charges
        </PrimaryButton>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line p-4 sm:p-5">
          <label
            htmlFor="area-charge-status"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Select Status
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="area-charge-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-9 min-w-[160px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Clear Filter
            </OutlineButton>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page">
              <Search
                size={48}
                strokeWidth={1.25}
                className="text-muted/45"
              />
            </span>
            <p className="text-base font-semibold text-ink">No Results Found.</p>
            <p className="mt-1 text-sm text-muted">
              We couldn&apos;t find a match for your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Locality</th>
                  <th className="px-4 py-3">Charge ({brand.currency})</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-page/50"
                  >
                    <td className="px-4 py-3 font-medium text-ink">{row.area}</td>
                    <td className="px-4 py-3 text-ink">{row.locality}</td>
                    <td className="px-4 py-3 text-ink">{row.charge}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={row.active ? 'success' : 'neutral'}
                        size="md"
                      >
                        {row.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${row.area}`}
                          onClick={() =>
                            navigate(
                              `/management/configuration/area-locality-delivery/edit/${row.id}`,
                            )
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${row.area}`}
                          onClick={() => handleDelete(row.id)}
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                        >
                          <Trash2 size={15} />
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
    </ReportsPageShell>
  )
}
