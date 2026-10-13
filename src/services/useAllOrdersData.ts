import { useEffect, useState } from 'react'

import { showToast } from '../utils/toast'
import { formatDayMonth } from '../utils/format'
import type { AllOrderRow, OrdersChartPoint } from '../mocks/allOrdersData'
import {
  changePaymentApi,
  collectDueApi,
  dailySummaryApi,
  listOrdersApi,
  toAllOrderRow,
  type DailySummaryPoint,
  type OrderDto,
  type OrderEventData,
} from './orderService'
import { subscribeToRail } from './liveRailClient'

function toChartPoints(points: DailySummaryPoint[]): OrdersChartPoint[] {
  return points.map((point) => ({
    label: formatDayMonth(new Date(`${point.date}T00:00:00`)),
    value: Number(point.total ?? 0),
  }))
}

function emptyChart(days: number): OrdersChartPoint[] {
  return Array.from({ length: days }, (_, index) => ({
    label: formatDayMonth(
      new Date(new Date().getTime() - (days - 1 - index) * 86_400_000),
    ),
    value: 0,
  }))
}

function upsertOrder(prev: AllOrderRow[], row: AllOrderRow): AllOrderRow[] {
  const exists = prev.some((order) => order.id === row.id)
  if (!exists) return [row, ...prev]
  return prev.map((order) => (order.id === row.id ? row : order))
}

export function useAllOrdersData(
  encryptedOutletId: string | null,
  token: string | null,
  options?: { includeRevenue?: boolean },
) {
  // The revenue chart comes from `daily-summary`, a billing-gated endpoint. A
  // role that can read the board but not the money skips the call entirely, so
  // it never fires a request it would be refused.
  const includeRevenue = options?.includeRevenue ?? true
  const [orders, setOrders] = useState<AllOrderRow[]>([])
  const [chartSeries, setChartSeries] = useState<OrdersChartPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    const fetchAllPages = async (): Promise<OrderDto[]> => {
      const first = await listOrdersApi(encryptedOutletId, {
        page: 1,
        page_size: 100,
      })
      const all: OrderDto[] = [...first.results]
      const totalPages = Math.max(1, Math.ceil(first.count / 100))
      for (let page = 2; page <= totalPages; page += 1) {
        if (cancelled) return all
        const next = await listOrdersApi(encryptedOutletId, {
          page,
          page_size: 100,
        })
        all.push(...next.results)
      }
      return all
    }
    fetchAllPages()
      .then((dtos) => {
        if (cancelled) return
        setOrders(dtos.map(toAllOrderRow))
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load orders',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  useEffect(() => {
    if (!encryptedOutletId || !includeRevenue) return
    let cancelled = false
    dailySummaryApi(encryptedOutletId, { days: 15, resource: 'orders' })
      .then((result) => {
        if (cancelled) return
        setChartSeries(toChartPoints(result.results))
      })
      .catch(() => {
        if (!cancelled) setChartSeries(emptyChart(15))
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, includeRevenue])

  useEffect(() => {
    if (!encryptedOutletId || !token) return
    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event, data) => {
        if (event === 'order.created') {
          setOrders((prev) => [toAllOrderRow(data as OrderEventData), ...prev])
          return
        }
        if (
          event === 'order.settle' ||
          event === 'order.printed' ||
          event === 'order.modified'
        ) {
          const row = toAllOrderRow(data as OrderEventData)
          setOrders((prev) => upsertOrder(prev, row))
          return
        }
        if (event === 'order.cancelled') {
          const payload = data as OrderEventData
          setOrders((prev) =>
            prev.map((row) =>
              row.id === payload.id
                ? { ...row, status: 'Cancelled' as const }
                : row,
            ),
          )
        }
      },
    })
  }, [encryptedOutletId, token])

  const grandTotal = orders.reduce((sum, row) => sum + row.grandTotal, 0)

  async function saveChangePayment(
    orderId: string,
    payment: string,
    reason: string,
  ) {
    if (!encryptedOutletId) return
    try {
      const updated = await changePaymentApi(encryptedOutletId, orderId, {
        payment_type: payment,
        reason,
      })
      setOrders((prev) =>
        prev.map((row) => (row.id === orderId ? toAllOrderRow(updated) : row)),
      )
      showToast('Payment type updated')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update payment type',
      )
    }
  }

  async function saveDueCollect(
    orderId: string,
    payload: { amount: number; method: string; note: string },
  ) {
    if (!encryptedOutletId) return
    try {
      const updated = await collectDueApi(encryptedOutletId, orderId, payload)
      setOrders((prev) =>
        prev.map((row) => (row.id === orderId ? toAllOrderRow(updated) : row)),
      )
      showToast('Due amount collected')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to collect due amount',
      )
    }
  }

  return {
    orders,
    chartSeries,
    grandTotal,
    loading,
    saveChangePayment,
    saveDueCollect,
  }
}