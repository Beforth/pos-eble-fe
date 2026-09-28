/** Shared shapes and helpers for the manual stock-count pages (available / closing). */

export type { StockCountKind } from '../../services/inventoryService'
import type { StockCountKind } from '../../services/inventoryService'

export const STOCK_COUNT_COPY: Record<
  StockCountKind,
  {
    title: string
    entityLabel: string
    addTab: string
    activeItem: 'available-stock' | 'closing-stock'
    draftKey: string
    guideTitle: string
    exportLabel: string
    rightLabel: string
  }
> = {
  available: {
    title: 'Available Stock',
    entityLabel: 'available stock',
    addTab: 'Add Available Stock',
    activeItem: 'available-stock',
    draftKey: 'availableStock',
    guideTitle: 'Available stock guide',
    exportLabel: 'Available stock CSV',
    rightLabel: '"Manual stock (available stock) [inventory]"',
  },
  closing: {
    title: 'Closing Stock',
    entityLabel: 'closing stock',
    addTab: 'Add Closing Stock',
    activeItem: 'closing-stock',
    draftKey: 'closingStock',
    guideTitle: 'Closing stock guide',
    exportLabel: 'Closing stock CSV',
    rightLabel: '"Manual stock (closing stock) [inventory]"',
  },
}

export interface ImportedStockRow {
  raw_material_name: string
  qty: string
  notes: string
}

export interface ImportStockRowResult extends ImportedStockRow {
  rowNumber: number
  matched: boolean
  error: string | null
}

const NAME_HEADERS = [
  'raw_material_name',
  'rawmaterial',
  'material',
  'item',
  'item_name',
  'name',
]
const QTY_HEADERS = [
  'qty',
  'quantity',
  'counted_qty',
  'stock',
  'new_stock',
  'closing_stock',
]
const NOTE_HEADERS = ['notes', 'note', 'reason', 'remark', 'remarks']

/** Split one CSV line, honouring quoted cells and escaped quotes. */
export function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (quoted) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        current += char
      }
      continue
    }
    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells.map((cell) => cell.trim())
}

function normaliseHeader(cell: string): string {
  return cell.toLowerCase().replace(/[\s-]+/g, '_')
}

function parseQty(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '').trim()
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function cellText(cell: unknown): string {
  if (cell === null || cell === undefined) return ''
  // Excel dates are cells, but the count sheet is date-free; keep any stray
  // date-ish cell readable instead of printing "[object Date]".
  if (cell instanceof Date) return cell.toISOString().slice(0, 10)
  return String(cell).trim()
}

/**
 * Map a header row plus data rows to count-sheet rows. Both the CSV and the
 * XLSX reader funnel through here so the two formats accept exactly the same
 * headers and produce exactly the same errors.
 */
function mapSheetRows(
  headerCells: unknown[],
  dataRows: unknown[][],
): ImportStockRowResult[] | null {
  const headers = headerCells.map((cell) => normaliseHeader(cellText(cell)))
  const nameAt = headers.findIndex((header) => NAME_HEADERS.includes(header))
  const qtyAt = headers.findIndex((header) => QTY_HEADERS.includes(header))
  if (nameAt === -1 || qtyAt === -1) return null
  const noteAt = headers.findIndex((header) => NOTE_HEADERS.includes(header))

  return dataRows.map((cells, offset) => {
    const name = cellText(cells[nameAt])
    const rawQty = cellText(cells[qtyAt])
    const notes = noteAt === -1 ? '' : cellText(cells[noteAt])
    const qty = parseQty(rawQty)

    let error: string | null = null
    if (!name) error = 'Missing raw material name'
    else if (qty === null) error = 'Quantity is not a number'
    else if (qty <= 0) error = 'Quantity must be greater than zero'

    return {
      rowNumber: offset + 2,
      raw_material_name: name,
      qty: qty === null ? rawQty : String(qty),
      notes,
      matched: false,
      error,
    }
  })
}

/**
 * Parse a CSV count sheet into rows. Returns `null` when the file is not a
 * usable count sheet (no material column or no quantity column).
 */
export function parseStockCsv(text: string): ImportStockRowResult[] | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return null
  return mapSheetRows(
    parseCsvLine(lines[0]),
    lines.slice(1).map((line) => parseCsvLine(line)),
  )
}

/**
 * Parse a real `.xlsx` workbook, first sheet only. `read-excel-file` is loaded
 * on demand so the ~100KB reader never lands in the main bundle.
 */
export async function parseStockXlsx(file: File): Promise<ImportStockRowResult[] | null> {
  const { readSheet } = await import('read-excel-file/browser')
  const rows = await readSheet(file)
  if (rows.length < 2) return null
  return mapSheetRows(rows[0], rows.slice(1))
}

/** Dispatch on file extension. Returns `null` for an unusable sheet. */
export async function parseStockFile(file: File): Promise<ImportStockRowResult[] | null> {
  if (/\.xlsx$/i.test(file.name)) return parseStockXlsx(file)
  return parseStockCsv(await file.text())
}

export const STOCK_SHEET_ACCEPT = '.csv,.xlsx,text/csv'
