import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileX, Loader2, Pencil } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { listTaxesApi } from '../../services/menuService'
import { useNewOrder } from '../../state/useNewOrder'
import type { Tax } from '../../types/menu'
import { showToast } from '../../utils/toast'

/** The taxes the outlet has set up; the pencil opens the existing tax editor. */
export default function BillingTaxes() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, canAccess } = useAuth()
  // The editor lives under Menu, which some roles (a cashier) cannot open.
  const canEdit = canAccess('/menu/taxes')
  const [billNo, setBillNo] = useState('')
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listTaxesApi(encryptedOutletId)
      .then((rows) => {
        if (!cancelled) setTaxes([...rows].sort((a, b) => a.position - b.position))
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(error instanceof Error ? error.message : 'Failed to load taxes')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Tax Listing</h1>
          <button
            type="button"
            onClick={() => navigate('/billing/operations')}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-12 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading taxes…
          </div>
        ) : taxes.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-xl border border-line bg-card px-6 py-10 text-center">
            <FileX size={64} strokeWidth={1.2} className="text-muted/60" />
            <p className="text-sm text-muted">Records not available</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-page text-left text-sm font-bold text-ink">
                    <th scope="col" className="px-5 py-4">Tax Title</th>
                    <th scope="col" className="px-5 py-4">Tax Type</th>
                    <th scope="col" className="px-5 py-4">Type</th>
                    <th scope="col" className="px-5 py-4">Amount</th>
                    <th scope="col" className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {taxes.map((tax) => (
                    <tr key={tax.id} className="border-t border-line">
                      <td className="px-5 py-5 text-ink">{tax.title}</td>
                      <td className="px-5 py-5 text-ink">{tax.tax_type}</td>
                      <td className="px-5 py-5 text-ink">{tax.type}</td>
                      <td className="px-5 py-5 tabular-nums text-ink">{tax.amount}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          {canEdit ? (
                            <button
                              type="button"
                              aria-label={`Edit ${tax.title}`}
                              data-tooltip="Edit tax"
                              onClick={() =>
                                navigate(`/menu/taxes/${encodeURIComponent(tax.id)}/edit`)
                              }
                              className="inline-flex size-9 items-center justify-center rounded-lg bg-page text-ink hover:bg-line/60"
                            >
                              <Pencil size={16} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
