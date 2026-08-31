import { addDays, formatDayMonth } from '../utils/format'

export interface OrdersChartPoint {
  label: string
  value: number
}

export type OrderStatus = 'Printed' | 'Settled' | 'Cancelled'
export type OrderChannel = 'DINE IN' | 'PARCEL' | 'DELIVERY' | 'PICK UP'

export interface AllOrderRow {
  id: string
  orderNo: string
  orderType: OrderChannel
  customerName: string
  assignTo: string
  items: string
  myAmount: number
  tax: number
  discount: number
  grandTotal: number
  payment: string
  status: OrderStatus
  created: string
}

export interface CumulativeItemRow {
  name: string
  quantity: number
}

const today = new Date()

function chartLabel(daysAgo: number): string {
  return formatDayMonth(addDays(today, -daysAgo))
}

/** Last ~15 days series for the All Orders chart (POS-Eble-style peaks). */
export const allOrdersChartSeries: OrdersChartPoint[] = [
  { label: chartLabel(14), value: 52_754 },
  { label: chartLabel(13), value: 63_000 },
  { label: chartLabel(12), value: 41_465 },
  { label: chartLabel(11), value: 58_073 },
  { label: chartLabel(10), value: 49_820 },
  { label: chartLabel(9), value: 55_410 },
  { label: chartLabel(8), value: 62_150 },
  { label: chartLabel(7), value: 47_900 },
  { label: chartLabel(6), value: 53_280 },
  { label: chartLabel(5), value: 61_040 },
  { label: chartLabel(4), value: 44_675 },
  { label: chartLabel(3), value: 57_320 },
  { label: chartLabel(2), value: 50_110 },
  { label: chartLabel(1), value: 59_860 },
  { label: chartLabel(0), value: 54_200 },
]

export const advanceOrdersChartSeries: OrdersChartPoint[] = allOrdersChartSeries.map(
  (point) => ({ ...point, value: 0 }),
)

export const allOrdersList: AllOrderRow[] = [
  {
    id: '1',
    orderNo: '48405',
    orderType: 'DINE IN',
    customerName: '',
    assignTo: '',
    items: 'Vegetable Regular Sandwich (Regular)',
    myAmount: 152.38,
    tax: 7.62,
    discount: 0,
    grandTotal: 160,
    payment: 'Cash',
    status: 'Printed',
    created: `${formatDayMonth(today)} 13:44:47`,
  },
  {
    id: '2',
    orderNo: '48404',
    orderType: 'PARCEL',
    customerName: 'Rahul M.',
    assignTo: 'Counter 1',
    items: 'Cheese Dabeli ×2, Masala Pav Bhaji',
    myAmount: 285.71,
    tax: 14.29,
    discount: 20,
    grandTotal: 280,
    payment: 'Other [UPI]',
    status: 'Printed',
    created: `${formatDayMonth(today)} 13:21:10`,
  },
  {
    id: '3',
    orderNo: '48403',
    orderType: 'DELIVERY',
    customerName: 'Swiggy',
    assignTo: 'Rider',
    items: 'Vada Pav ×3',
    myAmount: 142.86,
    tax: 7.14,
    discount: 0,
    grandTotal: 150,
    payment: 'Other [Online]',
    status: 'Settled',
    created: `${formatDayMonth(today)} 12:58:03`,
  },
  {
    id: '4',
    orderNo: '48402',
    orderType: 'PICK UP',
    customerName: 'Anita S.',
    assignTo: '',
    items: 'Misal Pav, Lime Soda',
    myAmount: 190.48,
    tax: 9.52,
    discount: 0,
    grandTotal: 200,
    payment: 'Card',
    status: 'Printed',
    created: `${formatDayMonth(today)} 12:40:22`,
  },
  {
    id: '5',
    orderNo: '48401',
    orderType: 'PARCEL',
    customerName: '',
    assignTo: 'Counter 2',
    items: 'Kathiyawadi Fafda (250 Gm)',
    myAmount: 238.1,
    tax: 11.9,
    discount: 0,
    grandTotal: 250,
    payment: 'Cash',
    status: 'Printed',
    created: `${formatDayMonth(today)} 12:15:41`,
  },
  {
    id: '6',
    orderNo: '48400',
    orderType: 'DINE IN',
    customerName: 'Table 4',
    assignTo: 'Server A',
    items: 'Tandoor Masala Sandwich ×2',
    myAmount: 304.76,
    tax: 15.24,
    discount: 10,
    grandTotal: 310,
    payment: 'Other [UPI]',
    status: 'Settled',
    created: `${formatDayMonth(today)} 11:52:08`,
  },
  {
    id: '7',
    orderNo: '48399',
    orderType: 'DELIVERY',
    customerName: 'Zomato',
    assignTo: 'Rider',
    items: 'Amul Butter Dabeli ×4',
    myAmount: 266.67,
    tax: 13.33,
    discount: 0,
    grandTotal: 280,
    payment: 'Other [Online]',
    status: 'Printed',
    created: `${formatDayMonth(today)} 11:30:55`,
  },
  {
    id: '8',
    orderNo: '48398',
    orderType: 'PARCEL',
    customerName: '',
    assignTo: '',
    items: 'Cold Coffee, Butter Milk',
    myAmount: 95.24,
    tax: 4.76,
    discount: 0,
    grandTotal: 100,
    payment: 'Cash',
    status: 'Printed',
    created: `${formatDayMonth(today)} 11:05:19`,
  },
  {
    id: '9',
    orderNo: '48397',
    orderType: 'PICK UP',
    customerName: 'Kiran P.',
    assignTo: 'Counter 1',
    items: 'Masala Burger Regular',
    myAmount: 114.29,
    tax: 5.71,
    discount: 0,
    grandTotal: 120,
    payment: 'Card',
    status: 'Printed',
    created: `${formatDayMonth(today)} 10:48:33`,
  },
  {
    id: '10',
    orderNo: '48396',
    orderType: 'DINE IN',
    customerName: 'Table 2',
    assignTo: 'Server B',
    items: 'Vegetable Grill Sandwich (Cheese)',
    myAmount: 209.52,
    tax: 10.48,
    discount: 0,
    grandTotal: 220,
    payment: 'Cash',
    status: 'Printed',
    created: `${formatDayMonth(today)} 10:22:07`,
  },
]

export const allOrdersGrandTotal = allOrdersList.reduce(
  (sum, row) => sum + row.grandTotal,
  0,
)

export const cumulativeItems: CumulativeItemRow[] = [
  { name: 'Vegetable Grill Sandwich (Cheese)', quantity: 11 },
  { name: 'Masala Burger Regular', quantity: 5 },
  { name: 'Vegetable Grill Sandwich (Regular)', quantity: 3 },
  { name: 'Kathiyawadi Fafda (250 Gm)', quantity: 2 },
  { name: 'Tandoor Masala Sandwich', quantity: 2 },
]
