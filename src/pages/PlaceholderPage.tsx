import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '../components/brand/BrandLogo'
import { brand } from '../theme/brand'

const TITLES: Record<string, string> = {
  '/day-end': 'Day End',
  '/logs': 'Logs',
  '/reports/category-summary': 'Category Summary',
  '/reports/item-summary': 'Item Summary',
  '/reports/sales-summary': 'Sales Summary',
  '/reports/order-summary': 'Order Summary',
  '/reports/executive-sales-summary': 'Executive Sales Summary',
  '/reports/employee-summary': 'Employee Summary',
  '/reports/group-summary': 'Group Summary',
  '/reports/variation-summary': 'Variation Summary',
  '/reports/tax-summary': 'Tax Summary',
  '/reports/counter-summary': 'Counter Summary',
}

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = TITLES[pathname] ?? 'Page'

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="flex h-14 items-center gap-3 border-b border-line bg-white px-4">
        <BrandLogo size={32} />
        <span className="text-sm font-bold text-ink">{brand.shortName}</span>
        <button
          type="button"
          onClick={() => navigate('/billing')}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={14} />
          Back to Billing
        </button>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <p className="text-sm text-muted">This section will be available soon.</p>
      </main>
    </div>
  )
}
