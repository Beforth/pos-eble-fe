import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, LayoutGrid, X } from 'lucide-react'
import {
  getTemplate,
  InvoiceDocumentPreview,
  isInvoiceTabId,
  SELECT_LABEL,
  TEMPLATES_BY_TAB,
  type InvoiceTabId,
} from './invoiceTemplateShared'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

export default function InvoiceTemplateFullscreen() {
  const navigate = useNavigate()
  const { tab: tabParam } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const templateId = searchParams.get('template') ?? ''

  const tab: InvoiceTabId = isInvoiceTabId(tabParam ?? '')
    ? (tabParam as InvoiceTabId)
    : 'purchase'

  const templates = TEMPLATES_BY_TAB[tab]
  const currentIndex = Math.max(
    0,
    templates.findIndex((item) => item.id === templateId),
  )
  const template = useMemo(
    () => templates[currentIndex] ?? getTemplate(tab, `${tab}-standard`),
    [templates, currentIndex, tab],
  )

  function goBack(extra?: { selectedId?: string }) {
    navigate('/inventory/invoice-templates', {
      state: {
        tab,
        ...(extra?.selectedId ? { selectedId: extra.selectedId } : {}),
      },
    })
  }

  function showTemplateAt(index: number) {
    const next = templates[index]
    if (!next) return
    setSearchParams({ template: next.id }, { replace: true })
  }

  function showPrevious() {
    showTemplateAt((currentIndex - 1 + templates.length) % templates.length)
  }

  function showNext() {
    showTemplateAt((currentIndex + 1) % templates.length)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') showPrevious()
      if (event.key === 'ArrowRight') showNext()
      if (event.key === 'Escape') goBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (!template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page px-4">
        <p className="text-sm font-medium text-ink">Template not found</p>
        <OutlineButton onClick={() => goBack()}>Back</OutlineButton>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-line bg-card px-4 py-3">
        <button
          type="button"
          onClick={() => goBack()}
          className="inline-flex size-8 items-center justify-center rounded-md border border-line text-ink hover:bg-page"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-ink">
          Preview - {template.name}
        </h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous template"
            onClick={showPrevious}
            className="inline-flex size-8 items-center justify-center rounded-md border border-line text-ink hover:bg-page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-medium text-muted">
            {currentIndex + 1} / {templates.length}
          </span>
          <button
            type="button"
            aria-label="Next template"
            onClick={showNext}
            className="inline-flex size-8 items-center justify-center rounded-md border border-line text-ink hover:bg-page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <OutlineButton variant="gray" onClick={() => goBack()}>
          <LayoutGrid size={14} />
          Choose Another
        </OutlineButton>
        <button
          type="button"
          onClick={() => goBack()}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </header>

      <div className="border-b border-line bg-card px-4 py-2">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
          {templates.map((item, index) => {
            const active = item.id === template.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => showTemplateAt(index)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-line bg-card text-ink hover:bg-page'
                }`}
              >
                {item.name}
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-8">
        <InvoiceDocumentPreview tab={tab} templateName={template.name} />
      </main>

      <footer className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 border-t border-line bg-card px-4 py-3">
        <OutlineButton variant="gray" onClick={() => goBack()}>
          <LayoutGrid size={14} />
          Choose Another Template
        </OutlineButton>
        <div className="flex flex-wrap gap-2">
          <OutlineButton variant="gray" onClick={() => goBack()}>
            Close
          </OutlineButton>
          <PrimaryButton onClick={() => goBack({ selectedId: template.id })}>
            {SELECT_LABEL[tab]}
          </PrimaryButton>
        </div>
      </footer>
    </div>
  )
}
