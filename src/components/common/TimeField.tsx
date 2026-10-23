import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Clock3, X } from 'lucide-react'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** `HH:MM` (24h) -> parts in 12h clock, or `null` for blank / invalid. */
function parseTime(value: string): { hour: number; minute: number; pm: boolean } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const h24 = Number(match[1])
  const minute = Number(match[2])
  if (h24 > 23 || minute > 59) return null
  return { hour: h24 % 12 === 0 ? 12 : h24 % 12, minute, pm: h24 >= 12 }
}

function toValue(hour: number, minute: number, pm: boolean): string {
  const h24 = (hour % 12) + (pm ? 12 : 0)
  return `${pad2(h24)}:${pad2(minute)}`
}

function formatTimeLabel(value: string): string {
  const parts = parseTime(value)
  if (!parts) return ''
  return `${pad2(parts.hour)}:${pad2(parts.minute)} ${parts.pm ? 'PM' : 'AM'}`
}

interface TimeFieldProps {
  label: string
  /** `HH:MM` (24h); blank = not set. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Themed time-of-day picker (hour / minute / AM-PM columns) - the browser's own
 * `<input type="time">` ignores the app theme. Same trigger look as FilterSelect.
 */
export function TimeField({
  label,
  value,
  onChange,
  placeholder = 'Any time',
  className = '',
}: TimeFieldProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ hour: 12, minute: 0, pm: false })
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    setDraft(parseTime(value) ?? { hour: 12, minute: 0, pm: false })
  }, [open, value])

  function reposition() {
    const trigger = rootRef.current
    const menu = menuRef.current
    if (!trigger || !menu) return
    const rect = trigger.getBoundingClientRect()
    const menuRect = menu.getBoundingClientRect()
    const gap = 6
    const pad = 12
    let left = rect.left
    if (left + menuRect.width > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - menuRect.width - pad)
    }
    let top = rect.bottom + gap
    if (top + menuRect.height > window.innerHeight - pad) {
      const above = rect.top - gap - menuRect.height
      top = above >= pad ? above : pad
    }
    setPos({ top, left })
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    reposition()
  }, [open])

  // Bring the chosen hour / minute into view when the panel opens.
  useLayoutEffect(() => {
    if (!open || !pos) return
    menuRef.current
      ?.querySelectorAll<HTMLElement>('[data-selected="true"]')
      .forEach((el) => el.scrollIntoView({ block: 'center' }))
    // Only on first placement, not on every pick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pos === null])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const columnItem = (selected: boolean) =>
    `flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums transition-colors ${
      selected ? 'bg-primary font-semibold text-white' : 'text-ink hover:bg-page'
    }`

  const display = formatTimeLabel(value)

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <p className="text-xs text-muted">{label}</p>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={label}
          className="flex h-9 w-full items-center gap-2 rounded-lg border border-line bg-card px-2.5 pr-8 text-left text-sm transition-colors hover:border-muted"
        >
          <Clock3 size={14} className="shrink-0 text-primary" />
          <span className={`truncate tabular-nums ${display ? 'text-ink' : 'text-muted'}`}>
            {display || placeholder}
          </span>
        </button>
        {display ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={`Clear ${label}`}
            data-tooltip={`Clear ${label}`}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {open
        ? createPortal(
            <div
              ref={(node) => {
                menuRef.current = node
              }}
              role="dialog"
              aria-label={label}
              style={pos ? { top: pos.top, left: pos.left } : { top: -9999, left: -9999 }}
              className="fixed z-[200] w-56 overflow-hidden rounded-xl border border-line bg-card p-3 shadow-xl"
            >
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <div>
                  <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted">
                    Hour
                  </p>
                  <div className="max-h-48 space-y-0.5 overflow-y-auto pr-0.5">
                    {HOURS.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        data-selected={draft.hour === hour}
                        onClick={() => setDraft((d) => ({ ...d, hour }))}
                        className={columnItem(draft.hour === hour)}
                      >
                        {pad2(hour)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted">
                    Min
                  </p>
                  <div className="max-h-48 space-y-0.5 overflow-y-auto pr-0.5">
                    {MINUTES.map((minute) => (
                      <button
                        key={minute}
                        type="button"
                        data-selected={draft.minute === minute}
                        onClick={() => setDraft((d) => ({ ...d, minute }))}
                        className={columnItem(draft.minute === minute)}
                      >
                        {pad2(minute)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 pt-5">
                  {(['AM', 'PM'] as const).map((half) => (
                    <button
                      key={half}
                      type="button"
                      data-selected={draft.pm === (half === 'PM')}
                      onClick={() => setDraft((d) => ({ ...d, pm: half === 'PM' }))}
                      className={`${columnItem(draft.pm === (half === 'PM'))} px-2.5`}
                    >
                      {half}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    setOpen(false)
                  }}
                  className="h-8 rounded-lg px-3 text-sm font-medium text-ink hover:bg-page"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(toValue(draft.hour, draft.minute, draft.pm))
                    setOpen(false)
                  }}
                  className="h-8 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
                >
                  Apply
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
