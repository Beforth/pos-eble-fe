#!/usr/bin/env node
/**
 * Audits icon-only interactive controls for missing tooltips / accessible names.
 *
 * A control is "icon-only" when it renders a component child (an icon) and has
 * no visible text of its own. Such a control must carry BOTH:
 *   - aria-label  (accessible name; data-tooltip alone is not announced)
 *   - data-tooltip (the delegated manager in src/utils/tooltip.ts)
 *
 * Detection lives in scripts/lib/icon-controls.mjs so this audit and the
 * migration codemod can never drift apart.
 *
 * Exit code 1 when findings remain, so it can gate CI.
 *
 * Usage: npm run audit:tooltips [-- --json|--stats]
 */
import { readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { findIconOnlyControls, lineOf, walkTsxFiles } from './lib/icon-controls.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'src')

const findings = []
let controls = 0
let iconOnly = 0

for (const file of walkTsxFiles(SRC)) {
  const source = readFileSync(file, 'utf8')
  if (source.includes('@ts-nocheck')) continue

  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  for (const c of findIconOnlyControls(sf)) {
    controls++
    iconOnly++
    const hasLabel = c.spread || !!c.ariaLabelAttr || !!c.labelProp
    const hasTooltip = c.spread || c.hasTooltip
    if (hasLabel && hasTooltip) continue

    findings.push({
      file: relative(ROOT, file).split(sep).join('/'),
      line: lineOf(sf, c.node),
      tag: c.tag,
      icons: c.icons,
      hasLabel,
      hasTooltip,
      spread: c.spread,
      missing: [!hasLabel && 'aria-label', !hasTooltip && 'data-tooltip'].filter(Boolean),
    })
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(findings, null, 2))
} else if (process.argv.includes('--stats')) {
  console.log(`icon-only controls: ${iconOnly}`)
  console.log(`findings: ${findings.length}`)
} else if (!findings.length) {
  console.log(
    'audit-icon-tooltips: OK — every icon-only control is labelled and has data-tooltip.',
  )
} else {
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
  const byFile = new Map()
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, [])
    byFile.get(f.file).push(f)
  }
  console.log(
    `audit-icon-tooltips: ${findings.length} icon-only control(s) need attention in ${byFile.size} file(s)\n`,
  )
  for (const [file, list] of byFile) {
    console.log(`  ${file}`)
    for (const f of list) {
      const tag = f.tag.toLowerCase()
      const icons = f.icons.length ? `<${f.icons.join('>, <')}>` : ''
      console.log(
        `    L${String(f.line).padStart(4)}  <${tag}> ${icons}`.padEnd(74) +
          ` missing: ${f.missing.join(' + ')}${f.spread ? ' (has spread props)' : ''}`,
      )
    }
  }
  console.log('\nFix: add aria-label + data-tooltip, or reuse a wrapper that does.')
}

process.exit(findings.length ? 1 : 0)
