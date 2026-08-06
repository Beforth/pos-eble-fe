import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightSlot,
  className = '',
  id,
  ...rest
}: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          className={`h-10 w-full rounded-lg border bg-card text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            leftIcon ? 'pl-9' : 'pl-3'
          } ${rightSlot ? 'pr-11' : 'pr-3'} ${
            error ? 'border-danger' : 'border-line focus:border-primary'
          } ${className}`}
          {...rest}
        />
        {rightSlot && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightSlot}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}
