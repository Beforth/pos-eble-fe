import { topSellers } from '../../mocks/overviewDashboardData'
import { formatINR } from '../../utils/format'
import { Card } from '../common/Card'

const maxSales = Math.max(...topSellers.map((row) => row.sales), 1)

export function TopSellersCard() {
  return (
    <Card title="Top sellers" subtitle="By revenue today" divider={false}>
      <ul className="space-y-3">
        {topSellers.map((row) => (
          <li key={row.name}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-ink">{row.name}</p>
              <p className="shrink-0 text-xs font-semibold text-ink tabular-nums">
                {formatINR(row.sales)}
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-page">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(row.sales / maxSales) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted">{row.qty} plates</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
