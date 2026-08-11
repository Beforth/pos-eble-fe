import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

const CYCLE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const

export type StockUpdateCycle = (typeof CYCLE_OPTIONS)[number]['value']

interface StockUpdateCycleSelectProps {
  value: StockUpdateCycle
  onChange: (value: StockUpdateCycle) => void
}

export function StockUpdateCycleSelect({
  value,
  onChange,
}: StockUpdateCycleSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected =
    CYCLE_OPTIONS.find((option) => option.value === value) ?? CYCLE_OPTIONS[1]

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
    <div className="inline-flex items-center gap-2">
      <span className="whitespace-nowrap text-sm text-ink">
        Stock update cycle:
      </span>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Stock update cycle"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-9 min-w-[120px] items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <span>{selected.label}</span>
          <ChevronDown size={14} className="shrink-0 text-muted" />
        </button>
        {open ? (
          <ul
            role="listbox"
            className="absolute left-0 z-40 mt-1.5 min-w-full overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg"
          >
            {CYCLE_OPTIONS.map((option) => {
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
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-page ${
                      active ? 'font-semibold text-ink' : 'text-ink'
                    }`}
                  >
                    <span>{option.label}</span>
                    {active ? (
                      <Check size={15} className="shrink-0 text-success" />
                    ) : (
                      <span className="size-[15px]" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
