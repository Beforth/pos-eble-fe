import { useEffect, useMemo, useRef, useState } from 'react'
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

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const timer = searchable
      ? window.setTimeout(() => inputRef.current?.focus(), 0)
      : undefined
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, searchable])

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={selectedOption?.label}
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

      {open ? (
        <div
          role="listbox"
          aria-label={caption ?? placeholder}
          className={`absolute z-40 mt-1.5 flex max-h-80 w-64 flex-col overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
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
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {isActive ? (
                      <Check size={14} className="shrink-0 text-primary" />
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
