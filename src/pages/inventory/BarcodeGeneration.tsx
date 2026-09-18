import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { Info, Trash2, Upload, X } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'

interface BarcodeRow {
  id: string
  rawMaterial: string
  prints: number
  barcode: string
}

interface PrinterSettings {
  printerName: string
  copies: string
  paperSize: string
}

const RAW_MATERIALS = [
  { name: 'Tomatoes', barcode: 'RM-TOM-001' },
  { name: 'Onion', barcode: 'RM-ONI-002' },
  { name: 'Paneer', barcode: 'RM-PAN-003' },
  { name: 'Milk', barcode: 'RM-MLK-004' },
  { name: 'Butter', barcode: 'RM-BUT-005' },
  { name: 'Flour', barcode: 'RM-FLR-006' },
  { name: 'Dabeli Masala Mix', barcode: 'RM-DMM-007' },
]

const MAX_BARCODES = 500
const PRINTER_SETTINGS_KEY = 'rajubhai.barcode.printerSettings'
const PAPER_SIZE_OPTIONS = ['A4', 'Label 50x25', 'Label 40x30', 'Letter']

const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  printerName: '',
  copies: '1',
  paperSize: 'Label 50x25',
}

function loadPrinterSettings(): PrinterSettings {
  try {
    const raw = localStorage.getItem(PRINTER_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_PRINTER_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<PrinterSettings>
    return {
      printerName: parsed.printerName ?? DEFAULT_PRINTER_SETTINGS.printerName,
      copies: parsed.copies ?? DEFAULT_PRINTER_SETTINGS.copies,
      paperSize: parsed.paperSize ?? DEFAULT_PRINTER_SETTINGS.paperSize,
    }
  } catch {
    return { ...DEFAULT_PRINTER_SETTINGS }
  }
}

function InfoHint({ title }: { title: string }) {
  return (
    <span title={title}>
      <Info size={13} className="text-muted" />
    </span>
  )
}

function PrinterSettingsModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean
  initial: PrinterSettings
  onClose: () => void
  onSave: (settings: PrinterSettings) => void
}) {
  const titleId = useId()
  const [printerName, setPrinterName] = useState(initial.printerName)
  const [copies, setCopies] = useState(initial.copies)
  const [paperSize, setPaperSize] = useState(initial.paperSize)

  useEffect(() => {
    if (!open) return
    setPrinterName(initial.printerName)
    setCopies(initial.copies)
    setPaperSize(initial.paperSize)
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-line bg-card shadow-xl [background-color:var(--color-card)]"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Printer Settings
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded p-1 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Printer name
            </label>
            <input
              type="text"
              value={printerName}
              onChange={(event) => setPrinterName(event.target.value)}
              placeholder="e.g. Barcode Label Printer"
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Copies
            </label>
            <input
              type="number"
              min={1}
              value={copies}
              onChange={(event) => setCopies(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <SearchableSelect
              label="Paper size"
              value={paperSize}
              options={PAPER_SIZE_OPTIONS}
              placeholder="Label 50x25"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setPaperSize}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
          <OutlineButton variant="gray" onClick={onClose}>
            Close
          </OutlineButton>
          <PrimaryButton
            onClick={() => {
              const nextCopies = Number(copies)
              if (!Number.isFinite(nextCopies) || nextCopies < 1) {
                showToast('Copies must be at least 1')
                return
              }
              onSave({
                printerName: printerName.trim(),
                copies: String(Math.floor(nextCopies)),
                paperSize,
              })
            }}
          >
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function BarcodeGeneration() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [bulkUpload, setBulkUpload] = useState(false)
  const [rawMaterial, setRawMaterial] = useState('')
  const [prints, setPrints] = useState('1')
  const [barcode, setBarcode] = useState('')
  const [rows, setRows] = useState<BarcodeRow[]>([])
  const [error, setError] = useState('')
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [printerSettingsOpen, setPrinterSettingsOpen] = useState(false)
  const [printerSettings, setPrinterSettings] = useState(loadPrinterSettings)

  const totalPrints = rows.reduce((sum, row) => sum + row.prints, 0)

  const { sortKey, sortDir, toggleSort, visible } = useListQuery(
    rows,
    (row) => [row.rawMaterial, row.prints, row.barcode],
    (row, key) => {
      if (key === 'prints') return row.prints
      if (key === 'barcode') return row.barcode
      return row.rawMaterial
    },
  )

  function showAlert(message: string) {
    setAlertMessage(message)
    setAlertOpen(true)
  }

  function handleAdd() {
    if (!rawMaterial) {
      setError('Please select a raw material')
      return
    }
    const count = Number(prints)
    if (!prints.trim() || !Number.isFinite(count) || count < 1) {
      setError('Number of prints must be at least 1')
      return
    }
    if (!barcode.trim()) {
      setError('Raw material barcode is required')
      return
    }
    if (totalPrints + count > MAX_BARCODES) {
      setError(`A maximum of ${MAX_BARCODES} barcodes can be generated at once.`)
      return
    }
    setError('')
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random()}`,
        rawMaterial,
        prints: count,
        barcode: barcode.trim(),
      },
    ])
    setRawMaterial('')
    setPrints('1')
    setBarcode('')
    showToast('Raw material added')
  }

  function handleClearAll() {
    if (rows.length === 0) {
      showAlert('No record found.')
      return
    }
    setRows([])
    showToast('Cleared all')
  }

  function handleGenerate() {
    if (rows.length === 0) {
      showAlert('No record found.')
      return
    }
    if (totalPrints > MAX_BARCODES) {
      showAlert(
        `A maximum of ${MAX_BARCODES} barcodes can be generated at once.`,
      )
      return
    }
    showToast('Generating PDF for print…')
  }

  function handleBulkFile(file: File | null) {
    if (!file) return
    showToast(`Uploaded ${file.name}`)
  }

  function handleSavePrinterSettings(settings: PrinterSettings) {
    localStorage.setItem(PRINTER_SETTINGS_KEY, JSON.stringify(settings))
    setPrinterSettings(settings)
    setPrinterSettingsOpen(false)
    showToast('Printer settings saved')
  }

  return (
    <InventoryPageShell activeItem="barcode-generation">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Barcode Generation</h1>
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton
            onClick={() =>
              navigate('/inventory/barcode-generation/configuration')
            }
          >
            Barcode Configuration
          </OutlineButton>
          <OutlineButton onClick={() => setPrinterSettingsOpen(true)}>
            Printer Settings
          </OutlineButton>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-line bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">
            Select Raw Materials
          </h2>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                bulkUpload ? 'bg-primary' : 'bg-line'
              }`}
            >
              <input
                type="checkbox"
                checked={bulkUpload}
                onChange={(event) => setBulkUpload(event.target.checked)}
                className="sr-only"
              />
              <span
                className={`absolute left-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                  bulkUpload ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </span>
            Bulk Upload
          </label>
        </div>

        {bulkUpload ? (
          <div className="rounded-lg border border-dashed border-line bg-page/60 px-4 py-8 text-center">
            <Upload size={28} className="mx-auto text-muted" />
            <p className="mt-2 text-sm font-medium text-ink">
              Upload Excel file for bulk barcode generation
            </p>
            <p className="mt-1 text-xs text-muted">
              Supported format: .xlsx, .xls, .csv
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(event) => {
                handleBulkFile(event.target.files?.[0] ?? null)
                event.target.value = ''
              }}
            />
            <div className="mt-4 flex justify-center">
              <OutlineButton onClick={() => fileInputRef.current?.click()}>
                Choose File
              </OutlineButton>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-3">
              <SearchableSelect
                label={
                  <>
                    Raw Material
                    <InfoHint title="Select the raw material for barcode printing" />
                  </>
                }
                required
                value={rawMaterial}
                options={RAW_MATERIALS.map((m) => m.name)}
                placeholder="Select Raw Material"
                searchPlaceholder="Search"
                includePlaceholderOption={false}
                onChange={(value) => {
                  setRawMaterial(value)
                  const material = RAW_MATERIALS.find((m) => m.name === value)
                  if (material) setBarcode(material.barcode)
                }}
              />
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink">
                  Number of prints
                  <span className="text-primary">*</span>
                  <InfoHint title="How many barcode labels to print for this material" />
                </label>
                <input
                  type="number"
                  min={1}
                  max={MAX_BARCODES}
                  value={prints}
                  onChange={(event) => setPrints(event.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink">
                  Raw Material Barcode
                  <span className="text-primary">*</span>
                  <InfoHint title="Barcode value printed on the label" />
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {error ? <p className="mt-3 text-xs text-primary">{error}</p> : null}

            <div className="mt-4 flex justify-end">
              <OutlineButton onClick={handleAdd}>Add</OutlineButton>
            </div>
          </>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-line bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">
            Selected Raw Material Summary
          </h2>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
              <tr>
                <SortableTh
                  columnKey="rawMaterial"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Raw Material
                </SortableTh>
                <SortableTh
                  columnKey="prints"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Number Of Prints
                </SortableTh>
                <SortableTh
                  columnKey="barcode"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Raw Material Barcode
                </SortableTh>
                <th className="px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    No Record Found
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-3 py-2.5 text-ink">{row.rawMaterial}</td>
                    <td className="px-3 py-2.5 text-ink">{row.prints}</td>
                    <td className="px-3 py-2.5 text-ink">{row.barcode}</td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        aria-label="Remove row"
                        onClick={() =>
                          setRows((prev) =>
                            prev.filter((item) => item.id !== row.id),
                          )
                        }
                        className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-sm text-muted">
          A maximum of {MAX_BARCODES} barcodes can be generated at once.
        </p>
        <PrimaryButton onClick={handleGenerate}>
          Generate PDF For Print
        </PrimaryButton>
      </div>

      <SelectRecordAlert
        open={alertOpen}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />

      <PrinterSettingsModal
        open={printerSettingsOpen}
        initial={printerSettings}
        onClose={() => setPrinterSettingsOpen(false)}
        onSave={handleSavePrinterSettings}
      />
    </InventoryPageShell>
  )
}
