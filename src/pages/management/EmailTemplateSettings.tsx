import { useRef, useState } from 'react'
import {
  Globe,
  ImagePlus,
  Mail,
  MapPin,
  Palette,
  Phone,
  Store,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigFormRow,
  ConfigSaveBar,
  ConfigSectionCard,
  MutedHelp,
} from '../../components/management/ConfigSectionCard'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { brand } from '../../theme/brand'

const MAX_LOGO_BYTES = 500 * 1024
const MAX_ADDRESS = 750

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
const textareaClass =
  'min-h-[100px] w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary'

export default function EmailTemplateSettings() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoName, setLogoName] = useState('')
  const [headerColor, setHeaderColor] = useState('#ff0917')
  const [address, setAddress] = useState(
    'Shop 01, Sunrich Apartment, Satpur, College Road, Nashik - 422005.',
  )
  const [contactNo, setContactNo] = useState('9168169991')
  const [emailId, setEmailId] = useState('deveshjobanputra143@gmail.com')
  const [website, setWebsite] = useState('https://www.rajubhaidabeliwale.com/')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function handleLogoChange(file: File | null) {
    if (!file) return
    if (!/\.(png|jpe?g)$/i.test(file.name) && !file.type.startsWith('image/')) {
      showToast('Please upload JPEG/PNG/JPG format')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      showToast('Maximum file size: 500 KB')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoUrl(URL.createObjectURL(file))
    setLogoName(file.name)
  }

  function handleSave() {
    if (address.length > MAX_ADDRESS) {
      showToast('Outlet Address must be under 750 characters')
      return
    }
    showToast('Email template saved')
  }

  function handleCancel() {
    setLogoUrl(null)
    setLogoName('')
    setHeaderColor('#ff0917')
    setAddress(
      'Shop 01, Sunrich Apartment, Satpur, College Road, Nashik - 422005.',
    )
    setContactNo('9168169991')
    setEmailId('deveshjobanputra143@gmail.com')
    setWebsite('https://www.rajubhaidabeliwale.com/')
    if (fileRef.current) fileRef.current.value = ''
    showToast('Changes discarded')
  }

  return (
    <ReportsPageShell
      title={<ConfigBreadcrumb onNavigate={goBack} current="Email Template" />}
      activeItem="config-email-template"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        This email template configured would be utilised in emails sent for
        Ebill and Gift card service only.
      </p>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="min-w-0">
          <ConfigSectionCard
            icon={<Palette size={16} />}
            title="Branding & Header"
            description="Upload your logo and choose the header colour shown at the top of the email."
          >
            <div className="space-y-4">
              <ConfigFormRow label="Add Logo">
                <>
                  <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-page/50 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Uploaded logo"
                        className="max-h-16 object-contain"
                      />
                    ) : (
                      <>
                        <ImagePlus size={28} className="text-muted" />
                        <span className="text-sm text-muted">Upload logo</span>
                      </>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                      className="sr-only"
                      onChange={(event) =>
                        handleLogoChange(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  {logoName ? (
                    <MutedHelp>Selected file: {logoName}</MutedHelp>
                  ) : null}
                  <MutedHelp>
                    Note: Please upload file in JPEG/PNG/JPG format. Maximum
                    file size: 500 KB
                  </MutedHelp>
                </>
              </ConfigFormRow>

              <ConfigFormRow label="Header Color" align="center">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={headerColor}
                    onChange={(event) => setHeaderColor(event.target.value)}
                    className="size-10 cursor-pointer rounded-md border border-line bg-card p-1"
                    aria-label="Header color picker"
                  />
                  <input
                    type="text"
                    value={headerColor.toUpperCase()}
                    onChange={(event) => setHeaderColor(event.target.value)}
                    className={`${inputClass} max-w-[140px]`}
                  />
                </div>
              </ConfigFormRow>
            </div>
          </ConfigSectionCard>

          <ConfigSectionCard
            icon={<Store size={16} />}
            title="Outlet Contact Details"
            description="These details appear in the footer of every email sent using this template."
          >
            <div className="space-y-4">
              <ConfigFormRow label="Outlet Address">
                <>
                  <textarea
                    value={address}
                    maxLength={MAX_ADDRESS}
                    onChange={(event) => setAddress(event.target.value)}
                    className={textareaClass}
                  />
                  <MutedHelp>
                    Note: Must be under 750 characters. ({address.length}/
                    {MAX_ADDRESS})
                  </MutedHelp>
                </>
              </ConfigFormRow>

              <ConfigFormRow label="Outlet Contact No." align="center">
                <input
                  type="text"
                  value={contactNo}
                  onChange={(event) => setContactNo(event.target.value)}
                  className={`${inputClass} max-w-md`}
                />
              </ConfigFormRow>

              <ConfigFormRow label="Outlet Email Id" align="center">
                <input
                  type="email"
                  value={emailId}
                  onChange={(event) => setEmailId(event.target.value)}
                  className={`${inputClass} max-w-md`}
                />
              </ConfigFormRow>

              <ConfigFormRow label="Outlet Web Site" align="center">
                <input
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  className={`${inputClass} max-w-md`}
                />
              </ConfigFormRow>
            </div>
          </ConfigSectionCard>

          <ConfigSaveBar onCancel={handleCancel} onSave={handleSave} />
        </div>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">Email Preview</p>
            </div>

            <div className="bg-page/40 p-4">
              <div className="overflow-hidden rounded-lg border border-line bg-card">
                <div
                  className="flex items-center justify-between px-4 py-4"
                  style={{ backgroundColor: headerColor }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-10 max-w-[120px] object-contain"
                    />
                  ) : (
                    <BrandLogo size={40} className="rounded-full bg-white/10" />
                  )}
                  <span className="text-xs font-bold tracking-wide text-white/90">
                    {brand.shortName.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 px-5 py-6 text-sm leading-relaxed text-ink">
                  <p>Hello,</p>
                  <p>Greetings of the day.</p>
                  <p>
                    Payment of {brand.currency} 560 has been done successfully at{' '}
                    {brand.shopName} from the gift card 1234567890.
                  </p>
                  <p>
                    Remaining balance: {brand.currency} 9082
                  </p>
                </div>

                <div className="space-y-3 bg-ink px-5 py-4 text-xs leading-relaxed text-white/90">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-white/70" />
                    <span>{address || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="shrink-0 text-white/70" />
                    <span>{contactNo || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="shrink-0 text-white/70" />
                    <span>{emailId || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="shrink-0 text-white/70" />
                    <span className="break-all">{website || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </ReportsPageShell>
  )
}
