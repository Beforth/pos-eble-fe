import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { formatMinutesAgo } from '../../utils/format'

interface SyncStatusItem {
  label: string
  minutesAgo: number
}

interface PageContainerProps {
  title: ReactNode
  actions?: ReactNode
  /** Extra control shown on the right of the sync row (e.g. Action Center). */
  syncActions?: ReactNode
  syncStatus?: SyncStatusItem[]
  onRefresh?: () => void
  className?: string
  children: ReactNode
}

export function PageContainer({
  title,
  actions,
  syncActions,
  syncStatus,
  onRefresh,
  className = '',
  children,
}: PageContainerProps) {
  return (
    <main className={`px-4 py-4 sm:px-5 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink sm:text-xl">{title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh data"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-card text-muted transition-colors hover:text-ink"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {(syncStatus && syncStatus.length > 0) || syncActions ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            {syncStatus?.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success" />
                {item.label} synced {formatMinutesAgo(item.minutesAgo)}
              </span>
            ))}
          </div>
          {syncActions}
        </div>
      ) : null}

      {children}
    </main>
  )
}
