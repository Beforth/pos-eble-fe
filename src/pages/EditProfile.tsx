import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Eye, EyeOff, ImagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { PageContainer } from '../components/layout/PageContainer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import { brand } from '../theme/brand'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/
const MAX_PHOTO_BYTES = 500 * 1024

interface FieldErrors {
  name?: string
  email?: string
  phone?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function EditProfile() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.identifier ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function closeOtherDrawers() {
    setSupportOpen(false)
    setNotificationsOpen(false)
  }

  function handlePhotoChange(file: File | null) {
    if (!file) return
    if (!/\.(png|jpe?g)$/i.test(file.name) && !file.type.startsWith('image/')) {
      showToast('Please upload a JPEG or PNG image')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      showToast('Maximum file size is 500 KB')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setPhotoUrl(url)
  }

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email'

    if (phone.trim() && !PHONE_RE.test(phone.trim())) {
      next.phone = 'Enter a valid 10-digit mobile number'
    }

    const changingPassword =
      Boolean(currentPassword) || Boolean(newPassword) || Boolean(confirmPassword)

    if (changingPassword) {
      if (!currentPassword) next.currentPassword = 'Current password is required'
      if (!newPassword) next.newPassword = 'New password is required'
      else if (newPassword.length < 4) {
        next.newPassword = 'Password must be at least 4 characters'
      }
      if (!confirmPassword) next.confirmPassword = 'Confirm the new password'
      else if (newPassword && confirmPassword !== newPassword) {
        next.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) {
      showToast('Please fix the highlighted fields')
      return
    }

    setSaving(true)
    updateProfile({
      name: name.trim(),
      identifier: email.trim(),
      phone: phone.trim() || undefined,
      photoUrl: photoUrl || undefined,
    })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setSaving(false)
    showToast('Profile updated')
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem="dashboard"
      />

      <SupportAgentDrawer
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <div
        className={`transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'}`}
      >
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          onSupportClick={() => {
            closeOtherDrawers()
            setSupportOpen(true)
          }}
          onNotificationsClick={() => {
            closeOtherDrawers()
            setNotificationsOpen(true)
          }}
          outletName={brand.outletName}
        />

        <PageContainer
          title="Edit profile"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-profile-form"
                loading={saving}
              >
                Save
              </Button>
            </div>
          }
        >
          {toast ? (
            <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
              {toast}
            </div>
          ) : null}

          <form
            id="edit-profile-form"
            onSubmit={handleSubmit}
            noValidate
            className="w-full space-y-4"
          >
            <section className="rounded-xl border border-line bg-card p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-deep">Basic details</h2>
              <p className="mt-0.5 text-xs text-muted">
                Update how this account appears across the POS.
              </p>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="shrink-0">
                  <p className="mb-2 text-sm font-medium text-ink">Photo</p>
                  <label className="flex size-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-page text-center hover:border-primary/40">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={name || 'Profile'}
                        className="size-full object-cover"
                      />
                    ) : (
                      <>
                        <ImagePlus size={22} className="text-muted" />
                        <span className="mt-1 text-[11px] text-muted">Upload</span>
                      </>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      onChange={(event) =>
                        handlePhotoChange(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  <p className="mt-1.5 text-[11px] text-muted">
                    JPEG/PNG, 500 KB max
                  </p>
                </div>

                <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Input
                    label="Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    error={errors.phone}
                    hint="10-digit Indian mobile number"
                  />
                  <Input
                    label="Username"
                    value={user?.identifier ?? ''}
                    readOnly
                    disabled
                  />
                  <div className="sm:col-span-2 xl:col-span-4">
                    <Input
                      label="Outlet"
                      value={user?.outlet ?? brand.outletName}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-line bg-card p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-deep">Change password</h2>
              <p className="mt-0.5 text-xs text-muted">
                Leave blank to keep the current password.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Current password"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  error={errors.currentPassword}
                  rightSlot={
                    <button
                      type="button"
                      aria-label={showCurrent ? 'Hide password' : 'Show password'}
                      onClick={() => setShowCurrent((prev) => !prev)}
                      className="rounded p-1 text-muted hover:text-ink"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Input
                  label="New password"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  error={errors.newPassword}
                  rightSlot={
                    <button
                      type="button"
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                      onClick={() => setShowNew((prev) => !prev)}
                      className="rounded p-1 text-muted hover:text-ink"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Input
                  label="Confirm password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={errors.confirmPassword}
                  rightSlot={
                    <button
                      type="button"
                      aria-label={
                        showConfirm ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="rounded p-1 text-muted hover:text-ink"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
            </section>
          </form>
        </PageContainer>
      </div>
    </div>
  )
}
