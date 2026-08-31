import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: ReactNode
  align?: 'left' | 'right' | 'center'
  render?: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  /** Sticky summary row rendered below the body (e.g. platform Total). */
  footer?: ReactNode
  emptyMessage?: string
  dense?: boolean
}

const alignClasses = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const

export function Table<T>({
  columns,
  rows,
  rowKey,
  footer,
  emptyMessage = 'No records to show',
  dense = false,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted ${alignClasses[column.align ?? 'left']}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-line last:border-0 hover:bg-page/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3 text-ink ${dense ? 'py-1.5' : 'py-2.5'} ${alignClasses[column.align ?? 'left']} ${column.className ?? ''}`}
                >
                  {column.render
                    ? column.render(row)
                    : (row as Record<string, ReactNode>)[column.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-sm text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  )
}
