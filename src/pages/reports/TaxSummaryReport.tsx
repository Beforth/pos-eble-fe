import { DataReportPage } from '../../components/reports/DataReportPage'
import { money, topRow } from '../../components/reports/reportStyles'

const SEARCH_KEYS = ['tax']

export default function TaxSummaryReport() {
  return (
    <DataReportPage
      title="Tax Summary"
      tableTitle="Tax collected by type"
      slug="tax"
      fileName="tax-summary"
      searchKeys={SEARCH_KEYS}
      searchPlaceholder="Search tax"
      barKey="amount"
      emptyText="No tax was collected in this date range."
      tiles={({ rows, totals }) => {
        const top = topRow(rows, 'amount')
        return [
          { label: 'Total tax collected', value: money(totals.amount), primary: true },
          { label: 'Tax types', value: rows.length },
          {
            label: 'Highest tax',
            value: top ? String(top.tax) : '—',
            hint: top ? money(top.amount) : undefined,
          },
        ]
      }}
    />
  )
}
