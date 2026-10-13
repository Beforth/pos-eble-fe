import { type CSSProperties } from 'react'
import { Printer, X } from 'lucide-react'
import { brand } from '../../theme/brand'
import type { TaxBreakdownLine } from '../../utils/taxEngine'

export interface ReceiptItem {
  name: string
  note?: string
  qty?: number
  rate?: number
}

export interface ReceiptShop {
  name?: string
  tagline?: string
  address?: string
  phone?: string
  gstin?: string
  fssai?: string
  billLabel?: string
  instagram?: string
}

export interface ReceiptMeta {
  billNo?: string
  token?: string
  date?: string
  time?: string
  orderType?: string
  cashier?: string
}

export interface ReceiptCharges {
  /** Legacy percentage shortcut — used only when no breakdown is supplied. */
  cgstPct?: number
  sgstPct?: number
  /**
   * Per-tax amounts ({ label, amount, mode, rate }). Preferred over the
   * percentage shortcut so the bill prints the real category amounts instead of
   * an assumed 2.5/2.5 split.
   */
  taxBreakdown?: TaxBreakdownLine[]
  roundOff?: number
  discount?: number
  deliveryCharge?: number
  containerCharge?: number
  customerPaid?: number
  tip?: number
  showDeliveryExtras?: boolean
  /** Hide the backward (tax-inclusive) rows from the printed breakdown. */
  printBackwardTax?: boolean
  /**
   * Show item rates excluding backward tax, with the tax surfaced as a separate
   * "included in prices" line so the bill still foots.
   */
  backwardTaxInItemPrice?: boolean
}

interface BillReceiptProps {
  shop?: ReceiptShop
  meta?: ReceiptMeta
  items?: ReceiptItem[]
  charges?: ReceiptCharges
  paymentMode?: string
  footerThanks?: string
  onClose?: () => void
}

const shopDefaults: ReceiptShop = {
  name: brand.shopName,
  tagline: `${brand.tagline} · Since ${brand.established}`,
  address: brand.address,
  phone: '98XXXXXXXX',
  gstin: '27XXXXXXXXXXZ5',
  fssai: '1234XXXXXXXXXX',
  billLabel: 'TAX INVOICE',
  instagram: '@rajubhai_dabeliwale',
}

