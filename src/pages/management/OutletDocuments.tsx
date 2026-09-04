import { useRef, useState } from 'react'
import { Eye, FileUp, FolderOpen, Plus, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigSaveBar,
  ConfigSectionCard,
} from '../../components/management/ConfigSectionCard'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { brand } from '../../theme/brand'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = /\.(pdf|png|jpe?g|docx?|xlsx?)$/i

const DEFAULT_DOCUMENTS: string[] = [
  'GST Certificate',
  'FSSAI License',
  'Trade License',
  'NOC',
  'Hygiene/Health Certificate',
]

interface DocumentFile {
  name: string
  fileName: string
  previewUrl?: string
}

export default function OutletDocuments() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingDoc, setPendingDoc] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [files, setFiles] = useState<Record<string, DocumentFile>>({})
  const [customDocs, setCustomDocs] = useState<string[]>([])
  const [customFileName, setCustomFileName] = useState('')
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function openFilePicker(docName: string) {
    setPendingDoc(docName)
    window.setTimeout(() => fileRef.current?.click(), 0)
  }

  function handleFileChange(file: File | null) {
    const doc = pendingDoc
    setPendingDoc(null)
    if (!doc) return
    if (!file) return
    if (!ACCEPTED_TYPES.test(file.name)) {
      showToast('Upload only pdf, png, jpeg, jpg, doc, docx, xls or xlsx file')
      return
    }
    if (file.size > MAX_BYTES) {
      showToast('File Size Limit: Max Upload size 5Mb')
      return
    }
    const existing = files[doc]
    if (existing?.previewUrl) URL.revokeObjectURL(existing.previewUrl)
    setFiles((prev) => ({
      ...prev,
      [doc]: {
        name: doc,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
      },
    }))
    showToast(`${doc} uploaded`)
  }

  function viewDocument(docName: string) {
    const doc = files[docName]
    if (!doc?.previewUrl) return
    setPreviewDoc(docName)
  }

  function closePreview() {
    setPreviewDoc(null)
  }

  function removeDocument(docName: string, custom = false) {
    setFiles((prev) => {
      const next = { ...prev }
      const removed = next[docName]
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      delete next[docName]
      return next
    })
    if (custom) {
      setCustomDocs((prev) => prev.filter((name) => name !== docName))
    }
    showToast(`${docName} removed`)
  }

  const previewFile = previewDoc ? files[previewDoc] : null
  const canEmbed = previewFile
    ? /\.(pdf|png|jpe?g)$/i.test(previewFile.fileName)
    : false

  function addCustomDocument() {
    const name = customFileName.trim()
    if (!name) {
      showToast('Please enter a document name')
      return
    }
    if (customDocs.includes(name)) {
      showToast('Document already added')
      return
    }
    setCustomDocs((prev) => [...prev, name])
    setCustomFileName('')
    showToast('Custom document added')
  }

  function handleSave() {
    showToast('Documents saved')
    window.setTimeout(goBack, 700)
  }

  const renderedDocs = [...DEFAULT_DOCUMENTS, ...customDocs]

  return (
    <ReportsPageShell
      title={
        <ConfigBreadcrumb onNavigate={goBack} current="Documents" />
      }
      activeItem="config-outlet"
    >
      <input
        ref={fileRef}
        type="file"
        className="sr-only"
        accept=".pdf,.png,.jpeg,.jpg,.doc,.docx,.xls,.xlsx"
        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
      />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        Upload the business and license documents of your outlet. These are used
        to keep your {brand.shortName} account verified and up to date.
      </p>

      <ConfigSectionCard
        icon={<FolderOpen size={16} />}
        title="Business & License Documents"
        description="GST, FSSAI, Trade License, NOC and Hygiene certificates."
      >
        <div className="space-y-2">
          {renderedDocs.map((docName) => {
            const uploaded = files[docName]
            const custom = customDocs.includes(docName)
            return (
              <div
                key={docName}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-page/40 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2 text-sm text-ink">
                  {custom ? (
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                      Custom
                    </span>
                  ) : null}
                  <span className="truncate font-medium">{docName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {uploaded ? (
                    <>
                      <span className="max-w-[160px] truncate text-xs text-muted">
                        {uploaded.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => viewDocument(docName)}
                        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-2.5 text-xs font-medium text-ink hover:bg-page"
                        aria-label={`View ${docName}`}
                        title="View document"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDocument(docName, custom)}
                        className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-primary/10 hover:text-primary"
                        aria-label={`Remove ${docName}`}
                        title="Remove document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openFilePicker(docName)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page"
                  >
                    <FileUp size={14} />
                    {uploaded ? 'Replace' : 'Upload'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-5 text-sm font-semibold text-ink">Add Custom Document</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={customFileName}
            onChange={(event) => setCustomFileName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addCustomDocument()
              }
            }}
            placeholder="e.g. Fire Safety Certificate"
            className="h-9 min-w-[200px] flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary sm:max-w-xs"
          />
          <button
            type="button"
            onClick={addCustomDocument}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
          <X size={13} className="mt-0.5 shrink-0" />
          File Size Limit: Max Upload size 5Mb · Allowed: pdf, png, jpeg, jpg,
          doc, docx, xls, xlsx
        </p>
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />

      {previewFile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close preview"
            className="absolute inset-0 bg-ink/50"
            onClick={closePreview}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-preview-title"
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0">
                <h3 id="document-preview-title" className="truncate text-sm font-semibold text-ink">
                  {previewFile.name}
                </h3>
                <p className="truncate text-xs text-muted">{previewFile.fileName}</p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                aria-label="Close preview"
                className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-page/40">
              {canEmbed ? (
                <iframe
                  src={previewFile.previewUrl}
                  title={previewFile.name}
                  className="block h-[70vh] w-full border-0 bg-white"
                />
              ) : (
                <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <FolderOpen size={40} className="text-muted/50" strokeWidth={1} />
                  <p className="text-sm font-medium text-ink">
                    Preview not available for this file type
                  </p>
                  <p className="text-xs text-muted">
                    {previewFile.fileName} · Use the button below to open it externally.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.open(previewFile.previewUrl!, '_blank')}
                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
                  >
                    <Eye size={15} />
                    Open Document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </ReportsPageShell>
  )
}
