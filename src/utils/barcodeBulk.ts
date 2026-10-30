import { parseCsvLine } from '../components/inventory/stockCountShared'
import { downloadCsv } from './downloadFile'
import { MAX_BARCODES } from './barcodeLabels'

export const BULK_BARCODE_ACCEPT = '.csv,.xlsx,text/csv'
export const MAX_BULK_BYTES = 10 * 1024 * 1024

export interface BulkBarcodeRow {
  rowNumber: number
  rawMaterial: string
  prints: number
  barcode: string
  error: string | null
}

const NAME_HEADERS = [
  'raw_material_name',
  'raw_material',
  'rawmaterial',
  'material',
  'item',
  'name',
]
const PRINT_HEADERS = ['prints', 'number_of_prints', 'no_of_prints', 'labels', 'qty', 'quantity']
const BARCODE_HEADERS = ['barcode', 'raw_material_barcode', 'code']

function normaliseHeader(cell: string): string {
  return cell.toLowerCase().trim().replace(/[\s-]+/g, '_')
}

function cellText(cell: unknown): string {
  if (cell === null || cell === undefined) return ''
  if (cell instanceof Date) return cell.toISOString().slice(0, 10)
  return String(cell).trim()
}

/**
 * Map a header row plus data rows to bulk barcode rows. CSV and XLSX both go
 * through here so they accept the same headers and report the same errors.
 * Returns null when the sheet has no raw material column.
 */
function mapBulkRows(headerCells: unknown[], dataRows: unknown[][]): BulkBarcodeRow[] | null {
  const headers = headerCells.map((cell) => normaliseHeader(cellText(cell)))
  const nameAt = headers.findIndex((header) => NAME_HEADERS.includes(header))
  if (nameAt === -1) return null
  const printAt = headers.findIndex((header) => PRINT_HEADERS.includes(header))
  const barcodeAt = headers.findIndex((header) => BARCODE_HEADERS.includes(header))

  const result: BulkBarcodeRow[] = []
  dataRows.forEach((cells, offset) => {
    const name = cellText(cells[nameAt])
    const printsRaw = printAt === -1 ? '' : cellText(cells[printAt])
    const barcode = barcodeAt === -1 ? '' : cellText(cells[barcodeAt]).toUpperCase()
    if (!name && !printsRaw && !barcode) return // blank line

    const prints = printsRaw === '' ? 1 : Number(printsRaw)
    let error: string | null = null
    if (!name) error = 'Missing raw material name'
    else if (!Number.isInteger(prints) || prints < 1 || prints > MAX_BARCODES) {
      error = `Prints must be a whole number from 1 to ${MAX_BARCODES}`
    }

    result.push({
      rowNumber: offset + 2,
      rawMaterial: name,
      prints: Number.isFinite(prints) ? prints : 0,
      barcode,
      error,
    })
  })
  return result
}

/** Parse a .csv or .xlsx price sheet. Returns null when the header row is unusable. */
export async function parseBulkBarcodeFile(file: File): Promise<BulkBarcodeRow[] | null> {
  if (/\.xlsx$/i.test(file.name)) {
    // Loaded on demand so the Excel reader stays out of the main bundle.
    const { readSheet } = await import('read-excel-file/browser')
    const rows = await readSheet(file)
    if (rows.length < 2) return null
    return mapBulkRows(rows[0], rows.slice(1))
  }
  const lines = (await file.text())
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return null
  return mapBulkRows(
    parseCsvLine(lines[0]),
    lines.slice(1).map((line) => parseCsvLine(line)),
  )
}

export function downloadBulkBarcodeTemplate(materialNames: string[]): void {
  const sample = materialNames.length > 0 ? materialNames.slice(0, 50) : ['Milk']
  downloadCsv(
    ['raw_material_name', 'prints', 'barcode'],
    sample.map((name) => [name, '1', '']),
    'barcode-generation-sample.csv',
  )
}
