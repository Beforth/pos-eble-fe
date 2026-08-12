import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { ActionCenterDrawer } from './ActionCenterDrawer'
import { MenuSidebar } from './MenuSidebar'
import { NotificationsDrawer } from './NotificationsDrawer'
import { PageContainer } from './PageContainer'
import { SupportAgentDrawer } from './SupportAgentDrawer'
import { TopBar } from './TopBar'
import { brand } from '../../theme/brand'

/** Dense item-channel pages — sidebar starts collapsed for more space. */
const AUTO_COLLAPSE_PATHS = [
  '/menu/base-menu',
  '/menu/home-delivery',
  '/menu/parcel',
  '/menu/dine-in',
  '/menu/zomato',
  '/menu/swiggy',
  '/menu/channel',
  '/menu/schedule-changes',
]

interface MenuPageShellProps {
  title: ReactNode
  /** Where the header Back button goes. Defaults to Dashboard. */
  backTo?: string
  /** Menu sidebar highlight. Defaults to Menu & Discounts. */
  activeItem?: string
  children: ReactNode
}

export function MenuPageShell({
  title,
  backTo = '/dashboard',
  activeItem = 'menu-discounts',
  children,
}: MenuPageShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const shouldAutoCollapse = AUTO_COLLAPSE_PATHS.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  )
  const [collapsed, setCollapsed] = useState(shouldAutoCollapse)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  useEffect(() => {
    if (shouldAutoCollapse) setCollapsed(true)
  }, [shouldAutoCollapse])

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  return (
    <div className="min-h-screen bg-page">
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
        className={`transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'}`}
      >
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

        <PageContainer
          title={title}
          actions={
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs text-muted">
                <RefreshCw size={13} className="text-accent" />
                Last Menu Sync{' '}
                <span className="rounded bg-accent/15 px-1.5 py-0.5 font-semibold text-accent">
                  12 hr ago
                </span>
              </span>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:brightness-95"
              >
                <RefreshCw size={14} />
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
          {children}
        </PageContainer>
      </div>
    </div>
  )
}
