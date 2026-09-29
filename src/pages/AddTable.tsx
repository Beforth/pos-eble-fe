import { useEffect, useState, type ReactNode } from 'react'

import { showToast } from '../utils/toast'
import { useNavigate } from 'react-router-dom'
import { Info, TableProperties } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { PrimaryButton } from '../components/menu/MenuActionButtons'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../services/apiClient'
import {
  createDiningTableApi,
  listDiningAreasApi,
} from '../services/menuService'
import type { DiningArea } from '../types/menu'

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children?: ReactNode
}) {
  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:z-30">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {children ? (
        <div className="border-t border-line px-4 py-4">{children}</div>
      ) : null}
    </section>
  )
}

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function inputCls(hasError: boolean) {
  return hasError
    ? 'h-10 w-full rounded-md border border-primary bg-card px-3 text-sm text-ink outline-none focus:border-primary'
    : inputClass
}

// Mirrors the backend table-no rules (comma = separator, colon = range) so the
// user gets live feedback. The backend stays authoritative on save.
const TABLE_TOKEN_RE = /^([A-Za-z]*)(\d+)$/

function expandTokenCount(token: string): number | null {
  if (token.includes(':')) {
    const [start, end] = token.split(':')
    if (!start || !end || end.includes(':')) return null
    const m1 = TABLE_TOKEN_RE.exec(start)
    const m2 = TABLE_TOKEN_RE.exec(end)
    if (!m1 || !m2 || m1[1].toUpperCase() !== m2[1].toUpperCase()) return null
    const from = Number(m1[2])
    const to = Number(m2[2])
    if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to) || from > to) return null
    return to - from + 1
  }
  return TABLE_TOKEN_RE.test(token) ? 1 : null
}

function previewTableInput(raw: string): { count?: number; spaceError?: boolean } {
  const value = raw.trim()
  if (!value) return {}
  const parts = value.split(',').map((part) => part.trim())
  if (parts.length === 1) {
    // Catch the "1 2 3" mistake: space-separated tokens that all look like table numbers.
    const words = value.split(/\s+/).filter(Boolean)
    if (words.length > 1 && words.every((word) => TABLE_TOKEN_RE.test(word))) {
      return { spaceError: true }
    }
    return {}
  }
  if (parts.some((part) => !part || part.includes(' '))) return {}
  let count = 0
  for (const part of parts) {
    const tokenCount = expandTokenCount(part)
    if (tokenCount === null) return {}
    count += tokenCount
  }
  return { count }
}