function num(value: number | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

const printCss = `
  @media print {
    @page { size: 80mm auto; margin: 0; }
    html, body { width: 80mm; margin: 0; padding: 0; }
    body * { visibility: hidden; }
    #bill-receipt, #bill-receipt * { visibility: visible; }
    #bill-receipt {
      position: absolute;
      top: 0;
      left: 0;
      width: 72mm;
      margin: 0 4mm;
    }
    .no-print { display: none !important; }
  }
`

export function BillReceipt({
  shop,
  meta,
  items,
  charges,
  paymentMode = 'UPI',
  footerThanks = 'Thank you, visit again!',
  onClose,
}: BillReceiptProps) {
  const s = { ...shopDefaults, ...shop }
  const m = meta ?? {}
  const c = { cgstPct: 0, sgstPct: 0, roundOff: 0, ...charges }

  const itemCount = (items ?? []).reduce((sum, it) => sum + num(it.qty), 0)
  const rawSubTotal = (items ?? []).reduce(
    (sum, it) => sum + num(it.qty) * num(it.rate),
    0,
  )
  // Only the forward slice is added to the bill — backward tax is already
  // inside the line rates, so adding it here would double-charge the customer.
  const fullBreakdown = c.taxBreakdown ?? []
  const legacyCgst = fullBreakdown.length === 0 ? rawSubTotal * (num(c.cgstPct) / 100) : 0
  const legacySgst = fullBreakdown.length === 0 ? rawSubTotal * (num(c.sgstPct) / 100) : 0
  const backwardTotal = fullBreakdown
    .filter((row) => row.mode === 'backward')
    .reduce((sum, row) => sum + num(row.amount), 0)
  const printBackwardTax = c.printBackwardTax !== false
  const backwardTaxInItemPrice = c.backwardTaxInItemPrice !== false
  // When item prices are shown ex-tax, strip the backward slice from every rate
  // and from the subtotal, then surface it as its own line so the bill foots.
  const exTaxFactor =
    !backwardTaxInItemPrice && rawSubTotal > 0
      ? Math.max(0, (rawSubTotal - backwardTotal) / rawSubTotal)
      : 1
  const subTotal = round2(rawSubTotal * exTaxFactor)
  const shownItems = backwardTaxInItemPrice
    ? (items ?? [])
    : (items ?? []).map((it) => ({ ...it, rate: num(it.rate) * exTaxFactor }))
  const shownBreakdown = printBackwardTax
    ? fullBreakdown
    : fullBreakdown.filter((row) => row.mode !== 'backward')
  const addedTax =
    shownBreakdown.reduce(
      (sum, row) => sum + (row.mode === 'forward' ? num(row.amount) : 0),
      legacyCgst + legacySgst,
    ) || 0
  const deliveryCharge = num(c.deliveryCharge)
  const containerCharge = num(c.containerCharge)
  const tipAmount = num(c.tip)
  const customerPaidAmount = num(c.customerPaid)
  const discountAmount = num(c.discount)
  const showDeliveryExtras = Boolean(c.showDeliveryExtras)
  const grandTotal =
    rawSubTotal -
    discountAmount +
    addedTax +
    num(c.roundOff) +
    deliveryCharge +
    containerCharge

  return (
    <div style={outerStyle}>
      <style>{printCss}</style>

      <button
        type="button"
        onClick={onClose}
        className="no-print"
        style={closeButtonStyle}
        aria-label="Close bill preview"
        data-tooltip="Close bill preview"
      >
        <X size={16} />
      </button>

      <div id="bill-receipt" style={receiptStyle}>
        <div style={headerStyle}>
          <div style={shopNameStyle}>{s.name}</div>
          <div style={taglineStyle}>{s.tagline}</div>
          <div style={smallStyle}>{s.address}</div>
          <div style={smallStyle}>
            Ph: {s.phone} &nbsp;|&nbsp; GSTIN: {s.gstin}
          </div>
          <div style={billTypeStyle}>{s.billLabel}</div>
        </div>

        <div style={solidDividerStyle} />

        <div style={rowStyle}>
          <span>
            Bill No: <strong style={boldStyle}>#{m.billNo}</strong>
          </span>
          <span>Token: {m.token}</span>
        </div>
        <div style={rowStyle}>
          <span>Date: {m.date}</span>
          <span>Time: {m.time}</span>
        </div>
        <div style={rowStyle}>
          <span>Order: {m.orderType}</span>
          <span>Cashier: {m.cashier}</span>
        </div>

        <div style={dashedDividerStyle} />

        <table style={itemTableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left', width: '50%' }}>
                Item
              </th>
              <th style={{ ...thStyle, textAlign: 'center', width: '14%' }}>
                Qty
              </th>
              <th style={{ ...thStyle, textAlign: 'right', width: '18%' }}>
                Rate
              </th>
              <th style={{ ...thStyle, textAlign: 'right', width: '18%' }}>
                Amt
              </th>
            </tr>
          </thead>
          <tbody>
            {shownItems.map((it, i) => (
              <tr key={`${it.name}-${i}`}>
                <td style={itemNameStyle}>
                  {it.name}
                  {it.note ? <span style={itemNoteStyle}>{it.note}</span> : null}
                </td>
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  {money(num(it.qty)).replace('.00', '')}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  {money(num(it.rate))}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  {money(num(it.qty) * num(it.rate))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={dashedDividerStyle} />

        <div>
          <div style={totalsRowStyle}>
            <span>Item Count</span>
            <span>{itemCount}</span>
          </div>
          <div style={totalsRowStyle}>
            <span>Sub Total</span>
            <span>{money(subTotal)}</span>
          </div>
          {discountAmount > 0 ? (
            <div style={totalsRowStyle}>
              <span>Discount</span>
              <span>-{money(discountAmount)}</span>
            </div>
          ) : null}
          {!backwardTaxInItemPrice && backwardTotal > 0 ? (
            <div style={{ ...totalsRowStyle, ...mutedStyle }}>
              <span>Backward tax (included in item prices)</span>
              <span>{money(backwardTotal)}</span>
            </div>
          ) : null}
          {shownBreakdown.length > 0
            ? shownBreakdown.map((row) => (
                <div
                  key={`${row.mode}:${row.label}`}
                  style={{ ...totalsRowStyle, ...mutedStyle }}
                >
                  <span>
                    {row.label}
                    {row.rate > 0 ? ` @${row.rate}%` : ''}
                    {row.mode === 'backward' ? ' (incl.)' : ''}
                  </span>
                  <span>{money(num(row.amount))}</span>
                </div>
              ))
            : num(c.cgstPct) > 0 || num(c.sgstPct) > 0
              ? [
                  { label: 'CGST', rate: num(c.cgstPct), amount: legacyCgst },
                  { label: 'SGST', rate: num(c.sgstPct), amount: legacySgst },
                ]
                  .filter((row) => row.rate > 0)
                  .map((row) => (
                    <div
                      key={row.label}
                      style={{ ...totalsRowStyle, ...mutedStyle }}
                    >
                      <span>
                        {row.label} @{row.rate}%
                      </span>
                      <span>{money(row.amount)}</span>
                    </div>
                  ))
              : null}
          {showDeliveryExtras ? (
            <>
              <div style={totalsRowStyle}>
                <span>Delivery Charge</span>
                <span>{money(deliveryCharge)}</span>
              </div>
              <div style={totalsRowStyle}>
                <span>Container Charge</span>
                <span>{money(containerCharge)}</span>
              </div>
            </>
          ) : null}
          <div style={totalsRowStyle}>
            <span>Round Off</span>
            <span>{money(num(c.roundOff))}</span>
          </div>
          <div style={grandTotalStyle}>
            <span>Grand Total</span>
            <span>Rs. {money(grandTotal)}</span>
          </div>
          {showDeliveryExtras ? (
            <>
              <div style={totalsRowStyle}>
                <span>Customer Paid</span>
                <span>{money(customerPaidAmount)}</span>
              </div>
              <div style={totalsRowStyle}>
                <span>Tip</span>
                <span>{money(tipAmount)}</span>
              </div>
            </>
          ) : null}
        </div>

        <div style={paymentModeStyle}>
          Paid via <span style={paymentTagStyle}>{paymentMode}</span>
        </div>

        <div style={scissorsStyle}>✂ - - - - - - - - - - - - - - - - - - - - - -</div>

        <div style={footerStyle}>
          <div style={thanksStyle}>{footerThanks}</div>
          <div style={smallStyle}>Follow us {s.instagram}</div>
          <div style={fssaiStyle}>FSSAI Lic. No: {s.fssai}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="no-print"
        style={printButtonStyle}
      >
        <Printer size={15} />
        Print Bill
      </button>
    </div>
  )
}

/* ---------- Styles ---------- */

const outerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 90,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  background: '#e5e5e5',
  overflowY: 'auto',
}

const closeButtonStyle: CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  padding: 6,
  fontSize: 14,
  fontWeight: 'bold',
  cursor: 'pointer',
  border: '1px solid #000',
  background: '#fff',
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const printButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 'bold',
  cursor: 'pointer',
  border: '1px solid #000',
  background: '#fff',
  borderRadius: 4,
}

const receiptStyle: CSSProperties = {
  width: '302px',
  background: '#fff',
  color: '#111',
  padding: '10px 12px',
  fontSize: 11.5,
  lineHeight: 1.45,
  fontFamily: "'Courier New', Consolas, monospace",
  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
}

const headerStyle: CSSProperties = {
  textAlign: 'center',
  marginBottom: 4,
}

const shopNameStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  margin: '0 0 1px 0',
}

const taglineStyle: CSSProperties = {
  fontSize: 10.5,
  letterSpacing: 0.5,
}

const smallStyle: CSSProperties = {
  fontSize: 10,
  color: '#555',
}

const billTypeStyle: CSSProperties = {
  display: 'inline-block',
  border: '1px solid #111',
  padding: '1px 8px',
  borderRadius: 2,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  marginTop: 4,
}

const solidDividerStyle: CSSProperties = {
  borderTop: '1.5px solid #111',
  margin: '6px 0',
}

const dashedDividerStyle: CSSProperties = {
  borderTop: '1px dashed #111',
  margin: '6px 0',
}

const rowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  fontSize: 10.5,
}

const boldStyle: CSSProperties = {
  fontWeight: 700,
}

const itemTableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 4,
}

const thStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  borderBottom: '1px dashed #111',
  padding: '0 0 3px 0',
}

