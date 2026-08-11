import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

export const COMMISSION_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Not Configured', label: 'Not Configured' },
  { value: 'Percentage', label: 'Percentage' },
  { value: 'Fixed', label: 'Fixed' },
] as const

export type CommissionTypeFilterValue =
  (typeof COMMISSION_TYPE_OPTIONS)[number]['value']

interface CommissionTypeSelectProps {
  value: string
  onChange: (value: string) => void
}

export function CommissionTypeSelect({
  value,
  onChange,
}: CommissionTypeSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedLabel =
    COMMISSION_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    'All'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COMMISSION_TYPE_OPTIONS
    return COMMISSION_TYPE_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
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

  return (
    <div ref={rootRef} className="relative min-w-[160px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-card px-2.5 text-left text-sm text-ink hover:bg-page"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-40 mt-1 min-w-[200px] overflow-hidden rounded-lg border border-line bg-card shadow-lg">
          <div className="border-b border-line p-2">
            <label className="flex h-8 items-center gap-2 rounded-md border border-line px-2.5">
              <Search size={13} className="shrink-0 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </label>
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.map((option) => {
              const active = option.value === value
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-page ${
                      active ? 'bg-page font-medium text-ink' : 'text-ink'
                    }`}
                  >
                    {option.label}
                    {active ? (
                      <Check size={14} className="shrink-0 text-success" />
                    ) : null}
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No matches</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
