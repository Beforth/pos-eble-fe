import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Download, Info, Trash2, Upload, X } from 'lucide-react'

import { showToast } from '../../utils/toast'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'

import { useAuth } from '../../auth/AuthContext'
import { listAllRawMaterialsApi } from '../../services/inventoryService'

import {
  DraftRecoveryBanner,
  useInventoryFormDraft,
} from '../../components/inventory/InventoryStockAssist'
import { loadBarcodeConfig } from '../../utils/barcodeConfig'
import {
  CODE39_HINT,
  isValidCode39,
  normalizeCode39,
} from '../../utils/barcodeSvg'
import {
  MAX_BARCODES,
  PAPER_SIZE_OPTIONS,
  getCopies,
  loadPrinterSettings,
  savePrinterSettings,
  type PrinterSettings,
} from '../../utils/barcodeLabels'
import {
  BULK_BARCODE_ACCEPT,
  MAX_BULK_BYTES,
  downloadBulkBarcodeTemplate,
  parseBulkBarcodeFile,
  type BulkBarcodeRow,
} from '../../utils/barcodeBulk'
import { buildBarcodeDocument } from '../../utils/barcodeDocument'

interface BarcodeRow {
  id: string
  rawMaterial: string
  prints: number
  barcode: string
}

interface MaterialOption {
  name: string
  barcode: string
}

const MAX_BULK_ERRORS_SHOWN = 8

function InfoHint({ title }: { title: string }) {
  return (
    <span title={title}>
      <Info size={13} className="text-muted" />
    </span>
  )
}

/** Adds a print row, or merges prints into an existing row for the same material. */
function upsertRow(
  list: BarcodeRow[],
  item: { rawMaterial: string; prints: number; barcode: string },
): BarcodeRow[] {
  const index = list.findIndex((row) => row.rawMaterial === item.rawMaterial)
  if (index === -1) {
    return [
      ...list,
      { id: `row-${Date.now()}-${Math.random()}`, ...item },
    ]
  }
  const next = [...list]
  next[index] = {
    ...next[index],
    prints: next[index].prints + item.prints,
    barcode: item.barcode,
  }
  return next
}

