import { useState } from 'react'
import { Search } from 'lucide-react'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { DateTimeField } from '../../components/common/DateTimeField'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const STATUS_OPTIONS = ['All', 'Success', 'Pending', 'Failed', 'Refunded']
const PROVIDER_OPTIONS = [
  'All',
  'Razorpay',
  'Paytm',
  'PhonePe',
  'PayU',
  'Card',
  'UPI',
]

const selectClass =
  'mt-1 block h-9 min-w-[140px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary'

export default function PaymentInformation() {
  const [fromDate, setFromDate] = useState(
    () => new Date(2026, 7, 12, 0, 0, 0),
  )
  const [toDate, setToDate] = useState(
    () => new Date(2026, 7, 12, 23, 59, 59),
  )
  const [status, setStatus] = useState('All')
  const [provider, setProvider] = useState('All')
  const [orderId, setOrderId] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    showToast('Search applied')
  }

  function handleShowAll() {
    setFromDate(new Date(2026, 7, 12, 0, 0, 0))
    setToDate(new Date(2026, 7, 12, 23, 59, 59))
    setStatus('All')
    setProvider('All')
    setOrderId('')
    showToast('Showing all records')
  }

  return (
    <ReportsPageShell
      title="Payment Information"
      activeItem="acct-payment-information"
      actions={
        <ExportExcelMenu
          onExportPage={() => showToast('Exporting current page…')}
          onExportAll={() => showToast('Exporting all records…')}
        />
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <DateTimeField
              label="From Date"
              value={fromDate}
              onChange={setFromDate}
              defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
            />
            <DateTimeField
              label="To Date"
              value={toDate}
              onChange={setToDate}
              defaultTime={{ hours: 23, minutes: 59, seconds: 59 }}
            />
            <label className="text-xs text-muted">
              Select Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={selectClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Select Provider
              <select
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                className={selectClass}
              >
                {PROVIDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[160px] flex-1 text-xs text-muted sm:max-w-[220px]">
              Order ID
              <input
                type="text"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder=""
                className="mt-1 block h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Show All
            </OutlineButton>
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page">
            <Search size={48} strokeWidth={1.25} className="text-muted/45" />
          </span>
          <p className="text-base font-semibold text-ink">No Results Found.</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t find a match for your search.
          </p>
        </div>
      </div>
    </ReportsPageShell>
  )
}
