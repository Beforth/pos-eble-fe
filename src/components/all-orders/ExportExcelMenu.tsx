import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileSpreadsheet } from 'lucide-react'

interface ExportExcelMenuProps {
  onExportPage?: () => void
  onExportAll?: () => void
}

export function ExportExcelMenu({
  onExportPage,
  onExportAll,
}: ExportExcelMenuProps) {
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
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
      >
        <FileSpreadsheet size={15} className="text-primary" />
        Export Excel
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <ul className="absolute right-0 z-40 mt-1.5 w-52 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onExportPage?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export Current Page
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onExportAll?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export All
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
