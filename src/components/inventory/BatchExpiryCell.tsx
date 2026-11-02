/** Expiry of a finished-good batch: the date, with a red/orange hint when it is near. */
export function BatchExpiryCell({ expiry }: { expiry: string | null }) {
  if (!expiry) return <span className="text-muted">—</span>
  const today = new Date().toISOString().slice(0, 10)
  const days = Math.round(
    (new Date(expiry).getTime() - new Date(today).getTime()) / 86_400_000,
  )
  if (days < 0) {
    return (
      <span className="whitespace-nowrap">
        <span className="text-ink">{expiry}</span>{' '}
        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
          Expired
        </span>
      </span>
    )
  }
  if (days <= 2) {
    return (
      <span className="whitespace-nowrap">
        <span className="text-ink">{expiry}</span>{' '}
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
          {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} left`}
        </span>
      </span>
    )
  }
  return <span className="whitespace-nowrap text-ink">{expiry}</span>
}
