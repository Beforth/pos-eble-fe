import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'

export function OutlineButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'gray'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border bg-card px-3 text-sm font-medium hover:bg-page ${
        variant === 'primary'
          ? 'border-primary text-primary hover:bg-primary/5'
          : 'border-line text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
    >
      {children}
    </button>
  )
}

export function ActionDropdown({
  label = 'Action',
  icon,
  options,
  searchable = false,
  menuClassName = '',
}: {
  label?: string
  icon?: ReactNode
  options?: { label: string; onClick?: () => void; badge?: string }[]
  searchable?: boolean
  menuClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const menuOptions = options ?? [
    { label: 'Active' },
    { label: 'Inactive' },
  ]

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return menuOptions
    return menuOptions.filter((option) =>
      option.label.toLowerCase().includes(q),
    )
  }, [menuOptions, query])

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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        {icon}
        {label}
        <ChevronDown
          size={14}
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute right-0 z-40 mt-1 min-w-[240px] overflow-hidden rounded-lg border border-line bg-card shadow-lg ${menuClassName}`}
        >
          {searchable ? (
            <div className="border-b border-line p-2">
              <label className="flex h-8 items-center gap-2 rounded-md border border-line px-2">
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
          ) : null}
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  option.onClick?.()
                  setOpen(false)
                }}
                className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-page"
              >
                <span>{option.label}</span>
                {option.badge ? (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {option.badge}
                  </span>
                ) : null}
              </button>
            ))}
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">No matches</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ImportExcelDropdown({
  onUpload,
  onDownloadSample,
}: {
  onUpload?: () => void
  onDownloadSample?: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        Import Excel
        <ChevronDown
          size={14}
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-line bg-card py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onUpload?.()
              setOpen(false)
            }}
            className="flex w-full cursor-pointer px-3 py-2 text-left text-sm text-ink hover:bg-page"
          >
            Upload
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDownloadSample?.()
              setOpen(false)
            }}
            className="flex w-full cursor-pointer px-3 py-2 text-left text-sm text-ink hover:bg-page"
          >
            Download Sample CSV
          </button>
        </div>
      ) : null}
    </div>
  )
}

const DEFAULT_SEARCH_BY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'not-assigned', label: 'Not Assigned' },
] as const

export type SearchByFilterValue =
  (typeof DEFAULT_SEARCH_BY_OPTIONS)[number]['value']

export function SearchByFilterDropdown({
  value,
  onChange,
  label = 'Search By',
}: {
  value: SearchByFilterValue
  onChange: (value: SearchByFilterValue) => void
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedLabel =
    DEFAULT_SEARCH_BY_OPTIONS.find((option) => option.value === value)?.label ??
    'All'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DEFAULT_SEARCH_BY_OPTIONS
    return DEFAULT_SEARCH_BY_OPTIONS.filter((option) =>
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
    <div>
      {label ? (
        <label className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-left text-sm text-ink hover:bg-page"
        >
          <span>{selectedLabel}</span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open ? (
          <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
            <div className="border-b border-line p-2">
              <label className="flex h-9 items-center gap-2 rounded-md border border-line px-2.5">
                <Search size={14} className="shrink-0 text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </label>
            </div>
            <ul role="listbox" className="py-1">
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
                      ) : (
                        <span className="size-3.5 shrink-0" />
                      )}
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
    </div>
  )
}

export function RowActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: ReactNode
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  function handleEnter() {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setPos({ top: rect.top - 8, left: rect.left + rect.width / 2 })
    setOpen(true)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setOpen(false)}
        onFocus={handleEnter}
        onBlur={() => setOpen(false)}
        className="inline-flex cursor-pointer rounded p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
      >
        {children}
      </button>
      {open
        ? createPortal(
            <span
              role="tooltip"
              style={{ top: pos.top, left: pos.left }}
              className="pointer-events-none fixed z-[200] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-white shadow-sm"
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}
