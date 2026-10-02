import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'
import type { CurrentOrderRow, CurrentOrderItem } from '../mocks/currentOrdersData'
import type { KotRow } from '../mocks/kotData'
import type { AllOrderRow } from '../mocks/allOrdersData'
import type { DayEndSummaryRow } from '../mocks/dayEndSummaryData'
import type {
  KotTicket,
  KotViewItem,
  KotViewOrderType,
} from '../mocks/kotViewData'
import { formatDayMonth, formatINR } from '../utils/format'
import type { TaxBreakdownLine } from '../utils/taxEngine'

// ─── DTOs (mirror orders.serializers read output; amounts are strings) ────

export type OrderType = 'dine-in' | 'delivery' | 'pick-up'
export type OrderStatus = 'saved' | 'printed' | 'cancelled' | 'paid'

export interface OrderItemDto {
  name: string
  note: string
  qty: string
  unit_price: string
  total_price: string
}

export interface OrderDto {
  id: string
  order_no: string
  bill_no: string
  parent_order: string | null
  order_type: OrderType
  order_type_label: string
  customer_name: string
  customer_phone: string
  customer: string | null
  special_note: string
  payment_type: string
  my_amount: string
  tax: string
  discount: string
  grand_total: string
  received_amount: string
  balance_due: string
  status: OrderStatus
  source: string
  sub_order_type: string
  print_count: number
  settlement_by: string
  settlement_counter: string
  created_at: string
  settled_at: string | null
  items: OrderItemDto[]
  /** Linked kitchen tickets — present on create/PATCH responses (and order
   * events) so billing screens can stamp local KOT tickets from one request. */
  kots?: KotDto[]
}

export interface OrdersPage {
  results: OrderDto[]
  count: number
  page: number
  page_size: number
}

export interface KotsPage {
  results: KotDto[]
  count: number
  page: number
  page_size: number
}

export type LiveOrdersIcon =
  | 'dineIn'
  | 'pickup'
  | 'delivery'
  | 'prep'
  | 'waiting'
  | 'out'

export interface LiveOrderChannelRow {
  id: string
  label: string
  orders: number
  amount: number
  icon: LiveOrdersIcon
}

export interface LiveOrdersSummary {
  totalOrders: number
  totalAmount: number
  rows: LiveOrderChannelRow[]
}

export interface RunningTablesSummary {
  activeTables: number
  revenueEstimated: number
}

export interface LiveOrderChannelDto {
  id: string
  label: string
  orders: number
  amount: string
}

export interface LiveOrdersRunningDto {
  totalOrders: number
  totalAmount: string
  rows: LiveOrderChannelDto[]
}

export interface RunningTablesDto {
  activeTables: number
  revenueEstimated: string
}

export interface LiveOrdersDto {
  running: LiveOrdersRunningDto
  pending: LiveOrdersRunningDto
  tables: RunningTablesDto
}

export type KotOrderType = 'DINE IN' | 'PARCEL' | 'DELIVERY' | 'PICK UP' | 'OTHER'
export type KotRowStatus =
  | 'Pending'
  | 'Ready'
  | 'Printed'
  | 'Used In Bill'
  | 'Cancelled'
export type KotSource = 'billing' | 'captain'

export interface KotItemDto {
  name?: string
  item_name?: string
  qty?: number
  quantity?: number
  unit_price?: number
}

export interface KotDto {
  id: string
  kot_no: number
  order_type: KotOrderType
  source: KotSource
  table_id: string
  table_no: string
  guests: number
  customer_name: string
  customer_phone: string
  item_count: number
  items: KotItemDto[]
  status: KotRowStatus
  reason: string
  bill_print_date: string | null
  complete_duration: string
  created: string
  modified: boolean
}

// ─── live-rail payloads (events carry a subset of the read DTOs) ─────────

export type OrderEventData = Partial<OrderDto> &
  Pick<OrderDto, 'id' | 'order_no' | 'status'>
export type KotEventData = Partial<KotDto> &
  Pick<KotDto, 'id' | 'kot_no' | 'status'>

/** `day_end.close` WS payload / persisted closure row shape. */
export interface DayEndCloseData {
  outlet_id: string
  closed_by: string
  closed_at: string
  day: string
  orders: number
  order_total: string
}

export interface DayEndClosureListDto {
  id: string
  day: string
  closed_at: string
  closed_by: string
  orders: number
  total: string
  created_at: string
}