export default function AddTable() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const [tableNo, setTableNo] = useState('')
  const [persons, setPersons] = useState('')
  const [extraInfo, setExtraInfo] = useState('')
  const [areaId, setAreaId] = useState('')
  const [isOn, setIsOn] = useState(true)
  const [discountPercent, setDiscountPercent] = useState('')
  const [areas, setAreas] = useState<DiningArea[]>([])

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listDiningAreasApi(encryptedOutletId)
      .then((data) => {
        if (!cancelled) setAreas(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          showToast(
            err instanceof Error ? err.message : 'Failed to load areas',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  async function handleSave() {
    if (!tableNo.trim()) {
      setFieldErrors({ table_no: 'Table number is required' })
      setError('Table number is required')
      showToast('Table No - This field may not be blank.')
      return
    }
    if (previewTableInput(tableNo).spaceError) {
      setError('Separate multiple table numbers with commas, e.g. 1,2,3')
      setFieldErrors({ table_no: 'Separate multiple table numbers with commas, e.g. 1,2,3' })
      return
    }
    if (!areaId.trim()) {
      setError('Area is required')
      setFieldErrors({ area: 'Area is required' })
      showToast('Area - This field is required for creating a table.')
      return
    }
    if (!encryptedOutletId) {
      setError('Outlet not selected')
      return
    }
    setError('')
    setFieldErrors({})
    setSaving(true)
    try {
      const rows = await createDiningTableApi(encryptedOutletId, {
        table_no: tableNo.trim(),
        persons: Number(persons) || 0,
        extra_info: extraInfo,
        area_id: areaId,
        is_on: isOn,
        discount_percent: discountPercent === '' ? '0' : discountPercent,
      })
      showToast(
        rows.length === 1
          ? 'Table created successfully'
          : `${rows.length} tables created successfully`,
      )
      window.setTimeout(() => navigate('/menu/tables'), 800)
    } catch (err) {
      setSaving(false)
      // Parse per-field errors from the ApiError and highlight fields
      if (err instanceof ApiError && err.errors && typeof err.errors === 'object') {
        const raw = err.errors as Record<string, unknown>
        const mapped: Record<string, string> = {}
        for (const [field, messages] of Object.entries(raw)) {
          mapped[field] = Array.isArray(messages)
            ? String(messages[0])
            : String(messages)
        }
        setFieldErrors(mapped)
      }
      showToast(err instanceof Error ? err.message : 'Failed to create table')
    }
  }

  const tablePreview = previewTableInput(tableNo)

  return (
    <MenuPageShell
      backTo="/menu/tables"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/menu')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/menu')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Menu Management
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/menu/tables')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/menu/tables')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Tables Management
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Table</span>
        </span>
      }
    >

      <SectionCard
        icon={<TableProperties size={16} />}
        title="Table Details"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Table No <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={tableNo}
              onChange={(event) => {
                setTableNo(event.target.value)
                if (fieldErrors.table_no) setFieldErrors((prev) => ({ ...prev, table_no: '' }))
              }}
              placeholder="e.g. A10:A20 or 1,2,3"
              className={inputCls(Boolean(fieldErrors.table_no))}
            />
            {fieldErrors.table_no ? (
              <p className="mt-1 text-xs text-primary">{fieldErrors.table_no}</p>
            ) : null}
            {tablePreview.count && tablePreview.count > 1 ? (
              <p className="mt-1 text-xs text-success">
                Will create {tablePreview.count} tables
              </p>
            ) : null}
            {tablePreview.spaceError ? (
              <p className="mt-1 text-xs text-primary">
                Separate multiple table numbers with commas, e.g. 1,2,3
              </p>
            ) : null}
            <div className="mt-3 rounded-lg border border-line bg-page/60 px-3.5 py-3">
              <div className="mb-2 flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0 text-muted" />
                <p className="text-xs leading-relaxed text-muted">
                  Enter multiple table numbers or ranges. Use{' '}
                  <span className="font-semibold text-ink">comma (,)</span> for
                  multiple values and{' '}
                  <span className="font-semibold text-ink">colon (:)</span> for
                  ranges.
                </p>
              </div>
              <ul className="space-y-1 pl-5 text-xs leading-relaxed text-muted">
                <li>
                  <span className="font-medium text-ink">Range:</span>{' '}
                  A10:A20
                </li>
                <li>
                  <span className="font-medium text-ink">
                    Mixed range + single:
                  </span>{' '}
                  AA10:AA20,BB1
                </li>
                <li>
                  <span className="font-medium text-ink">
                    Multiple ranges:
                  </span>{' '}
                  A10:A100,B1:B20
                </li>
                <li>
                  <span className="font-medium text-ink">
                    Multiple tables:
                  </span>{' '}
                  1,2,3
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              No. of Persons
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={persons}
              onChange={(event) => {
                setPersons(event.target.value)
                if (fieldErrors.persons) setFieldErrors((prev) => ({ ...prev, persons: '' }))
              }}
              placeholder="Max persons per table"
              className={inputCls(Boolean(fieldErrors.persons))}
            />
            {fieldErrors.persons ? (
              <p className="mt-1 text-xs text-primary">{fieldErrors.persons}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Area <span className="text-primary">*</span>
            </label>
            <select
              value={areaId}
              onChange={(event) => {
                setAreaId(event.target.value)
                if (fieldErrors.area) setFieldErrors((prev) => ({ ...prev, area: '' }))
              }}
              className={inputCls(Boolean(fieldErrors.area))}
            >
              <option value="" disabled>
                Select Area
              </option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            {fieldErrors.area ? (
              <p className="mt-1 text-xs text-primary">{fieldErrors.area}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Extra Information
            </label>
            <textarea
              value={extraInfo}
              onChange={(event) => {
                setExtraInfo(event.target.value)
                if (fieldErrors.extra_info) setFieldErrors((prev) => ({ ...prev, extra_info: '' }))
              }}
              rows={4}
              placeholder="Optional notes about this table..."
              className={`w-full rounded-md border ${fieldErrors.extra_info ? 'border-primary' : 'border-line'} bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary`}
            />
            {fieldErrors.extra_info ? (
              <p className="mt-1 text-xs text-primary">{fieldErrors.extra_info}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Discount (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={discountPercent}
              onChange={(event) => {
                setDiscountPercent(event.target.value)
                if (fieldErrors.discount_percent) setFieldErrors((prev) => ({ ...prev, discount_percent: '' }))
              }}
              placeholder="0"
              className={inputCls(Boolean(fieldErrors.discount_percent))}
            />
            {fieldErrors.discount_percent ? (
              <p className="mt-1 text-xs text-primary">{fieldErrors.discount_percent}</p>
            ) : null}
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isOn}
              onClick={() => setIsOn((prev) => !prev)}
              className={`relative inline-flex h-8 w-14 cursor-pointer items-center rounded-full transition-colors ${
                isOn ? 'bg-success' : 'bg-line'
              }`}
            >
              <span
                className={`inline-block size-6 rounded-full bg-white shadow-sm transition-transform ${
                  isOn ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-ink">Active</span>
          </div>
        </div>
      </SectionCard>

      {error ? <p className="mb-3 text-sm text-primary">{error}</p> : null}

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/menu/tables')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Table'}
        </PrimaryButton>
      </div>
    </MenuPageShell>
  )
}