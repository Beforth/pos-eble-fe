import { useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import {
  INVOICE_TABS,
  InvoiceDocumentPreview,
  SELECT_LABEL,
  TEMPLATES_BY_TAB,
  type InvoiceTabId,
  type InvoiceTemplate,
} from './invoiceTemplateShared'

function ThumbnailPreview({ variant }: { variant: number }) {
  const dense = variant % 2 === 1
  const withQr = variant >= 4
  const wideHeader = variant % 3 === 0

  return (
    <div className="flex h-full flex-col bg-card p-3 text-[8px] leading-tight text-ink sm:text-[9px]">
      <div
        className={`mb-2 border-b border-line pb-2 ${
          wideHeader ? 'text-center' : 'text-left'
        }`}
      >
        <p className="text-[10px] font-bold sm:text-[11px]">Restaurant Name</p>
        <p className="text-muted">GSTIN · Phone</p>
      </div>
      <div className="mb-2 grid grid-cols-2 gap-1 text-muted">
        <span>Inv No.</span>
        <span className="text-right">Date</span>
      </div>
      <div className="mb-2 border border-line">
        <div className="grid grid-cols-4 bg-page px-1.5 py-1 font-semibold">
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amt</span>
        </div>
        {Array.from({ length: dense ? 7 : 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-4 border-t border-line px-1.5 py-1 text-muted"
          >
            <span>Item {index + 1}</span>
            <span className="text-right">1</span>
            <span className="text-right">100</span>
            <span className="text-right">100</span>
          </div>
        ))}
      </div>
      <div className="mt-auto space-y-1 text-muted">
        <div className="flex justify-between font-semibold text-ink">
          <span>Grand Total</span>
          <span>420.00</span>
        </div>
        {withQr ? (
          <div className="mt-2 flex justify-end">
            <span className="inline-flex size-10 items-center justify-center border border-line bg-page text-[7px] text-muted">
              QR
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function TemplatePreviewModal({
  open,
  tab,
  templates,
  index,
  onIndexChange,
  onClose,
  onSelect,
  onFullScreen,
}: {
  open: boolean
  tab: InvoiceTabId
  templates: InvoiceTemplate[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
  onSelect: () => void
  onFullScreen: () => void
}) {
  const titleId = useId()
  const template = templates[index]

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') {
        onIndexChange((index - 1 + templates.length) % templates.length)
      }
      if (event.key === 'ArrowRight') {
        onIndexChange((index + 1) % templates.length)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose, onIndexChange, index, templates.length])

  if (!open || !template) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-2xl [background-color:var(--color-card)]"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <h2
            id={titleId}
            className="min-w-0 flex-1 truncate text-base font-semibold text-ink"
          >
            Preview - {template.name}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous template"
              onClick={() =>
                onIndexChange(
                  (index - 1 + templates.length) % templates.length,
                )
              }
              className="inline-flex size-8 items-center justify-center rounded-md border border-line text-ink hover:bg-page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Next template"
              onClick={() => onIndexChange((index + 1) % templates.length)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-line text-ink hover:bg-page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={onFullScreen}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-sm font-medium text-ink hover:bg-page"
          >
            <Maximize2 size={14} />
            View Full Screen
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-page px-3 py-4 sm:px-6">
          <InvoiceDocumentPreview tab={tab} templateName={template.name} />
        </div>

        <div className="flex justify-end border-t border-line px-4 py-3">
          <PrimaryButton onClick={onSelect}>{SELECT_LABEL[tab]}</PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function InvoiceTemplates() {
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<InvoiceTabId>('purchase')
  const [selectedByTab, setSelectedByTab] = useState<
    Record<InvoiceTabId, string>
  >({
    purchase: 'purchase-standard',
    'purchase-order': 'po-standard',
    sales: 'sales-standard',
    transfer: 'transfer-standard',
  })
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state as
      | { tab?: InvoiceTabId; selectedId?: string }
      | null
    if (!state?.tab && !state?.selectedId) return
    if (state.tab) setActiveTab(state.tab)
    if (state.selectedId && state.tab) {
      setSelectedByTab((prev) => ({
        ...prev,
        [state.tab!]: state.selectedId!,
      }))
      setToast('Template selected')
      window.setTimeout(() => setToast(null), 2000)
    }
    navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  const templates = TEMPLATES_BY_TAB[activeTab]
  const selectedId = selectedByTab[activeTab]

  const selectedName = useMemo(
    () => templates.find((t) => t.id === selectedId)?.name ?? 'Template',
    [templates, selectedId],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2000)
  }

  function confirmSelect() {
    if (previewIndex == null) return
    const template = templates[previewIndex]
    if (!template) return
    setSelectedByTab((prev) => ({ ...prev, [activeTab]: template.id }))
    setPreviewIndex(null)
    showToast(`${template.name} selected`)
  }

  function openFullScreen() {
    if (previewIndex == null) return
    const template = templates[previewIndex]
    if (!template) return
    setPreviewIndex(null)
    navigate(
      `/inventory/invoice-templates/fullscreen/${activeTab}?template=${encodeURIComponent(template.id)}`,
    )
  }

  return (
    <InventoryPageShell activeItem="invoice-templates">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Invoice Management</h1>
      </div>

      <div className="mb-5 border-b border-line">
        <div className="flex flex-wrap gap-1">
          {INVOICE_TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  setPreviewIndex(null)
                }}
                className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pb-2">
        {templates.map((template, index) => {
          const selected = template.id === selectedId
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setPreviewIndex(index)}
              className="group w-[200px] text-left sm:w-[220px]"
            >
              <div
                className={`relative h-[300px] overflow-hidden rounded-lg border bg-card transition-shadow sm:h-[320px] ${
                  selected
                    ? 'border-success shadow-[0_0_0_1px_var(--color-success)]'
                    : 'border-line hover:border-muted'
                }`}
              >
                {selected ? (
                  <span className="absolute right-2 top-2 z-10 inline-flex size-6 items-center justify-center rounded-full bg-success text-white shadow-sm">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                ) : null}
                {selected ? (
                  <span className="absolute inset-x-0 top-0 z-10 bg-ink/75 px-2 py-1 text-center text-[11px] font-medium text-white">
                    {selectedName}
                  </span>
                ) : null}
                <ThumbnailPreview variant={template.variant} />
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-ink">{template.name}</p>
                {selected ? (
                  <span className="mt-1.5 inline-flex rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                    Selected
                  </span>
                ) : (
                  <span className="mt-1.5 inline-block h-[22px]" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      <TemplatePreviewModal
        open={previewIndex != null}
        tab={activeTab}
        templates={templates}
        index={previewIndex ?? 0}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewIndex(null)}
        onSelect={confirmSelect}
        onFullScreen={openFullScreen}
      />
    </InventoryPageShell>
  )
}
