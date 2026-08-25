import { brand } from '../theme/brand'

export type DueBillStatus = 'Unpaid' | 'Partial' | 'Paid'
export type DueSaleStatus = 'Credit' | 'Settled'
export type DuePaymentMode = 'Cash' | 'UPI' | 'Card' | 'Other'

export interface DueBill {
  id: string
  billNo: string
  date: string
  dateMs: number
  total: number
  paid: number
}

export interface DueSale {
  id: string
  billNo: string
  date: string
  dateMs: number
  total: number
  status: DueSaleStatus
  pending: number
}

export interface DuePayment {
  id: string
  date: string
  dateMs: number
  method: DuePaymentMode
  amount: number
}

export interface DueClient {
  id: string
  name: string
  phone: string
  outlet: string
  bills: DueBill[]
  sales: DueSale[]
  payments: DuePayment[]
}

const outlet = brand.outletName

function fromDate(parsed: Date): { date: string; dateMs: number } {
  const date = parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return { date, dateMs: parsed.getTime() }
}

function at(iso: string) {
  return fromDate(new Date(iso))
}

function money2(value: number) {
  return Number(value.toFixed(2))
}

export function billPending(bill: DueBill) {
  return money2(Math.max(0, bill.total - bill.paid))
}

export function billStatus(bill: DueBill): DueBillStatus {
  const pending = billPending(bill)
  if (pending <= 0) return 'Paid'
  if (bill.paid > 0) return 'Partial'
  return 'Unpaid'
}

export function clientDue(client: DueClient) {
  return money2(client.bills.reduce((sum, bill) => sum + billPending(bill), 0))
}

export function monthlyTaken(client: DueClient, month: number, year: number) {
  return money2(
    client.bills
      .filter((bill) => {
        const d = new Date(bill.dateMs)
        return d.getMonth() === month && d.getFullYear() === year
      })
      .reduce((sum, bill) => sum + bill.total, 0),
  )
}

export function monthlyPaid(client: DueClient, month: number, year: number) {
  return money2(
    client.payments
      .filter((payment) => {
        const d = new Date(payment.dateMs)
        return d.getMonth() === month && d.getFullYear() === year
      })
      .reduce((sum, payment) => sum + payment.amount, 0),
  )
}

