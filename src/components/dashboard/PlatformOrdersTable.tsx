import type { PlatformRow } from '../../types'
import { formatINR, formatNumber } from '../../utils/format'
import { Table, type Column } from '../common/Table'

interface PlatformOrdersTableProps {
  platforms: PlatformRow[]
}

const platformDot: Record<string, string> = {
  Zomato: 'bg-primary',
  Swiggy: 'bg-accent',
  Toing: 'bg-secondary',
  Other: 'bg-muted',
}

export function PlatformOrdersTable({ platforms }: PlatformOrdersTableProps) {
  const totals = platforms.reduce(
    (acc, row) => ({
      orders: acc.orders + row.orders,
      prepaid: acc.prepaid + row.prepaidRevenue,
      cod: acc.cod + row.codRevenue,
      revenue: acc.revenue + row.revenue,
    }),
    { orders: 0, prepaid: 0, cod: 0, revenue: 0 },
  )

  const columns: Column<PlatformRow>[] = [
    {
      key: 'platform',
      header: 'Platform',
      render: (row) => (
        <span className="flex items-center gap-2">
          <span
            className={`size-2.5 shrink-0 rounded-full ${platformDot[row.platform] ?? 'bg-muted'}`}
          />
          <span>
            <span className="block font-medium text-ink">{row.platform}</span>
            <span className="text-[11px] text-muted">
              {row.brands} brand{row.brands === 1 ? '' : 's'}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums">{formatNumber(row.orders)}</span>
      ),
    },
    {
      key: 'prepaid',
      header: 'Prepaid Orders',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums">
          {row.prepaidRevenue > 0 ? formatINR(row.prepaidRevenue) : '—'}
        </span>
      ),
    },
    {
      key: 'cod',
      header: 'COD Orders',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums">
          {row.codRevenue > 0 ? formatINR(row.codRevenue) : '—'}
        </span>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      render: (row) => (
        <span className="font-semibold text-ink tabular-nums">
          {formatINR(row.revenue)}
        </span>
      ),
    },
  ]

  const footer = (
    <tr className="border-t border-line bg-page/70">
      <td className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-deep">
        Total
      </td>
      <td className="px-3 py-2.5 text-right text-sm font-bold text-ink tabular-nums">
        {formatNumber(totals.orders)}
      </td>
      <td className="px-3 py-2.5 text-right text-sm font-bold text-ink tabular-nums">
        {formatINR(totals.prepaid)}
      </td>
      <td className="px-3 py-2.5 text-right text-sm font-bold text-ink tabular-nums">
        {formatINR(totals.cod)}
      </td>
      <td className="px-3 py-2.5 text-right text-sm font-bold text-deep tabular-nums">
        {formatINR(totals.revenue)}
      </td>
    </tr>
  )

  return (
    <Table
      columns={columns}
      rows={platforms}
      rowKey={(row) => row.platform}
      footer={footer}
      dense
    />
  )
}
