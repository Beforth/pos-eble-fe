/** Shared label geometry, printer settings and text helpers for barcode printing. */

export const MAX_BARCODES = 500
export const PRINTER_SETTINGS_KEY = 'rajubhai.barcode.printerSettings'
/** CSS pixels per millimetre at 96 dpi. */
export const PX_PER_MM = 3.78

export interface PrinterSettings {
  printerName: string
  copies: string
  paperSize: string
}

export const PAPER_SIZE_OPTIONS = [
  'Label 36x24 mm (36 mm - Compact)',
  'Label 38x25 mm (1.5" x 1")',
  'Label 40x30 mm (Standard Jar / Box)',
  'Label 50x25 mm (2" x 1" - Standard Product)',
  'Label 50x30 mm (Container / Deli)',
  'Label 50x50 mm (2" x 2" - Square)',
  'Label 60x40 mm (Retail Pack)',
  'Label 75x50 mm (3" x 2" - Shelf Tag)',
  'Label 100x50 mm (4" x 2" - Outer Carton)',
  'Label 100x150 mm (4" x 6" - Shipping / Cargo)',
  'A4 Sheet (24 Labels/Sheet - 70x37 mm)',
  'A4 Sheet (30 Labels/Sheet - 70x29.7 mm)',
  'A4 Sheet (65 Labels/Sheet - 38.1x21.2 mm Micro)',
  'Letter Sheet (30 Labels/Sheet - Avery 5160)',
]

export const DEFAULT_PAPER_SIZE = 'Label 36x24 mm (36 mm - Compact)'

export const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  printerName: '',
  copies: '1',
  paperSize: DEFAULT_PAPER_SIZE,
}

export interface SheetLayout {
  labelWidthMm: number
  labelHeightMm: number
  columns: number
  rows: number
  pageSize: 'A4' | 'letter'
}

/**
 * Real grid for each sheet product. Every sheet option has its own label size
 * and count per page, so labels line up with the pre-cut sheet.
 */
const SHEET_LAYOUTS: Record<string, SheetLayout> = {
  'A4 Sheet (24 Labels/Sheet - 70x37 mm)': {
    labelWidthMm: 70,
    labelHeightMm: 37,
    columns: 3,
    rows: 8,
    pageSize: 'A4',
  },
  'A4 Sheet (30 Labels/Sheet - 70x29.7 mm)': {
    labelWidthMm: 70,
    labelHeightMm: 29.7,
    columns: 3,
    rows: 10,
    pageSize: 'A4',
  },
  'A4 Sheet (65 Labels/Sheet - 38.1x21.2 mm Micro)': {
    labelWidthMm: 38.1,
    labelHeightMm: 21.2,
    columns: 5,
    rows: 13,
    pageSize: 'A4',
  },
  'Letter Sheet (30 Labels/Sheet - Avery 5160)': {
    labelWidthMm: 66.7,
    labelHeightMm: 25.4,
    columns: 3,
    rows: 10,
    pageSize: 'letter',
  },
}

export interface LabelGeometry {
  widthMm: number
  heightMm: number
  sheet: SheetLayout | null
}

export function getLabelGeometry(paperSize: string): LabelGeometry {
  const sheet = SHEET_LAYOUTS[paperSize]
  if (sheet) {
    return { widthMm: sheet.labelWidthMm, heightMm: sheet.labelHeightMm, sheet }
  }
  const match = paperSize.match(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*mm/i)
  if (match) {
    return { widthMm: Number(match[1]), heightMm: Number(match[2]), sheet: null }
  }
  return { widthMm: 36, heightMm: 24, sheet: null }
}

export function normalizePaperSize(size?: string): string {
  if (!size) return DEFAULT_PAPER_SIZE
  if (PAPER_SIZE_OPTIONS.includes(size)) return size
  // Older saved values were shortened, e.g. "Label 36x24 mm", so match on contains.
  const found = PAPER_SIZE_OPTIONS.find((opt) =>
    opt.toLowerCase().includes(size.toLowerCase()),
  )
  return found ?? DEFAULT_PAPER_SIZE
}

export function normalizeCopies(value: unknown): string {
  const count = Math.floor(Number(value))
  return Number.isFinite(count) && count >= 1 ? String(count) : '1'
}

export function getCopies(settings: PrinterSettings): number {
  return Math.max(1, Math.floor(Number(settings.copies)) || 1)
}

export function loadPrinterSettings(): PrinterSettings {
  try {
    const raw = localStorage.getItem(PRINTER_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_PRINTER_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<PrinterSettings>
    return {
      printerName: parsed.printerName ?? '',
      copies: normalizeCopies(parsed.copies),
      paperSize: normalizePaperSize(parsed.paperSize),
    }
  } catch {
    return { ...DEFAULT_PRINTER_SETTINGS }
  }
}

export function savePrinterSettings(settings: PrinterSettings): void {
  try {
    localStorage.setItem(PRINTER_SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // quota exceeded or storage blocked
  }
}

/** Escape text before it is written into the print window's HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Font size in px for a configured field. Shared by print and the config preview. */
export function fieldFontPx(fontSize: string): number {
  return Math.max(9, Math.round(Number(fontSize) * 2.2))
}

/** Height of the barcode bars in px for a label of the given height. */
export function barcodeHeightPx(heightMm: number): number {
  return Math.max(24, Math.min(45, Math.round(heightMm * 1.1)))
}
