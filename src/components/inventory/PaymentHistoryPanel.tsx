import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../../services/apiClient'
import {
  addDocumentPaymentApi,
  getDocumentPaymentsApi,
  type InventoryDocumentPaymentSummary,
  type InventoryDocumentType,
} from '../../services/inventoryService'
import { showToast } from '../../utils/toast'

const PAYMENT_METHODS = ['Cash', 'Card', 'Cheque', 'Online', 'Other']

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function amount(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed.toFixed(3) : value
}

type PaymentHistoryPanelProps = {
  outletId: string
  documentType: InventoryDocumentType
  documentId: string
  canAdd: boolean
  terminology?: 'payment' | 'refund'
}

export function PaymentHistoryPanel({
  outletId,
  documentType,
  documentId,
  canAdd,
  terminology = 'payment',
}: PaymentHistoryPanelProps) {
  const isRefund = terminology === 'refund'
  const [summary, setSummary] =
    useState<InventoryDocumentPaymentSummary | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [method, setMethod] = useState('Cash')
  const [paidAt, setPaidAt] = useState(localDateTimeValue)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getDocumentPaymentsApi(
        outletId,
        documentType,
        documentId,
      )
      setSummary(data)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to load payment history',
      )
    } finally {
      setLoading(false)
    }
  }, [documentId, documentType, outletId])

  useEffect(() => {
    void load()
  }, [load])

  async function addPayment() {
    if (!canAdd || saving) return
    const numericAmount = Number(paymentAmount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Amount must be greater than zero.')
      return
    }
    if (!paidAt) {
      setError('Payment date and time are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const data = await addDocumentPaymentApi(
        outletId,
        documentType,
        documentId,
        {
          amount: paymentAmount,
          payment_method: method.toLowerCase(),
          paid_at: new Date(paidAt).toISOString(),
          note,
        },
      )
      setSummary(data)
      setPaymentAmount('')
      setNote('')
      setPaidAt(localDateTimeValue())
      showToast(isRefund ? 'Refund recorded' : 'Payment recorded')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : `Unable to record ${isRefund ? 'refund' : 'payment'}`
      setError(message)
      showToast(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-line bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-ink">
            {isRefund ? 'Refund History' : 'Payment History'}
          </h2>
          <p className="text-xs text-muted">
            New {isRefund ? 'refunds' : 'payments'} are recorded as an audit history.
          </p>
        </div>
        {summary ? (
          <span className="rounded-full bg-page px-3 py-1 text-xs font-semibold capitalize text-ink">
            {summary.payment_status === 'partial'
              ? `Partially ${isRefund ? 'refunded' : 'paid'}`
              : summary.payment_status === 'paid' && isRefund
                ? 'Refunded'
                : summary.payment_status}
          </span>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-muted">Loading payments…</p> : null}

      {summary ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              [isRefund ? 'Refunded' : 'Paid', summary.paid_total],
              ['Total', summary.grand_total],
              [isRefund ? 'Refund due' : 'Due', summary.due_amount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-line bg-page p-3">
                <p className="text-xs font-medium text-muted">{label}</p>
                <p className="mt-1 text-lg font-bold text-ink">{amount(value)}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 overflow-x-auto rounded-lg border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs text-muted">
                <tr>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">Date &amp; time</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {summary.payments.length ? (
                  summary.payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-3 py-2 font-semibold text-ink">
                        {amount(payment.amount)}
                      </td>
                      <td className="px-3 py-2 text-ink">
                        {payment.payment_method_label}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-ink">
                        {new Date(payment.paid_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-muted">
                        {payment.note || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-5 text-center text-muted">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {canAdd && Number(summary.due_amount) > 0 ? (
            <div className="grid gap-3 lg:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">
                  Amount
                </label>
                <input
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  inputMode="decimal"
                  placeholder={amount(summary.due_amount)}
                  className="h-9 w-full rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">
                  Method
                </label>
                <select
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                  className="h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                >
                  {PAYMENT_METHODS.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">
                  Date &amp; time
                </label>
                <input
                  type="datetime-local"
                  value={paidAt}
                  onChange={(event) => setPaidAt(event.target.value)}
                  className="h-9 w-full rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">
                  Note
                </label>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional note"
                  className="h-9 w-full rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void addPayment()}
                  className="h-9 w-full rounded-md bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Adding…' : isRefund ? 'Add Refund' : 'Add Payment'}
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {error ? <p className="mt-3 text-xs text-primary">{error}</p> : null}
    </section>
  )
}
