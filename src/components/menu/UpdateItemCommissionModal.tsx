import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { itemCommissionRows } from '../../mocks/itemCommissionData'

interface UpdateItemCommissionModalProps {
  open: boolean
  onClose: () => void
  onUpload?: (file: File) => void
}

export function UpdateItemCommissionModal({
  open,
  onClose,
  onUpload,
}: UpdateItemCommissionModalProps) {
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

  function downloadItemsList() {
    const header = 'Item,Category,Item Price,Commission Type,Commission Value\n'
    const unique = new Map<string, (typeof itemCommissionRows)[number]>()
    for (const row of itemCommissionRows) {
      if (!unique.has(row.itemName)) unique.set(row.itemName, row)
    }
    const body = Array.from(unique.values())
      .map(
        (row) =>
          `"${row.itemName}",${row.categoryName},${row.itemPrice},${row.commissionType},${row.commissionValue ?? ''}`,
      )
      .join('\n')
    const blob = new Blob([header + body], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'items-commission-list.csv'
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
            Update Item Commission
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
              onClick={downloadItemsList}
              className="h-9 shrink-0 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Download Items List
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
