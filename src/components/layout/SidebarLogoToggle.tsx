import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { BrandLogo } from '../brand/BrandLogo'

interface SidebarLogoToggleProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

/** Brand logo that swaps for the collapse/expand toggle on hover (desktop). */
export function SidebarLogoToggle({ collapsed, onToggleCollapse }: SidebarLogoToggleProps) {
  const label = collapsed ? 'Expand sidebar ([)' : 'Collapse sidebar (['
  return (
    <div className="group relative shrink-0">
      <BrandLogo size={36} />
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={label}
        data-tooltip={label}
        className="absolute inset-0 hidden cursor-pointer items-center justify-center rounded-lg bg-card text-ink opacity-0 ring-1 ring-line transition-opacity hover:bg-page focus-visible:opacity-100 group-hover:opacity-100 lg:flex"
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>
    </div>
  )
}
