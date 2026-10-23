import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isCaptainOnly } from '../auth/routePermissions'

interface StartOptions {
  /** Captain Orders flow: opens `/captain-orders` instead of `/billing`. */
  captain?: boolean
  /** Runs right before navigating - e.g. clear the cart. */
  onNavigate?: () => void
}

/**
 * "New Order" opens the order screen directly. The table is chosen on that
 * screen (Select table), and the table view is one icon away - so there is no
 * table-view detour. Every New Order button goes through here.
 */
export function useNewOrder() {
  const navigate = useNavigate()
  const { permissions } = useAuth()

  const startNewOrder = useCallback(
    (options: StartOptions = {}) => {
      options.onNavigate?.()
      const captain = Boolean(options.captain) || isCaptainOnly(permissions)
      navigate(captain ? '/captain-orders' : '/billing')
    },
    [navigate, permissions],
  )

  return { startNewOrder }
}
