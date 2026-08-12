import { useEffect, useRef, useState, type DragEvent } from 'react'
import { createPortal } from 'react-dom'
import { FolderOpen, Upload, X } from 'lucide-react'

const MAX_BYTES = 15 * 1024 * 1024
const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png', '.pdf']
const ACCEPTED_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]

interface UploadPhysicalMenuModalProps {
  open: boolean
  onClose: () => void
  onUpload: (files: File[]) => void
}

function isAccepted(file: File) {
  const name = file.name.toLowerCase()
  const extOk = ACCEPTED_EXT.some((ext) => name.endsWith(ext))
  const mimeOk = !file.type || ACCEPTED_MIME.includes(file.type)
  return extOk && mimeOk && file.size <= MAX_BYTES
}

export function UploadPhysicalMenuModal({
  open,
  onClose,
  onUpload,
}: UploadPhysicalMenuModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setFiles([])
    setError('')
    setDragOver(false)
    if (inputRef.current) inputRef.current.value = ''
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

  function takeFiles(list: FileList | File[] | null) {
    if (!list) return
    const incoming = Array.from(list)
    const accepted = incoming.filter(isAccepted)
    const rejected = incoming.length - accepted.length
    setFiles(accepted)
    setError(
      rejected
        ? `${rejected} file${rejected > 1 ? 's' : ''} skipped (type or over 15MB).`
        : '',
    )
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragOver(false)
    takeFiles(event.dataTransfer.files)
  }

  function handleUpload() {
    if (files.length === 0) {
      setError('Please choose a file to upload')
      return
    }
    onUpload(files)
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
        aria-labelledby="upload-physical-menu-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="upload-physical-menu-title"
            className="text-base font-semibold text-ink"
          >
            Upload File
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
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-line bg-page/60'
            }`}
          >
            <span className="relative mb-4 flex size-16 items-center justify-center rounded-2xl bg-secondary/50 text-deep">
              <FolderOpen size={36} strokeWidth={1.5} />
              <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-success text-[10px] font-bold text-white shadow-sm">
                ↑
              </span>
            </span>
            <p className="text-sm font-semibold text-ink">Upload your file here.</p>
            <p className="mt-1 max-w-xs text-xs text-muted">
              You can upload JPG, JPEG, PNG or PDF files (Max 15MB).
            </p>
            {files.length > 0 ? (
              <ul className="mt-3 w-full max-w-sm space-y-1 text-left text-xs text-ink">
                {files.map((file) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="truncate rounded-md border border-line bg-card px-2.5 py-1.5"
                  >
                    {file.name}
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Upload size={14} className="text-primary" />
              Browse
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              multiple
              className="hidden"
              onChange={(event) => takeFiles(event.target.files)}
            />
          </div>
          {error ? (
            <p className="mt-2 text-xs text-primary">{error}</p>
          ) : null}
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
