import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

type Side = 'top' | 'bottom'

interface QuickTooltipProps {
  label: string
  children: ReactNode
  /** Prefer `bottom` for top-bar icons so the tip stays on-screen. */
  side?: Side
  /** Delay before showing (ms). Native browser tooltips are ~1000ms. */
  delayMs?: number
  className?: string
}

export function QuickTooltip({
  label,
  children,
  side = 'bottom',
  delayMs = 80,
  className = '',
}: QuickTooltipProps) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<number | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function place() {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({
      top: side === 'top' ? rect.top - 8 : rect.bottom + 8,
      left: rect.left + rect.width / 2,
    })
  }

  function show() {
    place()
    clearTimer()
    if (delayMs <= 0) {
      setOpen(true)
      return
    }
    timerRef.current = window.setTimeout(() => setOpen(true), delayMs)
  }

  function hide() {
    clearTimer()
    setOpen(false)
  }

  useEffect(() => () => clearTimer(), [])

  if (!label) return <>{children}</>

  return (
    <>
      <span
        ref={wrapRef}
        className={`inline-flex ${className}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {open
        ? createPortal(
            <span
              role="tooltip"
              style={{ top: pos.top, left: pos.left }}
              className={`pointer-events-none fixed z-[200] -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm ${
                side === 'top' ? '-translate-y-full' : ''
              }`}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}
