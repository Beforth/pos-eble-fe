import { brand } from '../theme/brand'
import { addDays, formatDayMonth } from '../utils/format'

export type OnlineAggregator = 'All' | 'Zomato' | 'Swiggy'
export type OnlineOrderStatus =
  | 'Delivered'
  | 'Accepted'
  | 'Food Ready'
  | 'Dispatched'
  | 'Cancelled'

export interface OnlineOrderItem {
  name: string
  specialNote: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OnlineOrderRow {
  id: string
  orderNo: string
  paymentLabel: string
  paymentType: string
  outletName: string
  aggregator: 'Zomato' | 'Swiggy'
  channelLabel: string
  orderType: string
  riderName: string
  riderPhone: string
  riderStatus: string
  customerName: string
  customerPhone?: string
  customerAddress?: string
  persons?: string
  customerNotes?: string
  isUrgent?: boolean
  otp: string
  created: string
  received: string
  accepted: string
  updated: string
  total: number
  deliveryCharge: number
  containerCharge: number
  status: OnlineOrderStatus
  atCount: number
  items: OnlineOrderItem[]
}

const outlet = brand.shopName

export const onlineOrdersList: OnlineOrderRow[] = [
  {
    id: '1',
    orderNo: '243759935121090',
    paymentLabel: 'Online Paid',
    paymentType: 'Online',
    outletName: outlet,
    aggregator: 'Swiggy',
    channelLabel: 'Toing by Swiggy',
    orderType: 'Delivery',
    riderName: 'DIPAK VITTHAL POTE',
    riderPhone: '8452874168',
    riderStatus: 'DELIVERED',
    customerName: 'Laxmi',
    customerNotes: "Don't send cutlery",
    isUrgent: true,
    otp: '3714',
    created: '23-07-2026 13:56:52',
    received: '23-07-2026 13:56:53',
    accepted: '23-07-2026 13:57:05',
    updated: '23-07-2026 14:26:57',
    total: 350,
    deliveryCharge: 0,
    containerCharge: 0,
    status: 'Delivered',
    atCount: 185,
    items: [
      {
        name: 'Cheese Corn Sandwich',
        specialNote: '--',
        quantity: 1,
        unitPrice: 98,
        totalPrice: 98,
      },
      {
        name: 'Veg Tikki Burger',
        specialNote: 'Regular',
        quantity: 1,
        unitPrice: 84,
        totalPrice: 84,
      },
      {
        name: 'Mumbai Masala Sandwich',
        specialNote: 'Regular',
        quantity: 2,
        unitPrice: 84,
        totalPrice: 168,
      },
    ],
  },
  {
    id: '2',
    orderNo: '243759911538022',
    paymentLabel: 'Online Paid',
    paymentType: 'Online',
    outletName: outlet,
    aggregator: 'Swiggy',
    channelLabel: 'Swiggy',
    orderType: 'Delivery',
    riderName: 'ARJUN MAHENDRA YADAV',
    riderPhone: '8452891023',
    riderStatus: 'DELIVERED',
    customerName: 'Ramesh',
    customerNotes: 'Extra spicy',
    otp: '5821',
    created: '23-07-2026 13:42:10',
    received: '23-07-2026 13:42:11',
    accepted: '23-07-2026 13:42:28',
    updated: '23-07-2026 14:08:44',
    total: 428.5,
    deliveryCharge: 20,
    containerCharge: 0,
    status: 'Delivered',
    atCount: 162,
    items: [
      {
        name: 'Rajubhai Special Dabeli',
        specialNote: '--',
        quantity: 2,
        unitPrice: 80,
        totalPrice: 160,
      },
      {
        name: 'Cheese Burst Pav',
        specialNote: '--',
        quantity: 1,
        unitPrice: 120,
        totalPrice: 120,
      },
      {
        name: 'Masala Chaas',
        specialNote: '--',
        quantity: 2,
        unitPrice: 64.25,
        totalPrice: 128.5,
      },
    ],
  },
  {
    id: '3',
    orderNo: '8382357204',
    paymentLabel: 'Online Paid',
    paymentType: 'Online',
    outletName: outlet,
    aggregator: 'Zomato',
    channelLabel: 'Zomato',
    orderType: 'Delivery',
    riderName: 'Hrishikesh Marathe',
    riderPhone: '9876543210',
    riderStatus: 'Delivered',
    customerName: 'Pradip Parmeshwar Ingale',
    customerPhone: '9123456780',
    customerAddress: 'Dadar West, Mumbai',
    persons: '2',
    otp: '9964',
    created: '23-07-2026 13:31:02',
    received: '23-07-2026 13:31:03',
    accepted: '23-07-2026 13:31:18',
    updated: '23-07-2026 13:58:40',
    total: 238.01,
    deliveryCharge: 0,
    containerCharge: 10,
    status: 'Delivered',
    atCount: 0,
    items: [
      {
        name: 'Classic Dabeli',
        specialNote: '--',
        quantity: 3,
        unitPrice: 49,
        totalPrice: 147,
      },
      {
        name: 'Sev Puri',
        specialNote: 'Less sev',
        quantity: 1,
        unitPrice: 81.01,
        totalPrice: 81.01,
      },
    ],
  },
  {
    id: '4',
    orderNo: '8382355619',
    paymentLabel: 'Online Paid',
    paymentType: 'Online',
    outletName: outlet,
    aggregator: 'Zomato',
    channelLabel: 'Zomato',
    orderType: 'Delivery',
    riderName: 'Suresh Patil',
    riderPhone: '9988776655',
    riderStatus: 'Delivered',
    customerName: 'Neha Sharma',
    customerPhone: '9001122334',
    customerAddress: 'Lower Parel',
    isUrgent: true,
    customerNotes: 'Ring the bell',
    otp: '4412',
    created: '23-07-2026 13:18:44',
    received: '23-07-2026 13:18:45',
    accepted: '23-07-2026 13:19:02',
    updated: '23-07-2026 13:49:11',
    total: 512.0,
    deliveryCharge: 0,
    containerCharge: 0,
    status: 'Delivered',
    atCount: 3,
    items: [
      {
        name: 'Cheese Corn Sandwich',
        specialNote: '--',
        quantity: 2,
        unitPrice: 98,
        totalPrice: 196,
      },
      {
        name: 'Veg Tikki Burger (Regular)',
        specialNote: 'Regular',
        quantity: 2,
        unitPrice: 84,
        totalPrice: 168,
      },
      {
        name: 'Mumbai Masala Sandwich (Regular)',
        specialNote: 'Regular',
        quantity: 2,
        unitPrice: 74,
        totalPrice: 148,
      },
    ],
  },
  {
    id: '5',
    orderNo: '243759880441199',
    paymentLabel: 'Online Paid',
    paymentType: 'Online',
    outletName: outlet,
    aggregator: 'Swiggy',
    channelLabel: 'Swiggy',
    orderType: 'Delivery',
    riderName: 'VIKAS RAMESH KADAM',
    riderPhone: '8452011987',
    riderStatus: 'OUT FOR DELIVERY',
    customerName: 'Amit',
    otp: '7740',
    created: '23-07-2026 14:02:18',
    received: '23-07-2026 14:02:19',
    accepted: '23-07-2026 14:02:35',
    updated: '23-07-2026 14:15:02',
    total: 189.0,
    deliveryCharge: 15,
    containerCharge: 0,
    status: 'Dispatched',
    atCount: 31,
    items: [
      {
        name: 'Butter Dabeli',
        specialNote: '--',
        quantity: 2,
        unitPrice: 60,
        totalPrice: 120,
      },
      {
        name: 'Sweet Lassi',
        specialNote: '--',
        quantity: 1,
        unitPrice: 54,
        totalPrice: 54,
      },
    ],
  },
  {
    id: '6',
    orderNo: '8382354102',
    paymentLabel: 'Online Paid',
    paymentType: 'Online',
    outletName: outlet,
    aggregator: 'Zomato',
    channelLabel: 'Zomato',
    orderType: 'Delivery',
    riderName: 'Rahul Deshmukh',
    riderPhone: '9765432109',
    riderStatus: 'Food Ready',
    customerName: 'Priya Mehta',
    customerPhone: '9812345678',
    customerNotes: 'Pack separately',
    otp: '2208',
    created: '23-07-2026 14:10:05',
    received: '23-07-2026 14:10:06',
    accepted: '23-07-2026 14:10:22',
    updated: '23-07-2026 14:18:50',
    total: 365.75,
    deliveryCharge: 0,
    containerCharge: 5,
    status: 'Food Ready',
    atCount: 12,
    items: [
      {
        name: 'Paneer Dabeli',
        specialNote: '--',
        quantity: 2,
        unitPrice: 95,
        totalPrice: 190,
      },
      {
        name: 'Vada Pav',
        specialNote: '--',
        quantity: 3,
        unitPrice: 40,
        totalPrice: 120,
      },
      {
        name: 'Nimbu Soda',
        specialNote: '--',
        quantity: 1,
        unitPrice: 50.75,
        totalPrice: 50.75,
      },
    ],
  },
  {
    id: '7',
    orderNo: '243759850112334',
    paymentLabel: 'Cash on Delivery',
    paymentType: 'COD',
    outletName: outlet,
    aggregator: 'Swiggy',
    channelLabel: 'Swiggy',
    orderType: 'Delivery',
    riderName: 'SANTOSH BABURAO MORE',
    riderPhone: '8452765432',
    riderStatus: 'ACCEPTED',
    customerName: 'Kavita',
    isUrgent: true,
    otp: '1193',
    created: '23-07-2026 14:20:11',
    received: '23-07-2026 14:20:12',
    accepted: '23-07-2026 14:20:40',
    updated: '23-07-2026 14:20:40',
    total: 275.0,
    deliveryCharge: 0,
    containerCharge: 0,
    status: 'Accepted',
    atCount: 8,
    items: [
      {
        name: 'Cheese Corn Sandwich',
        specialNote: '--',
        quantity: 1,
        unitPrice: 98,
        totalPrice: 98,
      },
      {
        name: 'Mumbai Masala Sandwich (Regular)',
        specialNote: '--',
        quantity: 1,
        unitPrice: 63,
        totalPrice: 63,
      },
      {
        name: 'Veg Tikki Burger (Regular)',
        specialNote: '--',
        quantity: 1,
        unitPrice: 84,
        totalPrice: 84,
      },
      {
        name: 'Masala Chaas',
        specialNote: '--',
        quantity: 1,
        unitPrice: 30,
        totalPrice: 30,
      },
    ],
  },
  {
    id: '8',
    orderNo: '8382353001',
    paymentLabel: 'Online Paid',
    paymentType: 'Online',
    outletName: outlet,
    aggregator: 'Zomato',
    channelLabel: 'Zomato',
    orderType: 'Delivery',
    riderName: 'Aniket Joshi',
    riderPhone: '9898989898',
    riderStatus: 'Cancelled',
    customerName: 'Sanjay Kulkarni',
    customerPhone: '9876501234',
    otp: '0087',
    created: '23-07-2026 12:55:30',
    received: '23-07-2026 12:55:31',
    accepted: '23-07-2026 12:56:00',
    updated: '23-07-2026 13:05:15',
    total: 148.0,
    deliveryCharge: 0,
    containerCharge: 0,
    status: 'Cancelled',
    atCount: 45,
    items: [
      {
        name: 'Classic Dabeli',
        specialNote: '--',
        quantity: 2,
        unitPrice: 49,
        totalPrice: 98,
      },
      {
        name: 'Cutting Chai',
        specialNote: '--',
        quantity: 2,
        unitPrice: 25,
        totalPrice: 50,
      },
    ],
  },
]

const chartAnchor = new Date(2026, 6, 23)

/** Last 5 days order counts for the Online Orders chart. */
export const onlineOrdersChartSeries = [
  { label: formatDayMonth(addDays(chartAnchor, -4)), value: 14 },
  { label: formatDayMonth(addDays(chartAnchor, -3)), value: 21 },
  { label: formatDayMonth(addDays(chartAnchor, -2)), value: 11 },
  { label: formatDayMonth(addDays(chartAnchor, -1)), value: 18 },
  { label: formatDayMonth(chartAnchor), value: 8 },
]
