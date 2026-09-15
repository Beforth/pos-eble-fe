import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { ImagePlus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigSaveBar,
  ConfigSectionCard,
} from '../../components/management/ConfigSectionCard'
import { SettingsPageLoading } from '../../components/management/SettingsPageLoading'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { useAuth } from '../../auth/AuthContext'
import {
  getOutletSettingsApi,
  updateOutletSettingsMultipartApi,
} from '../../services/outletService'

const MAX_BYTES = 5 * 1024 * 1024

export default function PrintLogoSettings() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasLogo, setHasLogo] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) {
      setLoading(false)
      return
    }
    getOutletSettingsApi(encryptedOutletId, 'print')
      .then((value) => {
        if (cancelled) return
        const url = value.print_logo as string | null
        setHasLogo(Boolean(url))
        if (url) {
          setPreviewUrl(url)
          setFileName(url.split('/').pop() ?? '')
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load print logo',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])


  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function clearPreviewObjectUrl() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      setFileName('')
      setLogoFile(null)
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
    setLogoFile(file)
    setHasLogo(true)
  }

  function handleRemoveLogo() {
    clearPreviewObjectUrl()
    setPreviewUrl(null)
    setFileName('')
    setHasLogo(false)
    setLogoFile(null)
    if (fileRef.current) fileRef.current.value = ''
    showToast('Logo removed')
  }

  function handleSave() {
    if (!hasLogo && !previewUrl) {
      showToast('Please upload a logo')
      return
    }
    if (!encryptedOutletId) {
      showToast('No active outlet selected')
      return
    }
    updateOutletSettingsMultipartApi(
      encryptedOutletId,
      'print',
      {},
      { print_logo: logoFile ?? undefined },
    )
      .then(() => {
        showToast('Print logo saved')
      })
      .catch((error: unknown) => {
        showToast(
          error instanceof Error ? error.message : 'Failed to save print logo',
        )
      })
  }

  if (loading) {
    return <SettingsPageLoading />
  }

  return (
    <ReportsPageShell title={<ConfigBreadcrumb onNavigate={goBack} current="Set Your Print Logo" />} activeItem="config-outlet">

      <ConfigSectionCard
        icon={<ImagePlus size={16} />}
        title="Logo Customization"
        description="Logo To Print At Your Desktop Point Of Sale"
      >
        <div className="space-y-6">
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
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />
    </ReportsPageShell>
  )
}
