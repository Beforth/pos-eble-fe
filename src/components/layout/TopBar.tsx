import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  Compass,
  FileText,
  Headset,
  LogOut,
  Menu,
  Monitor,
  Plus,
  Settings,
  Shield,
  Store,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { brand } from '../../theme/brand'
import { IconButton } from '../common/IconButton'
import { ChangelogModal } from './ChangelogModal'
import { LegalDocModal, type LegalDocKind } from './LegalDocModal'

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
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [legalDoc, setLegalDoc] = useState<LegalDocKind | null>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!settingsOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [settingsOpen])

  function closeSettings() {
    setSettingsOpen(false)
  }

  function handleLogout() {
    closeSettings()
    logout()
    navigate('/login', { replace: true })
  }

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

      <button
        type="button"
        onClick={() => navigate('/table-view')}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>New Order</span>
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

        <div ref={settingsRef} className="relative">
          <IconButton
            label="Settings"
            active={settingsOpen}
            aria-haspopup="menu"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((prev) => !prev)}
          >
            <Settings size={18} />
          </IconButton>

          {settingsOpen && (
            <div
              role="menu"
              aria-label="Settings"
              className="absolute right-0 z-40 mt-1.5 w-56 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeSettings()
                  navigate('/profile')
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-page"
              >
                <UserRound size={15} className="shrink-0 text-muted" />
                Edit Profile
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeSettings()
                  setLegalDoc('terms')
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-page"
              >
                <FileText size={15} className="shrink-0 text-muted" />
                Terms & Condition
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeSettings()
                  setLegalDoc('privacy')
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-page"
              >
                <Shield size={15} className="shrink-0 text-muted" />
                Privacy Policy
              </button>

              <div className="my-1 border-t border-line" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeSettings()
                  setChangelogOpen(true)
                }}
                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-page"
              >
                <Store size={15} className="mt-0.5 shrink-0 text-muted" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{brand.shortName}</p>
                  <p className="mt-0.5 text-xs font-light text-muted">
                    Version {brand.appVersion}
                  </p>
                </div>
              </button>

              <div className="my-1 border-t border-line" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-page"
              >
                <LogOut size={15} className="shrink-0 text-muted" />
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
        >
          <Compass size={16} className="text-primary" />
          <span className="hidden sm:inline">Explore Products</span>
        </button>
      </div>
      <ChangelogModal
        open={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />
      <LegalDocModal kind={legalDoc} onClose={() => setLegalDoc(null)} />
    </header>
  )
}
