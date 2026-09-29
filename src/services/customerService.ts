import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'
import type { OrderDto } from './orderService'

// ─── request helper (mirrors orderService.ts) ─────────────────────────────

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function customersPath(outletId: string, suffix = ''): string {
  return `/api/v1/customers/${outletId}${suffix}`
}

function jsonRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH',
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    token: authToken(),
  })
}

// ─── DTOs (mirror customers.serializers read output; amounts are strings) ─

export interface CustomerDto {
  id: string
  name: string
  phone: string
  gstin: string
  email: string
  address: string
  created_at: string
  updated_at: string
}

export interface CustomerWritePayload {
  name?: string
  phone?: string
  gstin?: string
  email?: string
  address?: string
}

export interface DueBillDto {
  order: string
  order_no: string
  bill_no: string
  created_at: string
  status: string
  total: string
  paid: string
  remaining: string
}

export interface DuePaymentDto {
  id: string
  order: string | null
  amount: string
  method: string
  note: string
  created_by: string
  created_at: string
}

export interface CustomerDuesDto {
  bills: DueBillDto[]
  outstanding: string
}

export interface CustomerHistoryDto {
  customer: CustomerDto
  bills: DueBillDto[]
  payments: DuePaymentDto[]
  total_billed: string
  total_collected: string
  outstanding: string
}

export interface DueCollectPayload {
  amount: number
  method?: string
  order?: string
  note?: string
  reason?: string
}

// ─── API ─────────────────────────────────────────────────────────────────

export function listCustomersApi(outletId: string, search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return jsonRequest<CustomerDto[]>(`${customersPath(outletId)}/customers/${qs}`, 'GET')
}

export interface DueClientDto {
  id: string
  name: string
  phone: string
  bills: DueBillDto[]
  payments: DuePaymentDto[]
  total_billed: string
  total_collected: string
  outstanding: string
}

export function listDueClientsApi(outletId: string, search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return jsonRequest<DueClientDto[]>(`${customersPath(outletId)}/dues/${qs}`, 'GET')
}

export function findOrCreateCustomerApi(outletId: string, body: CustomerWritePayload) {
  return jsonRequest<CustomerDto>(
    `${customersPath(outletId)}/customers/`,
    'POST',
    body,
  )
}

export function updateCustomerApi(
  outletId: string,
  customerId: string,
  body: CustomerWritePayload,
) {
  return jsonRequest<CustomerDto>(
    `${customersPath(outletId)}/customers/${customerId}/`,
    'PATCH',
    body,
  )
}

export function customerHistoryApi(outletId: string, customerId: string) {
  return jsonRequest<CustomerHistoryDto>(
    `${customersPath(outletId)}/customers/${customerId}/history/`,
    'GET',
  )
}

export function customerDuesApi(outletId: string, customerId: string) {
  return jsonRequest<CustomerDuesDto>(
    `${customersPath(outletId)}/customers/${customerId}/dues/`,
    'GET',
  )
}

export function collectDuePaymentApi(
  outletId: string,
  customerId: string,
  body: DueCollectPayload,
) {
  return jsonRequest<DuePaymentDto>(
    `${customersPath(outletId)}/customers/${customerId}/dues/collect/`,
    'POST',
    body,
  )
}

// ─── mappers (mirror the DueClient mock shape for the dues screen) ─────────

export interface DueScreenClient {
  id: string
  name: string
  phone: string
  outstanding: string
  bills: DueBillDto[]
  payments: DuePaymentDto[]
}

export function toDueScreenClient(
  customer: CustomerDto,
  history: CustomerHistoryDto,
): DueScreenClient {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    outstanding: history.outstanding,
    bills: history.bills,
    payments: history.payments,
  }
}

export interface OrderCustomerRef {
  customer: string | null
}

export function dueOrderLink(order: OrderDto): OrderCustomerRef {
  return { customer: order.customer ?? null }
}

// ─── mapper for the due-payment screens (mirrors the DueClient mock shape) ─

import type {
  DueBillStatus,
  DueBill as DueBillMock,
  DueClient as DueClientMock,
  DuePayment as DuePaymentMock,
  DueSale as DueSaleMock,
  DueSaleStatus,
  DuePaymentMode,
} from '../mocks/duePaymentsData'

function toDateParts(iso: string): { date: string; dateMs: number } {
  const parsed = new Date(iso)
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

export function toDueClient(dto: DueClientDto): DueClientMock {
  const bills: DueBillMock[] = dto.bills.map((bill) => ({
    id: `${bill.order}-bill`,
    billNo: bill.bill_no,
    ...toDateParts(bill.created_at),
    total: Number(bill.total),
    paid: Number(bill.paid),
  }))
  const payments: DuePaymentMock[] = dto.payments.map((payment) => ({
    id: payment.id,
    ...toDateParts(payment.created_at),
    method: (payment.method || 'Other') as DuePaymentMode,
    amount: Number(payment.amount),
  }))
  const sales: DueSaleMock[] = dto.bills.map((bill) => {
    const pending = Math.max(0, Number(bill.total) - Number(bill.paid))
    const status: DueSaleStatus = pending <= 0 ? 'Settled' : 'Credit'
    return {
      id: `${bill.order}-sale`,
      billNo: bill.bill_no,
      ...toDateParts(bill.created_at),
      total: Number(bill.total),
      status,
      pending,
    }
  })
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone,
    outlet: '',
    bills,
    sales,
    payments,
  }
}

export function dueClientStatus(bill: DueBillMock): DueBillStatus {
  const pending = Math.max(0, bill.total - bill.paid)
  if (pending <= 0) return 'Paid'
  if (bill.paid > 0) return 'Partial'
  return 'Unpaid'
}