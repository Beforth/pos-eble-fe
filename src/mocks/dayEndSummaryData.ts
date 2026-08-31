export interface DayEndSummaryRow {
  id: string
  createdDate: string
  /** ISO date for filtering: YYYY-MM-DD */
  dateKey: string
  orders: number
  total: number
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatDisplayDate(year: number, monthIndex: number, day: number) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${pad(day)} ${months[monthIndex]} ${year}`
}

/** 30 mock day-end rows ending 11 Aug 2026 (matches POS-Eble sample). */
export const DAY_END_SUMMARY_ROWS: DayEndSummaryRow[] = (() => {
  const end = new Date(2026, 7, 11)
  const samples: Array<{ orders: number; total: number }> = [
    { orders: 416, total: 50862 },
    { orders: 434, total: 59575 },
    { orders: 533, total: 72119 },
    { orders: 407, total: 49857 },
    { orders: 389, total: 47210 },
    { orders: 451, total: 61240 },
    { orders: 398, total: 48560 },
    { orders: 472, total: 64890 },
    { orders: 425, total: 53120 },
    { orders: 410, total: 50240 },
    { orders: 468, total: 63980 },
    { orders: 392, total: 46850 },
    { orders: 445, total: 59870 },
    { orders: 418, total: 51430 },
    { orders: 401, total: 48920 },
    { orders: 456, total: 62150 },
    { orders: 378, total: 45210 },
    { orders: 429, total: 54890 },
    { orders: 463, total: 63540 },
    { orders: 395, total: 47820 },
    { orders: 441, total: 58670 },
    { orders: 412, total: 50980 },
    { orders: 487, total: 67240 },
    { orders: 404, total: 49150 },
    { orders: 438, total: 57480 },
    { orders: 421, total: 52890 },
    { orders: 459, total: 62810 },
    { orders: 386, total: 46120 },
    { orders: 447, total: 60350 },
    { orders: 415, total: 51680 },
  ]

  return samples.map((sample, index) => {
    const date = new Date(end)
    date.setDate(end.getDate() - index)
    const y = date.getFullYear()
    const m = date.getMonth()
    const d = date.getDate()
    return {
      id: `des-${y}${pad(m + 1)}${pad(d)}`,
      createdDate: formatDisplayDate(y, m, d),
      dateKey: `${y}-${pad(m + 1)}-${pad(d)}`,
      orders: sample.orders,
      total: sample.total,
    }
  })
})()
