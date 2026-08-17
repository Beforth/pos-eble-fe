import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const MAX_BYTES = 5 * 1024 * 1024

export default function PrintLogoSettings() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasLogo, setHasLogo] = useState(true)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function clearPreviewObjectUrl() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      setFileName('')
      return
    }
    if (!/\.(png|jpe?g)$/i.test(file.name) && !file.type.startsWith('image/')) {
      showToast('Upload only png, jpeg or jpg file')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (file.size > MAX_BYTES) {
      showToast('File Size Limit: Max Upload size 5Mb')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    clearPreviewObjectUrl()
    setFileName(file.name)
    setPreviewUrl(URL.createObjectURL(file))
    setHasLogo(true)
  }

  function handleRemoveLogo() {
    clearPreviewObjectUrl()
    setPreviewUrl(null)
    setFileName('')
    setHasLogo(false)
    if (fileRef.current) fileRef.current.value = ''
    showToast('Logo removed')
  }

  function handleSave() {
    if (!hasLogo && !previewUrl) {
      showToast('Please upload a logo')
      return
    }
    showToast('Print logo saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-52">
          <button
            type="button"
            className="w-full rounded-md bg-primary px-3 py-2.5 text-left text-sm font-semibold text-white"
          >
            Set Your Print Logo
          </button>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-line bg-card">
          <div className="space-y-6 p-5 sm:p-6">
            <div>
              <h2 className="text-base font-bold text-ink">Logo Customization</h2>
              <p className="mt-1 text-sm text-muted">
                Logo To Print At Your Desktop Point Of Sale
              </p>
            </div>

            <div className="rounded-xl border border-dashed border-line bg-page/40 px-4 py-8 text-center sm:px-8">
              <p className="mb-4 text-sm font-semibold text-ink">
                Upload Your Logo
              </p>
              <label className="inline-flex cursor-pointer flex-wrap items-center justify-center gap-2">
                <span className="inline-flex h-9 items-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page">
                  Choose File
                </span>
                <span className="text-sm text-muted">
                  {fileName || 'No file chosen'}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                  className="sr-only"
                  onChange={(event) =>
                    handleFileChange(event.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>

            {hasLogo ? (
              <div className="relative inline-block">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Print logo preview"
                    className="size-36 rounded-full object-cover shadow-sm ring-1 ring-line"
                  />
                ) : (
                  <BrandLogo size={144} className="rounded-full shadow-sm" />
                )}
                <button
                  type="button"
                  aria-label="Remove logo"
                  onClick={handleRemoveLogo}
                  className="absolute -right-1 -top-1 inline-flex size-7 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary-hover"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted">No logo set.</p>
            )}

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-ink">
                Notes:
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
                <li>File Size Limit: Max Upload size 5Mb</li>
                <li>Dimension Required: 300 × 300</li>
              </ol>
            </div>
          </div>

          <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-line bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
            <OutlineButton variant="gray" onClick={goBack}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
