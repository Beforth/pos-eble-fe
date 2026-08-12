export type CurrentOrderStatus = 'saved' | 'printed' | 'cancelled' | 'paid'
export type CurrentOrderType = 'dine-in' | 'delivery' | 'pick-up'
export type OrdersMainTab = 'current' | 'online' | 'advance'

export interface CurrentOrderItem {
  name: string
  note?: string
  qty: number
  unitPrice: number
  totalPrice: number
}

export interface CurrentOrderRow {
  id: string
  orderNo: string
  orderType: CurrentOrderType
  orderTypeLabel: string
  customerPhone: string
  customerName: string
  paymentType: string
  myAmount: number
  tax: number
  discount: number
  grandTotal: number
  createdAt: string
  status: CurrentOrderStatus
  source?: string
  subOrderType?: string
  printCount?: number
  items: CurrentOrderItem[]
  settlementBy?: string
  settlementCounter?: string
}

export const currentOrdersList: CurrentOrderRow[] = [
  {
    id: 'o878',
    orderNo: '878',
    orderType: 'dine-in',
    orderTypeLabel: 'Dine In (4) (Ground Floor)',
    customerPhone: '',
    customerName: '',
    paymentType: 'Cash',
    myAmount: 705,
    tax: 0,
    discount: 0,
    grandTotal: 705,
    createdAt: '2022-12-03 02:50:11',
    status: 'cancelled',
    subOrderType: 'Ground Floor',
    printCount: 1,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Papdi Chaat', qty: 2, unitPrice: 80, totalPrice: 160 },
      { name: 'Dabeli', qty: 3, unitPrice: 45, totalPrice: 135 },
      { name: 'Sev Puri', qty: 2, unitPrice: 70, totalPrice: 140 },
    ],
  },
  {
    id: 'o877',
    orderNo: '877',
    orderType: 'dine-in',
    orderTypeLabel: 'Dine In (4) (Ground Floor)',
    customerPhone: '',
    customerName: '',
    paymentType: 'Cash',
    myAmount: 460,
    tax: 0,
    discount: 0,
    grandTotal: 460,
    createdAt: '2022-12-03 02:45:33',
    status: 'printed',
    subOrderType: 'BASEMENT',
    printCount: 1,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Spring Roll', qty: 1, unitPrice: 150, totalPrice: 150 },
      { name: 'Tandoori Pasta', note: 'Spicy', qty: 1, unitPrice: 145, totalPrice: 145 },
      { name: 'Strawberry Mojito', qty: 1, unitPrice: 75, totalPrice: 75 },
      { name: 'Cold Coffee', note: 'Strong', qty: 1, unitPrice: 90, totalPrice: 90 },
    ],
  },
  {
    id: 'o876',
    orderNo: '876',
    orderType: 'dine-in',
    orderTypeLabel: 'Dine In (2) (Ground Floor)',
    customerPhone: '9876543210',
    customerName: 'Amit',
    paymentType: 'Cash',
    myAmount: 320,
    tax: 16,
    discount: 0,
    grandTotal: 336,
    createdAt: '2022-12-03 01:22:10',
    status: 'printed',
    subOrderType: 'Ground Floor',
    printCount: 1,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Bhel Puri', qty: 2, unitPrice: 70, totalPrice: 140 },
      { name: 'Dabeli', qty: 4, unitPrice: 45, totalPrice: 180 },
    ],
  },
  {
    id: 'o875',
    orderNo: '875',
    orderType: 'dine-in',
    orderTypeLabel: 'Dine In (6) (Party Hall)',
    customerPhone: '',
    customerName: '',
    paymentType: 'Card',
    myAmount: 1580,
    tax: 79,
    discount: 158,
    grandTotal: 1501,
    createdAt: '2022-12-02 21:10:44',
    status: 'printed',
    subOrderType: 'Party Hall',
    printCount: 2,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Party Box', qty: 2, unitPrice: 499, totalPrice: 998 },
      { name: 'Aloo Tikki Chaat', qty: 4, unitPrice: 90, totalPrice: 360 },
      { name: 'Cold Coffee', qty: 4, unitPrice: 55.5, totalPrice: 222 },
    ],
  },
  {
    id: 'o874',
    orderNo: '874',
    orderType: 'dine-in',
    orderTypeLabel: 'Dine In (3) (Ground Floor)',
    customerPhone: '',
    customerName: '',
    paymentType: 'Cash',
    myAmount: 210,
    tax: 0,
    discount: 0,
    grandTotal: 210,
    createdAt: '2022-12-02 19:05:01',
    status: 'saved',
    subOrderType: 'Ground Floor',
    printCount: 0,
    items: [
      { name: 'Sev Puri', qty: 3, unitPrice: 70, totalPrice: 210 },
    ],
  },
  {
    id: 'o805',
    orderNo: '805',
    orderType: 'delivery',
    orderTypeLabel: 'Delivery',
    customerPhone: '9034142334',
    customerName: 'Bharat',
    paymentType: 'Cash',
    myAmount: 380,
    tax: 19,
    discount: 0,
    grandTotal: 399,
    createdAt: '2022-11-20 13:18:22',
    status: 'printed',
    source: 'Home Website',
    subOrderType: 'Home Website',
    printCount: 1,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Dabeli', qty: 4, unitPrice: 45, totalPrice: 180 },
      { name: 'Papdi Chaat', qty: 2, unitPrice: 80, totalPrice: 160 },
      { name: 'Delivery Charge', qty: 1, unitPrice: 40, totalPrice: 40 },
    ],
  },
  {
    id: 'o804',
    orderNo: '804',
    orderType: 'delivery',
    orderTypeLabel: 'Delivery',
    customerPhone: '9123456780',
    customerName: 'Neha',
    paymentType: 'Online',
    myAmount: 520,
    tax: 26,
    discount: 50,
    grandTotal: 496,
    createdAt: '2022-11-20 12:02:09',
    status: 'printed',
    source: 'Home Website',
    subOrderType: 'Home Website',
    printCount: 1,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Party Box', qty: 1, unitPrice: 499, totalPrice: 499 },
      { name: 'Delivery Charge', qty: 1, unitPrice: 21, totalPrice: 21 },
    ],
  },
  {
    id: 'o803',
    orderNo: '803',
    orderType: 'delivery',
    orderTypeLabel: 'Delivery',
    customerPhone: '9988776655',
    customerName: 'Rahul',
    paymentType: 'Cash',
    myAmount: 250,
    tax: 0,
    discount: 0,
    grandTotal: 250,
    createdAt: '2022-11-19 20:44:12',
    status: 'paid',
    source: 'Zomato',
    subOrderType: 'Zomato',
    printCount: 1,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Bhel Puri', qty: 2, unitPrice: 70, totalPrice: 140 },
      { name: 'Dabeli', qty: 2, unitPrice: 45, totalPrice: 90 },
      { name: 'Delivery Charge', qty: 1, unitPrice: 20, totalPrice: 20 },
    ],
  },
  {
    id: 'o832',
    orderNo: '832',
    orderType: 'pick-up',
    orderTypeLabel: 'Pick Up (Pick Up)',
    customerPhone: '',
    customerName: '',
    paymentType: 'Cash',
    myAmount: 144,
    tax: 0,
    discount: 0,
    grandTotal: 144,
    createdAt: '2022-11-08 20:33:58',
    status: 'printed',
    subOrderType: 'Pick Up',
    printCount: 1,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Dabeli', qty: 2, unitPrice: 45, totalPrice: 90 },
      { name: 'Sev Puri', qty: 1, unitPrice: 54, totalPrice: 54 },
    ],
  },
  {
    id: 'o831',
    orderNo: '831',
    orderType: 'pick-up',
    orderTypeLabel: 'Pick Up (Pick Up)',
    customerPhone: '9001122334',
    customerName: 'Sneha',
    paymentType: 'Cash',
    myAmount: 280,
    tax: 14,
    discount: 0,
    grandTotal: 294,
    createdAt: '2022-11-08 19:11:05',
    status: 'printed',
    subOrderType: 'Pick Up',
    printCount: 1,
    settlementBy: 'biller (biller)',
    settlementCounter: 'main',
    items: [
      { name: 'Papdi Chaat', qty: 2, unitPrice: 80, totalPrice: 160 },
      { name: 'Cold Coffee', qty: 2, unitPrice: 60, totalPrice: 120 },
    ],
  },
  {
    id: 'o830',
    orderNo: '830',
    orderType: 'pick-up',
    orderTypeLabel: 'Pick Up (Pick Up)',
    customerPhone: '',
    customerName: '',
    paymentType: 'UPI',
    myAmount: 90,
    tax: 0,
    discount: 0,
    grandTotal: 90,
    createdAt: '2022-11-07 18:00:40',
    status: 'saved',
    subOrderType: 'Pick Up',
    printCount: 0,
    items: [
      { name: 'Aloo Tikki Chaat', qty: 1, unitPrice: 90, totalPrice: 90 },
    ],
  },
]

export function money(n: number): string {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function rowClassForStatus(_status: CurrentOrderStatus): string {
  return 'bg-card'
}
