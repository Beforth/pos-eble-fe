import { ReportsPageShell } from '../../components/layout/ReportsPageShell'

interface ManagementPlaceholderProps {
  title: string
  activeItem: string
}

export default function ManagementPlaceholder({
  title,
  activeItem,
}: ManagementPlaceholderProps) {
  return (
    <ReportsPageShell title={title} activeItem={activeItem}>
      <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-muted">
        {title} settings will be available soon.
      </div>
    </ReportsPageShell>
  )
}
