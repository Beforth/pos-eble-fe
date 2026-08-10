export interface BillingTable {
  id: string
  tableNo: string
  persons: number
  areaName: string
}

export const billingTables: BillingTable[] = [
  { id: 't1', tableNo: '1', persons: 2, areaName: 'Ground Floor' },
  { id: 't2', tableNo: '2', persons: 4, areaName: 'Ground Floor' },
  { id: 't3', tableNo: '3', persons: 4, areaName: 'Ground Floor' },
  { id: 't4', tableNo: '4', persons: 6, areaName: 'Ground Floor' },
  { id: 't5', tableNo: '5', persons: 2, areaName: 'First Floor' },
  { id: 't6', tableNo: '6', persons: 4, areaName: 'First Floor' },
]
