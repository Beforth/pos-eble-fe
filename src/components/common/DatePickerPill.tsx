import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatDayMonth } from '../../utils/format'

export interface DateRangeOption {
  value: string
  label: string
  sub?: string
}

interface DatePickerPillProps {
  options: DateRangeOption[]
  value: string
  onSelect: (value: string) => void
  customLabel?: string
  onCustomRange?: (from: string, to: string) => void
  className?: string
}

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

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function sameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime()
}

function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime()
}

function inRange(day: Date, from: Date | null, to: Date | null): boolean {
  if (!from || !to) return false
  const t = startOfDay(day).getTime()
  return t > startOfDay(from).getTime() && t < startOfDay(to).getTime()
}

function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDdMmYyyy(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${d}-${m}-${date.getFullYear()}`
}

function rangeForPreset(
  preset: string,
  today = startOfDay(new Date()),
): [Date, Date] {
  switch (preset) {
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return [y, y]
    }
    case '7d': {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return [start, today]
    }
    case '30d': {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      return [start, today]
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return [start, today]
    }
    case 'last-month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return [start, end]
    }
    case 'today':
    default:
      return [today, today]
  }
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

interface MonthGridProps {
  viewMonth: Date
  from: Date | null
  to: Date | null
  onPick: (date: Date) => void
  showPrev: boolean
  showNext: boolean
  onPrev: () => void
  onNext: () => void
}

function MonthGrid({
  viewMonth,
  from,
  to,
  onPick,
  showPrev,
  showNext,
  onPrev,
  onNext,
}: MonthGridProps) {
  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth])
  const today = startOfDay(new Date())

  return (
    <div className="w-[240px]">
      <div className="mb-3 flex items-center justify-between px-1">
        {showPrev ? (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous month"
            className="rounded-md p-1 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <span className="size-7" />
        )}
        <p className="text-sm font-semibold text-ink">
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </p>
        {showNext ? (
          <button
            type="button"
            onClick={onNext}
            aria-label="Next month"
            className="rounded-md p-1 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <ChevronRight size={18} />
          </button>
        ) : (
          <span className="size-7" />
        )}
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-muted">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-sm">
        {cells.map(({ date, inMonth }) => {
          const isStart = sameDay(date, from)
          const isEnd = sameDay(date, to)
          const isSelected = isStart || isEnd
          const isInRange = inRange(date, from, to)
          const isToday = sameDay(date, today)

          return (
            <button
              key={toKey(date)}
              type="button"
              onClick={() => onPick(date)}
              className={`relative flex h-9 items-center justify-center ${
                isInRange ? 'bg-primary/10' : ''
              } ${isStart && to ? 'rounded-l-full bg-primary/10' : ''} ${
                isEnd && from ? 'rounded-r-full bg-primary/10' : ''
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                  isSelected
                    ? 'bg-primary font-semibold text-white'
                    : inMonth
                      ? 'text-ink hover:bg-page'
                      : 'text-muted/50 hover:bg-page'
                } ${!isSelected && isToday ? 'ring-1 ring-primary/40' : ''}`}
              >
                {date.getDate()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Dropdown presets; dual calendars open only for Custom Range. */
export function DatePickerPill({
  options,
  value,
  onSelect,
  customLabel,
  onCustomRange,
  className = '',
}: DatePickerPillProps) {
  const [open, setOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [from, setFrom] = useState<Date | null>(() => rangeForPreset('today')[0])
  const [to, setTo] = useState<Date | null>(() => rangeForPreset('today')[1])
  const [pickingEnd, setPickingEnd] = useState(false)
  const [leftMonth, setLeftMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLElement | null>(null)

  const selected =
    options.find((option) => option.value === value) ?? options[0]

  const displayLabel =
    value === 'today'
      ? formatDayMonth(new Date())
      : value === 'custom' && customLabel
        ? customLabel
        : selected.label

  const rightMonth = addMonths(leftMonth, 1)

  function updateMenuPosition() {
    const trigger = rootRef.current
    const menu = menuRef.current
    if (!trigger || !menu) return

    const rect = trigger.getBoundingClientRect()
    const menuRect = menu.getBoundingClientRect()
    const gap = 8
    const pad = 12

    let top = rect.bottom + gap
    let left = rect.right - menuRect.width

    if (left < pad) left = pad
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
  }, [open, showCalendar])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }
      setOpen(false)
      setShowCalendar(false)
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
  }, [open, showCalendar])

  function closeAll() {
    setOpen(false)
    setShowCalendar(false)
  }

  function openCustomCalendar() {
    const [start, end] = rangeForPreset('today')
    setFrom(start)
    setTo(end)
    setLeftMonth(new Date(start.getFullYear(), start.getMonth(), 1))
    setPickingEnd(false)
    setShowCalendar(true)
  }

  function pickOption(optionValue: string) {
    if (optionValue === 'custom') {
      openCustomCalendar()
      return
    }
    onSelect(optionValue)
    closeAll()
  }

  function pickDay(date: Date) {
    const day = startOfDay(date)

    if (!from || (from && to) || !pickingEnd) {
      setFrom(day)
      setTo(null)
      setPickingEnd(true)
      return
    }

    if (isBefore(day, from)) {
      setTo(from)
      setFrom(day)
    } else {
      setTo(day)
    }
    setPickingEnd(false)
  }

  function applyCustom() {
    if (!from) return
    const end = to ?? from
    const start = isAfter(from, end) ? end : from
    const finish = isAfter(from, end) ? from : end
    onCustomRange?.(toKey(start), toKey(finish))
    onSelect('custom')
    closeAll()
  }

  const rangeText =
    from && (to ?? from)
      ? `${formatDdMmYyyy(from)} to ${formatDdMmYyyy(to ?? from)}`
      : from
        ? `${formatDdMmYyyy(from)} to —`
        : '—'

  const menuStyle = menuPos
    ? { top: menuPos.top, left: menuPos.left }
    : { top: -9999, left: -9999 }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (open) {
            closeAll()
            return
          }
          setOpen(true)
          setShowCalendar(false)
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-9 max-w-[240px] items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
      >
        <CalendarDays size={15} className="shrink-0 text-primary" />
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        createPortal(
          !showCalendar ? (
            <ul
              ref={(node) => {
                menuRef.current = node
              }}
              role="listbox"
              style={menuStyle}
              className="fixed z-[60] w-56 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
            >
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <button
                      type="button"
                      onClick={() => pickOption(option.value)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-page"
                    >
                      <span
                        className={
                          isSelected ? 'font-medium text-primary' : 'text-ink'
                        }
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check size={14} className="shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div
              ref={(node) => {
                menuRef.current = node
              }}
              role="dialog"
              aria-label="Custom date range"
              style={menuStyle}
              className="fixed z-[60] flex w-[min(calc(100vw-24px),640px)] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-xl border border-line bg-card shadow-xl"
            >
              <div className="flex flex-col sm:flex-row">
                <ul className="shrink-0 border-b border-line sm:w-40 sm:border-b-0 sm:border-r">
                  {options.map((option) => {
                    const isCustom = option.value === 'custom'
                    return (
                      <li key={option.value}>
                        <button
                          type="button"
                          onClick={() => {
                            if (isCustom) return
                            onSelect(option.value)
                            closeAll()
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            isCustom
                              ? 'bg-page font-medium text-ink'
                              : 'text-ink hover:bg-page'
                          }`}
                        >
                          {option.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div className="flex flex-1 flex-col gap-4 overflow-x-auto p-4 sm:flex-row sm:gap-6">
                  <MonthGrid
                    viewMonth={leftMonth}
                    from={from}
                    to={to}
                    onPick={pickDay}
                    showPrev
                    showNext={false}
                    onPrev={() => setLeftMonth((m) => addMonths(m, -1))}
                    onNext={() => setLeftMonth((m) => addMonths(m, 1))}
                  />
                  <MonthGrid
                    viewMonth={rightMonth}
                    from={from}
                    to={to}
                    onPick={pickDay}
                    showPrev={false}
                    showNext
                    onPrev={() => setLeftMonth((m) => addMonths(m, -1))}
                    onNext={() => setLeftMonth((m) => addMonths(m, 1))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
                <p className="text-sm text-muted tabular-nums">{rangeText}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeAll}
                    className="h-9 rounded-lg px-4 text-sm font-medium text-ink transition-colors hover:bg-page"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyCustom}
                    disabled={!from}
                    className="h-9 rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ),
          document.body,
        )}
    </div>
  )
}
