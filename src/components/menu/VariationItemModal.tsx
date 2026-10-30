import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { SearchableSelect } from '../inventory/SearchableSelect'
import {
  createVariationGroupApi,
  updateVariationGroupApi,
} from '../../services/menuService'
import type { Variation, VariationGroup } from '../../types/menu'
import { groupVariationsPayload } from '../../utils/variationGroupPayload'
import { showToast } from '../../utils/toast'

/** The departments a variation can sit in; a group of that name is created when it is first used. */
const DEPARTMENTS = [
  'Size',
  'Portion',
  'Quantity',
  'Portion Size',
  'Customisation',
  'Preparation',
]

interface VariationItemModalProps {
  open: boolean
  outletId: string
  /** Existing departments (variation groups); a variation lives in exactly one. */
  groups: VariationGroup[]
  /** The variation being edited, with its department; omit to add one. */
  editing: { group: VariationGroup; variation: Variation } | null
  onClose: () => void
  onSaved: () => void
}

const FIELD =
  'h-11 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary disabled:bg-page disabled:text-muted'

/**
 * Add or edit ONE variation (Regular, 250Gm ...) and the department it belongs
 * to (Size, Quantity ...). Saved through the group API, which replaces a group's
 * variation list, so the group's other variations are sent back unchanged.
 */
export function VariationItemModal({
  open,
  outletId,
  groups,
  editing,
  onClose,
  onSaved,
}: VariationItemModalProps) {
  const [name, setName] = useState('')
  const [onlineName, setOnlineName] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(editing?.variation.name ?? '')
    setOnlineName(editing?.variation.online_display_name ?? '')
    setDepartment(editing?.group.department_name ?? '')
    setStatus(editing?.variation.is_active ?? true)
    setShowErrors(false)
  }, [open, editing])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const nameMissing = name.trim() === ''
  const departmentMissing = department === ''

  async function handleSave() {
    if (nameMissing || departmentMissing) {
      setShowErrors(true)
      return
    }
    const fields = {
      name: name.trim(),
      online_display_name: onlineName.trim(),
      is_active: status,
    }
    setSaving(true)
    try {
      if (editing) {
        await updateVariationGroupApi(outletId, editing.group.id, {
          variations: groupVariationsPayload(editing.group, (variation) =>
            variation.id === editing.variation.id ? fields : undefined,
          ),
        })
      } else {
        const group = groups.find(
          (g) => g.department_name.toLowerCase() === department.toLowerCase(),
        )
        if (group) {
          await updateVariationGroupApi(outletId, group.id, {
            variations: [...groupVariationsPayload(group), fields],
          })
        } else {
          await createVariationGroupApi(outletId, {
            department_name: department,
            online_display_name: department,
            is_active: true,
            variations: [fields],
          })
        }
      }
      showToast(editing ? 'Variation updated' : 'Variation added')
      onSaved()
      onClose()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save the variation')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? 'Edit Variation' : 'Add Variation'}
        className="relative z-10 w-full max-w-3xl rounded-xl border border-line bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-base font-bold text-ink">
            {editing ? 'Edit Variation' : 'Add Variation'}
          </h2>
          <button
            type="button"
            aria-label="Close"
            data-tooltip="Close"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-ink">
              Name <span className="text-primary">*</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={showErrors && nameMissing}
                className={`${FIELD} mt-1.5 ${showErrors && nameMissing ? 'border-primary' : ''}`}
              />
              {showErrors && nameMissing ? (
                <span className="mt-1 block text-xs text-primary">Name is required.</span>
              ) : null}
            </label>
            <label className="block text-sm font-medium text-ink">
              Online Display Name
              <input
                type="text"
                value={onlineName}
                onChange={(event) => setOnlineName(event.target.value)}
                className={`${FIELD} mt-1.5`}
              />
            </label>
            {editing ? (
              <label className="block text-sm font-medium text-ink">
                Department Name
                <input type="text" value={department} disabled className={`${FIELD} mt-1.5`} />
              </label>
            ) : (
              <div>
                <SearchableSelect
                  label="Department Name"
                  required
                  value={department}
                  options={DEPARTMENTS}
                  placeholder="Select"
                  includePlaceholderOption
                  dropdownPlacement="auto"
                  onChange={setDepartment}
                />
                {showErrors && departmentMissing ? (
                  <span className="mt-1 block text-xs text-primary">Choose a department.</span>
                ) : null}
              </div>
            )}
          </div>

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

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
