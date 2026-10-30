import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Clock3, History } from 'lucide-react'

interface HistoryMenuProps {
  exportLabel: string
  onExport?: () => void
  /** When provided a "View history" item is added above the export items. */
  onHistory?: () => void
}

export function HistoryMenu({
  exportLabel,
  onExport,
  onHistory,
}: HistoryMenuProps) {
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

  function run(fn?: () => void) {
    fn?.()
    setOpen(false)
  }

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
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[200px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          {onHistory ? (
            <>
              <li className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <History size={12} />
                Saved counts
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => run(onHistory)}
                  className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
                >
                  View count history
                </button>
              </li>
              <li className="my-1 border-t border-line" />
            </>
          ) : null}
          <li className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Export
          </li>
          <li>
            <button
              type="button"
              onClick={() => run(onExport)}
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
