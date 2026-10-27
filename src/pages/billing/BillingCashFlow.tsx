import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileX } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { useNewOrder } from '../../state/useNewOrder'

/**
 * Cash Flow: the Petty Cash Assign listing. Petty cash assignments are not
 * recorded anywhere yet, so the list is always empty for now.
 */
export default function BillingCashFlow() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-bold text-ink">Petty Cash Assign Listing</h1>
        <button
          type="button"
          onClick={() => navigate('/billing/operations')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card px-6 py-10 text-sm text-muted shadow-sm">
          <FileX size={72} strokeWidth={1.25} className="text-line" />
          Records not available
        </div>
      </main>
    </div>
  )
}
