import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Download,
  FileSpreadsheet,
  Loader2,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  SHEET_TEMPLATE_HEADERS,
  downloadItemSheetTemplate,
  exportItemsSheetApi,
  previewItemsSheetApi,
  importItemsSheetApi,
  type SheetImportResult,
  type SheetPreview,
} from '../../services/menuService'
import { showToast } from '../../utils/toast'
import { ProgressBar } from '../common/ProgressBar'

// ── constants ──────────────────────────────────────────────────────────────

const ACCEPTED = '.xlsx'
/** 5 MB — xlsx files with 500 rows are well under this. */
const MAX_BYTES = 5 * 1024 * 1024
const MAX_ROWS = 500

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Import' },
] as const

type Step = 1 | 2 | 3
type Phase = 'importing' | 'done' | 'error'

/** Price columns shown in the review table (slug → header label). */
const PRICE_COLUMNS: Array<{ slug: string; label: string }> = [
  { slug: 'base', label: 'Base' },
  { slug: 'home-delivery', label: 'Home Del.' },
  { slug: 'parcel', label: 'Parcel' },
  { slug: 'dine-in', label: 'Dine In' },
  { slug: 'zomato', label: 'Zomato' },
  { slug: 'swiggy', label: 'Swiggy' },
]

// ── helpers ────────────────────────────────────────────────────────────────

function describeFieldErrors(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(describeFieldErrors).join(' ')
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([field, msg]) => `${field.replace(/_/g, ' ')} — ${describeFieldErrors(msg)}`)
      .join('; ')
  }
  return String(value)
}

function flattenApiError(error: unknown): string[] {
  if (!(error instanceof ApiError)) {
    return [error instanceof Error ? error.message : 'Request failed.']
  }
  const messages: string[] = [error.message]
  const errs = error.errors as Record<string, unknown> | null
  if (errs && typeof errs === 'object') {
    for (const [key, val] of Object.entries(errs)) {
      messages.push(`${key.replace(/_/g, ' ')}: ${describeFieldErrors(val)}`)
    }
  }
  return messages
}

// ── props ──────────────────────────────────────────────────────────────────

interface ImportSheetCsvModalProps {
  open: boolean
  onClose: () => void
  /** Passed through for compatibility — unused in the xlsx flow. */
  categories?: unknown[]
  initialCategoryId?: string
  onSaved: () => void
}

// ── component ──────────────────────────────────────────────────────────────