const seedClients: DueClient[] = [
  {
    id: 'kaveri',
    name: 'Kaveri',
    phone: '13345567',
    outlet,
    bills: [
      {
        id: 'k-b1',
        billNo: 'RB-1-20260818-001',
        ...at('2026-08-18T07:47:21'),
        total: 3596.64,
        paid: 2000,
      },
      {
        id: 'k-b2',
        billNo: 'RB-1-20260722-014',
        ...at('2026-07-22T20:12:08'),
        total: 944,
        paid: 0,
      },
    ],
    sales: [
      {
        id: 'k-s1',
        billNo: 'RB-1-20260818-001',
        ...at('2026-08-18T07:47:21'),
        total: 3596.64,
        status: 'Credit',
        pending: 1596.64,
      },
      {
        id: 'k-s2',
        billNo: 'RB-1-20260722-014',
        ...at('2026-07-22T20:12:08'),
        total: 944,
        status: 'Credit',
        pending: 944,
      },
    ],
    payments: [
      {
        id: 'k-p1',
        ...at('2026-08-18T07:47:39'),
        method: 'Cash',
        amount: 2000,
      },
    ],
  },
  {
    id: 'harsh',
    name: 'Harsh Patel',
    phone: '9876501234',
    outlet,
    bills: [
      {
        id: 'h-b1',
        billNo: 'RB-1-20260811-008',
        ...at('2026-08-11T13:05:12'),
        total: 250,
        paid: 0,
      },
    ],
    sales: [
      {
        id: 'h-s1',
        billNo: 'RB-1-20260811-008',
        ...at('2026-08-11T13:05:12'),
        total: 250,
        status: 'Credit',
        pending: 250,
      },
    ],
    payments: [],
  },
  {
    id: 'ramesh',
    name: 'Ramesh Iyer',
    phone: '9123456780',
    outlet,
    bills: [
      {
        id: 'r-b1',
        billNo: 'RB-1-20260808-021',
        ...at('2026-08-08T12:40:04'),
        total: 180,
        paid: 0,
      },
    ],
    sales: [
      {
        id: 'r-s1',
        billNo: 'RB-1-20260808-021',
        ...at('2026-08-08T12:40:04'),
        total: 180,
        status: 'Credit',
        pending: 180,
      },
    ],
    payments: [],
  },
  {
    id: 'karan',
    name: 'Karan Joshi',
    phone: '9765432109',
    outlet,
    bills: [
      {
        id: 'kj-b1',
        billNo: 'RB-1-20260807-033',
        ...at('2026-08-07T20:11:40'),
        total: 620,
        paid: 200,
      },
    ],
    sales: [
      {
        id: 'kj-s1',
        billNo: 'RB-1-20260807-033',
        ...at('2026-08-07T20:11:40'),
        total: 620,
        status: 'Credit',
        pending: 420,
      },
    ],
    payments: [
      {
        id: 'kj-p1',
        ...at('2026-08-12T11:20:16'),
        method: 'UPI',
        amount: 200,
      },
    ],
  },
  {
    id: 'neha',
    name: 'Neha Mehta',
    phone: '9988776655',
    outlet,
    bills: [
      {
        id: 'n-b1',
        billNo: 'RB-1-20260809-017',
        ...at('2026-08-09T21:14:55'),
        total: 705,
        paid: 705,
      },
    ],
    sales: [
      {
        id: 'n-s1',
        billNo: 'RB-1-20260809-017',
        ...at('2026-08-09T21:14:55'),
        total: 705,
        status: 'Settled',
        pending: 0,
      },
    ],
    payments: [
      {
        id: 'n-p1',
        ...at('2026-08-10T10:02:11'),
        method: 'Card',
        amount: 705,
      },
    ],
  },
]

function cloneClients(source: DueClient[]): DueClient[] {
  return source.map((client) => ({
    ...client,
    bills: client.bills.map((bill) => ({ ...bill })),
    sales: client.sales.map((sale) => ({ ...sale })),
    payments: client.payments.map((payment) => ({ ...payment })),
  }))
}

let store = cloneClients(seedClients)

export function getDueClients() {
  return store
}

export function setDueClients(next: DueClient[]) {
  store = next
}

export function getDueClient(id: string) {
  return store.find((client) => client.id === id) ?? null
}

export function applyDuePayment(
  clientId: string,
  amount: number,
  method: DuePaymentMode,
): DueClient | null {
  const value = money2(amount)
  if (value <= 0) return null

  const index = store.findIndex((client) => client.id === clientId)
  if (index < 0) return null

  const current = store[index]
  const due = clientDue(current)
  if (value > due + 0.001) return null

  let remaining = value
  const now = fromDate(new Date())

  const bills = current.bills.map((bill) => {
    if (remaining <= 0) return bill
    const pending = billPending(bill)
    if (pending <= 0) return bill
    const take = money2(Math.min(pending, remaining))
    remaining = money2(remaining - take)
    return { ...bill, paid: money2(bill.paid + take) }
  })

  const sales: DueSale[] = current.sales.map((sale) => {
    const bill = bills.find((row) => row.billNo === sale.billNo)
    if (!bill) return sale
    const pending = billPending(bill)
    const status: DueSaleStatus = pending <= 0 ? 'Settled' : 'Credit'
    return {
      ...sale,
      pending,
      status,
    }
  })

  const next: DueClient = {
    ...current,
    bills,
    sales,
    payments: [
      {
        id: `pay-${Date.now()}`,
        ...now,
        method,
        amount: value,
      },
      ...current.payments,
    ],
  }

  store = store.map((client, i) => (i === index ? next : client))
  return next
}

export function removeDueClient(id: string) {
  store = store.filter((client) => client.id !== id)
}

export const MONTH_OPTIONS = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
]

export const YEAR_OPTIONS = [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
]

export const PAYMENT_MODE_OPTIONS: DuePaymentMode[] = [
  'Cash',
  'UPI',
  'Card',
  'Other',
]
