import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfigBreadcrumb } from '../management/ConfigSectionCard'
import { useNewOrder } from '../../state/useNewOrder'
import { BillingHeader } from './BillingHeader'

interface BillingSettingsShellProps {
  /** Name of the settings screen, shown after "Outlet Settings >". */
  current: string
  children: ReactNode
}

/**
 * Frame for the billing copies of the outlet settings screens
 * (`/billing/settings/<name>`): the billing header and an "Outlet Settings >
 * <screen>" breadcrumb that leads back to `/billing/settings`.
 */
export function BillingSettingsShell({ current, children }: BillingSettingsShellProps) {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />
      <div className="border-b border-line bg-card px-5 py-3">
        <ConfigBreadcrumb
          onNavigate={() => navigate('/billing/settings')}
          parent="Outlet Settings"
          current={current}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
    </div>
  )
}
