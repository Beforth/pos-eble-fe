import { ChevronDown, FileText, Info, Search } from 'lucide-react'

export const REPORT_UNAVAILABLE_MESSAGE =
  'Report data API is not available yet. Filters and export are disabled.'

export function ReportUnavailableNotice({
  className = '',
}: {
  className?: string
}) {
  return (
    <div
      role="status"
      className={`mb-4 flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-ink ${className}`}
    >
      <Info size={18} className="shrink-0 text-amber-600" />
      <p>{REPORT_UNAVAILABLE_MESSAGE}</p>
    </div>
  )
}

export function DisabledExportButton({ label = 'Export' }: { label?: string }) {
  return (
    <button
      type="button"
      disabled
      title={REPORT_UNAVAILABLE_MESSAGE}
      className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink opacity-60"
    >
      <FileText size={15} className="text-muted" />
      {label}
      <ChevronDown size={14} className="text-muted" />
    </button>
  )
}

export function ReportEmptyState({
  title,
  variant = 'card',
}: {
  title: string
  variant?: 'card' | 'plain'
}) {
  return (
    <div
      className={
        variant === 'card'
          ? 'flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center'
          : 'flex flex-col items-center justify-center text-center'
      }
    >
      <span className="relative mb-4 text-muted">
        <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
        <Search
          size={24}
          className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
        />
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
    </div>
  )
}
