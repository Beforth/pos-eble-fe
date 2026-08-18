import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FilterSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
}

/** Styled single-select matching All Order Type trigger UI. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className = '',
}: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value) ?? options[0]

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
    <div ref={rootRef} className={`relative ${className || 'min-w-[140px] flex-1'}`}>
      {label ? <p className="text-xs text-muted">{label}</p> : null}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label || 'Select'}
        className={`${label ? 'mt-1' : ''} flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-line bg-card px-2.5 text-left text-sm text-ink transition-colors hover:border-muted`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-40 max-h-56 min-w-full overflow-y-auto rounded-lg border border-line bg-card py-1 shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full px-3 py-2 text-left text-sm hover:bg-page ${
                    isSelected ? 'font-medium text-primary' : 'text-ink'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
