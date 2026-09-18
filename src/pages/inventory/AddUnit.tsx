import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WRITE_PERMISSION,
  createUnitApi,
  updateUnitApi,
} from '../../services/inventoryService'

export default function AddUnit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const { units, loadMasters, upsertUnit } = useInventoryMasters()
  const existing = useMemo(
    () => (id ? units.find((row) => row.id === id) : undefined),
    [id, units],
  )
  const isEdit = Boolean(id)

  const [name, setName] = useState(existing?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    setName(existing?.name ?? '')
    setError(null)
  }, [existing?.id, existing?.name])

  async function handleSave() {
    if (!canWrite) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const row = isEdit && id
        ? await updateUnitApi(id, { name: trimmed })
        : await createUnitApi(trimmed)
      upsertUnit(row)
      showToast(isEdit ? 'Unit updated' : 'Unit created')
      navigate('/inventory/units')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save unit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <InventoryPageShell activeItem="units">
      <div className="flex min-h-[calc(100vh-7.5rem)] flex-col rounded-xl border border-line bg-card">
        <div className="flex-1 p-5 sm:p-6">
          <h1 className="mb-5 text-lg font-bold text-ink">
            {isEdit ? 'Edit Unit Name' : 'Add Unit Name'}
          </h1>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (error) setError(null)
              }}
              autoFocus
              disabled={!canWrite}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
            />
            {error ? (
              <p className="mt-1.5 text-xs text-primary">{error}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3 sm:px-6">
          <OutlineButton onClick={() => navigate('/inventory/units')}>
            Cancel
          </OutlineButton>
          {canWrite ? (
            <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
              Save Changes
            </PrimaryButton>
          ) : null}
        </div>
      </div>
    </InventoryPageShell>
  )
}