export interface DayEndClosureDetailDto extends DayEndClosureListDto {
  summary: DayEndSnapshot | null
}

/** Rich closed-day snapshot persisted with the closure row. */
export interface DayEndSnapshot {
  day: string
  orders: number
  order_total: string
  my_amount: string
  tax: string
  discount: string
  status: { saved: number; printed: number; paid: number; cancelled: number }
  settled_total: string
  order_types: Record<
    string,
    { count: number; total: string }
  >
  payment_types: Record<string, { count: number; total: string }>
  due: { count: number; total: string }
  kots: { count: number; cancelled: number }
}

export interface DailySummaryPoint {
  date: string
  count: number
  total: string
  cancelled: number
  resource: string
}

export interface DailySummaryResult {
  results: DailySummaryPoint[]
}

export type AdvanceOrderStatus =
  | 'booked'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface AdvanceOrderItemDto {
  name: string
  note: string
  qty: string
  unit_price: string
  total_price: string
}

export interface AdvanceOrderDto {
  id: string
  adv_order_no: string
  order_type: OrderType
  order_type_label: string
  customer_name: string
  customer_phone: string
  special_note: string
  payment_type: string
  advance_amount: string
  grand_total: string
  scheduled_date: string | null
  scheduled_time: string | null
  status: AdvanceOrderStatus
  source: string
  created_by: string
  created_at: string
  items: AdvanceOrderItemDto[]
}

// ─── write payloads ───────────────────────────────────────────────────────

export interface OrderItemPayload {
  name: string
  note?: string
  qty: number
  unit_price: number
  total_price: number
}

export interface CreateOrderPayload {
  order_type: OrderType
  order_type_label?: string
  customer_name?: string
  customer_phone?: string
  payment_type?: string
  my_amount?: number
  tax?: number
  tax_breakdown?: TaxBreakdownLine[]
  round_off?: number
  discount?: number
  grand_total?: number
  sub_order_type?: string
  source?: string
  items: OrderItemPayload[]
  /** KOT entries created together with the order (server-side KOT-on-order). */
  kots?: CreateKotPayload[]
}

export interface SettleOrderPayload {
  payment_type?: string
  my_amount?: number
  tax?: number
  tax_breakdown?: TaxBreakdownLine[]
  round_off?: number
  discount?: number
  grand_total?: number
  received_amount?: number
  settlement_by?: string
  settlement_counter?: string
}

export interface CreateKotPayload {
  order_type: KotOrderType
  source?: KotSource
  table_id?: string
  table_no?: string
  guests?: number
  customer_name?: string
  customer_phone?: string
  item_count?: number
  items: unknown[]
  status?: KotRowStatus
  complete_duration?: string
  /** Encrypted draft this KOT was sent from — the server marks it consumed. */
  draft_id?: string
}

export type UpdateOrderAction =
  | 'edit'
  | 'settle'
  | 'cancel'
  | 'reprint'
  | 'change_payment'
  | 'adopt_kots'

export interface UpdateOrderPayload {
  action?: UpdateOrderAction
  reason?: string
  customer_name?: string
  customer_phone?: string
  special_note?: string
  payment_type?: string
  order_type?: OrderType
  order_type_label?: string
  sub_order_type?: string
  my_amount?: number
  tax?: number
  tax_breakdown?: TaxBreakdownLine[]
  round_off?: number
  discount?: number
  grand_total?: number
  received_amount?: number
  settlement_by?: string
  settlement_counter?: string
  items?: OrderItemPayload[]
  /** KOT entries appended to the order by the edit action (server-side). */
  kots?: CreateKotPayload[]
  /** Encrypted KOT ids to re-parent onto this order (`adopt_kots`). */
  kot_ids?: string[]
}

export interface SplitPartPayload {
  order_type: OrderType
  order_type_label?: string
  customer_name?: string
  customer_phone?: string
  payment_type?: string
  items?: OrderItemPayload[]
}

export interface SplitOrderResult {
  parent: OrderDto
  children: OrderDto[]
}

export interface DraftBillDto {
  id: string
  client_key: string
  table_id: string
  table_no: string
  guests: number
  order_type: OrderType
  lines: unknown[]
  order_note: string
  customer: Record<string, unknown>
  /** Set once the draft's items were sent to the kitchen (hidden from lists). */
  consumed_at: string | null
  consumed_kot_no: number | null
  created_at: string
  updated_at: string
}

