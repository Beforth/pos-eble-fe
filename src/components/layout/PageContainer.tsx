import { useState, type ReactNode } from 'react'
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
  /** When false, the refresh icon spins only on click (no hover rotate). */
  refreshHoverRotate?: boolean
  className?: string
  children: ReactNode
}

export function PageContainer({
  title,
  actions,
  syncActions,
  syncStatus,
  onRefresh,
  refreshHoverRotate = true,
  className = '',
  children,
}: PageContainerProps) {
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    if (!onRefresh || refreshing) return
    setRefreshing(true)
    onRefresh()
    window.setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <main className={`px-4 py-4 sm:px-5 ${className}`}>
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink sm:text-xl">{title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh data"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-card text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-80"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? 'animate-spin'
                    : refreshHoverRotate
                      ? 'transition-transform duration-300 hover:rotate-180'
                      : undefined
                }
              />
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
