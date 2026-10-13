import type { MenuItemRow } from './menuAdapter'

/**
 * Normalize a short code for comparison: trim, lowercase, strip leading zeros
 * ("01" → "1", "Vb" → "vb").
 */
export function normalizeShortCode(value: string): string {
  return value.trim().toLowerCase().replace(/^0+(\d)/, '$1')
}

function itemShortCodes(
  item: Pick<MenuItemRow, 'shortCode' | 'shortCode2'>,
): string[] {
  return [item.shortCode, item.shortCode2].filter((c): c is string => Boolean(c))
}

/** Case-insensitive exact or prefix match against the item's short codes. */
export function matchesShortCode(
  item: Pick<MenuItemRow, 'shortCode' | 'shortCode2'>,
  input: string,
): boolean {
  const query = normalizeShortCode(input)
  if (!query) return false
  return itemShortCodes(item).some((code) => {
    const normalized = normalizeShortCode(code)
    return normalized === query || normalized.includes(query)
  })
}

/**
 * Resolve a short-code input to a single addable item. Exact matches win; else
 * a unique prefix match; `matches` counts every candidate so a caller can tell
 * an ambiguous prefix from a miss.
 */
export function resolveByShortCode(
  items: MenuItemRow[],
  input: string,
): { item: MenuItemRow | null; matches: MenuItemRow[] } {
  const query = normalizeShortCode(input)
  if (!query) return { item: null, matches: [] }
  const candidates = items.filter((item) => item.available && matchesShortCode(item, query))
  if (candidates.length === 0) return { item: null, matches: [] }
  const exact = candidates.filter((item) =>
    itemShortCodes(item).some((code) => normalizeShortCode(code) === query),
  )
  const item = exact.length > 0 ? exact[0]! : candidates.length === 1 ? candidates[0]! : null
  return { item, matches: candidates }
}

/** Collapse stretched vowels so "pani" matches "paani". */
export function normalizeFoodText(value: string): string {
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