export interface DraftBillPayload {
  client_key?: string
  table_id?: string
  table_no?: string
  guests?: number
  order_type: OrderType
  lines?: unknown[]
  order_note?: string
  customer?: Record<string, unknown>
}

export interface UpdateKotPayload {
  customer_name?: string
  customer_phone?: string
  item_count?: number
  items?: unknown[]
  status?: KotRowStatus
  complete_duration?: string
  reason?: string
}

// ─── request helper (mirrors menuService.ts) ─────────────────────────────

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function ordersPath(outletId: string, suffix = ''): string {
  return `/api/v1/orders/${outletId}${suffix}`
}

function jsonRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    token: authToken(),
  })
}

// ─── orders ───────────────────────────────────────────────────────────────

const LIVE_ORDER_ICONS: Record<string, LiveOrdersIcon> = {
  'dine-in': 'dineIn',
  'pick-up': 'pickup',
  delivery: 'delivery',
  prep: 'prep',
  waiting: 'waiting',
  out: 'out',
}

export async function liveOrdersApi(outletId: string): Promise<LiveOrdersDto> {
  return jsonRequest<LiveOrdersDto>(ordersPath(outletId, '/live/'), 'GET')
}

export function toLiveOrdersBoard(dto: LiveOrdersRunningDto): LiveOrdersSummary {
  return {
    totalOrders: dto.totalOrders,
    totalAmount: Number(dto.totalAmount),
    rows: dto.rows.map((row) => ({
      id: row.id,
      label: row.label,
      orders: row.orders,
      amount: Number(row.amount),
      icon: LIVE_ORDER_ICONS[row.id] ?? 'dineIn',
    })),
  }
}

// ─── live/orders/ drill-down records ──────────────────────────────────────

export interface LiveBoardOrderItemDto {
  name: string
  note?: string
  qty: number | string
  unit_price: number | string
  total_price: number | string
}

export interface LiveBoardOrderRecord {
  kind: 'order'
  id: string
  orderNo: string
  billNo: string
  customerName: string
  status: string
  itemCount: number
  total: number
  items: LiveBoardOrderItemDto[]
}

export interface LiveBoardKotRecord {
  kind: 'kot'
  id: string
  kotNo: number
  tableNo: string
  customerName: string
  status: string
  itemCount: number
  total: number
  items: LiveBoardOrderItemDto[]
}

export type LiveBoardRecord = LiveBoardOrderRecord | LiveBoardKotRecord

export function toLiveBoardOrderRecord(order: OrderDto): LiveBoardOrderRecord {
  return {
    kind: 'order',
    id: order.id,
    orderNo: order.order_no,
    billNo: order.bill_no,
    customerName: order.customer_name || 'Walk-in',
    status: order.status,
    itemCount: order.items.reduce((sum, i) => sum + Number(i.qty || 0), 0),
    total: Number(order.grand_total || 0),
    items: order.items,
  }
}

export function toLiveBoardKotRecord(kot: KotDto): LiveBoardKotRecord {
  return {
    kind: 'kot',
    id: kot.id,
    kotNo: kot.kot_no,
    tableNo: kot.table_no,
    customerName: kot.customer_name || (kot.table_no ? `Table ${kot.table_no}` : 'Walk-in'),
    status: kot.status,
    itemCount: kot.item_count,
    total: (kot.items as LiveBoardOrderItemDto[]).reduce(
      (sum, item) => sum + Number(item.total_price || 0),
      0,
    ),
    items: kot.items as LiveBoardOrderItemDto[],
  }
}

/**
 * Running-board drill-down. The server returns a mixed list (printed/ready
 * orders plus orphan Ready KOTs folded into the row), each tagged with `kind`.
 */
export async function liveBoardOrdersApi(
  outletId: string,
  rowId: string,
): Promise<LiveBoardRecord[]> {
  const qs = new URLSearchParams({ board: 'running', row: rowId })
  const dto = await jsonRequest<{
    rows: Array<{ kind?: string }>
    count: number
  }>(ordersPath(outletId, `/live/orders/?${qs.toString()}`), 'GET')
  return dto.rows.map((row) =>
    row.kind === 'kot'
      ? toLiveBoardKotRecord(row as unknown as KotDto)
      : toLiveBoardOrderRecord(row as unknown as OrderDto),
  )
}

