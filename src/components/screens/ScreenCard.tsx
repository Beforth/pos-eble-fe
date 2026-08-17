import { MonitorSmartphone, Settings, Trash2 } from 'lucide-react'
import type { KotScreen } from '../../mocks/screensData'
import { categoryName } from '../../mocks/screensData'
import { getMenuItemById } from '../../mocks/menuItemsData'

interface ScreenCardProps {
  screen: KotScreen
  onOpen: (screen: KotScreen) => void
  onEdit?: (screen: KotScreen) => void
  onDelete: (screen: KotScreen) => void
}

export function ScreenCard({ screen, onOpen, onEdit, onDelete }: ScreenCardProps) {
  const isMasterScreen = (screen.categoryIds?.length ?? 0) === 0 && (screen.itemIds?.length ?? 0) === 0

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <MonitorSmartphone size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {screen.name}
              </p>
              <p className="text-xs text-muted">
                {isMasterScreen
                  ? 'Master Screen (All Categories)'
                  : `${screen.categoryIds.length} ${screen.categoryIds.length === 1 ? 'category' : 'categories'}${screen.itemIds?.length ? ` • ${screen.itemIds.length} item${screen.itemIds.length === 1 ? '' : 's'}` : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(screen)}
                aria-label={`Settings for ${screen.name}`}
                title="Screen Settings"
                className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
              >
                <Settings size={16} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onDelete(screen)}
              aria-label={`Delete ${screen.name}`}
              className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-primary"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {screen.categoryIds.map((id) => (
            <span
              key={id}
              className="rounded-md border border-line bg-page px-2 py-0.5 text-xs text-muted"
            >
              {categoryName(id)}
            </span>
          ))}
          {(screen.itemIds ?? []).map((id) => {
            const item = getMenuItemById(id)
            if (!item) return null
            return (
              <span
                key={id}
                className="rounded-md border border-primary/40 bg-primary/5 px-2 py-0.5 text-xs text-ink"
              >
                {item.name}
              </span>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => onOpen(screen)}
          className="mt-auto inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <MonitorSmartphone size={15} />
          Open Screen
        </button>
      </div>
    </div>
  )
}
