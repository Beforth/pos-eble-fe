import type { ReactNode } from 'react'

/**
 * Wraps a control that cannot host `data-tooltip` itself — most importantly a
 * `disabled` button, which emits no mouse events, so the delegated manager in
 * src/utils/tooltip.ts would never see a tooltip placed on it.
 *
 * The wrapper becomes the hover/focus target. Keep the inner control's
 * `aria-label` for the accessible name; the wrapper's `data-tooltip` is what
 * the user sees on hover.
 */
export function TooltipWrapper({
  label,
  className = '',
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <span data-tooltip={label} className={`inline-flex ${className}`}>
      {children}
    </span>
  )
}
