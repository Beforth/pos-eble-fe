export const overviewKpis = {
  netSales: 48_260,
  bills: 126,
  avgTicket: 383,
  covers: 214,
  netSalesChange: 12,
  billsChange: 8,
  avgTicketChange: -3,
  coversChange: 15,
}

export const hourlySales = [
  { hour: '10a', sales: 820 },
  { hour: '11a', sales: 1_450 },
  { hour: '12p', sales: 4_820 },
  { hour: '1p', sales: 6_140 },
  { hour: '2p', sales: 5_280 },
  { hour: '3p', sales: 2_160 },
  { hour: '4p', sales: 1_890 },
  { hour: '5p', sales: 2_740 },
  { hour: '6p', sales: 4_560 },
  { hour: '7p', sales: 7_320 },
  { hour: '8p', sales: 6_980 },
  { hour: '9p', sales: 3_100 },
]

export const weeklySales = [
  { day: 'Mon', sales: 32_400, orders: 88 },
  { day: 'Tue', sales: 28_150, orders: 76 },
  { day: 'Wed', sales: 35_820, orders: 94 },
  { day: 'Thu', sales: 31_060, orders: 82 },
  { day: 'Fri', sales: 44_900, orders: 118 },
  { day: 'Sat', sales: 52_340, orders: 136 },
  { day: 'Sun', sales: 48_260, orders: 126 },
]

export const orderMix = [
  { name: 'Parcel', value: 22_180, orders: 58 },
  { name: 'Delivery', value: 16_420, orders: 41 },
  { name: 'Dine In', value: 9_660, orders: 27 },
]

export const topSellers = [
  { name: 'Veg Grill Sandwich', qty: 42, sales: 5_880 },
  { name: 'Dabeli Special', qty: 38, sales: 3_420 },
  { name: 'Masala Puri', qty: 31, sales: 2_790 },
  { name: 'Kathiyawadi Fafda', qty: 24, sales: 3_120 },
  { name: 'Cold Coffee', qty: 29, sales: 1_740 },
  { name: 'Sev Puri', qty: 22, sales: 1_980 },
]

export const liveFloor = {
  occupied: 9,
  billed: 3,
  free: 6,
  total: 18,
  tables: [
    { no: '1', status: 'occupied' as const },
    { no: '2', status: 'free' as const },
    { no: '3', status: 'occupied' as const },
    { no: '4', status: 'billed' as const },
    { no: '5', status: 'occupied' as const },
    { no: '6', status: 'free' as const },
    { no: '7', status: 'occupied' as const },
    { no: '8', status: 'occupied' as const },
    { no: '9', status: 'free' as const },
    { no: '10', status: 'billed' as const },
    { no: '11', status: 'occupied' as const },
    { no: '12', status: 'free' as const },
    { no: '13', status: 'occupied' as const },
    { no: '14', status: 'free' as const },
    { no: '15', status: 'occupied' as const },
    { no: '16', status: 'billed' as const },
    { no: '17', status: 'occupied' as const },
    { no: '18', status: 'free' as const },
  ],
}

export const paymentSplit = [
  { name: 'UPI', value: 21_400 },
  { name: 'Cash', value: 14_860 },
  { name: 'Card', value: 8_720 },
  { name: 'Due', value: 3_280 },
]

export const overviewSync = {
  posSyncedMinutesAgo: 2,
  ordersSyncedMinutesAgo: 6,
} as const
