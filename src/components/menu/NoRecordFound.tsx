import { Search } from 'lucide-react'

export function NoRecordFound() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-line bg-card px-6 py-12 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Search size={28} strokeWidth={1.75} />
      </span>
      <p className="text-base font-semibold text-ink">No Record Found</p>
      <p className="mt-1 max-w-sm text-sm text-muted">
        We could not find what you searched for Try searching again
      </p>
    </div>
  )
}
