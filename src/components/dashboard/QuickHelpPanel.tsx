import { Clock3, MessageCircle } from 'lucide-react'
import type { QuickHelpData } from '../../types'
import { Avatar } from '../common/Avatar'
import { Card } from '../common/Card'

interface QuickHelpPanelProps {
  data: QuickHelpData
  className?: string
}

export function QuickHelpPanel({ data, className = '' }: QuickHelpPanelProps) {
  return (
    <Card title="Quick Help" className={className} divider={false}>
      <div className="mb-4 flex items-center gap-3">
        <Avatar name={data.contact.name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {data.contact.name}
          </p>
          <p className="truncate text-xs text-muted">{data.contact.role}</p>
        </div>
      </div>

      <div className="mb-4 space-y-1.5 text-xs text-muted">
        <p className="flex items-center gap-1.5">
          <Clock3 size={13} className="text-primary" />
          {data.hours}
        </p>
        <p>
          Outlet ID:{' '}
          <span className="font-semibold text-ink tabular-nums">
            {data.outletId}
          </span>
        </p>
      </div>

      <a
        href={`https://wa.me/${data.contact.phone.replace(/[^\d]/g, '')}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        <MessageCircle size={16} />
        Contact On WhatsApp
      </a>
    </Card>
  )
}
