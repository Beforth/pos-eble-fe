import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { useInventoryQuickAdd } from '../../components/inventory/InventoryQuickAdd'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WRITE_PERMISSION,
  createCategoryApi,
  updateCategoryApi,
} from '../../services/inventoryService'

export default function AddInventoryCategory() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const { categories, loadMasters, upsertCategory } = useInventoryMasters()
  const existing = useMemo(
    () => (id ? categories.find((row) => row.id === id) : undefined),
    [id, categories],
  )
  const isEdit = Boolean(id)
  const parentOptions = useMemo(
    () =>
      categories
        .filter((row) => row.id !== id)
        .map((row) => row.name),
    [categories, id],
  )

  const [name, setName] = useState(existing?.name ?? '')
  const [parentName, setParentName] = useState(existing?.parent_name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const quickAdd = useInventoryQuickAdd()

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    setName(existing?.name ?? '')
    setParentName(existing?.parent_name ?? '')
  }, [existing?.id, existing?.name, existing?.parent_name])

  async function handleSave() {
    if (!canWrite) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }
    const parent = parentName
      ? categories.find((row) => row.name === parentName)
      : null
    if (parentName && !parent) {
      setError('Select a parent from the category list')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const payload = {
        name: trimmed,
        parent_id: parent?.id ?? null,
      }
      const row = isEdit && id
        ? await updateCategoryApi(id, payload)
        : await createCategoryApi(payload)
      upsertCategory(row)
      showToast(isEdit ? 'Category updated' : 'Category created')
      navigate('/inventory/categories')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to save category',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <InventoryPageShell activeItem="categories">
      <div className="flex min-h-[calc(100vh-7.5rem)] flex-col rounded-xl border border-line bg-card">
        <div className="flex-1 p-5 sm:p-6">
          <h1 className="mb-5 text-lg font-bold text-ink">
            {isEdit ? 'Edit Category' : 'Add Category'}
          </h1>

          <div className="grid max-w-xl gap-4">
            <div>
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
            </div>
            <SearchableSelect
              label="Parent category"
              value={parentName}
              options={parentOptions}
              placeholder="None"
              searchPlaceholder="Search"
              includePlaceholderOption
              onChange={setParentName}
              onAddNew={quickAdd.handler('category', (row) =>
                setParentName(row.name),
              )}
            />
            {error ? <p className="text-xs text-primary">{error}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3 sm:px-6">
          <OutlineButton onClick={() => navigate('/inventory/categories')}>
            Cancel
          </OutlineButton>
          {canWrite ? (
            <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
              Save Changes
            </PrimaryButton>
          ) : null}
        </div>
      </div>
      {quickAdd.host}
    </InventoryPageShell>
  )
}
