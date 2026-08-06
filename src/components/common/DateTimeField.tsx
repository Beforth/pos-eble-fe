import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function formatDateTimeDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${d} ${MONTHS[date.getMonth()]} ${date.getFullYear()} ${h}:${m}:${s}`
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildMonthCells(
  viewMonth: Date,
): Array<{ date: Date; inMonth: boolean }> {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<{ date: Date; inMonth: boolean }> = []

  for (let i = startPad - 1; i >= 0; i -= 1) {
    cells.push({ date: new Date(year, month, -i), inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inMonth: false,
    })
  }
  return cells
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

interface DateTimeFieldProps {
  label: string
  value: Date
  onChange: (date: Date) => void
  className?: string
  /** Default time when picking a new day (e.g. start-of-day vs end-of-day). */
  defaultTime?: { hours: number; minutes: number; seconds: number }
}

export function DateTimeField({
  label,
  value,
  onChange,
  className = '',
  defaultTime,
}: DateTimeFieldProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  )
  const [draft, setDraft] = useState(value)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth])
  const today = startOfDay(new Date())

  useEffect(() => {
    if (!open) return
    setDraft(value)
    setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1))
  }, [open, value])

  function updateMenuPosition() {
    const trigger = rootRef.current
    const menu = menuRef.current
    if (!trigger || !menu) return

    const rect = trigger.getBoundingClientRect()
    const menuRect = menu.getBoundingClientRect()
    const gap = 8
    const pad = 12

    let top = rect.bottom + gap
    let left = rect.left

    if (left + menuRect.width > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - menuRect.width - pad)
    }
    if (top + menuRect.height > window.innerHeight - pad) {
      const above = rect.top - gap - menuRect.height
      top = above >= pad ? above : pad
    }

    setMenuPos({ top, left })
  }

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null)
      return
    }
    updateMenuPosition()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }
    const onReposition = () => updateMenuPosition()
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  function pickDay(date: Date) {
    const next = new Date(date)
    if (defaultTime) {
      next.setHours(defaultTime.hours, defaultTime.minutes, defaultTime.seconds, 0)
    } else {
      next.setHours(
        draft.getHours(),
        draft.getMinutes(),
        draft.getSeconds(),
        0,
      )
    }
    setDraft(next)
  }

  function setTimePart(part: 'hours' | 'minutes' | 'seconds', raw: string) {
    const n = Math.min(part === 'hours' ? 23 : 59, Math.max(0, Number(raw) || 0))
    const next = new Date(draft)
    if (part === 'hours') next.setHours(n)
    if (part === 'minutes') next.setMinutes(n)
    if (part === 'seconds') next.setSeconds(n)
    setDraft(next)
  }

  function apply() {
    onChange(draft)
    setOpen(false)
  }

  const menuStyle = menuPos
    ? { top: menuPos.top, left: menuPos.left }
    : { top: -9999, left: -9999 }

  return (
    <div ref={rootRef} className={`relative min-w-[180px] flex-1 ${className}`}>
      <p className="text-xs text-muted">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="mt-1 flex h-9 w-full items-center gap-2 rounded-lg border border-line bg-card px-2.5 text-left text-sm text-ink transition-colors hover:border-muted"
      >
        <CalendarDays size={14} className="shrink-0 text-primary" />
        <span className="truncate tabular-nums">
          {formatDateTimeDisplay(value)}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={(node) => {
              menuRef.current = node
            }}
            role="dialog"
            aria-label={label}
            style={menuStyle}
            className="fixed z-[60] w-[280px] overflow-hidden rounded-xl border border-line bg-card p-3 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
                  )
                }
                aria-label="Previous month"
                className="rounded-md p-1 text-muted transition-colors hover:bg-page hover:text-ink"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="text-sm font-semibold text-ink">
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </p>
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
                  )
                }
                aria-label="Next month"
                className="rounded-md p-1 text-muted transition-colors hover:bg-page hover:text-ink"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
              {WEEKDAYS.map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
            </div>

            <div className="mb-3 grid grid-cols-7 text-center text-sm">
              {cells.map(({ date, inMonth }) => {
                const selected = sameDay(date, draft)
                const isToday = sameDay(date, today)
                return (
                  <button
                    key={toKey(date)}
                    type="button"
                    onClick={() => pickDay(date)}
                    className="flex h-9 items-center justify-center"
                  >
                    <span
                      className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                        selected
                          ? 'bg-primary font-semibold text-white'
                          : inMonth
                            ? 'text-ink hover:bg-page'
                            : 'text-muted/50 hover:bg-page'
                      } ${!selected && isToday ? 'ring-1 ring-primary/40' : ''}`}
                    >
                      {date.getDate()}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mb-3 flex items-center justify-center gap-1.5 border-t border-line pt-3">
              <label className="text-[11px] text-muted">
                Time
                <span className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={pad2(draft.getHours())}
                    onChange={(e) => setTimePart('hours', e.target.value)}
                    className="h-8 w-12 rounded-md border border-line bg-card px-1 text-center text-sm tabular-nums outline-none focus:border-primary"
                  />
                  <span className="text-muted">:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={pad2(draft.getMinutes())}
                    onChange={(e) => setTimePart('minutes', e.target.value)}
                    className="h-8 w-12 rounded-md border border-line bg-card px-1 text-center text-sm tabular-nums outline-none focus:border-primary"
                  />
                  <span className="text-muted">:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={pad2(draft.getSeconds())}
                    onChange={(e) => setTimePart('seconds', e.target.value)}
                    className="h-8 w-12 rounded-md border border-line bg-card px-1 text-center text-sm tabular-nums outline-none focus:border-primary"
                  />
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 rounded-lg px-3 text-sm font-medium text-ink hover:bg-page"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={apply}
                className="h-8 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Apply
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