export async function liveBoardKotsApi(
  outletId: string,
  rowId: string,
): Promise<LiveBoardKotRecord[]> {
  const qs = new URLSearchParams({ board: 'pending', row: rowId })
  const dto = await jsonRequest<{ rows: KotDto[]; count: number }>(
    ordersPath(outletId, `/live/orders/?${qs.toString()}`),
    'GET',
  )
  return dto.rows.map(toLiveBoardKotRecord)
}

export async function listOrdersApi(
  outletId: string,
  options: {
    status?: OrderStatus
    search?: string
    page?: number
    page_size?: number
  } = {},
): Promise<OrdersPage> {
  const query = new URLSearchParams()
  if (options.status) query.set('status', options.status)
  if (options.search) query.set('search', options.search)
  if (options.page) query.set('page', String(options.page))
  if (options.page_size) query.set('page_size', String(options.page_size))
  const qs = query.toString()
  return jsonRequest<OrdersPage>(
    ordersPath(outletId, `/orders/${qs ? `?${qs}` : ''}/`),
    'GET',
  )
}

export async function getOrderApi(outletId: string, id: string): Promise<OrderDto> {
  return jsonRequest<OrderDto>(ordersPath(outletId, `/orders/${id}/`), 'GET')
}

export async function createOrderApi(
  outletId: string,
  payload: CreateOrderPayload,
): Promise<OrderDto> {
  return jsonRequest<OrderDto>(ordersPath(outletId, '/orders/'), 'POST', payload)
}

export async function settleOrderApi(
  outletId: string,
  id: string,
  payload: SettleOrderPayload = {},
): Promise<OrderDto> {
  return jsonRequest<OrderDto>(
    ordersPath(outletId, `/orders/${id}/settle/`),
    'POST',
    payload,
  )
}

export async function cancelOrderApi(outletId: string, id: string): Promise<OrderDto> {
  return jsonRequest<OrderDto>(
    ordersPath(outletId, `/orders/${id}/cancel/`),
    'POST',
    {},
  )
}

export async function reprintOrderApi(outletId: string, id: string): Promise<OrderDto> {
  return jsonRequest<OrderDto>(
    ordersPath(outletId, `/orders/${id}/reprint/`),
    'POST',
    {},
  )
}

/**
 * Attach already-sent kitchen tickets to a bill. Save & Print creates the
 * order from the cart, so the KOT it is billing has to be re-parented onto it —
 * otherwise the ticket keeps its own row on the Running board next to the bill
 * that now contains it. A `Ready` ticket also flips to `Printed` server-side.
 */
export async function adoptOrderKotsApi(
  outletId: string,
  id: string,
  kotIds: string[],
): Promise<OrderDto> {
  return updateOrderApi(outletId, id, { action: 'adopt_kots', kot_ids: kotIds })
}

export interface ChangePaymentPayload {
  payment_type: string
  reason?: string
}

export async function changePaymentApi(
  outletId: string,
  id: string,
  payload: ChangePaymentPayload,
): Promise<OrderDto> {
  return jsonRequest<OrderDto>(
    ordersPath(outletId, `/orders/${id}/change-payment/`),
    'POST',
    payload,
  )
}

export interface SettleDuePayload {
  /** Omitted = collect the full outstanding balance_due. */
  amount?: number
  method?: string
  note?: string
}

export async function collectDueApi(
  outletId: string,
  id: string,
  payload: SettleDuePayload,
): Promise<OrderDto> {
  return jsonRequest<OrderDto>(
    ordersPath(outletId, `/orders/${id}/due-collect/`),
    'POST',
    payload,
  )
}

export async function updateOrderApi(
  outletId: string,
  id: string,
  payload: UpdateOrderPayload,
): Promise<OrderDto> {
  return jsonRequest<OrderDto>(
    ordersPath(outletId, `/orders/${id}/`),
    'PATCH',
    payload,
  )
}

export async function splitOrderApi(
  outletId: string,
  id: string,
  parts: SplitPartPayload[],
): Promise<SplitOrderResult> {
  return jsonRequest<SplitOrderResult>(
    ordersPath(outletId, `/orders/${id}/split/`),
    'POST',
    { parts },
  )
}

export async function allocateBillNoApi(
  outletId: string,
  id: string,
  orderType?: OrderType,
): Promise<OrderDto> {
  return jsonRequest<OrderDto>(
    ordersPath(outletId, `/orders/${id}/bill-no/`),
    'POST',
    orderType ? { order_type: orderType } : {},
  )
}

