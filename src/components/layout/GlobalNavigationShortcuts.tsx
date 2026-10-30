import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useChrome } from '../../state/ChromeContext'
import { showToast } from '../../utils/toast'

/**
 * Returns true if the target is an editable input/textarea/select/contenteditable.
 */
function isEditableElement(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  const tag = el.tagName.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    el.isContentEditable ||
    el.getAttribute('role') === 'textbox'
  )
}

/**
 * Global keyboard shortcuts listener for the entire application.
 *
 * Requirements:
 * 1. Opening bracket '[' toggles the sidebar open / close.
 * 2. Ctrl + <Initial> opens corresponding sidebar option:
 *    - Ctrl + B -> Billing (/billing)
 *    - Ctrl + I -> Inventory (/inventory)
 *    - Ctrl + K -> KOT (/kot)
 *    - Ctrl + D -> Dashboard (/dashboard)
 *    - Ctrl + L -> Live Orders (/live-orders)
 *    - Ctrl + M -> Menu (/menu)
 *    - Ctrl + F -> Finance (/finance)
 *    - Ctrl + R -> Reports (/reports/day-end-summary)
 *    - Ctrl + O -> Online Orders (/online-orders)
 *    - Ctrl + C -> Captain Orders (/captain-orders) [when not copying text]
 *    - Ctrl + A -> All Orders (/all-orders) [when not selecting text]
 *    - Ctrl + U -> Due Payments (/due-payments)
 *    - Ctrl + S -> Management (/management/configuration/outlet)
 */
export function GlobalNavigationShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()
  const { canAccess, isAuthenticated } = useAuth()
  const {
    collapsed,
    toggleCollapsed,
    billingDrawerOpen,
    setBillingDrawerOpen,
  } = useChrome()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // 1. Bracket shortcut: '[' toggles the sidebar
      // Supported naked '[' (when not typing in an input) OR 'Ctrl+[' anywhere
      const isBracketKey = event.key === '[' || event.code === 'BracketLeft'
      const isNakedBracket =
        isBracketKey && !event.ctrlKey && !event.metaKey && !event.altKey
      const isCtrlBracket =
        isBracketKey && (event.ctrlKey || event.metaKey) && !event.altKey

      if (isNakedBracket || isCtrlBracket) {
        // If typing in an input and pressed naked '[', let the user type the character
        if (isNakedBracket && isEditableElement(event.target)) {
          return
        }

        event.preventDefault()

        // If on billing screen, toggle billing navigation drawer
        if (location.pathname.startsWith('/billing')) {
          setBillingDrawerOpen((prev) => !prev)
          return
        }

        // On desktop/standard pages, toggle sidebar collapsed/expanded
        toggleCollapsed()
        return
      }

      // 2. Ctrl + <Initial> shortcut to open sidebar options
      // (Also supports Cmd on macOS)
      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        const key = event.key.toLowerCase()
        const target = event.target as HTMLElement | null
        const inEditable = isEditableElement(target)

        // Protect standard text editing operations in inputs:
        // Ctrl+A (Select All), Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+X (Cut), Ctrl+Z (Undo)
        if (
          inEditable &&
          (key === 'a' || key === 'c' || key === 'v' || key === 'x' || key === 'z')
        ) {
          return
        }

        // If user has selected text on screen, protect Copy and Select-All
        const hasSelection = (window.getSelection()?.toString().length ?? 0) > 0
        if (hasSelection && (key === 'c' || key === 'a')) {
          return
        }

        // Navigation mapping based on sidebar initials:
        let targetPath: string | null = null

        switch (key) {
          case 'b': // Billing
            targetPath = '/billing'
            break
          case 'i': // Inventory
            targetPath = '/inventory'
            break
          case 'k': // KOT
            targetPath = location.pathname.startsWith('/billing')
              ? '/billing/kot'
              : '/kot'
            break
          case 'd': // Dashboard
            targetPath = '/dashboard'
            break
          case 'l': // Live Orders
            targetPath = location.pathname.startsWith('/billing')
              ? '/billing/live-orders'
              : '/live-orders'
            break
          case 'm': // Menu
            targetPath = '/menu'
            break
          case 'f': // Finance
            targetPath = '/finance'
            break
          case 'r': // Reports
            targetPath = '/reports/day-end-summary'
            break
          case 'o': // Online Orders
            targetPath = '/online-orders'
            break
          case 'c': // Captain Orders
            targetPath = '/captain-orders'
            break
          case 'a': // All Orders
            targetPath = location.pathname.startsWith('/billing')
              ? '/billing/all-orders'
              : '/all-orders'
            break
          case 'u': // Due Payments (d-U-e Payments)
            targetPath = '/due-payments'
            break
          case 's': // Settings / Management
            targetPath = '/management/configuration/outlet'
            break
          default:
            break
        }

        if (targetPath) {
          event.preventDefault()

          if (!isAuthenticated) return

          if (!canAccess(targetPath)) {
            showToast(
              'Access restricted: You do not have permission for this screen',
              'warning',
            )
            return
          }

          if (billingDrawerOpen) {
            setBillingDrawerOpen(false)
          }

          navigate(targetPath)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    canAccess,
    collapsed,
    isAuthenticated,
    location.pathname,
    navigate,
    setBillingDrawerOpen,
    toggleCollapsed,
    billingDrawerOpen,
  ])

  return null
}
