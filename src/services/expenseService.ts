import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export type PaidFrom = 'cash' | 'bank' | 'due' | 'other' | 'upi' | 'card'

export interface ExpenseRow {
  reason: string
  amount: number | null
  explanation: string
  /** Encrypted user id, or null. */
  employee: string | null
  paid_from: PaidFrom
}

export interface ExpenseDay {
  date: string
  total: number
  count: number
}

export interface ExpenseChoices {
  reasons: string[]
  employees: Array<{ id: string; name: string }>
  paid_from: Array<{ value: PaidFrom; label: string }>
}

export interface ExpenseDayDetail extends ExpenseChoices {
  date: string
  total: number
  rows: ExpenseRow[]
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function path(outletId: string, suffix = ''): string {
  return `/api/v1/orders/${outletId}/expenses/${suffix}`
}

/** One row per day that has expenses, newest first. */
export function listExpenseDaysApi(outletId: string): Promise<ExpenseDay[]> {
  return apiRequest<ExpenseDay[]>(path(outletId), {
    method: 'GET',
    token: authToken(),
  })
}

/** A day's lines plus the choices the form needs. `date` is `YYYY-MM-DD`. */
export function getExpenseDayApi(
  outletId: string,
  date: string,
): Promise<ExpenseDayDetail> {
  return apiRequest<ExpenseDayDetail>(path(outletId, `${date}/`), {
    method: 'GET',
    token: authToken(),
  })
}

/** Replace the day's lines; rows without a reason and an amount are dropped. */
export function saveExpenseDayApi(
  outletId: string,
  date: string,
  rows: ExpenseRow[],
): Promise<ExpenseDayDetail> {
  return apiRequest<ExpenseDayDetail>(path(outletId, `${date}/`), {
    method: 'PUT',
    body: JSON.stringify({ rows }),
    token: authToken(),
  })
}

/** `2026-10-21` → `21-10-2026`. */
export function formatExpenseDate(date: string): string {
  const [y, m, d] = date.split('-')
  return y && m && d ? `${d}-${m}-${y}` : date
}
