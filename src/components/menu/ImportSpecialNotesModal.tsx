import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ImportSpecialNotesModalProps {
  open: boolean
  onClose: () => void
  onUpload?: (file: File) => void
}

export function ImportSpecialNotesModal({
  open,
  onClose,
  onUpload,
}: ImportSpecialNotesModalProps) {
  const titleId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setFile(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  function downloadSample() {
    const csv = 'Name,Available\nLess Oil,Yes\nExtra Spicy,Yes\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'special-notes-sample.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleUpload() {
    if (!file) {
      setError('Please choose a file to upload')
      return
    }
    onUpload?.(file)
    onClose()
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
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Import Special Notes
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv"
                onChange={(event) => {
                  const next = event.target.files?.[0] ?? null
                  setFile(next)
                  if (next) setError('')
                }}
                className="block w-full max-w-full text-sm text-ink file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-page file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-line/40"
              />
              {error ? (
                <p className="mt-1.5 text-xs text-primary">{error}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={downloadSample}
              className="h-9 shrink-0 rounded-md border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Download Special Note(S)
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Upload
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
