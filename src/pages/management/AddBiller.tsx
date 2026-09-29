import { useEffect, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ApiError } from '../../services/apiClient'
import { createUserApi, getUserApi, updateUserApi } from '../../services/userService'
import {
  BillerPermissionsPanel,
  type BillerPermissionsValue,
} from '../../components/management/BillerPermissionsPanel'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useRoles } from '../../state/RoleContext'

type FormTab = 'basic' | 'permissions'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-page px-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:bg-card'

const DISCOUNT_CAPPING = ['Percentage', 'Fixed', 'No Capping'] as const

function RequiredMark() {
  return <span className="text-danger">*</span>
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">
        {label} {required ? <RequiredMark /> : null}
      </span>
      {children}
    </label>
  )
}

function serverFieldKey(key: string): string {
  switch (key) {
    case 'username':
      return 'userName'
    case 'first_name':
      return 'name'
    case 'user_code':
      return 'userCode'
    case 'role_id':
      return 'userType'
    case 'passcode':
      return 'userPasscode'
    case 'swipe_code':
      return 'swipeCode'
    case 'discount_capping':
      return 'discountCapping'
    case 'discount_value':
      return 'discountValue'
    default:
      return key
  }
}

function mapServerErrors(errors: unknown): Record<string, string> {
  if (typeof errors !== 'object' || errors === null) return {}
  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries(errors)) {
    const message = Array.isArray(value) ? value[0] : String(value)
    if (message) next[serverFieldKey(key)] = message
  }
  return next
}

