import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import {
  BookOpen,
  CheckCircle2,
  CloudUpload,
  Download,
  XCircle,
} from 'lucide-react'
import {
  OutlineButton,
  PrimaryButton,
} from '../menu/MenuActionButtons'
import {
  StockUpdateCycleSelect,
  type StockUpdateCycle,
} from './StockUpdateCycleSelect'
import { StockStepGuideModal } from './StockStepGuideModal'
import {
  STOCK_SHEET_ACCEPT,
  parseStockFile,
  type ImportStockRowResult,
  type ImportedStockRow,
} from './stockCountShared'
import { downloadCsv } from '../../utils/downloadFile'

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Review pending errors' },
  { id: 3, label: 'Check your summary' },
] as const

const MAX_BYTES = 10 * 1024 * 1024

interface ImportStockExcelProps {
  entityLabel?: string
  onToast?: (message: string) => void
  /** Called with the rows that matched a known raw material and carry a valid qty. */
  onApply?: (rows: ImportedStockRow[]) => void
  /** Names used to build the downloadable sample template. */
  sampleNames?: string[]
  /** Case-insensitive lookup from raw material name to its id. */
  resolveId?: (name: string) => string | undefined
}

export function ImportStockExcel({
  entityLabel = 'stock',
  onToast,
  onApply,
  sampleNames = ['Milk', 'Flour'],
  resolveId,
}: ImportStockExcelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [cycle, setCycle] = useState<StockUpdateCycle>('daily')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [unreadable, setUnreadable] = useState<string | null>(null)
  const [rows, setRows] = useState<ImportStockRowResult[]>([])
  const [guideOpen, setGuideOpen] = useState(false)

  function reset() {
    setStep(1)
    setFileName(null)
    setUnreadable(null)
    setRows([])
  }

  async function acceptFile(file: File | undefined) {
    if (!file) return
    const lower = file.name.toLowerCase()
    if (!/\.(csv|xlsx)$/.test(lower)) {
      setUnreadable(
        lower.endsWith('.xls')
          ? '.xls is not supported. Open the sheet in Excel and use "Save As" .xlsx, then upload it here.'
          : 'Please upload a .csv or .xlsx file.',
      )
      onToast?.('Please upload a .csv or .xlsx file')
      return
    }
    if (file.size > MAX_BYTES) {
      setUnreadable('File must be 10MB or smaller.')
      onToast?.('File must be 10MB or smaller')
      return
    }
    setUnreadable(null)
    let parsed: ImportStockRowResult[] | null
    try {
      parsed = await parseStockFile(file)
    } catch {
      parsed = null
    }
    if (!parsed) {
      setUnreadable(
        'Could not read this sheet. It needs a header row with a material column (raw_material_name) and a quantity column (qty).',
      )
      onToast?.('Could not read this sheet')
      return
    }
    setFileName(file.name)
    setRows(
      parsed.map((row) => {
        if (row.error) return row
        const id = row.raw_material_name
          ? resolveId?.(row.raw_material_name)
          : undefined
        if (!id) {
          return {
            ...row,
            matched: false,
            error: `No raw material named "${row.raw_material_name}"`,
          }
        }
        return { ...row, matched: true }
      }),
    )
    setStep(2)
    onToast?.(`Uploaded ${file.name}`)
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    void acceptFile(event.target.files?.[0])
    event.target.value = ''
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    void acceptFile(event.dataTransfer.files?.[0])
  }

  function downloadSample() {
    downloadCsv(
      ['raw_material_name', 'qty', 'notes'],
      sampleNames.map((name) => [name, '', '']),
      `${entityLabel.replace(/\s+/g, '-').toLowerCase()}-sample.csv`,
    )
    onToast?.('Sample CSV downloaded')
  }

  const validRows = rows.filter((row) => row.matched && !row.error)
  const invalidRows = rows.filter((row) => !row.matched || row.error)

  return (
    <div className="space-y-5">
      <ol className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card px-4 py-3">
        {STEPS.map((item, index) => {
          const active = step === item.id
          const done = step > item.id
          return (
            <li key={item.id} className="flex items-center gap-2">
              {index > 0 ? (
                <span className="mx-1 hidden h-px w-8 bg-line sm:block" />
              ) : null}
              <span
                className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? 'bg-primary text-white'
                    : done
                      ? 'bg-success/15 text-success'
                      : 'bg-page text-muted'
                }`}
              >
                {item.id}
              </span>
              <span
                className={`text-sm ${active ? 'font-semibold text-ink' : 'text-muted'}`}
              >
                {item.label}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="rounded-xl border border-line bg-card p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">
              Upload Your {entityLabel} Sheet
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Download the sample template, fill in the counted quantity for each
              raw material, then upload the CSV to load the count sheet. Nothing is
              saved until you review and post it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StockUpdateCycleSelect value={cycle} onChange={setCycle} />
            <PrimaryButton onClick={downloadSample}>
              <Download size={15} />
              Download Sample CSV
            </PrimaryButton>
            <OutlineButton variant="gray" onClick={() => setGuideOpen(true)}>
              <BookOpen size={15} />
              Step-By-Step Guide
            </OutlineButton>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={STOCK_SHEET_ACCEPT}
          className="hidden"
          onChange={onInputChange}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-line bg-page/40 hover:border-primary/40'
          }`}
        >
          <CloudUpload size={36} className="mb-3 text-muted" />
          <p className="text-sm font-semibold text-ink">
            {fileName ?? 'Drag & drop or click to upload'}
          </p>
          <p className="mt-1 text-xs text-muted">
            .csv or .xlsx · max 10MB · columns: raw_material_name, qty, notes
          </p>
          {unreadable ? (
            <p className="mt-3 max-w-md text-xs font-medium text-primary">
              {unreadable}
            </p>
          ) : null}
        </div>
      </div>

      {fileName ? (
        <div className="rounded-xl border border-line bg-card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-ink">
                {rows.length} rows read from {fileName}
              </h3>
              <p className="mt-0.5 text-sm text-muted">
                {validRows.length} ready · {invalidRows.length} need attention
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OutlineButton variant="gray" onClick={reset}>
                Choose another file
              </OutlineButton>
              <PrimaryButton
                disabled={validRows.length === 0}
                onClick={() => {
                  onApply?.(validRows)
                  setStep(3)
                  onToast?.(`Applied ${validRows.length} rows to the count sheet`)
                }}
              >
                Apply {validRows.length} rows to count sheet
              </PrimaryButton>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-page text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Row</th>
                  <th className="px-3 py-2 font-semibold">Raw material</th>
                  <th className="px-3 py-2 font-semibold">Qty</th>
                  <th className="px-3 py-2 font-semibold">Notes</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={row.error ? 'bg-primary/5' : undefined}
                  >
                    <td className="px-3 py-2 text-muted">{row.rowNumber}</td>
                    <td className="px-3 py-2 font-medium text-ink">
                      {row.raw_material_name || '—'}
                    </td>
                    <td className="px-3 py-2 text-ink">{row.qty || '—'}</td>
                    <td className="px-3 py-2 text-muted">{row.notes || '—'}</td>
                    <td className="px-3 py-2">
                      {row.error ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                          <XCircle size={13} />
                          {row.error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                          <CheckCircle2 size={13} />
                          Ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <StockStepGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={`${entityLabel} import guide`}
        steps={[
          {
            title: 'Download the template',
            body: 'Use "Download Sample CSV" so the header row matches exactly: raw_material_name, qty, notes. Renaming headers makes the file unreadable.',
          },
          {
            title: 'Fill the counted quantity',
            body: 'Enter one row per raw material using the exact master name. Quantities must be greater than zero; blank rows are skipped.',
          },
          {
            title: 'Upload and review',
            body: 'Rows are matched against your raw material masters. Unknown names and non-numeric quantities are listed as errors and are not applied.',
          },
          {
            title: 'Apply, then post',
            body: 'Valid rows are loaded onto the count sheet. Nothing touches the ledger until you Quick Save or post from Review on the count tab.',
          },
        ]}
      />
    </div>
  )
}
