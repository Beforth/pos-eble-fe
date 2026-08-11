import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Trash2, Upload } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
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

function InfoHint({ title }: { title: string }) {
  return (
    <span title={title}>
      <Info size={13} className="text-muted" />
    </span>
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
  const [toast, setToast] = useState<string | null>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const totalPrints = rows.reduce((sum, row) => sum + row.prints, 0)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

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

  return (
    <InventoryPageShell activeItem="barcode-generation">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

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
          <OutlineButton onClick={() => showToast('Printer Settings')}>
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
                <th className="px-3 py-2.5">Raw Material</th>
                <th className="px-3 py-2.5">Number Of Prints</th>
                <th className="px-3 py-2.5">Raw Material Barcode</th>
                <th className="px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    No Record Found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
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
    </InventoryPageShell>
  )
}