// ─── drafts (server-side basket store) ───────────────────────────────────

export async function listDraftBillsApi(outletId: string): Promise<DraftBillDto[]> {
  return jsonRequest<DraftBillDto[]>(ordersPath(outletId, '/drafts/'), 'GET')
}

export async function saveDraftBillApi(
  outletId: string,
  payload: DraftBillPayload,
): Promise<DraftBillDto> {
  return jsonRequest<DraftBillDto>(ordersPath(outletId, '/drafts/'), 'POST', payload)
}

export async function updateDraftBillApi(
  outletId: string,
  id: string,
  payload: Partial<DraftBillPayload>,
): Promise<DraftBillDto> {
  return jsonRequest<DraftBillDto>(
    ordersPath(outletId, `/drafts/${id}/`),
    'PATCH',
    payload,
  )
}

export async function deleteDraftBillApi(
  outletId: string,
  id: string,
): Promise<null> {
  return jsonRequest<null>(ordersPath(outletId, `/drafts/${id}/`), 'DELETE')
}

// ─── daily summary / advance orders ──────────────────────────────────────

export async function dailySummaryApi(
  outletId: string,
  options: { days?: number; resource?: 'orders' | 'advance' } = {},
): Promise<DailySummaryResult> {
  const query = new URLSearchParams()
  query.set('days', String(options.days ?? 15))
  query.set('resource', options.resource ?? 'orders')
  return jsonRequest<DailySummaryResult>(
    ordersPath(outletId, `/daily-summary/?${query.toString()}`),
    'GET',
  )
}

export async function listAdvanceOrdersApi(
  outletId: string,
  scheduledDate?: string,
): Promise<AdvanceOrderDto[]> {
  const qs = scheduledDate ? `?date=${encodeURIComponent(scheduledDate)}` : ''
  return jsonRequest<AdvanceOrderDto[]>(
    ordersPath(outletId, `/advance-orders/${qs}`),
    'GET',
  )
}

export interface AdvanceOrderItemPayload {
  name: string
  note?: string
  qty: number
  unit_price: number
  total_price: number
}

export interface CreateAdvanceOrderPayload {
  order_type: OrderType
  order_type_label?: string
  customer_name?: string
  customer_phone?: string
  special_note?: string
  payment_type?: string
  advance_amount?: number
  grand_total?: number
  scheduled_date?: string | null
  scheduled_time?: string | null
  status?: AdvanceOrderStatus
  source?: string
  items: AdvanceOrderItemPayload[]
}

export type UpdateAdvanceOrderPayload = Partial<CreateAdvanceOrderPayload>

export async function createAdvanceOrderApi(
  outletId: string,
  payload: CreateAdvanceOrderPayload,
): Promise<AdvanceOrderDto> {
  return jsonRequest<AdvanceOrderDto>(
    ordersPath(outletId, '/advance-orders/'),
    'POST',
    payload,
  )
}

export async function updateAdvanceOrderApi(
  outletId: string,
  id: string,
  payload: UpdateAdvanceOrderPayload,
): Promise<AdvanceOrderDto> {
  return jsonRequest<AdvanceOrderDto>(
    ordersPath(outletId, `/advance-orders/${id}/`),
    'PATCH',
    payload,
  )
}

export async function cancelAdvanceOrderApi(
  outletId: string,
  id: string,
): Promise<AdvanceOrderDto> {
  return jsonRequest<AdvanceOrderDto>(
    ordersPath(outletId, `/advance-orders/${id}/cancel/`),
    'POST',
    {},
  )
}

// ─── KOT ──────────────────────────────────────────────────────────────────

export interface ListKotsOptions {
  status?: string
  order_type?: string
  source?: string
  from?: string
  to?: string
  page?: number
  page_size?: number
}

export async function listKotsApi(
  outletId: string,
  options: ListKotsOptions = {},
): Promise<KotsPage> {
  const params: string[] = []
  if (options.status) params.push(`status=${encodeURIComponent(options.status)}`)
  if (options.order_type)
    params.push(`order_type=${encodeURIComponent(options.order_type)}`)
  if (options.source) params.push(`source=${encodeURIComponent(options.source)}`)
  if (options.from) params.push(`from=${encodeURIComponent(options.from)}`)
  if (options.to) params.push(`to=${encodeURIComponent(options.to)}`)
  if (options.page) params.push(`page=${options.page}`)
  if (options.page_size) params.push(`page_size=${options.page_size}`)
  const qs = params.length ? `?${params.join('&')}` : ''
  return jsonRequest<KotsPage>(ordersPath(outletId, `/kots/${qs}/`), 'GET')
}

