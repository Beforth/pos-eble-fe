export type ToastVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const TOAST_CONTAINER_ID = 'toast-container'
const AUTO_DISMISS_MS = 5000
const EXIT_MS = 300

const ERROR_HINTS =
  /\b(failed|failure|cannot|can't|could not|couldn't|invalid|not found|missing|insufficient|already|error|unable|forbidden|unauthorized|permission|denied|timeout|timed out|expired|incorrect|wrong|try again|went wrong|please|must|not save|not saved|not update|not updated|not delete|not deleted|no match|no results)\b/i

const SUCCESS_HINTS =
  /\b(saved|added|updated|created|deleted|removed|success|successful|done|exported|cleared|copied|generated|enabled|disabled|uploaded|downloaded|activated|deactivated|submitted|closed|started|stopped|restored)\b/i

const VARIANT_ALIASES: Record<string, ToastVariant> = {
  success: 'success',
  error: 'danger',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  neutral: 'neutral',
}

function iconSvg(paths: string): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    paths +
    '</svg>'
  )
}

const ICONS: Record<ToastVariant, string> = {
  success: iconSvg('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  danger: iconSvg(
    '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  ),
  warning: iconSvg(
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  ),
  info: iconSvg(
    '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  ),
  neutral: iconSvg(
    '<path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>',
  ),
}

function classify(message: string): ToastVariant {
  if (ERROR_HINTS.test(message)) return 'danger'
  if (SUCCESS_HINTS.test(message)) return 'success'
  return 'neutral'
}

function resolveVariant(value: string | undefined, fallback: ToastVariant): ToastVariant {
  if (!value) return fallback
  return VARIANT_ALIASES[value.toLowerCase()] ?? fallback
}

function ensureContainer(): HTMLElement | null {
  const existing = document.getElementById(TOAST_CONTAINER_ID)
  if (existing) return existing
  const container = document.createElement('div')
  container.id = TOAST_CONTAINER_ID
  container.className = 'toast-container'
  document.body.appendChild(container)
  return container
}

function dismissToast(toast: HTMLElement): void {
  if (toast.dataset.closed) return
  toast.dataset.closed = '1'
  toast.classList.add('toast--hidden')
  window.setTimeout(() => {
    toast.parentNode?.removeChild(toast)
  }, EXIT_MS)
}

export function showToast(
  titleOrMessage: string,
  subtitleOrType?: string,
  optionalType?: string,
): void {
  const container = ensureContainer()
  if (!container) return

  const title = titleOrMessage || ''
  let subtitle = ''
  let variant: ToastVariant

  if (optionalType !== undefined) {
    subtitle = subtitleOrType ?? ''
    variant = resolveVariant(optionalType, 'info')
  } else if (subtitleOrType !== undefined) {
    const asVariant = VARIANT_ALIASES[subtitleOrType.toLowerCase()]
    if (asVariant) {
      variant = asVariant
    } else {
      subtitle = subtitleOrType
      variant = classify(title)
    }
  } else {
    variant = classify(title)
  }

  const toast = document.createElement('div')
  toast.className = `toast toast--${variant}`
  toast.setAttribute('role', 'status')
  toast.innerHTML =
    '<span class="toast__icon" aria-hidden="true"></span>' +
    '<div class="toast__msg"></div>' +
    '<button type="button" class="toast__dismiss" aria-label="Dismiss">×</button>'

  const iconEl = toast.querySelector<HTMLElement>('.toast__icon')
  if (iconEl) iconEl.innerHTML = ICONS[variant]

  const msgEl = toast.querySelector<HTMLElement>('.toast__msg')
  if (msgEl) {
    const titleEl = document.createElement('strong')
    titleEl.textContent = title
    msgEl.appendChild(titleEl)
    if (subtitle) {
      const subEl = document.createElement('div')
      subEl.textContent = subtitle
      msgEl.appendChild(subEl)
    }
  }

  toast
    .querySelector<HTMLButtonElement>('.toast__dismiss')
    ?.addEventListener('click', () => dismissToast(toast))

  container.appendChild(toast)
  window.setTimeout(() => dismissToast(toast), AUTO_DISMISS_MS)
}

export function showSuccess(message: string): void {
  showToast(message, undefined, 'success')
}

export function showError(message: string): void {
  showToast(message, undefined, 'danger')
}
