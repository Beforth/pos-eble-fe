import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileX, Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { listDiscountsApi } from '../../services/menuService'
import { useNewOrder } from '../../state/useNewOrder'
import type { Discount } from '../../types/menu'
import { formatINR } from '../../utils/format'
import { showToast } from '../../utils/toast'

const HEADINGS = ['Name', 'Type', 'Value', 'Max Amount', 'Applies To', 'Status']

function valueText(discount: Discount): string {
  const value = Number(discount.value)
  return discount.discount_type === 'Percentage' ? `${value}%` : formatINR(value, 2)
}

/** The discounts the outlet has set up, as the counter sees them (read-only). */
export default function BillingDiscounts() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listDiscountsApi(encryptedOutletId)
      .then((rows) => {
        if (!cancelled) setDiscounts(rows)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(error instanceof Error ? error.message : 'Failed to load discounts')
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
          <h1 className="text-lg font-bold text-ink">Discount</h1>
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
            Loading discounts…
          </div>
        ) : discounts.length === 0 ? (
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
                    {HEADINGS.map((heading) => (
                      <th key={heading} scope="col" className="whitespace-nowrap px-5 py-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.id} className="border-t border-line">
                      <td className="px-5 py-4 font-semibold text-ink">{discount.name}</td>
                      <td className="px-5 py-4 text-ink">{discount.discount_type}</td>
                      <td className="px-5 py-4 tabular-nums text-ink">{valueText(discount)}</td>
                      <td className="px-5 py-4 tabular-nums text-ink">
                        {discount.max_amount == null || discount.max_amount === ''
                          ? '—'
                          : formatINR(Number(discount.max_amount), 2)}
                      </td>
                      <td className="px-5 py-4 text-ink">
                        {discount.applicability.length > 0
                          ? discount.applicability.join(', ')
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-ink">
                        {discount.is_active ? 'Active' : 'Inactive'}
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
