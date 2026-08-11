import { X, Printer, Mail } from 'lucide-react'

export interface DummyBillItem {
  name: string
  qty: number
  price: number
  kotNo?: number
}

export interface DummyBillData {
  billNo: string
  mode: 'print' | 'ebill'
  tableNo: string
  customerName: string
  customerPhone: string
  paymentLabel: string
  createdAt: number
  items: DummyBillItem[]
  kotCount: number
  subtotal: number
  tax: number
  total: number
}

interface DummyBillModalProps {
  open: boolean
  bill: DummyBillData | null
  onClose: () => void
}

function formatMoney(n: number) {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DummyBillModal({ open, bill, onClose }: DummyBillModalProps) {
  if (!open || !bill) return null

  const isEbill = bill.mode === 'ebill'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close bill"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Generated bill"
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            {isEbill ? (
              <Mail size={16} className="text-primary" />
            ) : (
              <Printer size={16} className="text-primary" />
            )}
            <h2 className="text-sm font-bold text-ink">
              {isEbill ? 'eBill (Dummy)' : 'Print Bill (Dummy)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#fafafa] px-4 py-4">
          {/* Receipt paper */}
          <div className="mx-auto w-full max-w-[320px] border border-dashed border-line bg-white px-4 py-5 font-mono text-[12px] text-ink shadow-sm">
            <div className="border-b border-dashed border-line pb-3 text-center">
              <p className="text-base font-bold tracking-wide">POS EBILE</p>
              <p className="mt-0.5 text-[10px] text-muted">
                Demo Restaurant · Dummy Bill Format
              </p>
              <p className="mt-0.5 text-[10px] text-muted">
                GSTIN: 22AAAAA0000A1Z5
              </p>
            </div>

            <div className="space-y-0.5 border-b border-dashed border-line py-3 text-[11px]">
              <div className="flex justify-between gap-2">
                <span>Bill No</span>
                <span className="font-semibold">{bill.billNo}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Date</span>
                <span>{formatDateTime(bill.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Table</span>
                <span>{bill.tableNo}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>KOTs</span>
                <span>{bill.kotCount}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Payment</span>
                <span className="uppercase">{bill.paymentLabel}</span>
              </div>
              <div className="flex justify-between gap-2 pt-1">
                <span>Customer</span>
                <span className="max-w-[160px] truncate text-right font-semibold">
                  {bill.customerName}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Phone</span>
                <span className="font-semibold">{bill.customerPhone}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-line py-2">
              <div className="mb-1 grid grid-cols-[1fr_32px_56px_56px] gap-1 text-[10px] font-semibold uppercase text-muted">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amt</span>
              </div>
              <ul className="space-y-1.5">
                {bill.items.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    <div className="grid grid-cols-[1fr_32px_56px_56px] gap-1">
                      <span className="min-w-0 truncate">{item.name}</span>
                      <span className="text-right">{item.qty}</span>
                      <span className="text-right">{formatMoney(item.price)}</span>
                      <span className="text-right font-semibold">
                        {formatMoney(item.price * item.qty)}
                      </span>
                    </div>
                    {item.kotNo != null ? (
                      <p className="text-[10px] text-muted">KOT {item.kotNo}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1 py-3 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{formatMoney(bill.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>₹{formatMoney(bill.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-line pt-2 text-sm font-bold">
                <span>TOTAL</span>
                <span>₹{formatMoney(bill.total)}</span>
              </div>
            </div>

            <p className="border-t border-dashed border-line pt-3 text-center text-[10px] text-muted">
              {isEbill
                ? `Dummy eBill sent to ${bill.customerPhone}`
                : 'Dummy print preview — final format coming soon'}
            </p>
            <p className="mt-1 text-center text-[10px] text-muted">
              Thank you! Visit again.
            </p>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
