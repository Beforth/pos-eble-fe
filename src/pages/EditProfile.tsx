import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useChrome } from '../state/ChromeContext'

import { showToast } from '../utils/toast'
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
import { ApiError } from '../services/apiClient'
import {
  CHANGE_OWN_PASSWORD_PERMISSION,
  EDIT_OWN_PROFILE_PERMISSION,
  changePasswordApi,
  fetchMeApi,
  updateProfileApi,
  type AuthUser,
} from '../services/authService'
import { brand } from '../theme/brand'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/
const MAX_PHOTO_BYTES = 500 * 1024
const MIN_PASSWORD_LENGTH = 8

interface FieldErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

function firstFieldError(errors: unknown, key: string): string | undefined {
  if (!errors || typeof errors !== 'object') return undefined
  const value = (errors as Record<string, unknown>)[key]
  if (Array.isArray(value)) {
    const parts = value.filter((item): item is string => typeof item === 'string')
    return parts.length ? parts.join(' ') : undefined
  }
  if (typeof value === 'string') return value
  return undefined
}

export default function EditProfile() {
  const navigate = useNavigate()
<<<<<<< HEAD
  const { user, updateProfile, hasPermission } = useAuth()
  const canEdit = hasPermission(EDIT_OWN_PROFILE_PERMISSION)
  const canChangePassword = hasPermission(CHANGE_OWN_PASSWORD_PERMISSION)
=======
  const { user, updateProfile, homePath } = useAuth()
>>>>>>> origin/main

  const { collapsed, toggleCollapsed } = useChrome()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl ?? '')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const fileRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  function applyUserToForm(next: AuthUser) {
    setFirstName(next.firstName ?? '')
    setLastName(next.lastName ?? '')
    setEmail(next.email ?? '')
    setPhone(next.phone ?? '')
    setPhotoUrl(next.photoUrl ?? '')
    setPhotoFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const next = await fetchMeApi()
        if (cancelled) return
        updateProfile(next)
        applyUserToForm(next)
      } catch (err) {
        if (!cancelled && err instanceof ApiError) {
          showToast(err.message)
        } else if (!cancelled) {
          showToast('Unable to load profile')
        }
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [updateProfile])

  function closeOtherDrawers() {
    setSupportOpen(false)
    setNotificationsOpen(false)
  }

  function handlePhotoChange(file: File | null) {
    if (!file || !canEdit) return
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
    setPhotoFile(file)
  }

  function validateProfile(): boolean {
    const next: FieldErrors = {}
    if (!firstName.trim() && !lastName.trim()) {
      next.firstName = 'First name or last name is required'
    }
    if (!email.trim()) next.email = 'Email is required'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email'

    if (phone.trim() && !PHONE_RE.test(phone.trim())) {
      next.phone = 'Enter a valid 10-digit mobile number'
    }

    setErrors((prev) => ({
      ...prev,
      firstName: next.firstName,
      lastName: next.lastName,
      email: next.email,
      phone: next.phone,
    }))
    return Object.keys(next).length === 0
  }

  function validatePassword(): boolean {
    const next: FieldErrors = {}
    if (!currentPassword) next.currentPassword = 'Current password is required'
    if (!newPassword) next.newPassword = 'New password is required'
    else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      next.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }
    if (!confirmPassword) next.confirmPassword = 'Confirm the new password'
    else if (newPassword && confirmPassword !== newPassword) {
      next.confirmPassword = 'Passwords do not match'
    }

    setErrors((prev) => ({
      ...prev,
      currentPassword: next.currentPassword,
      newPassword: next.newPassword,
      confirmPassword: next.confirmPassword,
    }))
    return Object.keys(next).length === 0
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canEdit) {
      showToast('You do not have permission to edit your profile')
      return
    }
    if (!validateProfile()) {
      showToast('Please fix the highlighted fields')
      return
    }

    setSavingProfile(true)
    try {
      const next = await updateProfileApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photo: photoFile,
      })
      updateProfile(next)
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      applyUserToForm(next)
      showToast('Profile updated')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors((prev) => ({
          ...prev,
          firstName: firstFieldError(err.errors, 'first_name') ?? prev.firstName,
          lastName: firstFieldError(err.errors, 'last_name') ?? prev.lastName,
          email: firstFieldError(err.errors, 'email') ?? prev.email,
          phone: firstFieldError(err.errors, 'phone') ?? prev.phone,
        }))
        showToast(err.message)
      } else {
        showToast('Unable to update profile')
      }
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canChangePassword) {
      showToast('You do not have permission to change your password')
      return
    }
    if (!validatePassword()) {
      showToast('Please fix the highlighted fields')
      return
    }

    setSavingPassword(true)
    try {
      await changePasswordApi(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors((prev) => ({
        ...prev,
        currentPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      }))
      showToast('Password changed')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors((prev) => ({
          ...prev,
          currentPassword:
            firstFieldError(err.errors, 'current_password') ?? prev.currentPassword,
          newPassword:
            firstFieldError(err.errors, 'new_password') ?? prev.newPassword,
        }))
        showToast(err.message)
      } else {
        showToast('Unable to change password')
      }
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
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
              <Button variant="outline" onClick={() => navigate(homePath())}>
                Cancel
              </Button>
              {canEdit ? (
                <Button
                  type="submit"
                  form="edit-profile-form"
                  loading={savingProfile}
                  disabled={loadingProfile}
                >
                  Save
                </Button>
              ) : null}
            </div>
          }
        >
          <form
            id="edit-profile-form"
            onSubmit={handleProfileSubmit}
            noValidate
            className="w-full space-y-4"
          >
            <section className="rounded-xl border border-line bg-card p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-deep">Personal info</h2>
              <p className="mt-0.5 text-xs text-muted">
                {canEdit
                  ? 'Update how this account appears across the POS.'
                  : 'You can view your profile. Editing requires the Edit Profile permission.'}
              </p>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="shrink-0">
                  <p className="mb-2 text-sm font-medium text-ink">Photo</p>
                  <label
                    className={`flex size-28 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-page text-center ${
                      canEdit
                        ? 'cursor-pointer hover:border-primary/40'
                        : 'cursor-not-allowed opacity-80'
                    }`}
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={
                          [firstName, lastName].filter(Boolean).join(' ') ||
                          'Profile'
                        }
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
                      disabled={!canEdit}
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
                    label="First name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    error={errors.firstName}
                    disabled={!canEdit || loadingProfile}
                  />
                  <Input
                    label="Last name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    error={errors.lastName}
                    disabled={!canEdit || loadingProfile}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    error={errors.email}
                    required
                    disabled={!canEdit || loadingProfile}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    error={errors.phone}
                    hint="10-digit Indian mobile number"
                    disabled={!canEdit || loadingProfile}
                  />
                  <Input
                    label="Username"
                    value={user?.identifier ?? ''}
                    readOnly
                    disabled
                  />
                  <div className="sm:col-span-2 xl:col-span-3">
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
          </form>

          <section className="mt-4 rounded-xl border border-line bg-card p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-deep">POS profile</h2>
            <p className="mt-0.5 text-xs text-muted">
              These details are set by an administrator and cannot be edited here.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Input
                label="User code"
                value={user?.userCode ?? ''}
                readOnly
                disabled
              />
              <Input
                label="Role"
                value={user?.role?.name ?? ''}
                readOnly
                disabled
              />
              <Input
                label="Last login IP"
                value={user?.lastLoginIp ?? ''}
                readOnly
                disabled
              />
            </div>
          </section>

          <form
            id="change-password-form"
            onSubmit={handlePasswordSubmit}
            noValidate
            className="mt-4 w-full"
          >
            <section className="rounded-xl border border-line bg-card p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-deep">Change password</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {canChangePassword
                      ? 'Leave blank to keep the current password.'
                      : 'Changing password requires the Change Password permission.'}
                  </p>
                </div>
                {canChangePassword ? (
                  <Button
                    type="submit"
                    loading={savingPassword}
                    disabled={loadingProfile}
                  >
                    Update password
                  </Button>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="Current password"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  error={errors.currentPassword}
                  disabled={!canChangePassword}
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
                  hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  disabled={!canChangePassword}
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
                  disabled={!canChangePassword}
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
