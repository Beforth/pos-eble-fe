import type { PrinterJob, PrinterType } from '../services/outletService'

/** What a printer can be assigned to print, in the order the screen lists them. */
export const PRINTER_JOBS: PrinterJob[] = ['Bill', 'KOT', 'Report']

export const PRINTER_TYPE_LABEL: Record<PrinterType, string> = {
  general: 'General',
  ebill: 'eBill Printer',
}
