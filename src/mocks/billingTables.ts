export interface BillingTable {
  id: string
  tableNo: string
  persons: number
  areaName: string
}

export type TableFloorStatus =
  | 'blank'
  | 'running'
  | 'printed'
  | 'paid'
  | 'running-kot'

export const billingTables: BillingTable[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `gf-${i + 1}`,
    tableNo: String(i + 1),
    persons: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
    areaName: 'Ground Floor',
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `bs-${i + 11}`,
    tableNo: String(i + 11),
    persons: i % 2 === 0 ? 4 : 2,
    areaName: 'BASEMENT',
  })),
  {
    id: 'ph-1',
    tableNo: 'Hall 1',
    persons: 20,
    areaName: 'Party Hall',
  },
  {
    id: 'ph-2',
    tableNo: 'Hall 2',
    persons: 20,
    areaName: 'Party Hall',
  },
]

export const TABLE_STATUS_LEGEND: {
  id: TableFloorStatus
  label: string
  swatch: string
}[] = [
  { id: 'blank', label: 'Blank Table', swatch: 'bg-[#e8e8e8] border border-dashed border-[#bdbdbd]' },
  { id: 'running', label: 'Running Table', swatch: 'bg-sky-300' },
  { id: 'printed', label: 'Printed Table', swatch: 'bg-success' },
  { id: 'paid', label: 'Paid Table', swatch: 'bg-[#e8d5b7]' },
  {
    id: 'running-kot',
    label: 'Running KOT Table',
    swatch: 'bg-primary',
  },
]

export function tableCardClass(status: TableFloorStatus): string {
  switch (status) {
    case 'running':
      return 'border-sky-400 bg-sky-200 text-ink'
    case 'printed':
      return 'border-success bg-success/80 text-white'
    case 'paid':
      return 'border-[#c4a882] bg-[#e8d5b7] text-ink'
    case 'running-kot':
      return 'border-primary bg-primary text-white'
    case 'blank':
    default:
      return 'border-dashed border-[#bdbdbd] bg-[#ececec] text-ink'
  }
}
