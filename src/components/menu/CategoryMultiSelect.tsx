import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface CategoryOption {
  id: string
  name: string
}

interface CategoryMultiSelectProps {
  options: readonly CategoryOption[] | CategoryOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function CategoryMultiSelect({
  options,
  selectedIds,
  onChange,
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.name.toLowerCase().includes(q))
  }, [options, query])

  const displayValue = useMemo(() => {
    if (selectedIds.length === 0) return ''
    if (selectedIds.length === 1) {
      return options.find((o) => o.id === selectedIds[0])?.name ?? ''
    }
    return `${selectedIds.length} selected`
  }, [selectedIds, options])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    inputRef.current?.focus()
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((value) => value !== id))
      return
    }
    onChange([...selectedIds, id])
  }

  return (
    <div ref={rootRef} className="relative min-w-[180px] sm:min-w-[220px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-line bg-card px-2.5 text-left text-sm text-ink outline-none hover:bg-page focus:border-primary"
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            displayValue ? 'text-ink' : 'text-muted'
          }`}
        >
          {displayValue || 'Select category'}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
          <div className="border-b border-line p-2">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search category"
              className="h-8 w-full rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.map((opt) => {
              const checked = selectedSet.has(opt.id)
              return (
                <li key={opt.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-page">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(opt.id)}
                      className="size-4 shrink-0 rounded border-line accent-primary"
                    />
                    <span className="truncate">{opt.name}</span>
                  </label>
                </li>
              )
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No categories</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
