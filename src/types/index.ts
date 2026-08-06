/* Shared domain types for the POS dashboard. */

export type PaymentMethod = 'Cash' | 'Card' | 'Other' | 'Not Paid'

export interface PaymentSlice {
  label: PaymentMethod
  value: number
}

export interface SalesStats {
  totalSales: number
  totalOrders: number
  /** e.g. "5th Aug" shown under the Total Sales title */
  periodLabel: string
  onlineSubtotal: number
  payments: PaymentSlice[]
}

export interface ChartPoint {
  label: string
  dineIn: number
  parcel: number
  online: number
}

export type ChannelKey = 'dineIn' | 'parcel' | 'online'

export interface ChartStatus {
  successful: number
  complementary: number
  cancelled: number
}

export interface LeakageData {
  kots: {
    cancelled: number
    modified: number
    shifted: number
  }
  bills: {
    modified: number
    reprinted: number
    waivedOff: number
  }
}

export type OrderTypeKey = 'dineIn' | 'delivery' | 'parcel'

export interface OrderTypeDetails {
  orderCount: number
  minimum: number
  average: number
  maximum: number
  discount: number
  taxes: number
  total: number
}

export interface OrderTypeSummary {
  key: OrderTypeKey
  label: string
  revenue: number
  orders: number
  totalOrders: number
  avgTurnaroundMins: number
  details: OrderTypeDetails
}

export interface PlatformRow {
  platform: string
  brands: number
  orders: number
  prepaidRevenue: number
  codRevenue: number
  revenue: number
}

export interface OnlineOrdersData {
  totalOrders: number
  totalRevenue: number
  prepaidOrders: number
  prepaidRevenue: number
  codOrders: number
  codRevenue: number
  platforms: PlatformRow[]
}

export interface ItemRow {
  name: string
  revenue: number
  units: number
}

export type ExpenseType = 'expense' | 'withdrawal' | 'topup'

export interface ExpenseLine {
  label: string
  amount: number
  type: ExpenseType
}

export interface ExpensesData {
  totalOutflow: number
  lines: ExpenseLine[]
}

export interface SupportContact {
  name: string
  role: string
  phone: string
}

export interface QuickHelpData {
  outletId: string
  hours: string
  contact: SupportContact
}
