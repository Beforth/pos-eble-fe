import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { Download, X } from 'lucide-react'

interface RecipeModificationLogModalProps {
  open: boolean
  recipeName: string | null
  onClose: () => void
  onDownload?: () => void
}

export function RecipeModificationLogModal({
  open,
  recipeName,
  onClose,
  onDownload,
}: RecipeModificationLogModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-card shadow-2xl transition-transform duration-300 ease-out [background-color:var(--color-card)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-ink">
              Recipe Modification Details
              {recipeName ? ` - ${recipeName}` : ''}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink">
              <p>
                <span className="text-muted">Created By:</span> Devesh
                Jobanputra
              </p>
              <p className="inline-flex flex-wrap items-center gap-2">
                <span className="text-muted">Created Date:</span>{' '}
                26-Jul-2026 18:46:02
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  From AI
                </span>
              </p>
              <p>
                <span className="text-muted">Modify Date:</span> 26-Jul-2026
                18:46:02
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 rounded-md p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-primary/10 text-xs font-semibold text-ink">
                <tr>
                  <th className="px-3 py-2.5">Date And Time</th>
                  <th className="px-3 py-2.5">Item Name</th>
                  <th className="px-3 py-2.5">Before Modification</th>
                  <th className="px-3 py-2.5">After Modification</th>
                  <th className="px-3 py-2.5">Uploaded File</th>
                  <th className="px-3 py-2.5">User Details</th>
                </tr>
              </thead>
              <tbody>
                {recipeName ? (
                  <tr className="border-t border-line">
                    <td className="px-3 py-2.5 text-ink">
                      26-Jul-2026 18:46:02
                    </td>
                    <td className="px-3 py-2.5 text-ink">{recipeName}</td>
                    <td className="px-3 py-2.5 text-muted">—</td>
                    <td className="px-3 py-2.5 text-ink">Recipe changed</td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        aria-label="Download uploaded file"
                        onClick={onDownload}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
                      >
                        <Download size={15} />
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      Devesh Jobanputra (IP- 127.0.0.1)
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
