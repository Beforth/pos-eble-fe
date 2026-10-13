import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}
import type {
  ChartPoint,
  ChartStatus,
  ItemRow,
  LeakageData,
  OrderTypeSummary,
  QuickHelpData,
  SalesStats,
} from '../types'

// ── DTOs (backend payload shapes — money arrives as decimal strings) ────────

export interface TotalSalesDto {
  totalSales: string
  totalOrders: number
  periodLabel: string
  onlineSubtotal: string
  payments: Array<{ label: string; value: string }>
}

export interface SalesChartDto {
  series: Array<{ label: string; dineIn: string; parcel: string; online: string }>
  status: { totalOrders: number; successful: number; complementary: number; cancelled: number }
}

export interface OrderTypeRowDto {
  key: string
  label: string
  revenue: string
  orders: number
  totalOrders: number
  avgTurnaroundMins: number
  details: {
    orderCount: number
    minimum: string
    average: string
    maximum: string
    discount: string
    taxes: string
    total: string
  }
}

export interface ItemPerformanceDto {
  top: Array<{ name: string; revenue: string; units: string }>
  low: Array<{ name: string; revenue: string; units: string }>
}

// ── helpers ──────────────────────────────────────────────────────────────────

function toNumber(value: string | number | undefined): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function dashboardPath(outletId: string, metric: string, from?: string, to?: string): string {
  let path = `/api/v1/dashboard/${outletId}/${metric}/`
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

// ── API functions ────────────────────────────────────────────────────────────

/** Total Sales card. */
export async function getDashboardTotalSalesApi(
  outletId: string,
  from?: string,
  to?: string,
): Promise<SalesStats> {
  const dto = await apiRequest<TotalSalesDto>(dashboardPath(outletId, 'total-sales', from, to), {
    method: 'GET',
    token: authToken(),
  })
  return {
    totalSales: toNumber(dto.totalSales),
    totalOrders: dto.totalOrders,
    periodLabel: dto.periodLabel,
    onlineSubtotal: toNumber(dto.onlineSubtotal),
    payments: dto.payments.map((p) => ({
      label: p.label as SalesStats['payments'][number]['label'],
      value: toNumber(p.value),
    })),
  }
}

/** Sales chart card (channel series per time bucket + status counts). */
export async function getDashboardSalesChartApi(
  outletId: string,
  from?: string,
  to?: string,
): Promise<{ series: ChartPoint[]; status: ChartStatus }> {
  const dto = await apiRequest<SalesChartDto>(dashboardPath(outletId, 'sales-chart', from, to), {
    method: 'GET',
    token: authToken(),
  })
  return {
    series: dto.series.map((point) => ({
      label: point.label,
      dineIn: toNumber(point.dineIn),
      parcel: toNumber(point.parcel),
      online: toNumber(point.online),
    })),
    status: dto.status,
  }
}

/** Order-type summary cards. */
export async function getDashboardOrderTypesApi(
  outletId: string,
  from?: string,
  to?: string,
): Promise<OrderTypeSummary[]> {
  const rows = await apiRequest<OrderTypeRowDto[]>(
    dashboardPath(outletId, 'order-types', from, to),
    { method: 'GET', token: authToken() },
  )
  return rows.map((row) => ({
    key: row.key as OrderTypeSummary['key'],
    label: row.label,
    revenue: toNumber(row.revenue),
    orders: row.orders,
    totalOrders: row.totalOrders,
    avgTurnaroundMins: row.avgTurnaroundMins,
    details: {
      orderCount: row.details.orderCount,
      minimum: toNumber(row.details.minimum),
      average: toNumber(row.details.average),
      maximum: toNumber(row.details.maximum),
      discount: toNumber(row.details.discount),
      taxes: toNumber(row.details.taxes),
      total: toNumber(row.details.total),
    },
  }))
}

/** Leakage panel. */
export async function getDashboardLeakageApi(
  outletId: string,
  from?: string,
  to?: string,
): Promise<LeakageData> {
  return apiRequest<LeakageData>(dashboardPath(outletId, 'leakage', from, to), {
    method: 'GET',
    token: authToken(),
  })
}

/** Item performance panel (top + low sellers). */
export async function getDashboardItemPerformanceApi(
  outletId: string,
  from?: string,
  to?: string,
): Promise<{ top: ItemRow[]; low: ItemRow[] }> {
  const dto = await apiRequest<ItemPerformanceDto>(
    dashboardPath(outletId, 'item-performance', from, to),
    { method: 'GET', token: authToken() },
  )
  const mapRow = (row: { name: string; revenue: string; units: string }): ItemRow => ({
    name: row.name,
    revenue: toNumber(row.revenue),
    units: toNumber(row.units),
  })
  return { top: dto.top.map(mapRow), low: dto.low.map(mapRow) }
}

/** Quick help panel (outlet contact / hours). */
export async function getDashboardQuickHelpApi(outletId: string): Promise<QuickHelpData> {
  return apiRequest<QuickHelpData>(dashboardPath(outletId, 'quick-help'), {
    method: 'GET',
    token: authToken(),
  })
}
