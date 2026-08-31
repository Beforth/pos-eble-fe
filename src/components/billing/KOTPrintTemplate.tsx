import React from 'react'
import { X } from 'lucide-react'
import { type KotTicket } from '../../mocks/kotViewData'
import { brand } from '../../theme/brand'

interface KOTPrintTemplateProps {
  ticket: KotTicket
  onClose: () => void
}

function formatDateTime(d: Date): string {
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
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

export function KOTPrintTemplate({ ticket, onClose }: KOTPrintTemplateProps) {
  const handlePrint = () => window.print()

  const orderTypeLabel =
    ticket.orderType === 'dine-in'
      ? 'Dine-In'
      : ticket.orderType === 'delivery'
        ? 'Delivery'
        : ticket.orderType === 'pick-up'
          ? 'Pick-Up'
          : 'Other'

  const totalQty = ticket.items.reduce((sum, i) => sum + i.qty, 0)

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
          #kot-ticket, #kot-ticket * {
            visibility: visible;
          }
          #kot-ticket {
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

      <div id="kot-ticket" style={ticketStyle}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={shopNameStyle}>{brand.shopName}</div>
          <div style={kotLabelStyle}>KITCHEN ORDER TICKET</div>
        </div>

        <Divider />

        <div style={rowStyle}>
          <span>KOT No:</span>
          <span style={boldStyle}>#{ticket.kotNo}</span>
        </div>
        <div style={rowStyle}>
          <span>Order Type:</span>
          <span style={boldStyle}>{orderTypeLabel}</span>
        </div>
        {ticket.orderType === 'dine-in' && (
          <div style={rowStyle}>
            <span>Table:</span>
            <span style={boldStyle}>{ticket.tableNo}</span>
          </div>
        )}
        {ticket.persons > 0 && (
          <div style={rowStyle}>
            <span>Covers:</span>
            <span>{ticket.persons}</span>
          </div>
        )}
        <div style={rowStyle}>
          <span>Server:</span>
          <span>{ticket.biller}</span>
        </div>
        <div style={rowStyle}>
          <span>Date/Time:</span>
          <span>{formatDateTime(new Date(ticket.createdAt))}</span>
        </div>

        <Divider dashed />

        <table style={itemTableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left' }}>Item</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {ticket.items.map((item) => (
              <React.Fragment key={item.id}>
                <tr>
                  <td style={itemNameStyle}>{item.name}</td>
                  <td style={qtyStyle}>{item.qty}</td>
                </tr>
                {item.note ? (
                  <tr>
                    <td colSpan={2} style={noteStyle}>
                      * {item.note}
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <Divider dashed />

        {ticket.note ? (
          <div style={{ marginBottom: 6 }}>
            <div style={boldStyle}>Remarks:</div>
            <div>{ticket.note}</div>
          </div>
        ) : null}

        <Divider />

        <div style={{ textAlign: 'center', fontSize: 11 }}>
          Total Items: {totalQty}
        </div>
      </div>

      <button onClick={handlePrint} className="no-print" style={printButtonStyle}>
        Print KOT
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

const kotLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 'bold',
  letterSpacing: 1,
  marginTop: 2,
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 12,
}

const boldStyle: React.CSSProperties = {
  fontWeight: 'bold',
}

const itemTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const thStyle: React.CSSProperties = {
  fontSize: 12,
  borderBottom: '1px solid #000',
  paddingBottom: 4,
}

const itemNameStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 'bold',
  padding: '4px 0 0 0',
  verticalAlign: 'top',
}

const qtyStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 'bold',
  textAlign: 'center',
  padding: '4px 0 0 0',
  verticalAlign: 'top',
  width: 40,
}

const noteStyle: React.CSSProperties = {
  fontSize: 11,
  fontStyle: 'italic',
  paddingLeft: 8,
  paddingBottom: 2,
}
