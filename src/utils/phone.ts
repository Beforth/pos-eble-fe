/** Reduce typed or pasted text to a 10-digit Indian mobile number (drops a leading 91). */
export function normalizeMobileDigits(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2)
  }
  return digits.slice(0, 10)
}

export function isValidMobile(value: string): boolean {
  return normalizeMobileDigits(value).length === 10
}
