import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Clock3 } from 'lucide-react'

interface HistoryMenuProps {
  exportLabel: string
  onExport?: () => void
}

export function HistoryMenu({ exportLabel, onExport }: HistoryMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        <Clock3 size={15} className="text-muted" />
        History
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          <li className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Export
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onExport?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              {exportLabel}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
