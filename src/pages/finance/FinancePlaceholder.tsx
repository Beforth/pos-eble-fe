import { FinancePageShell } from '../../components/layout/FinancePageShell'

export default function FinancePlaceholder({
  activeItem,
  title,
  description = 'This section will be available soon.',
}: {
  activeItem: string
  title: string
  description?: string
}) {
  return (
    <FinancePageShell activeItem={activeItem}>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-ink">{title}</h1>
      </div>
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      </div>
    </FinancePageShell>
  )
}
