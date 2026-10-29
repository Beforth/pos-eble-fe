import { DataReportPage } from '../../components/reports/DataReportPage'
import { money, topRow } from '../../components/reports/reportStyles'

const SEARCH_KEYS = ['assignee']

export default function AssigneeWiseSummaryReport() {
  return (
    <DataReportPage
      title="Assignee Wise Summary"
      tableTitle="Collection by assignee"
      slug="assignee-wise"
      fileName="assignee-wise-summary"
      searchKeys={SEARCH_KEYS}
      searchPlaceholder="Search assignee"
      barKey="total"
      emptyText="There is no record available."
      tiles={({ rows, totals }) => {
        const top = topRow(rows, 'total')
        return [
          { label: 'Total collected', value: money(totals.total), primary: true },
          { label: 'Orders', value: Number(totals.orders) || 0 },
          { label: 'Assignees', value: rows.length },
          {
            label: 'Top assignee',
            value: top ? String(top.assignee) : '—',
            hint: top ? money(top.total) : undefined,
          },
        ]
      }}
    />
  )
}