/** Text cell that commits on blur or Enter and reverts if onCommit returns false. */
function InlineEditInput({
  value,
  onCommit,
  ariaLabel,
  type = 'text',
  invalid = false,
  widthClass = 'w-full',
  min,
  max,
}: {
  value: string | number
  onCommit: (text: string) => boolean
  ariaLabel: string
  type?: 'text' | 'number'
  invalid?: boolean
  widthClass?: string
  min?: number
  max?: number
}) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText(String(value))
  }, [value])

  function commit() {
    if (!onCommit(text)) setText(String(value))
  }

  return (
    <input
      type={type}
      aria-label={ariaLabel}
      value={text}
      min={min}
      max={max}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
      className={`h-9 ${widthClass} rounded-md border bg-card px-2 text-sm outline-none focus:border-primary ${
        invalid ? 'border-primary text-primary' : 'border-line'
      }`}
    />
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
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
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

  function save() {
    const nextCopies = Number(copies)
    if (!Number.isInteger(nextCopies) || nextCopies < 1) {
      showToast('Copies must be a whole number, at least 1')
      return
    }
    onSave({
      printerName: printerName.trim(),
      copies: String(nextCopies),
      paperSize,
    })
  }

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
              Copies per label
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
              placeholder="Label 36x24 mm (36 mm)"
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
          <PrimaryButton onClick={save}>Save</PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function BarcodeGeneration() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [bulkUpload, setBulkUpload] = useState(false)
  const [bulkDragging, setBulkDragging] = useState(false)
  const [bulkFileName, setBulkFileName] = useState<string | null>(null)
  const [bulkErrors, setBulkErrors] = useState<string[]>([])
  const [rawMaterial, setRawMaterial] = useState('')
  const [prints, setPrints] = useState('1')
  const [barcode, setBarcode] = useState('')
  const [materials, setMaterials] = useState<MaterialOption[]>([])
  const [rows, setRows] = useState<BarcodeRow[]>([])
  const [error, setError] = useState('')
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [printerSettingsOpen, setPrinterSettingsOpen] = useState(false)
  const [printerSettings, setPrinterSettings] = useState(loadPrinterSettings)

  const draft = useInventoryFormDraft(
    `rajubhai.inventory.barcode-generation.${encryptedOutletId ?? 'unknown'}`,
    { rows, bulkUpload },
    (saved) => {
      if (Array.isArray(saved.rows) && saved.rows.length > 0) {
        setRows(saved.rows)
      }
      if (typeof saved.bulkUpload === 'boolean') {
        setBulkUpload(saved.bulkUpload)
      }
    },
  )

  useEffect(() => {
    if (!encryptedOutletId) return
    listAllRawMaterialsApi(encryptedOutletId)
      .then((data) => {
        setMaterials(
          data.map((rm, idx) => ({
            name: rm.name,
            barcode: rm.barcode || `RM-${String(idx + 1).padStart(4, '0')}`,
          })),
        )
      })
      .catch(() => {})
  }, [encryptedOutletId])

  const copies = getCopies(printerSettings)
  const totalPrints = rows.reduce((sum, row) => sum + row.prints, 0)
  const totalLabels = totalPrints * copies
  const invalidRows = rows.filter((row) => !isValidCode39(row.barcode))

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

  function updateRow(id: string, patch: Partial<BarcodeRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function handleAdd() {
    if (!rawMaterial) {
      setError('Please select a raw material')
      return
    }
    const count = Number(prints)
    if (!prints.trim() || !Number.isInteger(count) || count < 1) {
      setError('Number of prints must be a whole number, at least 1')
      return
    }
    const code = normalizeCode39(barcode)
    if (!code) {
      setError('Raw material barcode is required')
      return
    }
    if (!isValidCode39(code)) {
      setError(`This barcode cannot be printed. ${CODE39_HINT}.`)
      return
    }
    if (totalPrints + count > MAX_BARCODES) {
      setError(`A maximum of ${MAX_BARCODES} prints can be queued at once.`)
      return
    }
    setError('')

    const existing = rows.find((r) => r.rawMaterial === rawMaterial)
    setRows((prev) => upsertRow(prev, { rawMaterial, prints: count, barcode: code }))
    showToast(
      existing
        ? `Updated print count for "${rawMaterial}" to ${existing.prints + count}`
        : 'Raw material added to print queue',
    )

    setRawMaterial('')
    setPrints('1')
    setBarcode('')
  }

  function handleEnterToAdd(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAdd()
    }
  }

  function handleClearAll() {
    if (rows.length === 0) {
      showAlert('No record found.')
      return
    }
    setRows([])
    setBulkErrors([])
    draft.clearDraft()
    showToast('Cleared all')
  }

  function openLabels(autoPrint: boolean) {
    if (rows.length === 0) {
      showAlert('No record found.')
      return
    }
    if (invalidRows.length > 0) {
      showAlert(
        `Fix the barcode for ${invalidRows.map((row) => row.rawMaterial).join(', ')} first. ${CODE39_HINT}.`,
      )
      return
    }
    if (totalLabels > MAX_BARCODES) {
      showAlert(
        `A maximum of ${MAX_BARCODES} labels can be generated at once. You have ${totalLabels} (prints × copies).`,
      )
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups to view printable PDF.')
      return
    }
    printWindow.document.write(
      buildBarcodeDocument({
        rows,
        settings: printerSettings,
        config: loadBarcodeConfig(),
        copies,
        autoPrint,
      }),
    )
    printWindow.document.close()
    showToast(autoPrint ? 'Opened printable barcodes window' : 'Opened label preview')
  }

  function handlePageKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      openLabels(true)
    }
  }

  async function handleBulkFile(file: File | undefined) {
    if (!file) return
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      setBulkErrors([
        'Please upload a .csv or .xlsx file. For .xls, use "Save As" .xlsx in Excel first.',
      ])
      showToast('Please upload a .csv or .xlsx file')
      return
    }
    if (file.size > MAX_BULK_BYTES) {
      setBulkErrors(['File must be 10MB or smaller.'])
      showToast('File must be 10MB or smaller')
      return
    }

    setBulkErrors([])
    setBulkFileName(file.name)
    let parsed: BulkBarcodeRow[] | null
    try {
      parsed = await parseBulkBarcodeFile(file)
    } catch {
      parsed = null
    }
    if (!parsed) {
      setBulkErrors([
        'Could not read this sheet. It needs a header row with raw_material_name and prints (barcode is optional).',
      ])
      showToast('Could not read this sheet')
      return
    }

    const materialByName = new Map(
      materials.map((material) => [material.name.toLowerCase(), material]),
    )
    const errors: string[] = []
    let next = rows
    let runningTotal = totalPrints
    let added = 0

    for (const row of parsed) {
      if (row.error) {
        errors.push(`Row ${row.rowNumber}: ${row.error}`)
        continue
      }
      const material = materialByName.get(row.rawMaterial.toLowerCase())
      if (!material) {
        errors.push(`Row ${row.rowNumber}: "${row.rawMaterial}" is not a known raw material`)
        continue
      }
      const code = normalizeCode39(row.barcode || material.barcode)
      if (!isValidCode39(code)) {
        errors.push(`Row ${row.rowNumber}: barcode "${code}" cannot be printed. ${CODE39_HINT}.`)
        continue
      }
      if (runningTotal + row.prints > MAX_BARCODES) {
        errors.push(`Row ${row.rowNumber}: skipped, the ${MAX_BARCODES} print limit would be exceeded`)
        continue
      }
      runningTotal += row.prints
      next = upsertRow(next, {
        rawMaterial: material.name,
        prints: row.prints,
        barcode: code,
      })
      added += 1
    }

    setRows(next)
    setBulkErrors(errors)
    showToast(added > 0 ? `Added ${added} row(s) from ${file.name}` : 'No rows were added')
  }

  function handleSavePrinterSettings(settings: PrinterSettings) {
    savePrinterSettings(settings)
    setPrinterSettings(settings)
    setPrinterSettingsOpen(false)
    showToast('Printer settings saved')
  }

  const shownBulkErrors = bulkErrors.slice(0, MAX_BULK_ERRORS_SHOWN)

  return (
    <InventoryPageShell activeItem="barcode-generation">
      <DraftRecoveryBanner
        visible={draft.hasDraft}
        onRestore={draft.restoreDraft}
        onDiscard={draft.discardDraft}
      />
      <div onKeyDown={handlePageKeyDown}>
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
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setBulkDragging(true)
              }}
              onDragLeave={() => setBulkDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setBulkDragging(false)
                void handleBulkFile(event.dataTransfer.files[0])
              }}
              className={`rounded-lg border border-dashed px-4 py-8 text-center ${
                bulkDragging ? 'border-primary bg-primary/5' : 'border-line bg-page/60'
              }`}
            >
              <Upload size={28} className="mx-auto text-muted" />
              <p className="mt-2 text-sm font-medium text-ink">
                {bulkFileName ?? 'Upload Excel or CSV file for bulk barcode generation'}
              </p>
              <p className="mt-1 text-xs text-muted">
                .csv or .xlsx · max 10MB · columns: raw_material_name, prints, barcode (barcode is optional)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={BULK_BARCODE_ACCEPT}
                className="hidden"
                onChange={(event) => {
                  void handleBulkFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <OutlineButton onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </OutlineButton>
                <OutlineButton
                  onClick={() =>
                    downloadBulkBarcodeTemplate(materials.map((m) => m.name))
                  }
                >
                  <Download size={14} className="mr-1 inline" />
                  Sample CSV
                </OutlineButton>
              </div>
              {shownBulkErrors.length > 0 ? (
                <ul className="mx-auto mt-4 max-w-xl space-y-1 text-left text-xs text-primary">
                  {shownBulkErrors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                  {bulkErrors.length > MAX_BULK_ERRORS_SHOWN ? (
                    <li>+{bulkErrors.length - MAX_BULK_ERRORS_SHOWN} more</li>
                  ) : null}
                </ul>
              ) : null}
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
                  options={materials.map((m) => m.name)}
                  placeholder="Select Raw Material"
                  searchPlaceholder="Search"
                  includePlaceholderOption={false}
                  onChange={(value) => {
                    setRawMaterial(value)
                    const material = materials.find((m) => m.name === value)
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
                    onKeyDown={handleEnterToAdd}
                    className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink">
                    Raw Material Barcode
                    <span className="text-primary">*</span>
                    <InfoHint title={`Barcode value printed on the label. ${CODE39_HINT}.`} />
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(event) => setBarcode(event.target.value)}
                    onKeyDown={handleEnterToAdd}
                    className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm uppercase outline-none focus:border-primary"
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
            <div>
              <h2 className="text-base font-semibold text-ink">
                Selected Raw Material Summary
              </h2>
              <p className="text-xs text-muted">
                Label: {printerSettings.paperSize} · Copies per label: {copies}
              </p>
            </div>
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
                      <td className="px-3 py-2.5">
                        <InlineEditInput
                          ariaLabel={`Prints for ${row.rawMaterial}`}
                          type="number"
                          min={1}
                          max={MAX_BARCODES}
                          value={row.prints}
                          widthClass="w-24"
                          onCommit={(text) => {
                            const next = Number(text)
                            if (!Number.isInteger(next) || next < 1) {
                              showToast('Prints must be a whole number, at least 1')
                              return false
                            }
                            if (totalPrints - row.prints + next > MAX_BARCODES) {
                              showToast(`A maximum of ${MAX_BARCODES} prints can be queued at once`)
                              return false
                            }
                            updateRow(row.id, { prints: next })
                            return true
                          }}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <InlineEditInput
                          ariaLabel={`Barcode for ${row.rawMaterial}`}
                          value={row.barcode}
                          invalid={!isValidCode39(row.barcode)}
                          widthClass="w-44 uppercase"
                          onCommit={(text) => {
                            updateRow(row.id, { barcode: normalizeCode39(text) })
                            return true
                          }}
                        />
                        {!isValidCode39(row.barcode) ? (
                          <p className="mt-1 text-xs text-primary">{CODE39_HINT}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          aria-label="Remove row"
                          data-tooltip="Remove row"
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
            {totalLabels} label{totalLabels === 1 ? '' : 's'} will be generated
            (maximum {MAX_BARCODES} at once).
          </p>
          <div className="flex flex-wrap gap-2">
            <OutlineButton onClick={() => openLabels(false)}>Preview</OutlineButton>
            <PrimaryButton onClick={() => openLabels(true)}>
              Generate PDF For Print
            </PrimaryButton>
          </div>
        </div>
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
