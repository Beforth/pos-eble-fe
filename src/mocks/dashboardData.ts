import type {
  ChartPoint,
  ChartStatus,
  ExpensesData,
  ItemRow,
  LeakageData,
  OnlineOrdersData,
  OrderTypeSummary,
  QuickHelpData,
  SalesStats,
} from '../types'
import { formatDayMonth } from '../utils/format'

/** Mock data shaped like a typical PetPooja day view for the Dadar outlet. */

export const salesStats: SalesStats = {
  totalSales: 2_808,
  totalOrders: 17,
  periodLabel: formatDayMonth(new Date()),
  onlineSubtotal: 483,
  payments: [
    { label: 'Cash', value: 445 },
    { label: 'Card', value: 0 },
    { label: 'Other', value: 1_880 },
    { label: 'Not Paid', value: 0 },
  ],
}

/** 4-hour stacked channel series for the Sales chart. */
export const channelSeries: ChartPoint[] = [
  { label: '12:00am - 04:00am', dineIn: 0, parcel: 0, online: 0 },
  { label: '04:00am - 08:00am', dineIn: 40, parcel: 20, online: 0 },
  { label: '08:00am - 12:00pm', dineIn: 200, parcel: 150, online: 95 },
  { label: '12:00pm - 04:00pm', dineIn: 0, parcel: 600, online: 205 },
  { label: '04:00pm - 08:00pm', dineIn: 0, parcel: 530, online: 160 },
  { label: '08:00pm - 12:00am', dineIn: 0, parcel: 300, online: 23 },
]

export const chartStatus: ChartStatus = {
  successful: 17,
  complementary: 0,
  cancelled: 0,
}

export const leakage: LeakageData = {
  kots: { cancelled: 0, modified: 0, shifted: 0 },
  bills: { modified: 0, reprinted: 0, waivedOff: 0 },
}

export const orderTypeSummaries: OrderTypeSummary[] = [
  {
    key: 'dineIn',
    label: 'Dine In',
    revenue: 0,
    orders: 0,
    totalOrders: 17,
    avgTurnaroundMins: 0,
    details: {
      orderCount: 0,
      minimum: 0,
      average: 0,
      maximum: 0,
      discount: 0,
      taxes: 0,
      total: 0,
    },
  },
  {
    key: 'delivery',
    label: 'Delivery',
    revenue: 1_165,
    orders: 11,
    totalOrders: 17,
    avgTurnaroundMins: 21,
    details: {
      orderCount: 11,
      minimum: 49,
      average: 106,
      maximum: 285,
      discount: 40,
      taxes: 98,
      total: 1_165,
    },
  },
  {
    key: 'parcel',
    label: 'Parcel',
    revenue: 1_643,
    orders: 6,
    totalOrders: 17,
    avgTurnaroundMins: 12,
    details: {
      orderCount: 6,
      minimum: 90,
      average: 274,
      maximum: 520,
      discount: 25,
      taxes: 142,
      total: 1_643,
    },
  },
]

export const onlineOrders: OnlineOrdersData = {
  totalOrders: 2,
  totalRevenue: 483,
  prepaidOrders: 2,
  prepaidRevenue: 483,
  codOrders: 0,
  codRevenue: 0,
  platforms: [
    {
      platform: 'Zomato',
      brands: 1,
      orders: 0,
      prepaidRevenue: 0,
      codRevenue: 0,
      revenue: 0,
    },
    {
      platform: 'Swiggy',
      brands: 1,
      orders: 1,
      prepaidRevenue: 147,
      codRevenue: 0,
      revenue: 147,
    },
    {
      platform: 'Toing',
      brands: 0,
      orders: 1,
      prepaidRevenue: 336,
      codRevenue: 0,
      revenue: 336,
    },
    {
      platform: 'Other',
      brands: 2,
      orders: 0,
      prepaidRevenue: 0,
      codRevenue: 0,
      revenue: 0,
    },
  ],
}

export const topItems: ItemRow[] = [
  { name: 'Vegetable Grill Sandwich (Cheese)', revenue: 838.09, units: 11 },
  { name: 'Masala Burger Regular (Regular)', revenue: 166.65, units: 5 },
  { name: 'Vegetable Grill Sandwich (Regular)', revenue: 194.28, units: 3 },
  { name: 'Kathiyawadi Fafda (250 Gm)', revenue: 257.14, units: 2 },
  { name: 'Tandoor Masala Sandwich', revenue: 152.38, units: 2 },
]

export const lowItems: ItemRow[] = [
  { name: 'Cold Coffee', revenue: 48, units: 2 },
  { name: 'Butter Milk', revenue: 30, units: 2 },
  { name: 'Lime Soda', revenue: 25, units: 1 },
  { name: 'Sprouts Chaat', revenue: 0, units: 0 },
  { name: 'Rasmalai', revenue: 0, units: 0 },
]

export const expenses: ExpensesData = {
  totalOutflow: 0,
  lines: [
    { label: 'Expenses', amount: 0, type: 'expense' },
    { label: 'Withdrawals', amount: 0, type: 'withdrawal' },
    { label: 'Cash Top up', amount: 0, type: 'topup' },
  ],
}

export const quickHelp: QuickHelpData = {
  outletId: '133856',
  hours: '10 AM - 7 PM',
  contact: {
    name: 'Pandey Ashutosh',
    role: 'Point of Contact',
    phone: '+91 98200 12345',
  },
}

export const syncStatus = {
  posSyncedMinutesAgo: 4,
  ordersSyncedMinutesAgo: 14,
} as const
