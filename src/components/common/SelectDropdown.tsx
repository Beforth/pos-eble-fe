import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search, Store } from 'lucide-react'

export interface SelectDropdownOption {
  value: string
  label: string
}

interface SelectDropdownProps {
  value: string
  options: SelectDropdownOption[]
  onChange: (value: string) => void
  /** Section caption above the list, e.g. "Select category". */
  caption?: string
  /** Shown on the trigger when no option matches the current value. */
  placeholder?: string
  searchPlaceholder?: string
  /** Defaults to true — pass false for short, fixed option lists. */
  searchable?: boolean
  /**
   * Panel alignment. The outlet switcher uses 'right' because it sits at the far
   * end of the top bar; left-anchored controls must use 'left' or the panel
   * hangs off the viewport edge.
   */
  align?: 'left' | 'right'
  /** Extra classes for the trigger button, so callers keep their own sizing. */
  triggerClassName?: string
  className?: string
}

/**
 * Single-select dropdown matching the dashboard outlet switcher design
 * (components/layout/TopBar.tsx), for picking an id-backed value such as a
 * category. Use this for new pickers instead of a native <select>.
 */
export function SelectDropdown({
  value,
  options,
  onChange,
  caption,
  placeholder = 'Please select',
  searchPlaceholder = 'Search',
  searchable = true,
  align = 'left',
  triggerClassName = '',
  className = '',
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    align: align as 'left' | 'right',
  })

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query])

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return

    const recalc = () => {
      if (!rootRef.current || !panelRef.current) return
      const rect = rootRef.current.getBoundingClientRect()
      const width = rect.width > 256 ? rect.width : 256
      const margin = 8
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      let left = rect.left
      if (align === 'right') {
        left = rect.right - width
      }
      if (left < margin) left = margin
      if (left + width + margin > viewportWidth) {
        left = viewportWidth - width - margin
      }

      const panelHeight = panelRef.current.offsetHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      const top =
        spaceBelow >= panelHeight || spaceBelow > spaceAbove
          ? rect.bottom + 4
          : Math.max(margin, rect.top - panelHeight - 4)

      setPosition({
        left,
        top,
        width,
        align,
      })
    }

    recalc()
    const onScroll = () => recalc()
    const onResize = () => recalc()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, align, query, filtered.length])

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selectedOption?.label}
        data-tooltip={selectedOption?.label}
        className={`inline-flex min-w-0 items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-muted ${triggerClassName}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="listbox"
              aria-label={caption ?? placeholder}
              style={{
                position: 'fixed',
                left: position.left,
                top: position.top,
                width: position.width,
                zIndex: 200,
              }}
              className="flex max-h-80 flex-col overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
            >
              {caption ? (
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                  {caption}
                </p>
              ) : null}

              {searchable ? (
                <div className="border-b border-line p-2">
                  <label className="flex h-9 items-center gap-2 rounded-md border border-line px-2.5">
                    <Search size={14} className="shrink-0 text-muted" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                    />
                  </label>
                </div>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted">No matches</p>
                ) : (
                  filtered.map((option) => {
                    const isActive = option.value === value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          onChange(option.value)
                          setOpen(false)
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-page"
                      >
                        <Store size={15} className="shrink-0 text-muted" />
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                        {isActive ? (
                          <Check size={14} className="shrink-0 text-primary" />
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
