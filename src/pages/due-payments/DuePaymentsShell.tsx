import { useState, type ReactNode } from 'react'
import { ActionCenterDrawer } from '../../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../../components/layout/NotificationsDrawer'
import { Sidebar } from '../../components/layout/Sidebar'
import { SupportAgentDrawer } from '../../components/layout/SupportAgentDrawer'
import { TopBar } from '../../components/layout/TopBar'
import { brand } from '../../theme/brand'

interface DuePaymentsShellProps {
  children: ReactNode
}

export function DuePaymentsShell({ children }: DuePaymentsShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  function closeOtherDrawers() {
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
        activeItem="due-payments"
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
        {children}
      </div>
    </div>
  )
}
