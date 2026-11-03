import { PaymentSummaryReportPage } from '../../components/inventory/PaymentSummaryReportPage'
import { getSupplierPaymentReportApi } from '../../services/inventoryService'

export default function SupplierPaymentReport() {
  return (
    <PaymentSummaryReportPage
      title="Supplier Payment Report"
      partyFilterLabel="From"
      partyColumn="Supplier"
      totalColumn="Total Purchase (₹)"
      fileName="supplier-payment"
      emptyTitle="Supplier Payment Report Record Not Found"
      load={getSupplierPaymentReportApi}
    />
  )
}
