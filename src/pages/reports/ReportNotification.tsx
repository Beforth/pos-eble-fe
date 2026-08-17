import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'

function ActionMenu({
  value,
  onChange,
}: {
  value: 'active' | 'inactive'
  onChange: (value: 'active' | 'inactive') => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        Action
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[140px] overflow-hidden rounded-lg border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onChange(value === 'inactive' ? 'active' : 'inactive')
                setOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-page ${
                value === 'inactive'
                  ? 'font-semibold text-primary'
                  : 'text-ink'
              }`}
            >
              {value === 'inactive' ? 'Active' : 'Inactive'}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export default function ReportNotification() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>(
    'active',
  )

  return (
    <ReportsPageShell
      title="Report Notification"
      activeItem="report-notification"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PrimaryButton
            onClick={() => navigate('/reports/report-notification/add')}
          >
            Add Report Notification
          </PrimaryButton>
          <ActionMenu value={statusFilter} onChange={setStatusFilter} />
        </div>
      }
    >
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <Search
          size={64}
          strokeWidth={1.25}
          className="mb-4 text-muted/40"
        />
        <p className="text-base font-semibold text-ink">No Results Found.</p>
        <p className="mt-1 text-sm text-muted">
          We couldn&apos;t find a match for your search.
        </p>
        {statusFilter === 'inactive' ? (
          <p className="mt-3 text-xs font-medium text-muted">
            Showing inactive notifications
          </p>
        ) : null}
      </div>
    </ReportsPageShell>
  )
}
