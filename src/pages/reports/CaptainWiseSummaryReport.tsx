import { DataReportPage } from '../../components/reports/DataReportPage'
import { money, topRow } from '../../components/reports/reportStyles'

const SEARCH_KEYS = ['captain']

export default function CaptainWiseSummaryReport() {
  return (
    <DataReportPage
      title="Captain Wise Summary"
      tableTitle="Sales by captain"
      slug="captain-wise"
      fileName="captain-wise-summary"
      searchKeys={SEARCH_KEYS}
      searchPlaceholder="Search captain"
      barKey="total"
      emptyText="There is no record available."
      tiles={({ rows, totals }) => {
        const top = topRow(rows, 'total')
        return [
          { label: 'Total sales', value: money(totals.total), primary: true },
          { label: 'Orders', value: Number(totals.orders) || 0, hint: `${rows.length} captains` },
          { label: 'Net amount', value: money(totals.net), hint: `Tax ${money(totals.tax)}` },
          {
            label: 'Top captain',
            value: top ? String(top.captain) : '—',
            hint: top ? money(top.total) : undefined,
          },
        ]
      }}
    />
  )
}
