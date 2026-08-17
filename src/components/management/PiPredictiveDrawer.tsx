import { useEffect, useState } from 'react'
import { Search, Wand2, X } from 'lucide-react'

interface PiPredictiveDrawerProps {
  open: boolean
  onClose: () => void
}

export function PiPredictiveDrawer({ open, onClose }: PiPredictiveDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Slide-in Drawer */}
      <aside
        role="dialog"
        aria-label="Predictive Revenue Leakage"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-6">
          <h2 className="text-base font-bold text-ink">
            Predictive Revenue Leakage
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Callout Banner */}
          <div className="flex items-start gap-3.5 rounded-xl bg-sky-50/70 p-4 text-xs font-medium text-ink border border-sky-100">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0284c7] text-white shadow-xs">
              <Wand2 size={16} />
            </div>
            <p className="leading-relaxed">
              Pi can help predict the revenue leakage for the item turned off on
              online platforms for the last 30 days. The Pi gets updated every
              other day. Select an item to get the predicted loss
            </p>
          </div>

          {/* Search Item */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">
              Search Item
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder=""
              className="h-11 w-full rounded-xl border border-line bg-card px-3.5 text-sm text-ink outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Centered Graphic & Text State */}
          <div className="flex min-h-[360px] flex-col items-center justify-center pt-8 text-center">
            {/* Search Cards Graphic Illustration */}
            <div className="relative mb-8 flex items-center justify-center">
              <div className="flex size-40 items-center justify-center rounded-full bg-[#f1f5f9]/70">
                <div className="relative space-y-3">
                  {/* Top floating search card */}
                  <div className="flex items-center gap-2 rounded-2xl border border-line bg-card px-4 py-2.5 shadow-md">
                    <span className="flex size-7 items-center justify-center rounded-full bg-ink/10 text-ink">
                      <Search size={15} />
                    </span>
                    <div className="space-y-1">
                      <div className="h-2 w-14 rounded-full bg-ink/75" />
                      <div className="h-1.5 w-9 rounded-full bg-muted/40" />
                    </div>
                  </div>

                  {/* Bottom offset search card */}
                  <div className="-ml-6 flex items-center gap-2 rounded-2xl border border-line bg-card px-4 py-2.5 shadow-md">
                    <span className="flex size-7 items-center justify-center rounded-full bg-ink/10 text-ink">
                      <Search size={15} />
                    </span>
                    <div className="space-y-1">
                      <div className="h-2 w-12 rounded-full bg-ink/75" />
                      <div className="h-1.5 w-8 rounded-full bg-muted/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-ink max-w-sm">
              Select an Item to get the predicted revenue leakage
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted max-w-sm px-4">
              Select an item from the dropdown where you can get the predicted
              revenue leakage for the item being turned off in online platforms
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
