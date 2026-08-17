import { useState, type ReactNode } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { BillerPermissionsPanel } from '../../components/management/BillerPermissionsPanel'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

type FormTab = 'basic' | 'permissions'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-page px-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:bg-card'

const USER_TYPES = [
  'Billing User',
  'Delivery Boy',
  'Waiter',
  'Captain',
  'Online Acceptance App',
] as const

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

export default function AddBiller() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<FormTab>('basic')
  const [toast, setToast] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [name, setName] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [userPasscode, setUserPasscode] = useState('')
  const [discountCapping, setDiscountCapping] =
    useState<(typeof DISCOUNT_CAPPING)[number]>('No Capping')
  const [userType, setUserType] =
    useState<(typeof USER_TYPES)[number]>('Billing User')
  const [userCode, setUserCode] = useState('')
  const [phone, setPhone] = useState('')
  const [swipeCode, setSwipeCode] = useState('')
  const [discountValue, setDiscountValue] = useState('')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/user-management/biller-app')
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!userName.trim()) next.userName = 'User Name is required'
    if (!password.trim()) next.password = 'Password is required'
    if (!userPasscode.trim()) next.userPasscode = 'User Passcode is required'
    if (!userCode.trim()) next.userCode = 'User Code is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleCreate() {
    setActiveTab('basic')
    if (!validate()) {
      showToast('Please fill all required fields')
      return
    }
    showToast('Billing user created')
    window.setTimeout(goBack, 700)
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
          Add Billing User
        </span>
      }
      activeItem="user-mgmt-biller-app"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton variant="gray" onClick={goBack}>
            Discard
          </OutlineButton>
          <PrimaryButton onClick={handleCreate}>
            <Plus size={15} />
            Create
          </PrimaryButton>
        </div>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
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
                options={[...USER_TYPES]}
                onChange={(value) =>
                  setUserType(value as (typeof USER_TYPES)[number])
                }
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
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Swipe Code">
                <input
                  type="text"
                  value={swipeCode}
                  onChange={(event) => setSwipeCode(event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Discount Value">
                <input
                  type="text"
                  inputMode="decimal"
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>
      ) : (
        <BillerPermissionsPanel />
      )}
    </ReportsPageShell>
  )
}
