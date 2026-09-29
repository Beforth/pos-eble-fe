import React from 'react'
import { X } from 'lucide-react'
import type { DayEndClosureDetailDto } from '../../services/orderService'
import type { DayEndSummaryRow } from '../../mocks/dayEndSummaryData'
import { formatNumber } from '../../utils/format'
import { brand } from '../../theme/brand'

export interface BreakoutRow {
  label: string
  count: number
  amount: number
}

interface DayEndPrintTemplateProps {
  detail: DayEndClosureDetailDto
  row: DayEndSummaryRow
  payment: BreakoutRow[]
  orderType: BreakoutRow[]
  onClose: () => void
}

function formatClosedAt(value: string): string {
  const parsed = new Date(
    value.includes(' ') ? value.replace(' ', 'T') : value,
  )
  if (!Number.isFinite(parsed.getTime())) return value
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function fmtAmount(value: string | number): string {
  const num = Number(value ?? 0)
  return `₹ ${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function Divider({ dashed = false }: { dashed?: boolean }) {
  return (
    <div
      style={{
        borderTop: dashed ? '1px dashed #000' : '1px solid #000',
        margin: '6px 0',
      }}
    />
  )
}

function Row({
  label,
  value,
  valueStrong = false,
}: {
  label: string
  value: string
  valueStrong?: boolean
}) {
  return (
    <div style={rowStyle}>
      <span>{label}</span>
      <span style={valueStrong ? { ...boldStyle, whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  )
}

function SectionBlock({
  title,
  rows,
}: {
  title: string
  rows: BreakoutRow[]
}) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0)
  return (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{title}</div>
      <div
        style={{
          display: 'flex',
          fontWeight: 'bold',
          fontSize: 12,
          borderBottom: '1px solid #000',
          paddingBottom: 2,
        }}
      >
        <span style={{ flex: 1 }}>Mode</span>
        <span style={qtyStyle}>Count</span>
        <span style={{ flex: 1, textAlign: 'right' }}>Amount</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{ ...rowStyle, fontSize: 12 }}>
          <span style={{ flex: 1 }}>{r.label}</span>
          <span style={qtyStyle}>{r.count === 0 ? '—' : formatNumber(r.count)}</span>
          <span style={{ flex: 1, textAlign: 'right' }}>{fmtAmount(r.amount)}</span>
        </div>
      ))}
      <div style={{ ...rowStyle, fontWeight: 'bold' }}>
        <span style={{ flex: 1 }}>Total</span>
        <span style={qtyStyle}>{formatNumber(total)}</span>
        <span style={{ flex: 1, textAlign: 'right' }}>{fmtAmount(total)}</span>
      </div>
    </div>
  )
}

export function DayEndPrintTemplate({
  detail,
  row,
  payment,
  orderType,
  onClose,
}: DayEndPrintTemplateProps) {
  const handlePrint = () => window.print()
  const summary = detail.summary

  const orders = summary?.orders ?? row.orders
  const orderTotal = summary ? Number(summary.order_total ?? 0) : row.total

  return (
    <div style={outerWrapperStyle}>
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          html, body {
            width: 80mm;
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          #day-end-ticket, #day-end-ticket * {
            visibility: visible;
          }
          #day-end-ticket {
            position: absolute;
            top: 0;
            left: 0;
            width: 72mm;
            margin: 0 4mm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <button onClick={onClose} className="no-print" style={closeButtonStyle}>
        <X size={16} />
      </button>

      <div id="day-end-ticket" style={ticketStyle}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={shopNameStyle}>{brand.shopName}</div>
          <div style={receiptLabelStyle}>DAY END SUMMARY</div>
          <div style={{ fontSize: 11 }}>{row.createdDate}</div>
        </div>

        <Divider />

        <Row label="Closed At:" value={formatClosedAt(detail.closed_at)} />
        <Row label="Closed By:" value={detail.closed_by || '—'} />

        <Divider dashed />

        <Row label="No. Of Orders" value={formatNumber(orders)} valueStrong />
        <Row label="Order Total" value={fmtAmount(orderTotal)} valueStrong />

        {summary ? (
          <>
            <Row
              label="Settled Total"
              value={fmtAmount(Number(summary.settled_total ?? 0))}
            />
            <Row
              label={`Due (${summary.due.count})`}
              value={fmtAmount(Number(summary.due.total ?? 0))}
            />
            <Row label="My Amount" value={fmtAmount(Number(summary.my_amount ?? 0))} />
            <Row label="Tax" value={fmtAmount(Number(summary.tax ?? 0))} />
            <Row label="Discount" value={fmtAmount(Number(summary.discount ?? 0))} />

            <Divider dashed />

            <Row
              label="KOTs"
              value={`${summary.kots.count} (${summary.kots.cancelled} cancelled)`}
            />
            <Row
              label="Status"
              value={`Saved ${summary.status.saved} · Printed ${summary.status.printed} · Paid ${summary.status.paid} · Cancelled ${summary.status.cancelled}`}
            />

            <Divider dashed />

            <SectionBlock title="PAYMENT MODE" rows={payment} />

            <Divider dashed />

            <SectionBlock title="ORDER TYPE" rows={orderType} />
          </>
        ) : null}

        <Divider />

        <div style={{ textAlign: 'center', fontSize: 11 }}>
          — End of Day —
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="no-print"
        style={printButtonStyle}
      >
        Print Day End
      </button>
    </div>
  )
}

/* ---------- Styles ---------- */

const outerWrapperStyle: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
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

const closeButtonStyle: React.CSSProperties = {
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

const printButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 14,
  fontWeight: 'bold',
  cursor: 'pointer',
  border: '1px solid #000',
  background: '#fff',
  borderRadius: 4,
}

const ticketStyle: React.CSSProperties = {
  width: '302px',
  background: '#fff',
  color: '#000',
  padding: '10px 12px',
  fontSize: 12,
  lineHeight: 1.4,
  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
}

const shopNameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 'bold',
  textTransform: 'uppercase',
}

const receiptLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 'bold',
  letterSpacing: 1,
  marginTop: 2,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 6,
  fontSize: 12,
}

const boldStyle: React.CSSProperties = {
  fontWeight: 'bold',
}

const qtyStyle: React.CSSProperties = {
  width: 70,
  textAlign: 'center',
}