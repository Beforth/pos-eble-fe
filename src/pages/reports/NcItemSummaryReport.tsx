import { DataReportPage } from '../../components/reports/DataReportPage'
import { money } from '../../components/reports/reportStyles'

const SEARCH_KEYS = ['item', 'bill_no']

export default function NcItemSummaryReport() {
  return (
    <DataReportPage
      title="NC Item Summary"
      tableTitle="Items billed at a changed price"
      slug="nc-item-summary"
      fileName="nc-item-summary"
      searchKeys={SEARCH_KEYS}
      searchPlaceholder="Search item or bill no"
      emptyText="No item was billed at a changed price in this date range."
      tiles={({ rows, totals }) => {
        const biggest = rows.reduce<(typeof rows)[number] | null>(
          (best, row) =>
            !best || Math.abs(Number(row.difference) || 0) > Math.abs(Number(best.difference) || 0)
              ? row
              : best,
          null,
        )
        return [
          {
            label: 'Total difference',
            value: money(totals.difference ?? rows.reduce((sum, row) => sum + (Number(row.difference) || 0), 0)),
            primary: true,
          },
          { label: 'Price changes', value: rows.length },
          {
            label: 'Quantity',
            value: Number(totals.qty) || rows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0),
          },
          {
            label: 'Biggest change',
            value: biggest ? String(biggest.item) : '—',
            hint: biggest ? `${money(biggest.difference)} · bill ${String(biggest.bill_no)}` : undefined,
          },
        ]
      }}
    />
  )
}
