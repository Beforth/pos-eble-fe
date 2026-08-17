import { useState, type ReactNode } from 'react'
import { ActionCenterDrawer } from './ActionCenterDrawer'
import { NotificationsDrawer } from './NotificationsDrawer'
import { PageContainer } from './PageContainer'
import { Sidebar } from './Sidebar'
import { SupportAgentDrawer } from './SupportAgentDrawer'
import { TopBar } from './TopBar'
import { brand } from '../../theme/brand'

interface ReportsPageShellProps {
  title: ReactNode
  activeItem: string
  actions?: ReactNode
  children?: ReactNode
}

export function ReportsPageShell({
  title,
  activeItem,
  actions,
  children,
}: ReportsPageShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
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

        <PageContainer title={title} actions={actions}>
          {children ?? (
            <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-muted">
              This report screen will be available soon.
            </div>
          )}
        </PageContainer>
      </div>
    </div>
  )
}
