import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { getUnitById, type UnitRow } from '../../mocks/unitsData'

export default function AddUnit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const stateRow = (location.state as { row?: UnitRow } | null)?.row
  const existing = useMemo(
    () => stateRow ?? (id ? getUnitById(id) : undefined),
    [stateRow, id],
  )
  const isEdit = Boolean(id) || Boolean(existing)

  const [name, setName] = useState(existing?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setName(existing?.name ?? '')
    setError(null)
  }, [existing?.id, existing?.name])

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }
    setError(null)
    setToast(isEdit ? 'Unit updated' : 'Unit created')
    window.setTimeout(() => navigate('/inventory/units'), 500)
  }

  return (
    <InventoryPageShell activeItem="units">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

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
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
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
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </InventoryPageShell>
  )
}
