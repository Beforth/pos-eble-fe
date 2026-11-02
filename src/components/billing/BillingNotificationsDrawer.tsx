import { NotificationsDrawer } from '../layout/NotificationsDrawer'

interface BillingNotificationsDrawerProps {
  open: boolean
  onClose: () => void
}

/** Opens from the billing header's Notifications icon; same feed as the admin bell. */
export function BillingNotificationsDrawer({ open, onClose }: BillingNotificationsDrawerProps) {
  return <NotificationsDrawer open={open} onClose={onClose} />
}
