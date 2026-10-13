import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { searchIndex, type SearchEntry } from '../../config/searchIndex'

interface UniversalSearchBarProps {
  compact?: boolean
  className?: string
}

const MAX_RESULTS = 8

function Highlighted({ text, query }: { text: string; query: string }) {
  const index =
    query.length > 0 ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (index === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-primary">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  )
}

export function UniversalSearchBar({
  compact = false,
  className = '',
}: UniversalSearchBarProps) {
  const navigate = useNavigate()
  const { canAccess } = useAuth()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const trimmed = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (trimmed.length < 2) return []
    const prefixMatches: SearchEntry[] = []
    const containsMatches: SearchEntry[] = []
    for (const entry of searchIndex) {
      // Never offer a screen the user would be bounced off: a captain, for
      // instance, would find "Billing" here and get denied.
      if (!canAccess(entry.path)) continue
      const label = entry.label.toLowerCase()
      const haystack = `${entry.label} ${entry.path} ${(entry.keywords ?? []).join(' ')}`.toLowerCase()
      if (!haystack.includes(trimmed)) continue
      if (
        label.startsWith(trimmed) ||
        entry.path.toLowerCase().startsWith(trimmed)
      ) {
        prefixMatches.push(entry)
      } else {
        containsMatches.push(entry)
      }
    }
    return [...prefixMatches, ...containsMatches].slice(0, MAX_RESULTS)
  }, [trimmed, canAccess])

  const showResults = open && trimmed.length >= 2
  const safeIndex =
    showResults && results.length > 0
      ? Math.min(activeIndex, results.length - 1)
      : -1

  useEffect(() => {
    setActiveIndex(0)
  }, [trimmed])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
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
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        const target = event.target as HTMLElement | null
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
        ) {
          return
        }
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function selectEntry(entry: SearchEntry) {
    navigate(entry.path)
    setQuery('')
    setOpen(false)
    setActiveIndex(0)
    inputRef.current?.blur()
    window.scrollTo({ top: 0 })
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      if (!showResults || results.length === 0) return
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      if (!showResults || results.length === 0) return
      event.preventDefault()
      setActiveIndex(
        (index) => (index - 1 + results.length) % results.length,
      )
    } else if (event.key === 'Enter') {
      if (!showResults || results.length === 0) return
      event.preventDefault()
      selectEntry(results[safeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const iconSize = compact ? 14 : 16

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative">
        <span
          className={`pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-muted ${compact ? '' : 'left-3'}`}
        >
          <Search size={iconSize} />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search pages…"
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search pages"
          aria-expanded={showResults}
          aria-controls={showResults ? 'universal-search-results' : undefined}
          aria-activedescendant={
            showResults && safeIndex >= 0
              ? `universal-search-option-${safeIndex}`
              : undefined
          }
          className={`w-full ${compact ? 'h-8 pl-8 pr-8 text-xs' : 'h-9 pl-9 pr-16 text-sm'} rounded-lg border border-ink/40 bg-card text-ink placeholder:text-muted transition-colors focus:border-ink/60 focus:outline-none focus:ring-2 focus:ring-ink/10 [&::-webkit-search-cancel-button]:hidden`}
        />
        {!compact && (
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <kbd className="rounded border border-line bg-page px-1.5 py-0.5 text-[10px] font-medium text-muted">
              Ctrl K
            </kbd>
          </span>
        )}
      </div>

      {showResults && (
        <div
          id="universal-search-results"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute right-0 top-full z-50 mt-1.5 max-h-96 w-full overflow-y-auto rounded-xl border border-line bg-card py-1 shadow-lg"
        >
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">
              No matching pages for “{query.trim()}”
            </p>
          ) : (
            results.map((entry, index) => (
              <button
                key={entry.id}
                id={`universal-search-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === safeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectEntry(entry)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === safeIndex ? 'bg-page' : ''
                }`}
              >
                <Search size={14} className="shrink-0 text-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">
                    <Highlighted text={entry.label} query={trimmed} />
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {entry.path}
                  </span>
                </span>
                <span className="shrink-0 rounded bg-page px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {entry.group}
                </span>
                {index === safeIndex && (
                  <CornerDownLeft size={12} className="shrink-0 text-muted" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}