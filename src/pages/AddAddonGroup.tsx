import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { useAuth } from '../auth/AuthContext'
import { createAddonGroupApi } from '../services/menuService'
import { showToast } from '../utils/toast'
import type { AddonGroupPayload } from '../types/menu'

export default function AddAddonGroup() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [departmentName, setDepartmentName] = useState('')
  const [onlineDisplayName, setOnlineDisplayName] = useState('')
  const [status, setStatus] = useState(true)
  const [saving, setSaving] = useState(false)

  function goBack() {
    navigate('/menu/addons')
  }

  async function handleSave() {
    if (!departmentName.trim()) {
      showToast('Please enter a department name')
      return
    }
    if (!encryptedOutletId) {
      showToast('No active outlet selected')
      return
    }
    const payload: AddonGroupPayload = {
      department_name: departmentName.trim(),
      online_display_name: onlineDisplayName.trim(),
      is_active: status,
    }
    setSaving(true)
    try {
      await createAddonGroupApi(encryptedOutletId, payload)
      showToast('Addon group created')
      window.setTimeout(goBack, 700)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create addon group',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <MenuPageShell
      backTo="/menu/addons"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/addons" className="text-primary hover:underline">
            Addon Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Addon Group</span>
        </span>
      }
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg border border-line bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-base font-bold text-ink">
            Department Details
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Department Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Online Display Name
              </label>
              <input
                type="text"
                value={onlineDisplayName}
                onChange={(event) => setOnlineDisplayName(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={status}
                onChange={(event) => setStatus(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              Status
            </label>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}