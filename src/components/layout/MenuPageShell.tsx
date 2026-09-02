import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { ActionCenterDrawer } from './ActionCenterDrawer'
import { MenuSidebar } from './MenuSidebar'
import { NotificationsDrawer } from './NotificationsDrawer'
import { PageContainer } from './PageContainer'
import { SupportAgentDrawer } from './SupportAgentDrawer'
import { TopBar } from './TopBar'
import { brand } from '../../theme/brand'

interface MenuPageShellProps {
  title: ReactNode
  /** Where the header Back button goes. Defaults to Dashboard. */
  backTo?: string
  /** Menu sidebar highlight. Defaults to Menu & Discounts. */
  activeItem?: string
  /** Stretch main content to fill remaining viewport height. */
  fillViewport?: boolean
  children: ReactNode
}

export function MenuPageShell({
  title,
  backTo = '/dashboard',
  activeItem = 'menu-discounts',
  fillViewport = false,
  children,
}: MenuPageShellProps) {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  function handleSync() {
    if (syncing) return
    setSyncing(true)
    window.setTimeout(() => setSyncing(false), 1500)
  }

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  return (
    <div
      className={`bg-page ${fillViewport ? 'h-dvh overflow-hidden' : 'min-h-screen'}`}
    >
      <MenuSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem={activeItem}
      />

      <SupportAgentDrawer
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <ActionCenterDrawer
        open={actionCenterOpen}
        onClose={() => setActionCenterOpen(false)}
      />

      <div
        className={`transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'} ${
          fillViewport ? 'flex h-dvh max-h-dvh flex-col overflow-hidden' : ''
        }`}
      >
        <div className={fillViewport ? 'shrink-0' : undefined}>
          <TopBar
            onMenuClick={() => setMobileOpen(true)}
            onSupportClick={() => {
              closeOtherDrawers()
              setSupportOpen(true)
            }}
            onNotificationsClick={() => {
              closeOtherDrawers()
              setNotificationsOpen(true)
            }}
            outletName={brand.outletName}
          />
        </div>

        <PageContainer
          title={title}
          className={
            fillViewport
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden pb-0'
              : ''
          }
          actions={
            <>
              <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm text-muted">
                <RefreshCw size={14} className="text-accent" />
                Last Menu Sync{' '}
                <span className="rounded bg-accent/15 px-1.5 py-0.5 font-semibold text-accent">
                  12 hr ago
                </span>
              </span>
              <button
                type="button"
                onClick={handleSync}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:brightness-95"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                Sync POS
              </button>
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            </>
          }
        >
          {fillViewport ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          ) : (
            children
          )}
        </PageContainer>
      </div>
    </div>
  )
}
