type ProgressColor = 'primary' | 'accent' | 'success' | 'secondary'

interface ProgressBarProps {
  /** 0-100 */
  value: number
  color?: ProgressColor
  height?: number
  className?: string
  showLabel?: boolean
}

const colorClasses: Record<ProgressColor, string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-success',
  secondary: 'bg-secondary',
}

export function ProgressBar({
  value,
  color = 'primary',
  height = 6,
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full overflow-hidden rounded-full bg-page"
        style={{ height }}
      >
        <div
          className={`h-full rounded-full transition-all ${colorClasses[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted tabular-nums">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}
