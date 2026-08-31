import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search, X } from 'lucide-react'

type RecordFilter = 'recent' | 'old'

const FILTER_OPTIONS: { value: RecordFilter; label: string }[] = [
  { value: 'recent', label: 'Recent Records' },
  { value: 'old', label: 'Old Records' },
]

interface ShowChangesModalProps {
  open: boolean
  name: string | null
  onClose: () => void
}

export function ShowChangesModal({
  open,
  name,
  onClose,
}: ShowChangesModalProps) {
  const [filter, setFilter] = useState<RecordFilter>('old')
  const [filterOpen, setFilterOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 220 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selectedLabel =
    FILTER_OPTIONS.find((option) => option.value === filter)?.label ??
    'Old Records'

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FILTER_OPTIONS
    return FILTER_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    if (!open) {
      setFilterOpen(false)
      setQuery('')
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (filterOpen) setFilterOpen(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose, filterOpen])

  useEffect(() => {
    if (!filterOpen) {
      setQuery('')
      return
    }

    const updatePosition = () => {
      const btn = triggerRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.right - 220,
        width: 220,
      })
    }

    updatePosition()

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setFilterOpen(false)
    }

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [filterOpen])

  if (!open || !name) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="show-changes-title"
        className="relative z-10 flex h-[min(72vh,560px)] w-full max-w-[920px] flex-col rounded-xl border border-line bg-card shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2
            id="show-changes-title"
            className="min-w-0 text-lg font-bold text-ink"
          >
            {name} Changes
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line bg-primary/5 px-6 py-3">
          <h3 className="text-sm font-semibold text-ink">Information</h3>

          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((prev) => !prev)}
            className="inline-flex h-9 min-w-[168px] cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <span>{selectedLabel}</span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-muted transition-transform ${filterOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="text-sm leading-relaxed text-ink">
            &ldquo;{name}&rdquo; added by Sagan Parth
            (parth.sagan@pos-eble.com) using Chrome (IP-49.36.71.137)
          </p>
        </div>
      </div>

      {filterOpen
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              aria-label="Record filter"
              style={{
                top: menuPos.top,
                left: Math.max(8, menuPos.left),
                width: menuPos.width,
              }}
              className="fixed z-[130] overflow-hidden rounded-lg border border-line bg-card shadow-lg"
            >
              <div className="border-b border-line p-2">
                <label className="flex h-9 items-center gap-2 rounded-md border border-line bg-card px-2.5">
                  <Search size={14} className="shrink-0 text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                  />
                </label>
              </div>
              <ul className="py-1">
                {filteredOptions.map((option) => {
                  const active = option.value === filter
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setFilter(option.value)
                          setFilterOpen(false)
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-ink hover:bg-page"
                      >
                        {option.label}
                        {active ? (
                          <Check size={14} className="shrink-0 text-success" />
                        ) : (
                          <span className="size-3.5 shrink-0" />
                        )}
                      </button>
                    </li>
                  )
                })}
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted">No matches</li>
                ) : null}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
