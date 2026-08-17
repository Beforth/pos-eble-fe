export interface FinanceKpi {
  id: string
  label: string
  value: number | null
  bills: number | null
  tone: 'total' | 'card' | 'wallet' | 'cash' | 'online' | 'due' | 'other'
}

export interface PaymentSlice {
  name: string
  value: number
  amount: number
  color: string
}

export interface MonthTrendPoint {
  month: string
  Card: number
  UPI: number
  Wallet: number
  Other: number
  Cash: number
  Online: number
  Due: number
}

export const FINANCE_KPIS: FinanceKpi[] = [
  { id: 'total', label: 'Total', value: 49857, bills: 407, tone: 'total' },
  { id: 'card-upi', label: 'Card/UPI', value: null, bills: null, tone: 'card' },
  { id: 'wallets', label: 'Wallets', value: null, bills: null, tone: 'wallet' },
  { id: 'cash', label: 'Cash', value: 13050, bills: 139, tone: 'cash' },
  { id: 'online', label: 'Online', value: 16372, bills: 62, tone: 'online' },
  { id: 'due', label: 'Due', value: null, bills: null, tone: 'due' },
  { id: 'others', label: 'Others', value: 20435, bills: 204, tone: 'other' },
]

export const PAYMENT_DISTRIBUTION: PaymentSlice[] = [
  { name: 'Other', value: 41, amount: 20435, color: '#9ca3af' },
  { name: 'Online', value: 32.8, amount: 16372, color: '#3b82f6' },
  { name: 'Cash', value: 26.2, amount: 13050, color: '#22c55e' },
]

export const MONTH_TRENDS: MonthTrendPoint[] = [
  {
    month: 'Feb 2026',
    Card: 120000,
    UPI: 80000,
    Wallet: 20000,
    Other: 150000,
    Cash: 180000,
    Online: 220000,
    Due: 10000,
  },
  {
    month: 'Mar 2026',
    Card: 140000,
    UPI: 95000,
    Wallet: 25000,
    Other: 170000,
    Cash: 200000,
    Online: 260000,
    Due: 12000,
  },
  {
    month: 'Apr 2026',
    Card: 110000,
    UPI: 88000,
    Wallet: 18000,
    Other: 160000,
    Cash: 190000,
    Online: 240000,
    Due: 8000,
  },
  {
    month: 'May 2026',
    Card: 160000,
    UPI: 110000,
    Wallet: 30000,
    Other: 190000,
    Cash: 210000,
    Online: 280000,
    Due: 15000,
  },
  {
    month: 'Jun 2026',
    Card: 150000,
    UPI: 105000,
    Wallet: 28000,
    Other: 185000,
    Cash: 205000,
    Online: 270000,
    Due: 14000,
  },
  {
    month: 'Jul 2026',
    Card: 170000,
    UPI: 120000,
    Wallet: 32000,
    Other: 200000,
    Cash: 220000,
    Online: 300000,
    Due: 16000,
  },
  {
    month: 'Aug 2026',
    Card: 72000,
    UPI: 52000,
    Wallet: 14000,
    Other: 86000,
    Cash: 94000,
    Online: 128000,
    Due: 7000,
  },
]

export const TREND_SERIES = [
  { key: 'Cash', color: '#16a34a' },
  { key: 'Online', color: '#2563eb' },
  { key: 'Other', color: '#6b7280' },
  { key: 'Card', color: '#d97706' },
  { key: 'UPI', color: '#7c3aed' },
  { key: 'Wallet', color: '#db2777' },
  { key: 'Due', color: '#ff0917' },
] as const

export const DEDUCTIONS = {
  charges: 0,
  tax: 2379.44,
  discount: 514,
  tips: 0,
}

export const CASH_SUMMARY = {
  opening: 0,
  totalBills: 13050,
  closing: 0,
  missing: 13050,
  billCount: 139,
  asOf: '11 Aug 2026',
}

export const CASH_WEEKLY = [
  { slot: '12am-6am', lastWeek: 0, currentWeek: 0 },
  { slot: '6am-12pm', lastWeek: 42000, currentWeek: 55000 },
  { slot: '12pm-6pm', lastWeek: 78000, currentWeek: 92000 },
  { slot: '6pm-12am', lastWeek: 18000, currentWeek: 22000 },
]

export const ONLINE_RECON = [
  {
    id: 'zomato',
    name: 'Zomato',
    outlets: 1,
    orders: 32,
    amount: 18450,
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    outlets: 1,
    orders: 24,
    amount: 14220,
  },
]
