import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import {
  updateAddonCommissionApi,
  updateItemCommissionApi,
} from '../../services/menuService'
import { showError, showToast } from '../../utils/toast'
import { CommissionTypeSelect } from './CommissionTypeSelect'
import type {
  AddonCommission,
  CommissionPayload,
  ItemCommission,
} from '../../types/menu'

type CommissionRow = ItemCommission | AddonCommission

interface UpdateItemCommissionModalProps {
  open: boolean
  onClose: () => void
  row: CommissionRow | null
  kind: 'item' | 'addon'
  onSaved: (updated: CommissionRow) => void
}

export function UpdateItemCommissionModal({
  open,
  onClose,
  row,
  kind,
  onSaved,
}: UpdateItemCommissionModalProps) {
  const titleId = useId()
  const typeId = useId()
  const valueId = useId()
  const { encryptedOutletId } = useAuth()
  const [commissionType, setCommissionType] = useState('Not Configured')
  const [commissionValue, setCommissionValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setCommissionType(row?.commission_type ?? 'Not Configured')
    setCommissionValue(
      row?.commission_value == null ? '' : String(row.commission_value),
    )
    setError('')
    setSaving(false)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, row, onClose])

  if (!open || !row) return null

  const currentRow = row

  const name =
    kind === 'addon' && 'addon_name' in currentRow
      ? currentRow.addon_name
      : 'item_name' in currentRow
        ? currentRow.item_name
        : ''
  const secondaryLabel = kind === 'addon' ? 'Group' : 'Category'
  const secondaryValue =
    kind === 'addon' && 'group_name' in currentRow
      ? currentRow.group_name
      : 'category_name' in currentRow
        ? currentRow.category_name
        : ''

  const valueDisabled = commissionType === 'Not Configured'
  const valueSuffix =
    commissionType === 'Fixed'
      ? '₹'
      : commissionType === 'Percentage'
        ? '%'
        : null

  async function handleSave() {
    if (!encryptedOutletId) return
    const type: CommissionPayload['commission_type'] =
      commissionType === 'Percentage' || commissionType === 'Fixed'
        ? commissionType
        : 'Not Configured'

    if (type !== 'Not Configured') {
      const trimmed = commissionValue.trim()
      if (!trimmed) {
        setError('Commission value is required')
        return
      }
      const parsed = Number(trimmed)
      if (Number.isNaN(parsed) || parsed < 0) {
        setError('Enter a valid non-negative number')
        return
      }
      if (type === 'Percentage' && parsed > 100) {
        setError('Percentage cannot exceed 100')
        return
      }
    }

    const payload: CommissionPayload = {
      commission_type: type,
      commission_value:
        type === 'Not Configured' || commissionValue.trim() === ''
          ? null
          : commissionValue.trim(),
    }
    setSaving(true)
    setError('')
    try {
      const updated =
        kind === 'addon'
          ? await updateAddonCommissionApi(
              encryptedOutletId,
              currentRow.id,
              payload,
            )
          : await updateItemCommissionApi(
              encryptedOutletId,
              currentRow.id,
              payload,
            )
      showToast('Commission updated successfully')
      onSaved(updated)
      onClose()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update commission'
      setError(message)
      showError(message)
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-md flex-col rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Update {kind === 'addon' ? 'Addon' : 'Item'} Commission
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            data-tooltip="Close dialog"
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="rounded-md border border-line bg-page px-3.5 py-3">
            <p className="text-sm font-semibold text-ink">{name || '—'}</p>
            <p className="mt-1 text-xs text-muted">
              {secondaryLabel}:{' '}
              <span className="font-medium text-ink">
                {secondaryValue || '—'}
              </span>
            </p>
          </div>

          <div>
            <label
              htmlFor={typeId}
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Commission Type
            </label>
            <div id={typeId}>
              <CommissionTypeSelect
                value={commissionType}
                onChange={(next) => {
                  setCommissionType(next)
                  setError('')
                  if (next === 'Not Configured') setCommissionValue('')
                }}
                exclude={['all']}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={valueId}
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Commission Value
              {!valueDisabled ? (
                <span className="text-primary"> *</span>
              ) : null}
            </label>
            <div className="relative">
              {valueSuffix === '₹' ? (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  ₹
                </span>
              ) : null}
              <input
                id={valueId}
                type="text"
                inputMode="decimal"
                value={commissionValue}
                onChange={(event) => {
                  setCommissionValue(event.target.value)
                  if (error) setError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleSave()
                }}
                disabled={valueDisabled}
                placeholder={
                  commissionType === 'Fixed'
                    ? 'Enter amount'
                    : commissionType === 'Percentage'
                      ? 'Enter percentage'
                      : 'Not applicable'
                }
                className={`h-9 w-full rounded-md border bg-card text-sm text-ink outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-page disabled:opacity-60 ${
                  error ? 'border-primary' : 'border-line'
                } ${
                  valueSuffix === '₹'
                    ? 'pl-7 pr-3'
                    : valueSuffix === '%'
                      ? 'px-3 pr-9'
                      : 'px-3'
                }`}
              />
              {valueSuffix === '%' ? (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  %
                </span>
              ) : null}
            </div>
            {error ? (
              <p className="mt-1.5 text-xs text-primary">{error}</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
