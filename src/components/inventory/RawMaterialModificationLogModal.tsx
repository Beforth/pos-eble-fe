import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface RawMaterialModificationLogModalProps {
  open: boolean
  materialName: string | null
  onClose: () => void
}

export function RawMaterialModificationLogModal({
  open,
  materialName,
  onClose,
}: RawMaterialModificationLogModalProps) {
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
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Raw Material Modification Details
            {materialName ? ` - ${materialName}` : ''}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-line bg-page px-5 py-2.5 text-sm text-ink">
          Created By: Devesh Jobanputra (26 Jul 2026 18:45:38)
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-primary/10 text-xs font-semibold text-ink">
                <tr>
                  <th className="px-3 py-2.5">Date And Time</th>
                  <th className="px-3 py-2.5">Raw Material</th>
                  <th className="px-3 py-2.5">Before Modification</th>
                  <th className="px-3 py-2.5">After Modification</th>
                  <th className="px-3 py-2.5">Uploaded File</th>
                  <th className="px-3 py-2.5">User Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-16 text-center text-sm text-muted"
                  >
                    No Record Found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {materialName ? (
            <p className="mt-3 text-xs text-muted">
              Showing modification history for{' '}
              <span className="font-medium text-ink">{materialName}</span>
            </p>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  )
}
