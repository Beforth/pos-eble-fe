export interface LiveOrderChannelRow {
  id: string
  label: string
  orders: number
  amount: number
  icon: 'dineIn' | 'pickup' | 'delivery' | 'prep' | 'waiting' | 'out'
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

export const runningOrders: LiveOrdersSummary = {
  totalOrders: 15,
  totalAmount: 2_325,
  rows: [
    { id: 'dine', label: 'Dine in', orders: 0, amount: 0, icon: 'dineIn' },
    { id: 'pickup', label: 'Pick up', orders: 11, amount: 1_165, icon: 'pickup' },
    { id: 'delivery', label: 'Delivery', orders: 4, amount: 1_160, icon: 'delivery' },
  ],
}

export const pendingOrders: LiveOrdersSummary = {
  totalOrders: 4,
  totalAmount: 1_160,
  rows: [
    {
      id: 'prep',
      label: 'In Preparation',
      orders: 2,
      amount: 680,
      icon: 'prep',
    },
    {
      id: 'waiting',
      label: 'Waiting For Pickup',
      orders: 2,
      amount: 480,
      icon: 'waiting',
    },
    {
      id: 'out',
      label: 'Out For Delivery',
      orders: 0,
      amount: 0,
      icon: 'out',
    },
  ],
}

export const runningTables: RunningTablesSummary = {
  activeTables: 0,
  revenueEstimated: 0,
}
