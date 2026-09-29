const COARSE_POINTER_QUERY = '(pointer: coarse)'
const EDGE_MARGIN = 10
const GAP = 10
const HIDE_DEBOUNCE_MS = 50

class TooltipManager {
  private tooltip: HTMLDivElement
  private activeTarget: HTMLElement | null = null
  private hideTimeout: number | null = null

  constructor() {
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'custom-tooltip'
    document.body.appendChild(this.tooltip)
    this.init()
  }

  private isDisabled(): boolean {
    return window.matchMedia(COARSE_POINTER_QUERY).matches
  }

  private init(): void {
    document.addEventListener('mouseover', (e) => {
      if (this.isDisabled()) return
      const target = this.resolveTarget(e.target)
      if (!target) return
      if (this.hideTimeout !== null) {
        window.clearTimeout(this.hideTimeout)
        this.hideTimeout = null
      }
      if (target !== this.activeTarget) {
        this.activeTarget = target
        this.show(target)
      }
    })

    document.addEventListener('mouseout', (e) => {
      if (this.isDisabled()) return
      const target = this.resolveTarget(e.target)
      if (!target || target !== this.activeTarget) return
      const related = e.relatedTarget
      if (related instanceof Node && target.contains(related)) return
      this.hideTimeout = window.setTimeout(() => {
        this.activeTarget = null
        this.hide()
      }, HIDE_DEBOUNCE_MS)
    })

    window.addEventListener(
      'scroll',
      () => {
        if (this.activeTarget) {
          this.activeTarget = null
          this.hide()
        }
      },
      { passive: true },
    )

    document.addEventListener('click', () => {
      if (this.activeTarget) {
        this.activeTarget = null
        this.hide()
      }
    })
  }

  private resolveTarget(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) return null
    if (typeof target.closest !== 'function') return null
    return target.closest<HTMLElement>('[data-tooltip]')
  }

  private show(target: HTMLElement): void {
    const text = target.getAttribute('data-tooltip')
    if (!text) return
    this.tooltip.textContent = text
    this.tooltip.classList.add('is-visible')

    const targetRect = target.getBoundingClientRect()
    const tooltipRect = this.tooltip.getBoundingClientRect()

    let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
    let top = targetRect.top - tooltipRect.height - GAP

    if (left < EDGE_MARGIN) left = EDGE_MARGIN
    if (left + tooltipRect.width > window.innerWidth - EDGE_MARGIN) {
      left = window.innerWidth - tooltipRect.width - EDGE_MARGIN
    }
    if (top < EDGE_MARGIN) top = targetRect.bottom + GAP

    this.tooltip.style.left = `${left}px`
    this.tooltip.style.top = `${top}px`
  }

  private hide(): void {
    if (this.hideTimeout !== null) {
      window.clearTimeout(this.hideTimeout)
      this.hideTimeout = null
    }
    this.tooltip.classList.remove('is-visible')
  }
}

let instance: TooltipManager | null = null

export function initTooltips(): TooltipManager {
  if (!instance) instance = new TooltipManager()
  return instance
}
