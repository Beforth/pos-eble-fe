const DISMISS_KEY = 'pos-eble-kot-dismissed'

/**
 * KOTs the billing board should never show again.
 *
 * Dismissing a KOT from the KOT view is a screen-local, persistent hide: the
 * ticket stays open on the server and in the shared KOT store (so the KOT
 * register, kitchen and other routes keep showing it), but this terminal
 * filters it out of the board for good. The set is keyed by the ticket's
 * encrypted id, which is unique per KOT.
 */
export function loadDismissedKotIds(): string[] {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

export function isKotDismissed(id: string): boolean {
  if (!id) return false
  return loadDismissedKotIds().includes(id)
}

/** Idempotent — dismissing the same KOT twice is a no-op. */
export function markKotDismissed(id: string): void {
  if (!id) return
  const dismissed = loadDismissedKotIds()
  if (dismissed.includes(id)) return
  dismissed.push(id)
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed))
  } catch {
    // Best-effort: a failed persist just means the board may show it again
    // after a reload.
  }
}