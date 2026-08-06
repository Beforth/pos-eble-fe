interface ToggleOption {
  value: string
  label: string
}

interface ToggleProps {
  options: ToggleOption[]
  value: string
  onChange: (value: string) => void
  name?: string
  className?: string
}

/**
 * Segmented pill control (e.g. Top Performing / Low Performing).
 * Falls back to a switch look when only two options are provided.
 */
export function Toggle({
  options,
  value,
  onChange,
  name = 'toggle',
  className = '',
}: ToggleProps) {
  return (
    <div
      role="tablist"
      aria-label={name}
      className={`inline-flex items-center gap-0.5 rounded-full border border-line bg-page p-0.5 ${className}`}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`h-7 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
              selected
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
