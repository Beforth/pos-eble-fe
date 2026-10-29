import { DataReportPage } from '../../components/reports/DataReportPage'
import { money } from '../../components/reports/reportStyles'

const SEARCH_KEYS = ['counter', 'user']

export default function SettlementSummaryReport() {
  return (
    <DataReportPage
      title="Settlement Summary"
      tableTitle="Orders settled by counter and billing user"
      slug="settlement-summary"
      fileName="settlement-summary"
      searchKeys={SEARCH_KEYS}
      searchPlaceholder="Search counter or user"
      barKey="total"
      columnsMenu
      tiles={({ rows, totals }) => [
        { label: 'Total settled', value: money(totals.total), primary: true },
        { label: 'Orders settled', value: Number(totals.orders) || 0 },
        { label: 'Billing users', value: new Set(rows.map((row) => String(row.user))).size },
        { label: 'Counters', value: new Set(rows.map((row) => String(row.counter))).size },
      ]}
    />
  )
}