export function ImportSheetCsvModal({
  open,
  onClose,
  onSaved,
}: ImportSheetCsvModalProps) {
  const { encryptedOutletId } = useAuth()

  const inputRef = useRef<HTMLInputElement>(null)
  const pctTimer = useRef<number | null>(null)

  const [step, setStep] = useState<Step>(1)
  const [phase, setPhase] = useState<Phase>('importing')

  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [result, setResult] = useState<SheetImportResult | null>(null)
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [importPct, setImportPct] = useState(0)

  const [preview, setPreview] = useState<SheetPreview | null>(null)
  const [previewBusy, setPreviewBusy] = useState(false)

  const [templateBusy, setTemplateBusy] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)

  // ── timer helpers ────────────────────────────────────────────────────

  function stopPctTimer() {
    if (pctTimer.current !== null) {
      window.clearInterval(pctTimer.current)
      pctTimer.current = null
    }
  }

  function startPctTimer() {
    stopPctTimer()
    setImportPct(6)
    pctTimer.current = window.setInterval(() => {
      setImportPct((pct) => Math.min(90, pct + Math.max(0.5, (90 - pct) * 0.1)))
    }, 180)
  }

  // ── reset on open ────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return
    setStep(1)
    setPhase('importing')
    setFileName('')
    setFileError('')
    setSelectedFile(null)
    setResult(null)
    setServerErrors([])
    setSaving(false)
    setImportPct(0)
    setPreview(null)
    setPreviewBusy(false)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
      stopPctTimer()
    }
  }, [open, onClose])

  // ── file acceptance ──────────────────────────────────────────────────

  function acceptFile(file: File | undefined) {
    if (!file) return
    setFileError('')
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setFileError('Please choose an .xlsx file.')
      return
    }
    if (file.size > MAX_BYTES) {
      setFileError('File must be 5 MB or smaller.')
      return
    }
    setFileName(file.name)
    setSelectedFile(file)
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    acceptFile(e.target.files?.[0])
    e.target.value = ''
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    acceptFile(e.dataTransfer.files?.[0])
  }

  // ── template & export ────────────────────────────────────────────────

  async function handleDownloadTemplate() {
    if (!encryptedOutletId || templateBusy) return
    setTemplateBusy(true)
    try {
      await downloadItemSheetTemplate(encryptedOutletId)
      showToast('Template downloaded')
    } catch {
      showToast('Could not download template', '', 'error')
    } finally {
      setTemplateBusy(false)
    }
  }

  async function handleExportCurrent() {
    if (!encryptedOutletId || exportBusy) return
    setExportBusy(true)
    try {
      await exportItemsSheetApi(encryptedOutletId)
      showToast('Export downloaded')
    } catch {
      showToast('Could not export items', '', 'error')
    } finally {
      setExportBusy(false)
    }
  }

  // ── review (dry run) ─────────────────────────────────────────────────

  async function handleReview() {
    if (!encryptedOutletId || !selectedFile) return
    setPreviewBusy(true)
    setPreview(null)
    setServerErrors([])
    try {
      const res = await previewItemsSheetApi(encryptedOutletId, selectedFile)
      setPreview(res)
      setStep(2)
    } catch (error) {
      setServerErrors(flattenApiError(error))
      setStep(2)
    } finally {
      setPreviewBusy(false)
    }
  }

  // ── confirm import ───────────────────────────────────────────────────

  async function handleConfirmImport() {
    if (!encryptedOutletId || !selectedFile) return
    setSaving(true)
    setServerErrors([])
    setPhase('importing')
    setStep(3)
    startPctTimer()
    try {
      const res = await importItemsSheetApi(encryptedOutletId, selectedFile)
      stopPctTimer()
      setImportPct(100)
      setResult(res)
      setPhase('done')
      if (res.created > 0) {
        showToast(`${res.created} item${res.created === 1 ? '' : 's'} created`)
        onSaved()
        // Close by itself once the menu has been told to refresh; a moment
        // is left so the finished state is seen. Nothing created keeps the
        // window open so the reasons stay on screen.
        window.setTimeout(onClose, 900)
      } else {
        showToast('Import complete — no new items created', '', 'neutral')
      }
    } catch (error) {
      stopPctTimer()
      setServerErrors(flattenApiError(error))
      setPhase('error')
    } finally {
      setSaving(false)
    }
  }

  // ── guard ────────────────────────────────────────────────────────────

  if (!open) return null

  const canImport = !saving && encryptedOutletId !== null && selectedFile !== null

  // ── render ───────────────────────────────────────────────────────────

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-sheet-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id="import-sheet-title" className="text-base font-semibold text-ink">
            Import / Export via Sheet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
            aria-label="Close"
            data-tooltip="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* step indicator */}
        <ol className="flex items-center gap-2 border-b border-line px-5 py-3">
          {STEPS.map((s, i) => {
            const active = step === s.id
            const done = step > s.id
            return (
              <li key={s.id} className="flex items-center gap-2">
                {i > 0 && <span className="mx-1 hidden h-px w-8 bg-line sm:block" />}
                <span
                  className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active
                      ? 'bg-primary text-white'
                      : done
                        ? 'bg-primary/15 text-primary'
                        : 'bg-page text-muted'
                  }`}
                >
                  {s.id}
                </span>
                <span className={`text-sm ${active ? 'font-semibold text-ink' : 'text-muted'}`}>
                  {s.label}
                </span>
              </li>
            )
          })}
        </ol>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">

          {/* ── step 1: upload ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">

              {/* column format callout */}
              <div className="rounded-lg border border-line bg-page px-4 py-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                  Sheet column format
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SHEET_TEMPLATE_HEADERS.map((col) => (
                    <span
                      key={col}
                      className="inline-flex items-center rounded border border-line bg-card px-2 py-0.5 text-xs font-medium text-ink"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                  Only <strong>Item</strong> and a numeric{' '}
                  <strong>Base Menu</strong> price are required.{' '}
                  <strong>Master Category</strong> / <strong>Sub Category</strong>{' '}
                  are optional — rows with a blank or missing category are filed
                  under <strong>Imported</strong> (created automatically). Rows
                  whose item name already exists are skipped. Prices must be
                  numbers (no currency symbols). Max {MAX_ROWS} rows per file.
                </p>
              </div>

              {/* action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleDownloadTemplate()}
                  disabled={templateBusy}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-primary bg-card px-3 text-sm font-medium text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                  data-tooltip="Download a blank template xlsx"
                >
                  {templateBusy ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  Download Template
                </button>
                <button
                  type="button"
                  onClick={() => void handleExportCurrent()}
                  disabled={exportBusy}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-60"
                  data-tooltip="Export all current items as xlsx"
                >
                  {exportBusy ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <FileSpreadsheet size={15} />
                  )}
                  Export Current Items
                </button>
              </div>

              {/* drop zone */}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={onInputChange}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={(e) => { e.preventDefault(); setDragging(false) }}
                onDrop={onDrop}
                className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors ${
                  dragging
                    ? 'border-primary bg-primary/10'
                    : selectedFile
                      ? 'border-success bg-success/5'
                      : 'border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.07]'
                }`}
              >
                <span className="mb-3 inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CloudUpload size={22} />
                </span>
                {selectedFile ? (
                  <>
                    <p className="text-sm font-semibold text-ink">{fileName}</p>
                    <p className="mt-1 text-xs text-muted">Click to choose a different file</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-ink">
                      Drag &amp; drop your xlsx here
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      or click to browse — .xlsx only, max 5 MB
                    </p>
                  </>
                )}
              </div>

              {fileError && (
                <p className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  {fileError}
                </p>
              )}
            </div>
          )}

          {/* ── step 2: review (dry run) ─────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              {preview ? (
                <>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-success/10 px-2 py-1 font-medium text-success">
                      {preview.summary.will_create} item
                      {preview.summary.will_create === 1 ? '' : 's'} will be created
                    </span>
                    {preview.summary.will_skip > 0 && (
                      <span className="rounded bg-page px-2 py-1 text-muted">
                        {preview.summary.will_skip} skipped
                      </span>
                    )}
                    {preview.summary.row_errors > 0 && (
                      <span className="rounded bg-danger/10 px-2 py-1 text-danger">
                        {preview.summary.row_errors} row error
                        {preview.summary.row_errors === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <div className="max-h-[42vh] overflow-auto rounded-lg border border-line">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-page">
                        <tr>
                          <th className="px-2 py-1.5 font-semibold text-muted">Row</th>
                          <th className="px-2 py-1.5 font-semibold text-muted">Item</th>
                          <th className="px-2 py-1.5 font-semibold text-muted">Category</th>
                          <th className="px-2 py-1.5 font-semibold text-muted">Description</th>
                          {PRICE_COLUMNS.filter((c) =>
                            preview.rows.some((r) => r.prices[c.slug] !== undefined),
                          ).map((c) => (
                            <th key={c.slug} className="px-2 py-1.5 font-semibold text-muted">
                              {c.label}
                            </th>
                          ))}
                          <th className="px-2 py-1.5 font-semibold text-muted">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.rows.map((row) => (
                          <tr
                            key={row.row}
                            className={
                              row.action === 'error'
                                ? 'bg-danger/5'
                                : row.action === 'skip'
                                  ? 'bg-page/50 text-muted'
                                  : ''
                            }
                          >
                            <td className="px-2 py-1.5 text-muted">{row.row}</td>
                            <td className="px-2 py-1.5 font-medium text-ink">
                              {row.name}
                            </td>
                            <td className="px-2 py-1.5 text-ink">
                              {row.category_path}
                              {!row.category_exists && (
                                <span className="ml-1 rounded bg-primary/10 px-1 font-medium text-primary">
                                  new
                                </span>
                              )}
                            </td>
                            <td className="max-w-[120px] truncate px-2 py-1.5 text-muted">
                              {row.description || '—'}
                            </td>
                            {PRICE_COLUMNS.filter((c) =>
                              preview.rows.some((r) => r.prices[c.slug] !== undefined),
                            ).map((c) => (
                              <td key={c.slug} className="px-2 py-1.5 text-ink">
                                {row.prices[c.slug] ?? '—'}
                              </td>
                            ))}
                            <td
                              className={`max-w-[180px] truncate px-2 py-1.5 ${
                                row.action === 'error' ? 'text-danger' : 'text-muted'
                              }`}
                            >
                              {row.message ?? ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {preview.errors.length > 0 && (
                    <ul className="max-h-[20vh] overflow-auto rounded-lg border border-danger/20 bg-danger/5 px-4 py-2 text-left">
                      {preview.errors.map((msg) => (
                        <li key={msg} className="py-0.5 text-xs text-danger">
                          • {msg}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                  <AlertTriangle size={30} className="text-danger" />
                  <p className="text-sm font-semibold text-ink">Could not read this file</p>
                  <ul className="max-w-md space-y-1 text-left text-xs text-danger">
                    {serverErrors.map((msg) => (
                      <li key={msg}>• {msg}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-1 inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── step 3: importing / done / error ───────────────────── */}
          {step === 3 && (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">

              {phase === 'importing' && (
                <>
                  <Loader2 size={28} className="animate-spin text-primary" />
                  <p className="text-sm font-semibold text-ink">Importing {fileName}…</p>
                  <div className="w-full max-w-xs">
                    <ProgressBar value={importPct} showLabel />
                  </div>
                  <p className="text-xs text-muted">Please keep this window open.</p>
                </>
              )}

              {phase === 'done' && result && (
                <>
                  <CheckCircle2 size={32} className="text-success" />
                  <p className="text-sm font-semibold text-ink">
                    {result.created} item{result.created === 1 ? '' : 's'} created
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    {result.skipped > 0 && (
                      <span className="rounded bg-page px-2 py-0.5 text-muted">
                        {result.skipped} row{result.skipped === 1 ? '' : 's'} skipped
                      </span>
                    )}
                    {result.errors.length > 0 && (
                      <span className="rounded bg-danger/10 px-2 py-0.5 text-danger">
                        {result.errors.length} row error{result.errors.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  {result.errors.length > 0 && (
                    <ul className="mt-1 max-h-[28vh] w-full max-w-lg overflow-auto rounded-lg border border-danger/20 bg-danger/5 px-4 py-2 text-left">
                      {result.errors.map((msg) => (
                        <li key={msg} className="py-0.5 text-xs text-danger">
                          • {msg}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    Done
                  </button>
                </>
              )}

              {phase === 'error' && (
                <>
                  <AlertTriangle size={30} className="text-danger" />
                  <p className="text-sm font-semibold text-ink">Import failed</p>
                  <ul className="max-w-md space-y-1 text-left text-xs text-danger">
                    {serverErrors.map((msg) => (
                      <li key={msg}>• {msg}</li>
                    ))}
                  </ul>
                  <p className="max-w-sm text-xs text-muted">
                    No items were created. Fix the file and try again.
                  </p>
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setPhase('importing') }}
                      className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* footer — only visible on step 1 */}
        {step === 1 && (
          <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleReview()}
              disabled={!canImport}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {previewBusy && <Loader2 size={15} className="animate-spin" />}
              Review Items
            </button>
          </div>
        )}

        {/* footer — review step: back + confirm */}
        {step === 2 && preview && (
          <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={saving}
              className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmImport()}
              disabled={saving || preview.summary.will_create === 0}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Import {preview.summary.will_create} Item
              {preview.summary.will_create === 1 ? '' : 's'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
