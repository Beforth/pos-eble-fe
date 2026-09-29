import type { CartLine, CustomerDetails, OrderType, PaymentMethod } from '../components/billing/BillPanel'
import type { DraftBillDto, DraftBillPayload } from '../services/orderService'

export interface DraftBill {
  id: string
  createdAt: number
  updatedAt: number
  tableId: string
  tableNo: string
  guests: number
  orderType: OrderType
  payment: PaymentMethod
  lines: CartLine[]
  orderNote: string
  customer: CustomerDetails
}

interface DraftPayloadSource {
  tableId: string
  tableNo: string
  guests: number
  orderType: OrderType
  payment: PaymentMethod
  lines: CartLine[]
  orderNote: string
  customer: CustomerDetails
}

function toTimestamp(value: string): number {
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? Date.now() : ms
}

export function toDraftBill(dto: DraftBillDto): DraftBill {
  const raw = (dto.customer ?? {}) as Partial<CustomerDetails>
  return {
    id: dto.id,
    createdAt: toTimestamp(dto.created_at),
    updatedAt: toTimestamp(dto.updated_at),
    tableId: dto.table_id ?? '',
    tableNo: dto.table_no ?? '',
    guests: dto.guests ?? 0,
    orderType: dto.order_type,
    payment: 'cash',
    lines: Array.isArray(dto.lines) ? (dto.lines as CartLine[]) : [],
    orderNote: dto.order_note ?? '',
    customer: {
      mobile: typeof raw.mobile === 'string' ? raw.mobile : '',
      name: typeof raw.name === 'string' ? raw.name : '',
      address: typeof raw.address === 'string' ? raw.address : '',
      locality: typeof raw.locality === 'string' ? raw.locality : '',
      gstNo: typeof raw.gstNo === 'string' ? raw.gstNo : '',
    },
  }
}

export function toDraftBillPayload(source: DraftPayloadSource): DraftBillPayload {
  return {
    table_id: source.tableId,
    table_no: source.tableNo,
    guests: source.guests,
    order_type: source.orderType === 'other' ? 'pick-up' : source.orderType,
    lines: source.lines as unknown[],
    order_note: source.orderNote,
    customer: { ...source.customer } as Record<string, unknown>,
  }
}

export function draftItemCount(draft: DraftBill): number {
  return draft.lines.reduce((sum, line) => sum + line.qty, 0)
}

export function draftAmount(draft: DraftBill): number {
  return draft.lines.reduce((sum, line) => sum + line.price * line.qty, 0)
}