import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { SortDirection } from '../../utils/listQuery'

interface SortableThProps {
  columnKey: string
  sortKey: string | null
  sortDir: SortDirection
  onSort: (key: string) => void
  children: ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

const alignClasses = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const

export function SortableTh({
  columnKey,
  sortKey,
  sortDir,
  onSort,
  children,
  className = '',
  align = 'left',
}: SortableThProps) {
  const active = sortKey === columnKey
  const justify =
    align === 'right'
      ? 'justify-end'
      : align === 'center'
        ? 'justify-center'
        : 'justify-start'

  return (
    <th
      scope="col"
      aria-sort={
        active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      className={`${alignClasses[align]} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={`inline-flex w-full items-center gap-1 ${justify} font-[inherit] text-[inherit]`}
      >
        <span>{children}</span>
        <span className="-my-0.5 inline-flex flex-col leading-none" aria-hidden>
          <ChevronUp
            size={10}
            strokeWidth={2.5}
            className={
              active && sortDir === 'asc' ? 'text-primary' : 'text-muted/35'
            }
          />
          <ChevronDown
            size={10}
            strokeWidth={2.5}
            className={
              active && sortDir === 'desc' ? 'text-primary' : 'text-muted/35'
            }
          />
        </span>
      </button>
    </th>
  )
}