export async function getKotApi(outletId: string, id: string): Promise<KotDto> {
  return jsonRequest<KotDto>(ordersPath(outletId, `/kots/${id}/`), 'GET')
}

export async function createKotApi(
  outletId: string,
  payload: CreateKotPayload,
): Promise<KotDto> {
  return jsonRequest<KotDto>(ordersPath(outletId, '/kots/'), 'POST', payload)
}

export async function markKotUsedApi(outletId: string, id: string): Promise<KotDto> {
  return jsonRequest<KotDto>(
    ordersPath(outletId, `/kots/${id}/used-in-bill/`),
    'POST',
    {},
  )
}

export async function markKotReadyApi(outletId: string, id: string): Promise<KotDto> {
  return updateKotApi(outletId, id, { status: 'Ready' })
}

export async function updateKotApi(
  outletId: string,
  id: string,
  payload: UpdateKotPayload,
): Promise<KotDto> {
  return jsonRequest<KotDto>(
    ordersPath(outletId, `/kots/${id}/`),
    'PATCH',
    payload,
  )
}

export async function deleteKotApi(outletId: string, id: string): Promise<null> {
  return jsonRequest<null>(ordersPath(outletId, `/kots/${id}/`), 'DELETE')
}

// ─── day end ──────────────────────────────────────────────────────────────

export async function closeDayApi(
  outletId: string,
): Promise<DayEndClosureDetailDto> {
  return jsonRequest<DayEndClosureDetailDto>(
    ordersPath(outletId, '/day-end/close/'),
    'POST',
    {},
  )
}

export async function listDayEndClosuresApi(
  outletId: string,
  day?: string,
): Promise<DayEndClosureListDto[]> {
  const query = day ? `?day=${encodeURIComponent(day)}` : ''
  return jsonRequest<DayEndClosureListDto[]>(
    ordersPath(outletId, `/day-end/${query}`),
    'GET',
  )
}

export async function getDayEndClosureApi(
  outletId: string,
  id: string,
): Promise<DayEndClosureDetailDto> {
  return jsonRequest<DayEndClosureDetailDto>(
    ordersPath(outletId, `/day-end/${id}/`),
    'GET',
  )
}

// ─── activity logs (Billing / Captain) ────────────────────────────────────

export type ActivityLogSource = 'billing' | 'captain'

export interface ActivityLogDto {
  id: string
  source: ActivityLogSource
  action: string
  details: string
  by: string
  order_id: string | null
  kot_id: string | null
  bill_no: string
  kot_no: number | null
  created_at: string
}

export interface ActivityLogPage {
  results: ActivityLogDto[]
  count: number
  page: number
  page_size: number
}

export async function listActivityLogsApi(
  outletId: string,
  options: {
    source: ActivityLogSource
    search?: string
    action?: string
    from?: string
    to?: string
    page?: number
    page_size?: number
  },
): Promise<ActivityLogPage> {
  const params: string[] = [`source=${encodeURIComponent(options.source)}`]
  if (options.search?.trim()) {
    params.push(`search=${encodeURIComponent(options.search.trim())}`)
  }
  if (options.action?.trim()) {
    params.push(`action=${encodeURIComponent(options.action.trim())}`)
  }
  if (options.from) params.push(`from=${encodeURIComponent(options.from)}`)
  if (options.to) params.push(`to=${encodeURIComponent(options.to)}`)
  if (options.page) params.push(`page=${options.page}`)
  if (options.page_size) params.push(`page_size=${options.page_size}`)
  return jsonRequest<ActivityLogPage>(
    ordersPath(outletId, `/activity-logs/?${params.join('&')}`),
    'GET',
  )
}

/** Day-end API row → UI list row (day → dateKey + display date, Number(total)). */
export function toDayEndSummaryRow(dto: DayEndClosureListDto): DayEndSummaryRow {
  const day = dto.day || (dto.created_at ?? '').slice(0, 10)
  const [year, month, date] = day.split('-')
  const display = month && date ? `${date} ${MONTHS_SHORT[Number(month) - 1]} ${year}` : day
  return {
    id: dto.id,
    createdDate: display,
    dateKey: day,
    orders: dto.orders,
    total: Number(dto.total ?? 0),
  }
}

