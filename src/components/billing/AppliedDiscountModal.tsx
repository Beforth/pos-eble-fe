import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Trash2, X } from 'lucide-react'
import { baseMenuCategories } from '../../mocks/menuItemsData'

export type DiscountMode = 'percentage' | 'fixed'

export interface CustomDiscountRow {
  id: string
  scope: string
  reason: string
  mode: DiscountMode
  value: number
}

export interface AppliedDiscount {
  rows: CustomDiscountRow[]
  couponCode: string
  /** Resolved discount amount in ₹ */
  amount: number
  /** Primary row fields (first row) for simple display. */
  scope: string
  reason: string
  mode: DiscountMode
  value: number
}

interface AppliedDiscountModalProps {
  open: boolean
  billTotal: number
  initial?: Partial<AppliedDiscount>
  onClose: () => void
  onSave: (discount: AppliedDiscount) => void
}

const EXTRA_SCOPE_OPTIONS = ['All'] as const

/** Categories taken from the original menu / billing category section. */
const FEATURED_CATEGORY_NAMES = [
  'Chaat',
  'Party Box',
  'Dabeli',
  'Snacks',
] as const

function newRow(): CustomDiscountRow {
  return {
    id: `disc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    scope: 'All',
    reason: '',
    mode: 'percentage',
    value: 0,
  }
}

function resolveAmount(
  billTotal: number,
  mode: DiscountMode,
  value: number,
): number {
  if (!Number.isFinite(value) || value <= 0 || billTotal <= 0) return 0
  if (mode === 'percentage') {
    const capped = Math.min(value, 100)
    return Math.round(((billTotal * capped) / 100) * 100) / 100
  }
  return Math.min(value, billTotal)
}

function ScopeDropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((name) => name.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-line bg-white px-3 text-left text-sm text-ink outline-none hover:border-primary"
      >
        <span>{value}</span>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-md border border-line bg-white shadow-lg">
          <div className="border-b border-line p-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              autoFocus
              className="h-9 w-full rounded-md border border-line bg-white px-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No matches</li>
            ) : (
              filtered.map((option) => {
                const active = option === value
                return (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option)
                        setOpen(false)
                      }}
                      className={`flex w-full px-3 py-2 text-left text-sm ${
                        active
                          ? 'bg-primary text-white'
                          : 'text-ink hover:bg-primary hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function AppliedDiscountModal({
  open,
  billTotal,
  initial,
  onClose,
  onSave,
}: AppliedDiscountModalProps) {
  const [rows, setRows] = useState<CustomDiscountRow[]>([newRow()])
  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState<string | null>(null)

  const scopeOptions = useMemo(() => {
    const fromMenu = FEATURED_CATEGORY_NAMES.filter((name) =>
      baseMenuCategories.some((cat) => cat.name === name),
    )
    // Fallback: first 4 original categories if featured names are missing
    const fallback = baseMenuCategories.slice(0, 4).map((cat) => cat.name)
    const categories = fromMenu.length > 0 ? fromMenu : fallback
    return [...EXTRA_SCOPE_OPTIONS, ...categories]
  }, [])

  useEffect(() => {
    if (!open) return
    if (initial?.rows && initial.rows.length > 0) {
      setRows(initial.rows.map((row) => ({ ...row })))
    } else if (initial?.scope || (initial?.value != null && initial.value > 0)) {
      setRows([
        {
          id: `disc-${Date.now()}`,
          scope: initial.scope ?? 'All',
          reason: initial.reason ?? '',
          mode: initial.mode ?? 'percentage',
          value: initial.value ?? 0,
        },
      ])
    } else {
      setRows([newRow()])
    }
    setCouponCode(initial?.couponCode ?? '')
    setCouponMessage(null)
    // Reset form only when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  function updateRow(id: string, patch: Partial<CustomDiscountRow>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponMessage('Enter a coupon code')
      return
    }
    if (code === 'SAVE10') {
      setRows((prev) => {
        const [first, ...rest] = prev
        return [
          { ...(first ?? newRow()), mode: 'percentage', value: 10 },
          ...rest,
        ]
      })
      setCouponMessage('Coupon SAVE10 applied · 10% off')
      return
    }
    if (code === 'FLAT50') {
      setRows((prev) => {
        const [first, ...rest] = prev
        return [
          { ...(first ?? newRow()), mode: 'fixed', value: 50 },
          ...rest,
        ]
      })
      setCouponMessage('Coupon FLAT50 applied · ₹50 off')
      return
    }
    setCouponMessage('Invalid coupon code')
  }

  function handleSave() {
    let remaining = billTotal
    let totalAmount = 0
    for (const row of rows) {
      const part = resolveAmount(remaining, row.mode, row.value)
      totalAmount += part
      remaining = Math.max(0, remaining - part)
    }
    totalAmount = Math.round(totalAmount * 100) / 100
    const first = rows[0] ?? newRow()
    onSave({
      rows,
      couponCode: couponCode.trim(),
      amount: totalAmount,
      scope: first.scope,
      reason: first.reason,
      mode: first.mode,
      value: first.value,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close applied discount"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Applied Discount"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Applied Discount</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Custom Discount</h3>
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, newRow()])}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Add More
              </button>
            </div>

            {rows.map((row, index) => (
              <div
                key={row.id}
                className="space-y-3 rounded-lg border border-line bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Discount {index + 1}
                  </p>
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      title="Remove discount"
                      aria-label="Remove discount"
                      onClick={() =>
                        setRows((prev) => prev.filter((r) => r.id !== row.id))
                      }
                      className="rounded p-1 text-muted hover:bg-primary/10 hover:text-primary"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </div>

                <ScopeDropdown
                  value={row.scope}
                  options={scopeOptions}
                  onChange={(scope) => updateRow(row.id, { scope })}
                />

                <input
                  type="text"
                  value={row.reason}
                  onChange={(e) =>
                    updateRow(row.id, { reason: e.target.value })
                  }
                  placeholder="Reason"
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
                />

                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink">
                    <input
                      type="radio"
                      name={`discount-mode-${row.id}`}
                      checked={row.mode === 'percentage'}
                      onChange={() => updateRow(row.id, { mode: 'percentage' })}
                      className="size-3.5 accent-primary"
                    />
                    Percentage
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink">
                    <input
                      type="radio"
                      name={`discount-mode-${row.id}`}
                      checked={row.mode === 'fixed'}
                      onChange={() => updateRow(row.id, { mode: 'fixed' })}
                      className="size-3.5 accent-primary"
                    />
                    Fixed
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.value || ''}
                    onChange={(e) =>
                      updateRow(row.id, {
                        value: Number(e.target.value) || 0,
                      })
                    }
                    placeholder={row.mode === 'percentage' ? '%' : '₹'}
                    className="ml-auto h-9 w-28 rounded-md border border-line bg-white px-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3 border-t border-line pt-4">
            <h3 className="text-sm font-semibold text-ink">Coupon Code</h3>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value)
                  setCouponMessage(null)
                }}
                placeholder="Enter coupon code"
                className="h-10 min-w-0 flex-1 rounded-md border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              />
              <button
                type="button"
                onClick={() => {
                  setCouponCode('')
                  setCouponMessage(null)
                }}
                className="px-2 text-sm font-semibold text-primary hover:underline"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={applyCoupon}
                className="h-10 rounded-lg bg-success px-4 text-sm font-semibold text-white hover:brightness-95"
              >
                Apply
              </button>
            </div>
            {couponMessage ? (
              <p
                className={`text-xs ${
                  couponMessage.startsWith('Invalid') ||
                  couponMessage.startsWith('Enter')
                    ? 'text-primary'
                    : 'text-success'
                }`}
              >
                {couponMessage}
              </p>
            ) : (
              <p className="text-xs text-muted">Try SAVE10 or FLAT50</p>
            )}
          </section>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-ink/80 bg-white px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  )
}
