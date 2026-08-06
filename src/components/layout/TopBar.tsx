import {
  Bell,
  ChevronDown,
  Compass,
  Headset,
  Menu,
  Monitor,
  Settings,
} from 'lucide-react'
import { IconButton } from '../common/IconButton'

interface TopBarProps {
  onMenuClick: () => void
  onSupportClick: () => void
  onNotificationsClick: () => void
  outletName: string
}

export function TopBar({
  onMenuClick,
  onSupportClick,
  onNotificationsClick,
  outletName,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-card px-4">
      <IconButton
        label="Open menu"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu size={20} />
      </IconButton>

      {/* Outlet switcher */}
      <button
        type="button"
        className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-muted"
        title={outletName}
      >
        <span className="max-w-40 truncate sm:max-w-56 lg:max-w-80">
          {outletName}
        </span>
        <ChevronDown size={14} className="shrink-0 text-muted" />
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSupportClick}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
        >
          <Headset size={16} className="text-primary" />
          <span className="hidden md:inline">Support Agent</span>
        </button>

        <IconButton label="Display">
          <Monitor size={18} />
        </IconButton>
        <IconButton
          label="Notifications"
          badgeDot
          onClick={onNotificationsClick}
        >
          <Bell size={18} />
        </IconButton>
        <IconButton label="Settings">
          <Settings size={18} />
        </IconButton>

        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
        >
          <Compass size={16} className="text-primary" />
          <span className="hidden sm:inline">Explore Products</span>
        </button>
      </div>
    </header>
  )
}
