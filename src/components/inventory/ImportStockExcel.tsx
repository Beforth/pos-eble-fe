import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { BookOpen, CloudUpload, Download } from 'lucide-react'
import {
  OutlineButton,
  PrimaryButton,
} from '../menu/MenuActionButtons'
import {
  StockUpdateCycleSelect,
  type StockUpdateCycle,
} from './StockUpdateCycleSelect'

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Review pending errors' },
  { id: 3, label: 'Check your summary' },
] as const

const ACCEPTED = '.xlsx,.xls,.csv'
const MAX_BYTES = 10 * 1024 * 1024

interface ImportStockExcelProps {
  entityLabel?: string
  onToast?: (message: string) => void
}

export function ImportStockExcel({
  entityLabel = 'stock',
  onToast,
}: ImportStockExcelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [step] = useState(1)
  const [cycle, setCycle] = useState<StockUpdateCycle>('daily')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  function acceptFile(file: File | undefined) {
    if (!file) return
    const lower = file.name.toLowerCase()
    const okExt =
      lower.endsWith('.xlsx') ||
      lower.endsWith('.xls') ||
      lower.endsWith('.csv')
    if (!okExt) {
      onToast?.('Please upload a .xlsx, .xls, or .csv file')
      return
    }
    if (file.size > MAX_BYTES) {
      onToast?.('File must be 10MB or smaller')
      return
    }
    setFileName(file.name)
    onToast?.(`Uploaded ${file.name}`)
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0])
    event.target.value = ''
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    acceptFile(event.dataTransfer.files?.[0])
  }

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
                      ? 'bg-primary/15 text-primary'
                      : 'bg-page text-muted'
                }`}
              >
                {item.id}
              </span>
              <span
                className={`text-sm ${
                  active ? 'font-semibold text-ink' : 'text-muted'
                }`}
              >
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide">
                  Step {item.id}:
                </span>
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
              Upload Your Stock Excel
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Download the sample template, fill in your {entityLabel} details,
              and upload the completed file to import your inventory.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StockUpdateCycleSelect value={cycle} onChange={setCycle} />
            <PrimaryButton
              onClick={() => onToast?.('Sample Excel downloaded')}
            >
              <Download size={15} />
              Download Excel File
            </PrimaryButton>
            <OutlineButton
              variant="gray"
              onClick={() => onToast?.('Step-by-step guide opened')}
            >
              <BookOpen size={15} />
              Step-By-Step Guide
            </OutlineButton>
          </div>
        </div>

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
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setDragging(false)
          }}
          onDrop={onDrop}
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? 'border-primary bg-primary/10'
              : 'border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.07]'
          }`}
        >
          <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CloudUpload size={24} />
          </span>
          <p className="text-sm font-semibold text-ink">
            {fileName ? fileName : 'Drag & drop your file here'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {fileName
              ? 'Click to choose a different file'
              : 'or click to browse .xlsx, .xls, .csv - max 10MB'}
          </p>
        </div>
      </div>
    </div>
  )
}
