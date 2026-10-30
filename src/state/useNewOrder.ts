import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isCaptainOnly } from '../auth/routePermissions'
import { useDisplaySettings } from '../services/useDisplaySettings'

interface StartOptions {
  /** Captain Orders flow: opens `/captain-orders` instead of `/billing`. */
  captain?: boolean
  /** Runs right before navigating - e.g. clear the cart. */
  onNavigate?: () => void
}

/**
 * "New Order" opens the order screen directly. The table is chosen on that
 * screen (Select table), and the table view is one icon away. When the outlet's
 * Display Settings make Table Management the default screen, New Order opens
 * the table view instead, so the table is picked first. Every New Order button
 * goes through here.
 */
export function useNewOrder() {
  const navigate = useNavigate()
  const { permissions } = useAuth()
  const { defaultScreen } = useDisplaySettings()

  const startNewOrder = useCallback(
    (options: StartOptions = {}) => {
      options.onNavigate?.()
      const captain = Boolean(options.captain) || isCaptainOnly(permissions)
      if (captain) {
        navigate('/captain-orders')
      } else {
        navigate(defaultScreen === 'Table Management' ? '/table-view' : '/billing')
      }
    },
    [navigate, permissions, defaultScreen],
  )

  return { startNewOrder }
}
