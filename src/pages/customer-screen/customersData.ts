import type { CustomerHistoryOrder } from '../../components/billing/CustomerHistoryModal'

export interface CustomerRow {
  id: string
  name: string
  phone: string
  email: string
  address: string
  locality: string
  dueAmount: number
  loyaltyPoints: number
  lastVisit: string
  orders: CustomerHistoryOrder[]
}

export function money(value: number) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const customersList: CustomerRow[] = [
  {
    id: 'c1',
    name: 'Pooja Shah',
    phone: '9876543210',
    email: 'pooja.shah@gmail.com',
    address: '12 Shivaji Nagar',
    locality: 'Dadar West',
    dueAmount: 0,
    loyaltyPoints: 120,
    lastVisit: '2026-08-10 19:22',
    orders: [
      {
        id: 'c1-o1',
        date: '10 Aug 2026',
        billNo: '882',
        amount: 460,
        items: ['Sev Puri', 'Dabeli'],
      },
      {
        id: 'c1-o2',
        date: '02 Aug 2026',
        billNo: '801',
        amount: 320,
        items: ['Raj Kachori'],
      },
    ],
  },
  {
    id: 'c2',
    name: 'Harsh Patel',
    phone: '9876501234',
    email: '',
    address: 'B-14, Station Road',
    locality: 'Dadar East',
    dueAmount: 250,
    loyaltyPoints: 40,
    lastVisit: '2026-08-11 13:05',
    orders: [
      {
        id: 'c2-o1',
        date: '11 Aug 2026',
        billNo: '890',
        amount: 250,
        items: ['Aloo Tikki Chaat'],
      },
    ],
  },
  {
    id: 'c3',
    name: 'Neha Mehta',
    phone: '9988776655',
    email: 'neha.m@gmail.com',
    address: '44 Linking Road',
    locality: 'Bandra',
    dueAmount: 0,
    loyaltyPoints: 210,
    lastVisit: '2026-08-09 21:14',
    orders: [
      {
        id: 'c3-o1',
        date: '09 Aug 2026',
        billNo: '870',
        amount: 705,
        items: ['Party Box - Dahi Puri', 'Papdi Chaat'],
      },
    ],
  },
  {
    id: 'c4',
    name: 'Ramesh Iyer',
    phone: '9123456780',
    email: '',
    address: '7 Mahim Causeway',
    locality: 'Mahim',
    dueAmount: 180,
    loyaltyPoints: 15,
    lastVisit: '2026-08-08 12:40',
    orders: [
      {
        id: 'c4-o1',
        date: '08 Aug 2026',
        billNo: '855',
        amount: 180,
        items: ['Dabeli'],
      },
    ],
  },
  {
    id: 'c5',
    name: 'Anita Sharma',
    phone: '9812345678',
    email: 'anita.s@yahoo.com',
    address: '19 Plaza Cinema Lane',
    locality: 'Dadar West',
    dueAmount: 0,
    loyaltyPoints: 80,
    lastVisit: '2026-08-12 18:30',
    orders: [
      {
        id: 'c5-o1',
        date: '12 Aug 2026',
        billNo: '901',
        amount: 540,
        items: ['Spring Roll', 'Tandoori Pasta'],
      },
    ],
  },
  {
    id: 'c6',
    name: 'Karan Joshi',
    phone: '9765432109',
    email: '',
    address: '3 Ground Floor, Matunga',
    locality: 'Matunga',
    dueAmount: 620,
    loyaltyPoints: 0,
    lastVisit: '2026-08-07 20:11',
    orders: [
      {
        id: 'c6-o1',
        date: '07 Aug 2026',
        billNo: '840',
        amount: 620,
        items: ['Party Box - Dahi Puri'],
      },
    ],
  },
]
