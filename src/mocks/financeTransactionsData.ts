export type TransactionTab =
  | 'all'
  | 'cash'
  | 'card-upi'
  | 'wallet'
  | 'online'

export interface FinanceTransaction {
  id: string
  billNo: string
  orderType: string
  subOrderType: string
  paymentType: string
  tax: number
  discount: number
  total: number
  tip: number
  status: string
  createdOn: string
  orderDate?: string
  serviceProvider?: string
}

export const FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: '1',
    billNo: '56954',
    orderType: 'Delivery',
    subOrderType: 'Home Delivery',
    paymentType: 'Cash',
    tax: 0,
    discount: 0,
    total: 70,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 20:14:02',
  },
  {
    id: '2',
    billNo: '56953',
    orderType: 'Take Away',
    subOrderType: 'Parcel',
    paymentType: 'Other (UPI)',
    tax: 8.58,
    discount: 0,
    total: 188.58,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 20:11:40',
  },
  {
    id: '3',
    billNo: '56952',
    orderType: 'Delivery',
    subOrderType: 'Home Delivery',
    paymentType: 'Cash',
    tax: 0,
    discount: 0,
    total: 140,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 20:05:18',
  },
  {
    id: '4',
    billNo: '56951',
    orderType: 'Take Away',
    subOrderType: 'Parcel',
    paymentType: 'Cash',
    tax: 5.72,
    discount: 0,
    total: 125.72,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 19:58:33',
  },
  {
    id: '5',
    billNo: '56950',
    orderType: 'Delivery',
    subOrderType: 'Home Delivery',
    paymentType: 'Other (UPI)',
    tax: 0,
    discount: 10,
    total: 190,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 19:42:11',
  },
  {
    id: '6',
    billNo: '56949',
    orderType: 'Take Away',
    subOrderType: 'Parcel',
    paymentType: 'Cash',
    tax: 0,
    discount: 0,
    total: 95,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 19:30:05',
  },
  {
    id: '7',
    billNo: '56948',
    orderType: 'Delivery',
    subOrderType: 'Swiggy',
    paymentType: 'Online',
    tax: 12.4,
    discount: 20,
    total: 272.4,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 19:18:44',
    serviceProvider: '',
  },
  {
    id: '8',
    billNo: '56947',
    orderType: 'Delivery',
    subOrderType: 'Home Delivery',
    paymentType: 'Cash',
    tax: 0,
    discount: 0,
    total: 160,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 19:02:19',
  },
  {
    id: '9',
    billNo: '56946',
    orderType: 'Take Away',
    subOrderType: 'Parcel',
    paymentType: 'Other (UPI)',
    tax: 4.28,
    discount: 0,
    total: 94.28,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 18:51:07',
  },
  {
    id: '10',
    billNo: '56945',
    orderType: 'Delivery',
    subOrderType: 'Zomato',
    paymentType: 'Online',
    tax: 18.6,
    discount: 30,
    total: 408.6,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 18:40:22',
    serviceProvider: '',
  },
  {
    id: '11',
    billNo: '56944',
    orderType: 'Take Away',
    subOrderType: 'Parcel',
    paymentType: 'Cash',
    tax: 0,
    discount: 0,
    total: 85,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 18:22:55',
  },
  {
    id: '12',
    billNo: '56943',
    orderType: 'Delivery',
    subOrderType: 'Swiggy',
    paymentType: 'Online',
    tax: 9.52,
    discount: 15,
    total: 209.52,
    tip: 0,
    status: 'Success',
    createdOn: '11 Aug 2026',
    orderDate: '11 Aug 2026 18:10:13',
    serviceProvider: '',
  },
]

export const TRANSACTION_TOTALS: Record<TransactionTab, number> = {
  all: 6590,
  cash: 2136,
  'card-upi': 0,
  wallet: 0,
  online: 953,
}
