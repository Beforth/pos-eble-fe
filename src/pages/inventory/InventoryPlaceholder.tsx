import { InventoryPageShell } from '../../components/layout/InventoryPageShell'

interface InventoryPlaceholderProps {
  activeItem: string
  title: string
  description?: string
}

export default function InventoryPlaceholder({
  activeItem,
  title,
  description = 'This section will be available soon.',
}: InventoryPlaceholderProps) {
  return (
    <InventoryPageShell activeItem={activeItem}>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">{title}</h1>
      </div>
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      </div>
    </InventoryPageShell>
  )
}
