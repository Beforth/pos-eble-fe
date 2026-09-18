/** Trigger a browser download for a Blob or text payload. */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadText(
  content: string,
  filename: string,
  mime = 'text/plain;charset=utf-8',
) {
  downloadBlob(new Blob([content], { type: mime }), filename)
}

export function downloadCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  filename: string,
) {
  const escape = (value: string | number | null | undefined) => {
    const text = value == null ? '' : String(value)
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }
  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ]
  downloadText(lines.join('\n'), filename, 'text/csv;charset=utf-8;')
}
