export type TableFloorStatus =
  | 'blank'
  | 'printed'
  | 'paid'
  | 'running-kot'

export const TABLE_STATUS_LEGEND: {
  id: TableFloorStatus
  label: string
  swatch: string
}[] = [
  { id: 'blank', label: 'Blank Table', swatch: 'bg-[#e8e8e8] border border-dashed border-[#bdbdbd]' },
  { id: 'printed', label: 'Printed Table', swatch: 'bg-success' },
  { id: 'paid', label: 'Paid Table', swatch: 'bg-[#e8d5b7]' },
  {
    id: 'running-kot',
    label: 'Running KOT Table',
    swatch: 'bg-secondary',
  },
]

export function tableCardClass(status: TableFloorStatus): string {
  switch (status) {
    case 'printed':
      return 'border-success bg-success text-white'
    case 'paid':
      return 'border-[#c4a882] bg-[#e8d5b7] text-ink'
    case 'running-kot':
      return 'border-[#c9a82d] bg-secondary text-deep'
    case 'blank':
    default:
      return 'border-dashed border-[#bdbdbd] bg-[#ececec] text-ink'
  }
}
