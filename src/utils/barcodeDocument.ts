import type { BarcodeLabelConfig, ConfigField, AlignOption } from './barcodeConfig'
import { generateBarcodeSvgString } from './barcodeSvg'
import {
  barcodeHeightPx,
  escapeHtml,
  fieldFontPx,
  getLabelGeometry,
  type PrinterSettings,
} from './barcodeLabels'

export interface LabelRow {
  rawMaterial: string
  prints: number
  barcode: string
}

interface BuildArgs {
  rows: LabelRow[]
  settings: PrinterSettings
  config: BarcodeLabelConfig
  copies: number
  /** true = open the print dialog straight away; false = preview with a Print button. */
  autoPrint: boolean
}

function alignClass(align: AlignOption): string {
  if (align === 'Left') return 'text-left'
  if (align === 'Right') return 'text-right'
  return 'text-center'
}

/**
 * Builds the standalone HTML document for the print window. Every size is in
 * mm, so the preview on screen and the printed output match.
 */
export function buildBarcodeDocument({
  rows,
  settings,
  config,
  copies,
  autoPrint,
}: BuildArgs): string {
  const { widthMm, heightMm, sheet } = getLabelGeometry(settings.paperSize)
  const { backgroundColor, textColor, alignment, fields } = config
  const topFields = fields.filter((field) => field.position === 'Top')
  const bottomFields = fields.filter((field) => field.position === 'Bottom')
  const barcodeHeight = barcodeHeightPx(heightMm)
  const totalLabels = rows.reduce((sum, row) => sum + row.prints * copies, 0)

  function renderFields(list: ConfigField[], row: LabelRow): string {
    return list
      .map((field) => {
        if (field.field === 'Barcode') {
          return `<div class="field-barcode">${generateBarcodeSvgString(row.barcode, textColor, barcodeHeight)}</div>`
        }

        let text: string
        let monospace = false
        if (field.field === 'Raw Material Name') {
          text = row.rawMaterial
        } else if (field.field === 'Barcode Number') {
          text = row.barcode
          monospace = true
        } else {
          text = field.label || 'Custom Label'
        }

        const weight = field.fontWeight === 'Bold' ? 'font-bold' : 'font-normal'
        const style =
          `font-size:${fieldFontPx(field.fontSize)}px;color:${textColor};` +
          (monospace ? 'font-family:monospace;letter-spacing:0.5px;' : '')
        return `<div class="field-item ${alignClass(field.align)} ${weight}" style="${style}">${escapeHtml(text)}</div>`
      })
      .join('')
  }

  function renderLabel(row: LabelRow): string {
    const bottom =
      bottomFields.length > 0
        ? `<div class="fields-bottom">${renderFields(bottomFields, row)}</div>`
        : ''
    return `<div class="label"><div class="fields-top">${renderFields(topFields, row)}</div>${bottom}</div>`
  }

  const labels: string[] = []
  for (const row of rows) {
    const html = renderLabel(row)
    for (let i = 0; i < row.prints * copies; i += 1) labels.push(html)
  }

  let body: string
  let pageRule: string
  let layoutCss: string
  if (sheet) {
    const perPage = sheet.columns * sheet.rows
    const pages: string[] = []
    for (let i = 0; i < labels.length; i += perPage) {
      pages.push(`<section class="sheet">${labels.slice(i, i + perPage).join('')}</section>`)
    }
    body = pages.join('')
    pageRule = `size: ${sheet.pageSize}; margin: 0;`
    layoutCss = `
      .sheet {
        width: ${sheet.columns * widthMm}mm;
        height: ${sheet.rows * heightMm}mm;
        display: grid;
        grid-template-columns: repeat(${sheet.columns}, ${widthMm}mm);
        grid-template-rows: repeat(${sheet.rows}, ${heightMm}mm);
        margin: 0 auto 16px;
      }`
  } else {
    body = `<section class="strip">${labels.join('')}</section>`
    pageRule = `size: ${widthMm}mm ${heightMm}mm; margin: 0;`
    layoutCss = `
      .strip { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }`
  }

  const title = autoPrint ? 'Barcode Labels Print Preview' : 'Barcode Label Preview'
  const toolbar = `
    <div class="toolbar">
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p>Target Printer: ${escapeHtml(settings.printerName || 'Default')} | Size: ${escapeHtml(settings.paperSize)} | Total Labels: ${totalLabels}</p>
      </div>
      ${autoPrint ? '' : '<button class="primary" type="button" onclick="window.print()">Print</button>'}
    </div>`

  const script = autoPrint
    ? '<script>window.onload = function () { window.print(); };</script>'
    : ''

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(`Barcode Labels (${settings.paperSize})`)}</title>
    <style>
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        margin: 0;
        padding: 16px;
        background: #f4f4f5;
        color: #09090b;
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 16px;
      }
      .toolbar h1 { font-size: 18px; margin: 0 0 4px; }
      .toolbar p { font-size: 13px; color: #71717a; margin: 0; }
      .toolbar button {
        height: 36px;
        padding: 0 14px;
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        background: #fff;
        font-weight: 600;
        cursor: pointer;
      }
      .toolbar button.primary { background: #18181b; color: #fff; border-color: #18181b; }
      .label {
        width: ${widthMm}mm;
        height: ${heightMm}mm;
        background-color: ${backgroundColor};
        color: ${textColor};
        border: 1px dashed #a1a1aa;
        padding: 1.5mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .fields-top, .fields-bottom {
        width: 100%;
        display: flex;
        flex-direction: ${alignment === 'Row' ? 'row' : 'column'};
        gap: 2px;
        align-items: stretch;
      }
      .field-item {
        width: 100%;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .field-barcode { width: 100%; display: flex; justify-content: center; margin: 2px 0; }
      .barcode-svg { width: 100%; display: block; }
      .text-left { text-align: left; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-bold { font-weight: 700; }
      .font-normal { font-weight: 400; }
      ${layoutCss}
      @media print {
        @page { ${pageRule} }
        body { background: #fff; padding: 0; }
        .toolbar { display: none; }
        .label { border: none; }
        .strip { display: block; }
        .strip .label { page-break-after: always; break-after: page; }
        .strip .label:last-child { page-break-after: auto; break-after: auto; }
        .sheet { margin: 0; page-break-after: always; break-after: page; }
        .sheet:last-child { page-break-after: auto; break-after: auto; }
      }
    </style>
  </head>
  <body>
    ${toolbar}
    ${body}
    ${script}
  </body>
</html>`
}