const itemNameStyle: CSSProperties = {
  fontSize: 11,
  padding: '3px 0',
  verticalAlign: 'top',
}

const itemNoteStyle: CSSProperties = {
  display: 'block',
  fontSize: 9.5,
  color: '#555',
}

const cellStyle: CSSProperties = {
  fontSize: 11,
  padding: '3px 0',
  verticalAlign: 'top',
}

const totalsRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 11,
  padding: '1.5px 0',
}

const mutedStyle: CSSProperties = {
  color: '#555',
  fontSize: 10,
}

const grandTotalStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 14,
  fontWeight: 800,
  padding: '6px 0 2px 0',
  borderTop: '1.5px solid #111',
  borderBottom: '1.5px solid #111',
  marginTop: 4,
}

const paymentModeStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 10.5,
  textAlign: 'center',
}

const paymentTagStyle: CSSProperties = {
  border: '1px dashed #111',
  padding: '2px 10px',
  borderRadius: 2,
  fontWeight: 700,
}

const scissorsStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 11,
  color: '#999',
  margin: '10px 0 -2px 0',
  letterSpacing: 2,
}

const footerStyle: CSSProperties = {
  marginTop: 10,
  textAlign: 'center',
}

const thanksStyle: CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: 0.5,
}

const fssaiStyle: CSSProperties = {
  fontSize: 9,
  color: '#555',
  marginTop: 4,
}