import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'

interface DeliveryDistanceRow {
  id: string
  fromKm: string
  toKm: string
  charge: string
}

export default function DeliveryDistance() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [rows, setRows] = useState<DeliveryDistanceRow[]>([])

  const hasRows = useMemo(() => rows.length > 0, [rows])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleDelete(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id))
    showToast('Distance removed')
  }

  return (
    <ReportsPageShell
      title="Delivery Distance"
      activeItem="config-delivery-distance"
      actions={
        <PrimaryButton
          onClick={() =>
            navigate('/management/configuration/delivery-distance/add')
          }
        >
          <Plus size={15} />
          Add Distance
        </PrimaryButton>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {!hasRows ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
          <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page">
            <Search size={48} strokeWidth={1.25} className="text-muted/45" />
          </span>
          <p className="text-base font-semibold text-ink">No Results Found.</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t find a match for your search.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-page/50"
                  >
                    <td className="px-4 py-3 text-ink">{row.fromKm}</td>
                    <td className="px-4 py-3 text-ink">{row.toKm}</td>
                    <td className="px-4 py-3 text-ink">{row.charge}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Edit distance"
                          onClick={() =>
                            navigate(
                              `/management/configuration/delivery-distance/edit/${row.id}`,
                            )
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete distance"
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
        </div>
      )}
    </ReportsPageShell>
  )
}