// ─── mappers → UI row shapes ──────────────────────────────────────────────

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

/** ISO timestamp → `YYYY-MM-DD HH:MM:SS` (Current Orders display format). */
export function formatOrderTimestamp(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** ISO timestamp → `7 Aug 2026 10:05:18` (KOT page parseKotDate format). */
export function formatKotTimestamp(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function kotItemsText(items: unknown): string {
  if (!Array.isArray(items)) {
    return typeof items === 'string' ? items : ''
  }
  const parts = items.map((entry) => {
    if (typeof entry === 'string') return entry
    if (!entry || typeof entry !== 'object') return ''
    const record = entry as Record<string, unknown>
    const name = String(record.name ?? record.item_name ?? '').trim()
    if (!name) return ''
    const qty = Number(record.qty ?? record.quantity ?? 1)
    return Number.isFinite(qty) && qty > 0 ? `${name} × ${qty}` : name
  })
  return parts.filter(Boolean).join(', ')
}

export function toOrderRows(dtos: OrderDto[]): CurrentOrderRow[] {
  return dtos.map(toOrderRow)
}

/** `· Due ₹ 400` payment-cell suffix when a bill was only partially settled. */
function orderDueSuffix(dto: { balance_due?: string }): string {
  const due = Number(dto.balance_due ?? 0)
  return due > 0 ? ` · Due ${formatINR(due, 0)}` : ''
}

export function toOrderRow(dto: OrderDto | OrderEventData): CurrentOrderRow {
  const items: CurrentOrderItem[] = (dto.items ?? []).map((item) => ({
    name: item.name,
    note: item.note || undefined,
    qty: Number(item.qty),
    unitPrice: Number(item.unit_price),
    totalPrice: Number(item.total_price),
  }))
  return {
    id: dto.id,
    orderNo: dto.order_no ?? '',
    orderType: dto.order_type ?? 'dine-in',
    orderTypeLabel: dto.order_type_label ?? '',
    customerPhone: dto.customer_phone ?? '',
    customerName: dto.customer_name ?? '',
    paymentType: `${dto.payment_type ?? ''}${orderDueSuffix(dto)}`,
    myAmount: Number(dto.my_amount ?? 0),
    tax: Number(dto.tax ?? 0),
    discount: Number(dto.discount ?? 0),
    grandTotal: Number(dto.grand_total ?? 0),
    createdAt: dto.created_at
      ? formatOrderTimestamp(dto.created_at)
      : formatOrderTimestamp(new Date().toISOString()),
    status: dto.status ?? 'saved',
    source: dto.source || undefined,
    subOrderType: dto.sub_order_type || undefined,
    printCount: dto.print_count ?? 0,
    items,
    settlementBy: dto.settlement_by || undefined,
    settlementCounter: dto.settlement_counter || undefined,
  }
}

// ─── KOT event → kitchen-ticket mapper (workstream 4) ────────────────────

const KOT_ORDER_TYPE_TO_VIEW: Record<KotOrderType, KotViewOrderType> = {
  'DINE IN': 'dine-in',
  PARCEL: 'other',
  DELIVERY: 'delivery',
  'PICK UP': 'pick-up',
  OTHER: 'other',
}

function kotOrderTypeToView(type?: KotOrderType): KotViewOrderType {
  return (type && KOT_ORDER_TYPE_TO_VIEW[type]) ?? 'other'
}

/** Server KOTs have no table fields; reuse the counter-table labels the
 * billing UI already shows for no-table KOTs. */
function kotTableNoFallback(orderType: KotOrderType | undefined): string {
  switch (orderType) {
    case 'DELIVERY':
      return 'Delivery'
    case 'PICK UP':
      return 'Pick Up'
    case 'OTHER':
      return 'Other'
    case 'DINE IN':
    case 'PARCEL':
    default:
      return 'Counter'
  }
}

function parseKotCreated(value: string | undefined): number {
  if (!value) return Date.now()
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(
    value.trim(),
  )
  if (match) {
    const [, y, mo, d, h, mi, s] = match
    return new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      Number(s),
    ).getTime()
  }
  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : Date.now()
}

function kotEventItems(dto: KotDto | KotEventData): KotViewItem[] {
  const entries = dto.items ?? []
  if (!Array.isArray(entries)) return []
  return entries.map((entry, index) => ({
    id: `${dto.kot_no ?? 0}-${index}`,
    name: entry.name ?? entry.item_name ?? 'Item',
    qty: entry.qty ?? entry.quantity ?? 1,
    price: Number(entry.unit_price) || 0,
  }))
}

/** Rail ``kot.prep`` / ``kot.modified`` payload → a kitchen ticket that the
 * display boards can merge into the local store. Server KOTs carry table
 * attribution (``table_id``/``table_no``/``guests``); falling back to the
 * counter-table labels only when a legacy payload lacks it. */
export function kotEventToTicket(dto: KotDto | KotEventData): KotTicket {
  const orderType = kotOrderTypeToView(dto.order_type)
  return {
    id: dto.id,
    source: dto.source ?? 'billing',
    kotNo: dto.kot_no ?? 0,
    tableId: dto.table_id || 'no-table',
    tableNo: dto.table_no || kotTableNoFallback(dto.order_type),
    orderType,
    biller: '',
    persons: dto.guests ?? 0,
    items: kotEventItems(dto),
    createdAt: parseKotCreated(dto.created),
    status: dto.status === 'Ready' ? 'ready' : 'active',
    customerName: dto.customer_name?.trim() || undefined,
  }
}

export function toKotRow(dto: KotDto | KotEventData): KotRow {
  return {
    id: dto.id,
    kotId: dto.kot_no,
    orderType: dto.order_type ?? 'DINE IN',
    source: dto.source ?? 'billing',
    tableId: dto.table_id || undefined,
    tableNo: dto.table_no || undefined,
    guests: dto.guests ?? undefined,
    customerName: dto.customer_name ?? '',
    customerPhone: dto.customer_phone ?? '',
    itemCount: dto.item_count ?? 0,
    items: kotItemsText(dto.items),
    status: dto.status ?? 'Pending',
    billPrintDate: dto.bill_print_date
      ? formatKotTimestamp(dto.bill_print_date)
      : '--',
    completeDuration: dto.complete_duration || '--',
    created: dto.created ? formatKotTimestamp(dto.created) : '--',
    modified: Boolean(dto.modified),
  }
}

// ─── All Orders mapper ───────────────────────────────────────────────────

const ALL_ORDER_TYPES: Record<OrderType, AllOrderRow['orderType']> = {
  'dine-in': 'DINE IN',
  delivery: 'DELIVERY',
  'pick-up': 'PICK UP',
}

function allOrderItemsText(items: OrderItemDto[] | undefined): string {
  if (!Array.isArray(items) || items.length === 0) return ''
  return items
    .map((item) => {
      const name = item.name || ''
      const qty = Number(item.qty)
      return qty > 1 ? `${name} × ${qty}` : name
    })
    .filter(Boolean)
    .join(', ')
}

function toAllOrderStatus(status: OrderDto['status']): AllOrderRow['status'] {
  switch (status) {
    case 'saved':
      return 'Saved'
    case 'printed':
      return 'Printed'
    case 'paid':
      return 'Settled'
    case 'cancelled':
      return 'Cancelled'
  }
}

/** ISO timestamp → `5th Aug 13:44:47` (All Orders column format). */
export function formatOrderListTimestamp(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${formatDayMonth(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function toAllOrderRow(dto: OrderDto | OrderEventData): AllOrderRow {
  const status = dto.status ?? 'saved'
  return {
    id: dto.id,
    orderNo: dto.order_no ?? '',
    orderType: ALL_ORDER_TYPES[dto.order_type as OrderType] ?? 'DINE IN',
    customerName: dto.customer_name ?? '',
    assignTo: '',
    items: allOrderItemsText(dto.items),
    myAmount: Number(dto.my_amount ?? 0),
    tax: Number(dto.tax ?? 0),
    discount: Number(dto.discount ?? 0),
    grandTotal: Number(dto.grand_total ?? 0),
    payment: `${dto.payment_type ?? ''}${orderDueSuffix(dto)}`,
    status: toAllOrderStatus(status),
    created: dto.created_at
      ? formatOrderListTimestamp(dto.created_at)
      : formatOrderListTimestamp(new Date().toISOString()),
    balanceDue: Number(dto.balance_due ?? 0),
  }
}