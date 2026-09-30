import { useEffect, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { ApiError } from '../../services/apiClient'
import {
  createRoleApi,
  updateRoleApi,
} from '../../services/roleService'
import { useRoles } from '../../state/RoleContext'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-page px-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:bg-card'

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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export default function AddRole() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { roles, status, loadRoles, upsertRole } = useRoles()

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [codeTouched, setCodeTouched] = useState(false)


  function goBack() {
    navigate('/management/user-management/roles')
  }

  useEffect(() => {
    void loadRoles()
  }, [loadRoles])

  useEffect(() => {
    if (!id || status !== 'ready') return
    const role = roles.find((row) => String(row.id) === String(id))
    if (!role) {
      showToast('Role not found')
      window.setTimeout(goBack, 700)
      return
    }
    setName(role.name)
    setCode(role.code)
    setCodeTouched(isEdit)
    setDescription(role.description ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status, roles])

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Role name is required'
    if (!code.trim()) next.code = 'Code is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (!validate()) {
      showToast('Please fill all required fields')
      return
    }
    setServerError(null)
    const payload = { name: name.trim(), code: code.trim(), description }
    try {
      if (isEdit && id) {
        const saved = await updateRoleApi(id, payload)
        upsertRole(saved)
        showToast('Role updated')
      } else {
        const saved = await createRoleApi(payload)
        upsertRole(saved)
        showToast('Role created')
      }
      window.setTimeout(goBack, 700)
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(
          typeof err.errors === 'object' && err.errors !== null
            ? (err.errors as Record<string, string>)
            : {},
        )
      }
      setServerError(err instanceof ApiError ? err.message : 'Unable to save.')
    }
  }

  return (
    <ReportsPageShell
      title={
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back to Roles"
            data-tooltip="Back to Roles"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <ArrowLeft size={18} />
          </button>
          {isEdit ? 'Edit Role' : 'Add Role'}
        </span>
      }
      activeItem="user-mgmt-roles"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton variant="gray" onClick={goBack}>
            Discard
          </OutlineButton>
          <PrimaryButton onClick={() => void handleSave()}>
            <Save size={15} />
            {isEdit ? 'Update' : 'Create'}
          </PrimaryButton>
        </div>
      }
    >

      {isEdit && status !== 'ready' ? (
        <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-muted">
          Loading role…
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
          {serverError ? (
            <div className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {serverError}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2 md:gap-x-8">
            <div className="space-y-5">
              <Field label="Role Name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    if (!codeTouched) {
                      setCode(slugify(event.target.value))
                    }
                    if (errors.name) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.name
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.name ? 'border-danger' : ''}`}
                  placeholder="e.g. Billing User"
                />
                {errors.name ? (
                  <span className="text-xs text-danger">{errors.name}</span>
                ) : null}
              </Field>

              <Field label="Code" required>
                <input
                  type="text"
                  value={code}
                  onChange={(event) => {
                    setCodeTouched(true)
                    setCode(event.target.value)
                    if (errors.code) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.code
                        return next
                      })
                    }
                  }}
                  className={`${inputClass} ${errors.code ? 'border-danger' : ''}`}
                  placeholder="e.g. billing"
                />
                {errors.code ? (
                  <span className="text-xs text-danger">{errors.code}</span>
                ) : null}
              </Field>
            </div>

            <div className="space-y-5">
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary focus:bg-card"
                  placeholder="What does this role do?"
                />
              </Field>
            </div>
          </div>
        </div>
      )}
    </ReportsPageShell>
  )
}