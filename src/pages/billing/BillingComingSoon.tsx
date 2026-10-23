import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { useNewOrder } from '../../state/useNewOrder'

interface BillingComingSoonProps {
  title: string
  description: string
}

/** Stand-in for an Operations screen that is listed but not built yet. */
export default function BillingComingSoon({ title, description }: BillingComingSoonProps) {
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

      <main className="flex min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <Link
            to="/billing/operations"
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={14} />
            Operations
          </Link>
          <h1 className="text-lg font-bold text-ink">{title}</h1>
          <p className="mt-0.5 text-sm text-muted">{description}</p>
          <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-line bg-card px-6 py-12 text-center text-sm text-muted">
            This screen is coming soon.
          </div>
        </div>
      </main>
    </div>
  )
}
