import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'
import type { ExpenseDay } from './expenseService'

export type WithdrawalDay = ExpenseDay

export interface WithdrawalRow {
  reason: string
  amount: number | null
  explanation: string
}

export interface WithdrawalDayDetail {
  date: string
  total: number
  rows: WithdrawalRow[]
  reasons: string[]
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function path(outletId: string, suffix = ''): string {
  return `/api/v1/orders/${outletId}/withdrawals/${suffix}`
}

/** One row per day that has withdrawals, newest first. */
export function listWithdrawalDaysApi(outletId: string): Promise<WithdrawalDay[]> {
  return apiRequest<WithdrawalDay[]>(path(outletId), {
    method: 'GET',
    token: authToken(),
  })
}

/** A day's lines plus the reason choices. `date` is `YYYY-MM-DD`. */
export function getWithdrawalDayApi(
  outletId: string,
  date: string,
): Promise<WithdrawalDayDetail> {
  return apiRequest<WithdrawalDayDetail>(path(outletId, `${date}/`), {
    method: 'GET',
    token: authToken(),
  })
}

/** Replace the day's lines; rows without a reason and an amount are dropped. */
export function saveWithdrawalDayApi(
  outletId: string,
  date: string,
  rows: WithdrawalRow[],
): Promise<WithdrawalDayDetail> {
  return apiRequest<WithdrawalDayDetail>(path(outletId, `${date}/`), {
    method: 'PUT',
    body: JSON.stringify({ rows }),
    token: authToken(),
  })
}
