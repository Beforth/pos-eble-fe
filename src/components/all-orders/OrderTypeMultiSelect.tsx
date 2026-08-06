import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface CheckboxOption {
  value: string
  label: string
}

interface CheckboxMultiSelectProps {
  label: string
  options: CheckboxOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
}

export function CheckboxMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  className = '',
}: CheckboxMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const displayPlaceholder = placeholder ?? label

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

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const display =
    value.length === 0
      ? displayPlaceholder
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? value[0])
        : `${value.length} selected`

  return (
    <div ref={rootRef} className={`relative min-w-[150px] flex-1 ${className}`}>
      <p className="text-xs text-muted">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="mt-1 flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-line bg-card px-2.5 text-left text-sm text-ink transition-colors hover:border-muted"
      >
        <span className={`truncate ${value.length ? 'text-ink' : 'text-muted'}`}>
          {display}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable
          className="absolute left-0 top-[calc(100%+4px)] z-40 max-h-56 min-w-full overflow-y-auto rounded-lg border border-line bg-card py-1 shadow-lg"
        >
          {options.map((option) => {
            const checked = value.includes(option.value)
            return (
              <li key={option.value} role="option" aria-selected={checked}>
                <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-page">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.value)}
                    className="size-3.5 accent-[var(--color-primary)]"
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Back-compat alias */
export const OrderTypeMultiSelect = CheckboxMultiSelect
