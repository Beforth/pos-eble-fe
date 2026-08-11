/** @deprecated Live cover-size data is stored via `utils/coverSizeStore`. Kept for reference. */
export interface CoverSizeRow {
  label: string
  persons: number
  isTotal?: boolean
}

export const coverSizeReportRows: CoverSizeRow[] = [
  { label: 'Total', persons: 0, isTotal: true },
]

export const coverSizeReportGeneratedOn = ''
