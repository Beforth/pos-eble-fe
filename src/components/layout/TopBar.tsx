import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  ChefHat,
  ChevronDown,
  FileText,
  Loader2,
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
import {
  listOutletsApi,
  type OutletMembershipSummary,
} from '../../services/outletService'
import { brand } from '../../theme/brand'
import { IconButton } from '../common/IconButton'
import { ChangelogModal } from './ChangelogModal'
import { LegalDocModal, type LegalDocKind } from './LegalDocModal'
import { UniversalSearchBar } from './UniversalSearchBar'

interface TopBarProps {
  onMenuClick: () => void
  onSupportClick: () => void
  onNotificationsClick: () => void
  outletName: string
}

export function TopBar({
  onMenuClick,
  onNotificationsClick,
  outletName,
}: TopBarProps) {
  const navigate = useNavigate()
  const { logout, user, outletId, encryptedOutletId, switchOutlet } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [legalDoc, setLegalDoc] = useState<LegalDocKind | null>(null)
  const [outletOpen, setOutletOpen] = useState(false)
  const [outletSwitching, setOutletSwitching] = useState(false)
  const [outletError, setOutletError] = useState<string | null>(null)
  const [memberships, setMemberships] = useState<OutletMembershipSummary[]>([])
  const membershipsLoadedRef = useRef(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const outletRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!outletOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (
        outletRef.current &&
        !outletRef.current.contains(event.target as Node)
      ) {
        setOutletOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOutletOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [outletOpen])

  const loadOutlets = useCallback(async () => {
    setOutletError(null)
    try {
      setMemberships(await listOutletsApi())
    } catch (err) {
      setOutletError(
        err instanceof Error ? err.message : 'Failed to load outlets.',
      )
    } finally {
      membershipsLoadedRef.current = true
    }
  }, [])

  function toggleOutlet() {
    const opening = !outletOpen
    setOutletOpen(opening)
    if (opening && !membershipsLoadedRef.current) {
      loadOutlets()
    }
  }

  async function handleSwitchOutlet(outlet: OutletMembershipSummary) {
    if (outletSwitching) return
    if (outlet.outlet_id === outletId || outlet.encrypted_id === encryptedOutletId) {
      setOutletOpen(false)
      return
    }
    setOutletSwitching(true)
    setOutletError(null)
    try {
      await switchOutlet(outlet.outlet_id)
      setOutletOpen(false)
    } catch (err) {
      setOutletError(
        err instanceof Error ? err.message : 'Failed to switch outlet.',
      )
    } finally {
      setOutletSwitching(false)
    }
  }

  function closeSettings() {
    setSettingsOpen(false)
  }

  function handleLogout() {
    closeSettings()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-y-2 border-b border-line bg-card px-4 py-2 lg:h-14 lg:flex-row lg:items-center lg:gap-y-0 lg:py-0">
      <div className="flex items-center gap-2">
        <IconButton
          label="Open menu"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu size={20} />
        </IconButton>

        <UniversalSearchBar className="max-lg:flex-1 max-lg:w-full lg:w-96 xl:w-[28rem]" />
      </div>

      <div className="ml-auto flex items-center gap-1.5 max-lg:w-full max-lg:flex-wrap max-lg:justify-end">
        {/* Outlet switcher */}
        <div ref={outletRef} className="relative max-lg:min-w-0 max-lg:flex-1">
          <button
            type="button"
            onClick={toggleOutlet}
            disabled={outletSwitching}
            className="inline-flex min-w-0 max-lg:w-full items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-muted disabled:opacity-60"
            title={user?.outlet ?? outletName}
            aria-haspopup="listbox"
            aria-expanded={outletOpen}
          >
            <span className="max-w-40 truncate sm:max-w-56 lg:max-w-80">
              {user?.outlet ?? outletName}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-muted transition-transform ${outletOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {outletOpen && (
            <div
              role="listbox"
              aria-label="Switch outlet"
              className="absolute right-0 z-40 mt-1.5 w-72 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
            >
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                Select outlet
              </p>

              {!membershipsLoadedRef.current && !outletError ? (
                <div className="px-3 py-3 text-sm text-muted">
                  Loading outlets…
                </div>
              ) : outletError ? (
                <div className="px-3 py-3 text-sm text-muted">
                  {outletError}
                  <button
                    type="button"
                    onClick={() => loadOutlets()}
                    className="mt-1 block text-primary hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : memberships.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted">
                  No outlets available.
                </div>
              ) : (
                memberships.map((outlet) => {
                  const isActive =
                    outlet.outlet_id === outletId ||
                    outlet.encrypted_id === encryptedOutletId
                  const switching = outletSwitching && !isActive
                  return (
                    <button
                      key={outlet.outlet_id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      disabled={outletSwitching}
                      onClick={() => handleSwitchOutlet(outlet)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Store size={15} className="shrink-0 text-muted" />
                      <span className="min-w-0 flex-1 truncate">
                        {outlet.outlet_name}
                      </span>
                      {switching ? (
                        <Loader2
                          size={14}
                          className="animate-spin shrink-0 text-muted"
                        />
                      ) : isActive ? (
                        <Check size={14} className="shrink-0 text-primary" />
                      ) : null}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/table-view')}
          className="inline-flex h-9 max-lg:shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Order</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/captain-orders')}
          title="Captain Orders"
          className="inline-flex h-9 max-lg:shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
        >
          <ChefHat size={16} className="text-primary" />
          <span className="hidden sm:inline">Captain Orders</span>
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
      </div>
      <ChangelogModal
        open={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />
      <LegalDocModal kind={legalDoc} onClose={() => setLegalDoc(null)} />
    </header>
  )
}
