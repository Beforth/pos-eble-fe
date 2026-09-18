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
import { StockStepGuideModal } from './StockStepGuideModal'
import { downloadCsv } from '../../utils/downloadFile'

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
  const [step, setStep] = useState(1)
  const [cycle, setCycle] = useState<StockUpdateCycle>('daily')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)

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
    setStep(2)
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

  function downloadSample() {
    downloadCsv(
      ['raw_material_name', 'unit', 'qty', 'stock_date', 'notes'],
      [
        ['Milk', 'Ltr', '10', new Date().toISOString().slice(0, 10), ''],
        ['Flour', 'Kg', '5', new Date().toISOString().slice(0, 10), ''],
      ],
      `${entityLabel.replace(/\s+/g, '-').toLowerCase()}-sample.csv`,
    )
    onToast?.('Sample Excel downloaded')
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
              Upload Your Stock Excel
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Download the sample template, fill in your {entityLabel} details,
              and upload the completed file to import your inventory.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StockUpdateCycleSelect value={cycle} onChange={setCycle} />
            <PrimaryButton onClick={downloadSample}>
              <Download size={15} />
              Download Excel File
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
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-line bg-page/40 hover:border-primary/40'
          }`}
        >
          <CloudUpload size={36} className="mb-3 text-muted" />
          <p className="text-sm font-semibold text-ink">
            {fileName ? fileName : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-1 text-xs text-muted">
            .xlsx, .xls, or .csv · max 10MB · cycle: {cycle}
          </p>
          {fileName ? (
            <div
              className="mt-4"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <OutlineButton
                onClick={() => {
                  setStep(3)
                  onToast?.(
                    `Ready to import ${fileName}. Stock import API will apply rows when connected.`,
                  )
                }}
              >
                Continue to summary
              </OutlineButton>
            </div>
          ) : null}
        </div>
      </div>

      <StockStepGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={`${entityLabel} import guide`}
      />
    </div>
  )
}
