import { toast } from 'react-toastify'

const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 2200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

const ERROR_HINTS =
  /\b(failed|failure|cannot|can't|could not|couldn't|invalid|not found|missing|insufficient|already|error|unable|forbidden|unauthorized|timeout|timed out|expired|incorrect|wrong|try again|went wrong|please|must|not save|not saved|not update|not updated|not delete|not deleted|no match|no results|invalid)\b/i

const SUCCESS_HINTS =
  /\b(saved|added|updated|created|deleted|removed|success|successful|done|exported|cleared|copied|generated|enabled|disabled|uploaded|downloaded|activated|deactivated|submitted|closed|started|stopped|restored)\b/i

type ToastKind = 'success' | 'error' | 'neutral'

function classify(message: string): ToastKind {
  if (ERROR_HINTS.test(message)) return 'error'
  if (SUCCESS_HINTS.test(message)) return 'success'
  return 'neutral'
}

export function showToast(message: string) {
  const kind = classify(message)
  if (kind === 'success') toast.success(message, TOAST_OPTIONS)
  else if (kind === 'error') toast.error(message, TOAST_OPTIONS)
  else toast(message, TOAST_OPTIONS)
}

export function showSuccess(message: string) {
  toast.success(message, TOAST_OPTIONS)
}

export function showError(message: string) {
  toast.error(message, TOAST_OPTIONS)
}