export default function AddBiller() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { roles, loadRoles } = useRoles()
  const [activeTab, setActiveTab] = useState<FormTab>('basic')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editInitial, setEditInitial] = useState<BillerPermissionsValue | null>(
    null,
  )
  const [panelValue, setPanelValue] = useState<BillerPermissionsValue | null>(
    null,
  )

  const [name, setName] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [userPasscode, setUserPasscode] = useState('')
  const [discountCapping, setDiscountCapping] =
    useState<(typeof DISCOUNT_CAPPING)[number]>('No Capping')
  const [userType, setUserType] = useState('Billing User')
  const [userCode, setUserCode] = useState('')
  const [phone, setPhone] = useState('')
  const [swipeCode, setSwipeCode] = useState('')
  const [discountValue, setDiscountValue] = useState('')


  function goBack() {
    navigate('/management/user-management/biller-app')
  }

  useEffect(() => {
    void loadRoles()
  }, [loadRoles])

  useEffect(() => {
    if (roles.length > 0 && !roles.some((role) => role.name === userType)) {
      setUserType(roles[0].name)
    }
  }, [roles, userType])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getUserApi(id)
      .then((user) => {
        if (cancelled) return
        setName(user.name)
        setUserName(user.username)
        setUserPasscode(user.passcode || '')
        setDiscountCapping(
          (user.discount_capping as (typeof DISCOUNT_CAPPING)[number]) ||
            'No Capping',
        )
        if (user.role) setUserType(user.role.name)
        setUserCode(user.user_code || '')
        setPhone(user.phone || '')
        setSwipeCode(user.swipe_code || '')
        setDiscountValue(
          user.discount_value != null ? String(user.discount_value) : '',
        )
        setEditInitial({
          group: user.memberships?.[0]?.groups?.[0] ?? '',
        })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setServerError(
            err instanceof ApiError
              ? err.message
              : 'Failed to load billing user',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!userName.trim()) next.userName = 'User Name is required'
    if (!isEdit && !password.trim()) next.password = 'Password is required'
    if (!userPasscode.trim()) next.userPasscode = 'User Passcode is required'
    if (!userCode.trim()) next.userCode = 'User Code is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    setActiveTab('basic')
    if (!validate()) {
      showToast('Please fill all required fields')
      return
    }
    setSaving(true)
    setServerError(null)
    const role = roles.find((item) => item.name === userType)
    const payload = {
      username: userName.trim(),
      first_name: name.trim(),
      password: password.trim(),
      passcode: userPasscode.trim(),
      discount_capping: discountCapping,
      role_id: role?.id ?? null,
      user_code: userCode.trim(),
      phone: phone.trim(),
      swipe_code: swipeCode.trim(),
      discount_value: discountValue.trim() !== '' ? discountValue.trim() : null,
      ...(panelValue
        ? {
            group:
              panelValue.group === 'No Group Selected' ? '' : panelValue.group,
          }
        : {}),
    }
    try {
      if (isEdit && id) {
        await updateUserApi(id, {
          ...payload,
          password: password.trim() ? password.trim() : undefined,
        })
      } else {
        await createUserApi(payload)
      }
      showToast(isEdit ? 'Billing user updated' : 'Billing user created')
      window.setTimeout(goBack, 700)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(mapServerErrors(err.errors))
      }
      setServerError(
        err instanceof ApiError ? err.message : 'Failed to save billing user',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <ReportsPageShell
      title={
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back to Biller App"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <ArrowLeft size={18} />
          </button>
          {isEdit ? 'Edit Billing User' : 'Add Billing User'}
        </span>
      }
      activeItem="user-mgmt-biller-app"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton variant="gray" onClick={goBack}>
            Discard
          </OutlineButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            {isEdit ? 'Save' : 'Create'}
          </PrimaryButton>
        </div>
      }
    >

      {serverError ? (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {serverError}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {(
          [
            { id: 'basic', label: 'Basic Details' },
            { id: 'permissions', label: 'Permissions' },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'border-b-2 border-primary font-semibold text-primary'
                  : 'border-b-2 border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'basic' ? (
        <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2 md:gap-x-8">
            <div className="space-y-5">
              <Field label="Name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    if (errors.name) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.name
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.name ? 'border-danger' : ''}`}
                />
                {errors.name ? (
                  <span className="text-xs text-danger">{errors.name}</span>
                ) : null}
              </Field>

              <Field label="User Name" required>
                <input
                  type="text"
                  value={userName}
                  onChange={(event) => {
                    setUserName(event.target.value)
                    if (errors.userName) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.userName
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.userName ? 'border-danger' : ''}`}
                />
                {errors.userName ? (
                  <span className="text-xs text-danger">{errors.userName}</span>
                ) : null}
              </Field>

              <Field label="Password" required>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (errors.password) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.password
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.password ? 'border-danger' : ''}`}
                />
                {errors.password ? (
                  <span className="text-xs text-danger">{errors.password}</span>
                ) : null}
              </Field>

              <Field label="User Passcode" required>
                <input
                  type="password"
                  value={userPasscode}
                  onChange={(event) => {
                    setUserPasscode(event.target.value)
                    if (errors.userPasscode) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.userPasscode
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.userPasscode ? 'border-danger' : ''}`}
                />
                {errors.userPasscode ? (
                  <span className="text-xs text-danger">
                    {errors.userPasscode}
                  </span>
                ) : null}
              </Field>

              <SearchableSelect
                label="Discount Capping"
                value={discountCapping}
                options={[...DISCOUNT_CAPPING]}
                onChange={(value) =>
                  setDiscountCapping(value as (typeof DISCOUNT_CAPPING)[number])
                }
              />
            </div>

            <div className="space-y-5">
              <SearchableSelect
                label={
                  <>
                    User Type <span className="text-danger">*</span>
                  </>
                }
                value={userType}
                options={roles.map((role) => role.name)}
                onChange={(value) => setUserType(value)}
              />

              <Field label="User Code" required>
                <input
                  type="text"
                  value={userCode}
                  onChange={(event) => {
                    setUserCode(event.target.value)
                    if (errors.userCode) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.userCode
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.userCode ? 'border-danger' : ''}`}
                />
                {errors.userCode ? (
                  <span className="text-xs text-danger">{errors.userCode}</span>
                ) : null}
              </Field>

              <Field label="Phone">
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value)
                    if (errors.phone) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.phone
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.phone ? 'border-danger' : ''}`}
                />
                {errors.phone ? (
                  <span className="text-xs text-danger">{errors.phone}</span>
                ) : null}
              </Field>

              <Field label="Swipe Code">
                <input
                  type="text"
                  value={swipeCode}
                  onChange={(event) => {
                    setSwipeCode(event.target.value)
                    if (errors.swipeCode) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.swipeCode
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.swipeCode ? 'border-danger' : ''}`}
                />
                {errors.swipeCode ? (
                  <span className="text-xs text-danger">
                    {errors.swipeCode}
                  </span>
                ) : null}
              </Field>

              <Field label="Discount Value">
                <input
                  type="text"
                  inputMode="decimal"
                  value={discountValue}
                  onChange={(event) => {
                    setDiscountValue(event.target.value)
                    if (errors.discountValue) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.discountValue
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.discountValue ? 'border-danger' : ''}`}
                />
                {errors.discountValue ? (
                  <span className="text-xs text-danger">
                    {errors.discountValue}
                  </span>
                ) : null}
              </Field>
            </div>
          </div>
        </div>
      ) : (
        <BillerPermissionsPanel
          initial={editInitial}
          onChange={setPanelValue}
        />
      )}
    </ReportsPageShell>
  )
}
