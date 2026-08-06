import { brand } from '../theme/brand'

export type OnlineAggregator = 'All' | 'Zomato' | 'Swiggy'
export type OnlineOrderStatus =
  | 'Delivered'
  | 'Accepted'
  | 'Food Ready'
  | 'Dispatched'
  | 'Cancelled'

export interface OnlineOrderRow {
  id: string
  orderNo: string
  paymentLabel: string
  outletName: string
  aggregator: 'Zomato' | 'Swiggy'
  channelLabel: string
  orderType: string
  riderName: string
  riderPhone: string
  riderStatus: string
  customerName: string
  customerPhone?: string
  otp: string
  created: string
  received: string
  accepted: string
  updated: string
  total: number
  status: OnlineOrderStatus
  atCount: number
}

const outlet = brand.shopName

export const onlineOrdersList: OnlineOrderRow[] = [
  {
    id: '1',
    orderNo: '243759935121090',
    paymentLabel: 'Online Paid',
    outletName: outlet,
    aggregator: 'Swiggy',
    channelLabel: 'Toing by Swiggy',
    orderType: 'Delivery',
    riderName: 'DIPAK VITTHAL POTE',
    riderPhone: '8452874168',
    riderStatus: 'DELIVERED',
    customerName: 'Laxmi',
    otp: '3714',
    created: '23-07-2026 13:56:52',
    received: '23-07-2026 13:56:53',
    accepted: '23-07-2026 13:57:05',
    updated: '23-07-2026 14:26:57',
    total: 350,
    status: 'Delivered',
    atCount: 185,
  },
  {
    id: '2',
    orderNo: '243759911538022',
    paymentLabel: 'Online Paid',
    outletName: outlet,
    aggregator: 'Swiggy',
    channelLabel: 'Swiggy',
    orderType: 'Delivery',
    riderName: 'ARJUN MAHENDRA YADAV',
    riderPhone: '8452891023',
    riderStatus: 'DELIVERED',
    customerName: 'Ramesh',
    otp: '5821',
    created: '23-07-2026 13:42:10',
    received: '23-07-2026 13:42:11',
    accepted: '23-07-2026 13:42:28',
    updated: '23-07-2026 14:08:44',
    total: 428.5,
    status: 'Delivered',
    atCount: 162,
  },
  {
    id: '3',
    orderNo: '8382357204',
    paymentLabel: 'Online Paid',
    outletName: outlet,
    aggregator: 'Zomato',
    channelLabel: 'Zomato',
    orderType: 'Delivery',
    riderName: 'Hrishikesh Marathe',
    riderPhone: '9876543210',
    riderStatus: 'Delivered',
    customerName: 'Pradip Parmeshwar Ingale',
    customerPhone: '9123456780',
    otp: '9964',
    created: '23-07-2026 13:31:02',
    received: '23-07-2026 13:31:03',
    accepted: '23-07-2026 13:31:18',
    updated: '23-07-2026 13:58:40',
    total: 238.01,
    status: 'Delivered',
    atCount: 0,
  },
  {
    id: '4',
    orderNo: '8382355619',
    paymentLabel: 'Online Paid',
    outletName: outlet,
    aggregator: 'Zomato',
    channelLabel: 'Zomato',
    orderType: 'Delivery',
    riderName: 'Suresh Patil',
    riderPhone: '9988776655',
    riderStatus: 'Delivered',
    customerName: 'Neha Sharma',
    customerPhone: '9001122334',
    otp: '4412',
    created: '23-07-2026 13:18:44',
    received: '23-07-2026 13:18:45',
    accepted: '23-07-2026 13:19:02',
    updated: '23-07-2026 13:49:11',
    total: 512.0,
    status: 'Delivered',
    atCount: 3,
  },
  {
    id: '5',
    orderNo: '243759880441199',
    paymentLabel: 'Online Paid',
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
    status: 'Dispatched',
    atCount: 31,
  },
  {
    id: '6',
    orderNo: '8382354102',
    paymentLabel: 'Online Paid',
    outletName: outlet,
    aggregator: 'Zomato',
    channelLabel: 'Zomato',
    orderType: 'Delivery',
    riderName: 'Rahul Deshmukh',
    riderPhone: '9765432109',
    riderStatus: 'Food Ready',
    customerName: 'Priya Mehta',
    customerPhone: '9812345678',
    otp: '2208',
    created: '23-07-2026 14:10:05',
    received: '23-07-2026 14:10:06',
    accepted: '23-07-2026 14:10:22',
    updated: '23-07-2026 14:18:50',
    total: 365.75,
    status: 'Food Ready',
    atCount: 12,
  },
  {
    id: '7',
    orderNo: '243759850112334',
    paymentLabel: 'Cash on Delivery',
    outletName: outlet,
    aggregator: 'Swiggy',
    channelLabel: 'Swiggy',
    orderType: 'Delivery',
    riderName: 'SANTOSH BABURAO MORE',
    riderPhone: '8452765432',
    riderStatus: 'ACCEPTED',
    customerName: 'Kavita',
    otp: '1193',
    created: '23-07-2026 14:20:11',
    received: '23-07-2026 14:20:12',
    accepted: '23-07-2026 14:20:40',
    updated: '23-07-2026 14:20:40',
    total: 275.0,
    status: 'Accepted',
    atCount: 8,
  },
  {
    id: '8',
    orderNo: '8382353001',
    paymentLabel: 'Online Paid',
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
    status: 'Cancelled',
    atCount: 45,
  },
]
