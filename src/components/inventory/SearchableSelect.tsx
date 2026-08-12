import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

interface SearchableSelectProps {
  label: ReactNode
  required?: boolean
  value: string
  options: string[]
  placeholder?: string
  searchPlaceholder?: string
  /** Show placeholder as a selectable list row (clears value) */
  includePlaceholderOption?: boolean
  /** Prefer opening the menu above the trigger (useful near page bottom). */
  dropdownPlacement?: 'below' | 'above'
  onChange: (value: string) => void
}

export function SearchableSelect({
  label,
  required = false,
  value,
  options,
  placeholder = 'Please select',
  searchPlaceholder = 'Search',
  includePlaceholderOption = false,
  dropdownPlacement = 'below',
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.toLowerCase().includes(q))
  }, [options, query])

  const showPlaceholderRow =
    includePlaceholderOption &&
    (!query.trim() || placeholder.toLowerCase().includes(query.trim().toLowerCase()))

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
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
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function renderOption(option: string, isPlaceholder = false) {
    const selected = isPlaceholder ? !value : value === option
    return (
      <li key={isPlaceholder ? '__placeholder__' : option}>
        <button
          type="button"
          role="option"
          aria-selected={selected}
          onClick={() => {
            onChange(isPlaceholder ? '' : option)
            setOpen(false)
          }}
          className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-page ${
            selected ? 'font-semibold text-ink' : 'text-ink'
          }`}
        >
          <span className={isPlaceholder && !selected ? 'text-muted' : undefined}>
            {option}
          </span>
          {selected ? (
            <Check size={15} className="shrink-0 text-success" />
          ) : (
            <span className="size-[15px]" />
          )}
        </button>
      </li>
    )
  }

  return (
    <div ref={rootRef}>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-left text-sm outline-none hover:bg-page focus:border-primary"
        >
          <span className={value ? 'truncate text-ink' : 'truncate text-muted'}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open ? (
          <div
            className={`absolute left-0 right-0 z-40 overflow-hidden rounded-md border border-line bg-card shadow-lg ${
              dropdownPlacement === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
          >
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
            <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
              {showPlaceholderRow ? renderOption(placeholder, true) : null}
              {filtered.map((option) => renderOption(option))}
              {!showPlaceholderRow && filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted">No matches</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
