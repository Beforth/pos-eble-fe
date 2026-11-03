import { PaymentSummaryReportPage } from '../../components/inventory/PaymentSummaryReportPage'
import { getTransferPaymentReportApi } from '../../services/inventoryService'

export default function TransferPaymentReport() {
  return (
    <PaymentSummaryReportPage
      title="Transfer Payment Report"
      partyFilterLabel="To"
      partyColumn="Location"
      totalColumn="Total Transferred (₹)"
      fileName="transfer-payment"
      emptyTitle="Transfer Payment Report Record Not Found"
      load={getTransferPaymentReportApi}
    />
  )
}
