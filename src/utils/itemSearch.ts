/** Collapse stretched vowels so "pani" matches "paani". */
function normalizeFoodText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/aa+/g, 'a')
    .replace(/ee+/g, 'e')
    .replace(/ii+/g, 'i')
    .replace(/oo+/g, 'o')
    .replace(/uu+/g, 'u')
}

/** Initials from "Party Box - Dahi Puri" → "pbdp". */
export function getItemInitials(name: string): string {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0] ?? '')
    .join('')
}

/**
 * Matches item names with:
 * - normal substring
 * - spelling variants (pani ↔ paani)
 * - compact form (panipuri)
 * - initials (pp, pbdp)
 */
export function itemNameMatchesQuery(name: string, query: string): boolean {
  const raw = query.trim().toLowerCase()
  if (!raw) return true

  const nameLower = name.toLowerCase()
  if (nameLower.includes(raw)) return true

  const normName = normalizeFoodText(name)
  const normQuery = normalizeFoodText(raw)
  if (!normQuery) return true
  if (normName.includes(normQuery)) return true

  const compactName = normName.replace(/\s+/g, '')
  const compactQuery = normQuery.replace(/\s+/g, '')
  if (compactQuery && compactName.includes(compactQuery)) return true

  const initialsQuery = raw.replace(/[^a-z0-9]/g, '')
  if (initialsQuery.length >= 2) {
    const initials = getItemInitials(name)
    if (
      initials === initialsQuery ||
      initials.startsWith(initialsQuery)
    ) {
      return true
    }
  }

  const queryWords = normQuery.split(' ').filter(Boolean)
  const nameWords = normName.split(' ').filter(Boolean)
  if (
    queryWords.length > 0 &&
    queryWords.every((qw) =>
      nameWords.some(
        (nw) => nw.startsWith(qw) || qw.startsWith(nw) || nw.includes(qw),
      ),
    )
  ) {
    return true
  }

  return false
}
