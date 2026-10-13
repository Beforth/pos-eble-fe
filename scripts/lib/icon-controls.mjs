/**
 * Shared JSX detection helpers for icon-only control audits/codemods.
 *
 * A control is "icon-only" when it renders a component child (an icon) and has
 * no visible text of its own. Such a control needs BOTH:
 *   - aria-label  (accessible name; data-tooltip alone is not announced)
 *   - data-tooltip (picked up by the delegated manager in src/utils/tooltip.ts)
 *
 * Note for TypeScript 6.x: JsxElement exposes the tag on `openingElement`;
 * JsxSelfClosingElement exposes it directly. Use jsxTag() rather than reaching
 * for `.tagName` on a JsxElement.
 */
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

export const ELEMENT_TAGS = new Set(['button', 'a', 'Link', 'NavLink'])

/** Attribute names that provide an accessible name on a control. */
export const LABEL_PROPS = new Set([
  'aria-label',
  'label',
  'ariaLabel',
  'tooltip',
  'hint',
  'description',
  'title',
])

export function walkTsxFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walkTsxFiles(full))
    else if (/\.tsx$/.test(entry)) out.push(full)
  }
  return out
}

export function jsxTag(node) {
  if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText()
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText()
  return null
}

export function jsxChildren(node) {
  return ts.isJsxElement(node) ? node.children : []
}

export function hasSpread(openingElement) {
  return openingElement.attributes.properties.some(
    (p) => p.kind === ts.SyntaxKind.SpreadElement,
  )
}

export function attrName(prop) {
  if (!ts.isJsxAttribute(prop)) return null
  const name = prop.name
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
  if (ts.isJsxNamespacedName(name)) return `${name.namespace.text}:${name.name.text}`
  return null
}

export function collectAttrs(openingElement) {
  const names = []
  for (const prop of openingElement.attributes.properties) {
    const name = attrName(prop)
    if (name) names.push(name)
  }
  return names
}

export function findAttr(openingElement, wanted) {
  for (const prop of openingElement.attributes.properties) {
    if (attrName(prop) === wanted) return prop
  }
  return null
}

export function hasTextContent(children) {
  for (const child of children) {
    if (ts.isJsxText(child)) {
      if (child.text.trim()) return true
      continue
    }
    if (ts.isJsxExpression(child)) {
      const expr = child.expression
      if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
        if (expr.text.trim()) return true
      }
      if (ts.isTemplateExpression(expr) && ts.isStringLiteral(expr.head)) {
        if (expr.head.text.trim()) return true
      }
      if (
        ts.isJsxElement(expr) ||
        ts.isJsxFragment(expr) ||
        ts.isJsxSelfClosingElement(expr)
      ) {
        if (hasTextContent(jsxChildren(expr))) return true
      }
      // Ternary / string concatenation: assume it can render text.
      if (ts.isConditionalExpression(expr) || ts.isBinaryExpression(expr)) return true
      // A bare identifier or member access (e.g. {label}, {item.name}) almost
      // always renders visible text. Assume text: a false positive would demand
      // a tooltip on an already-labelled control, which is worse than missing
      // a genuinely icon-only one.
      if (
        ts.isIdentifier(expr) ||
        ts.isPropertyAccessExpression(expr) ||
        ts.isElementAccessExpression(expr) ||
        ts.isCallExpression(expr) ||
        ts.isNonNullExpression(expr)
      ) {
        return true
      }
      continue
    }
    if (ts.isJsxElement(child) || ts.isJsxFragment(child)) {
      if (hasTextContent(jsxChildren(child))) return true
    }
  }
  return false
}

export function containsComponentChild(children) {
  for (const child of children) {
    const tag = jsxTag(child)
    if (tag && /^[A-Z]/.test(tag)) return true
    if (ts.isJsxElement(child) || ts.isJsxFragment(child)) {
      if (containsComponentChild(jsxChildren(child))) return true
    }
    if (ts.isJsxExpression(child) && child.expression) {
      const expr = child.expression
      const innerTag = jsxTag(expr)
      if (innerTag && /^[A-Z]/.test(innerTag)) return true
      if (ts.isJsxFragment(expr) && containsComponentChild(jsxChildren(expr))) return true
    }
  }
  return false
}

export function iconChildNames(children) {
  const names = []
  for (const child of children) {
    const tag = jsxTag(child)
    if (tag && /^[A-Z]/.test(tag)) names.push(tag)
  }
  return names
}

/**
 * Collects every icon-only button/a/Link/NavLink in a parsed source file.
 * Returns nodes with the attribute context the callers need.
 */
export function findIconOnlyControls(sf) {
  const found = []

  const visit = (node) => {
    const tag = jsxTag(node)
    if (ts.isJsxElement(node) && tag && ELEMENT_TAGS.has(tag)) {
      const children = node.children
      if (containsComponentChild(children) && !hasTextContent(children)) {
        const opening = node.openingElement
        found.push({
          node,
          tag,
          opening,
          spread: hasSpread(opening),
          hasTooltip:
            hasSpread(opening) ||
            opening.attributes.properties.some((p) => attrName(p) === 'data-tooltip') ||
            isInsideTooltipWrapper(node),
          ariaLabelAttr: findAttr(opening, 'aria-label'),
          labelProp: findAttr(opening, 'label') ?? findAttr(opening, 'title'),
          icons: iconChildNames(children),
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  return found
}

export function lineOf(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
}

/**
 * A control wrapped in <TooltipWrapper label="..."> gets its tooltip from the
 * wrapper, because a `disabled` control emits no mouse events and so cannot
 * host data-tooltip itself. src/components/common/TooltipWrapper.tsx
 */
export function isInsideTooltipWrapper(node) {
  let cur = node.parent
  let depth = 0
  while (cur && depth < 4) {
    const tag = jsxTag(cur)
    if (tag === 'TooltipWrapper') return true
    // Only keep climbing while we are still inside JSX children.
    if (ts.isJsxElement(cur) || ts.isJsxFragment(cur) || ts.isJsxExpression(cur)) {
      cur = cur.parent
      depth++
      continue
    }
    return false
  }
  return false
}
