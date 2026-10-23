import { useEffect, useId, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type {
  PrinterJob,
  PrinterRecord as Printer,
  PrinterType,
} from '../../services/outletService'
import { PRINTER_JOBS, PRINTER_TYPE_LABEL } from '../../utils/printerOptions'

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const titleId = useId()
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl bg-card p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-base font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

const primaryBtn =
  'inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50'
const plainBtn =
  'inline-flex h-9 items-center rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page'

interface PrinterFormModalProps {
  /** `null` adds a new printer; a printer edits it. */
  printer: Printer | null
  onClose: () => void
  onSave: (values: { name: string; type: PrinterType }) => void
}

export function PrinterFormModal({ printer, onClose, onSave }: PrinterFormModalProps) {
  const [name, setName] = useState(printer?.name ?? '')
  const [type, setType] = useState<PrinterType>(printer?.printer_type ?? 'general')
  const trimmed = name.trim()

  return (
    <ModalShell title={printer ? 'Edit Printer' : 'Add Printer'} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (trimmed) onSave({ name: trimmed, type })
        }}
        className="space-y-4"
      >
        <label className="block text-xs font-medium text-muted">
          Printer Name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="e.g. Kitchen printer"
            className="mt-1 h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="block text-xs font-medium text-muted">
          Printer Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PrinterType)}
            className="mt-1 h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
          >
            {(Object.keys(PRINTER_TYPE_LABEL) as PrinterType[]).map((key) => (
              <option key={key} value={key}>
                {PRINTER_TYPE_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={plainBtn}>
            Cancel
          </button>
          <button type="submit" disabled={!trimmed} className={primaryBtn}>
            {printer ? 'Save' : 'Add Printer'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

interface PrinterAssignModalProps {
  printer: Printer
  onClose: () => void
  onSave: (jobs: PrinterJob[]) => void
}

export function PrinterAssignModal({ printer, onClose, onSave }: PrinterAssignModalProps) {
  const [jobs, setJobs] = useState<PrinterJob[]>(printer.assigned_for)

  function toggle(job: PrinterJob) {
    setJobs((cur) => (cur.includes(job) ? cur.filter((j) => j !== job) : [...cur, job]))
  }

  return (
    <ModalShell title={`Assign ${printer.name}`} onClose={onClose}>
      <p className="mb-3 text-sm text-muted">Choose what this printer prints.</p>
      <div className="mb-4 space-y-2">
        {PRINTER_JOBS.map((job) => (
          <label
            key={job}
            className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm text-ink"
          >
            <input
              type="checkbox"
              checked={jobs.includes(job)}
              onChange={() => toggle(job)}
              className="size-4 accent-[var(--color-primary)]"
            />
            {job}
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={plainBtn}>
          Cancel
        </button>
        <button type="button" onClick={() => onSave(jobs)} className={primaryBtn}>
          Save
        </button>
      </div>
    </ModalShell>
  )
}
