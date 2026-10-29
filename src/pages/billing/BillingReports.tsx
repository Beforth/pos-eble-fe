import { Navigate, useParams } from 'react-router-dom'
import { DataReportPage } from '../../components/reports/DataReportPage'
import { BILLING_REPORTS, BILLING_REPORTS_PATH } from '../../config/billingReports'

const PAGE_SIZE = 25

/** `/billing/reports/:slug` - one page for every report in the billing Reports menu. */
export default function BillingReports() {
  const { slug: slugParam } = useParams()
  const report = BILLING_REPORTS.find((r) => r.slug === slugParam)
  if (!report) {
    return <Navigate to={`${BILLING_REPORTS_PATH}/${BILLING_REPORTS[0].slug}`} replace />
  }
  return (
    // Keyed by report: switching reports in the menu starts with a clean search and columns.
    <DataReportPage
      key={report.slug}
      title={report.label}
      tableTitle={report.label}
      slug={report.slug}
      fileName={report.slug}
      pageSize={PAGE_SIZE}
      backTo={null}
      columnsMenu
    />
  )
}
