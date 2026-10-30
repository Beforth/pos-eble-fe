/**
 * Code 39 vector SVG barcode generator.
 * Encodes alphanumeric strings into genuine, standard Code 39 barcode bars.
 * Renders as pure vector SVG `<rect>` elements so it NEVER gets stripped
 * by browser print dialogs or "Save as PDF" background graphics settings.
 */

/** Characters a Code 39 barcode can store (the start/stop `*` is added automatically). */
const CODE39_CHARSET = /^[0-9A-Z\-. $/+%]+$/

/** Trim and upper-case a value so the printed text matches the encoded bars. */
export function normalizeCode39(value: string): string {
  return value.trim().toUpperCase()
}

/** True when the value can be encoded without silently dropping characters. */
export function isValidCode39(value: string): boolean {
  const normalized = normalizeCode39(value)
  return normalized.length > 0 && CODE39_CHARSET.test(normalized)
}

export const CODE39_HINT = 'Use only A–Z, 0–9, space and - . $ / + %'

const CODE39_PATTERNS: Record<string, string> = {
  '0': '000110100',
  '1': '100100001',
  '2': '001100001',
  '3': '101100000',
  '4': '000110001',
  '5': '100110000',
  '6': '001110000',
  '7': '000100101',
  '8': '100100100',
  '9': '001100100',
  A: '100001001',
  B: '001001001',
  C: '101001000',
  D: '000011001',
  E: '100011000',
  F: '001011000',
  G: '000001101',
  H: '100001100',
  I: '001001100',
  J: '000011100',
  K: '100000011',
  L: '001000011',
  M: '101000010',
  N: '000010011',
  O: '100010010',
  P: '001010010',
  Q: '000000111',
  R: '100000110',
  S: '001000110',
  T: '000010110',
  U: '110000001',
  V: '011000001',
  W: '111000000',
  X: '010010001',
  Y: '110010000',
  Z: '011010000',
  '-': '010000101',
  '.': '110000100',
  ' ': '011000100',
  $: '010101000',
  '/': '010100010',
  '+': '010001010',
  '%': '000101010',
  '*': '010010100', // Start / Stop character
}

/**
 * Generates an SVG string containing precise vector barcode lines for the given text.
 */
export function generateBarcodeSvgString(
  code: string,
  color = '#000000',
  height = 36,
): string {
  const cleanCode = (code || '0000').toUpperCase().replace(/[^0-9A-Z\-.$/+% ]/g, '') || '0000'
  const fullText = `*${cleanCode}*`

  const narrowWidth = 1.3
  const wideWidth = 3.2
  const gapWidth = 1.5

  let currentX = 4
  const rects: string[] = []

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i]
    const pattern = CODE39_PATTERNS[char] ?? CODE39_PATTERNS['0']

    for (let p = 0; p < pattern.length; p++) {
      const isBar = p % 2 === 0
      const isWide = pattern[p] === '1'
      const width = isWide ? wideWidth : narrowWidth

      if (isBar) {
        rects.push(
          `<rect x="${currentX.toFixed(1)}" y="1" width="${width.toFixed(1)}" height="${height}" fill="${color}" shape-rendering="crispEdges" />`,
        )
      }
      currentX += width
    }

    // Inter-character gap (space)
    if (i < fullText.length - 1) {
      currentX += gapWidth
    }
  }

  currentX += 4
  const totalWidth = Math.ceil(currentX)

  return `
    <svg viewBox="0 0 ${totalWidth} ${height + 2}" class="barcode-svg" style="width: 100%; max-width: ${Math.min(220, totalWidth * 1.4)}px; height: ${height}px; display: block; margin: 0 auto;" aria-label="Barcode: ${cleanCode}">
      ${rects.join('')}
    </svg>
  `
}
