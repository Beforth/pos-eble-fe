/**
 * Settlement rounding:
 * - fraction > 0.5 → next whole number (100.6 → 101)
 * - fraction === 0.5 → keep .5 (100.5 → 100.5)
 * - fraction < 0.5 → previous whole number (100.4 → 100)
 */
export function roundSettlementAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0

  const normalized = Math.round(amount * 100) / 100
  const whole = Math.floor(normalized + 1e-9)
  const fraction = Math.round((normalized - whole) * 100) / 100

  if (fraction > 0.5) return whole + 1
  if (fraction === 0.5) return whole + 0.5
  return whole
}
