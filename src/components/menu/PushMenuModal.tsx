import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  Send,
  X,
} from 'lucide-react'
import { ConfirmDialog } from '../common/ConfirmDialog'
import {
  getMenuPushApi,
  listMenuPushesApi,
  previewMenuPushApi,
  pushMenuApi,
  trackerMessages,
  type MenuPushPreview,
  type MenuPushRecord,
  type PushPlatform,
} from '../../services/menuPushService'
import { showToast } from '../../utils/toast'

const PLATFORM_LABEL: Record<PushPlatform, string> = {
  zomato: 'Zomato',
  swiggy: 'Swiggy',
}

interface PushMenuModalProps {
  open: boolean
  platform: PushPlatform
  outletId: string
  onClose: () => void
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function Stat({ label, value, tone = 'ink' }: { label: string; value: number; tone?: 'ink' | 'warn' }) {
  return (
    <div className="rounded-lg border border-line bg-page px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-0.5 text-xl font-bold tabular-nums ${
          tone === 'warn' && value > 0 ? 'text-accent' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function IssueList({
  title,
  issues,
}: {
  title: string
  issues: MenuPushPreview['issues']
}) {
  const [open, setOpen] = useState(false)
  if (issues.length === 0) return null
  return (
    <div className="rounded-lg border border-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-ink hover:bg-page"
      >
        {title} ({issues.length})
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <ul className="max-h-56 divide-y divide-line overflow-y-auto border-t border-line text-sm">
          {issues.map((issue, index) => (
            <li key={`${issue.id ?? 'menu'}-${index}`} className="px-3 py-2">
              {issue.name && (
                <p className="font-medium text-ink">{issue.name}</p>
              )}
              <p className="text-muted">{issue.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PushMenuModal({
  open,
  platform,
  outletId,
  onClose,
}: PushMenuModalProps) {
  const label = PLATFORM_LABEL[platform]
  const [preview, setPreview] = useState<MenuPushPreview | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [loading, setLoading] = useState(false)
  const [last, setLast] = useState<MenuPushRecord | null>(null)
  const [sent, setSent] = useState<MenuPushRecord | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [checking, setChecking] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setPreviewError('')
    Promise.all([
      previewMenuPushApi(outletId, platform),
      listMenuPushesApi(outletId).catch(() => [] as MenuPushRecord[]),
    ])
      .then(([data, pushes]) => {
        setPreview(data)
        setLast(pushes.find((row) => row.platform === platform) ?? null)
      })
      .catch((error: unknown) => {
        setPreview(null)
        setPreviewError(errorText(error, 'Could not prepare the menu.'))
      })
      .finally(() => setLoading(false))
  }, [outletId, platform])

  useEffect(() => {
    if (!open) return
    setSent(null)
    setConfirmOpen(false)
    load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !confirmOpen && !sending) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, confirmOpen, sending, onClose])

  async function checkStatus(record: MenuPushRecord, quiet = false) {
    setChecking(true)
    try {
      const fresh = await getMenuPushApi(outletId, record.id, true)
      setSent(fresh)
    } catch (error) {
      if (!quiet) showToast(errorText(error, 'Could not read the status from Wera.'))
    } finally {
      setChecking(false)
    }
  }

  async function handleSend() {
    setSending(true)
    try {
      const record = await pushMenuApi(outletId, platform)
      setSent(record)
      setConfirmOpen(false)
      showToast(`Menu sent to ${label}`)
      // Wera usually answers validation at once; show it without a second click.
      void checkStatus(record, true)
    } catch (error) {
      setConfirmOpen(false)
      showToast(errorText(error, `Could not send the menu to ${label}.`))
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  const skipped = preview?.issues.filter((i) => i.level === 'skipped') ?? []
  const notices = preview?.issues.filter((i) => i.level === 'warning') ?? []
  const messages = sent ? trackerMessages(sent.tracker) : []

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !sending) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Push menu to ${label}`}
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-card shadow-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-ink">Push menu to {label}</h2>
            <p className="mt-0.5 text-xs text-muted">
              Sends the {label} menu and prices through Wera
              {preview?.merchant_id ? ` (merchant ${preview.merchant_id})` : ''}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            data-tooltip="Close"
            className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
              <Loader2 size={18} className="animate-spin text-primary" />
              Checking the menu...
            </div>
          ) : previewError ? (
            <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm">
              <p className="font-semibold text-danger">{previewError}</p>
              <button
                type="button"
                onClick={load}
                className="mt-3 inline-flex h-8 cursor-pointer items-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
              >
                Try again
              </button>
            </div>
          ) : preview ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Items to send" value={preview.counts.items} />
                <Stat label="Categories" value={preview.counts.categories} />
                <Stat label="Add-ons" value={preview.counts.addons} />
                <Stat label="Left out" value={preview.skipped} tone="warn" />
              </div>

              {!preview.can_push && (
                <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm font-medium text-danger">
                  {preview.blocked_reason ?? 'This menu cannot be sent yet.'}
                </p>
              )}

              {last && !sent && (
                <p className="flex items-center gap-2 text-xs text-muted">
                  <Clock3 size={14} />
                  Last push {new Date(last.created_at).toLocaleString('en-IN')} by{' '}
                  {last.requested_by || 'unknown'}
                  {last.outcome === 'failed'
                    ? ' - rejected'
                    : last.outcome === 'success'
                      ? ' - queued'
                      : ''}
                </p>
              )}

              <IssueList title="Left out of this push" issues={skipped} />
              <IssueList title="Notices" issues={notices} />

              {sent && (
                <div
                  className={`rounded-lg border p-4 text-sm ${
                    sent.outcome === 'failed'
                      ? 'border-danger/30 bg-danger/5'
                      : sent.outcome === 'success'
                        ? 'border-success/30 bg-success/5'
                        : 'border-line bg-page'
                  }`}
                >
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    {sent.outcome === 'failed' ? (
                      <AlertTriangle size={16} className="text-danger" />
                    ) : sent.outcome === 'success' ? (
                      <CheckCircle2 size={16} className="text-success" />
                    ) : (
                      <Clock3 size={16} className="text-muted" />
                    )}
                    {sent.outcome === 'failed'
                      ? `${label} rejected the menu`
                      : sent.outcome === 'success'
                        ? `Queued by Wera - ${label} shows it in about 5-10 minutes`
                        : 'Sent to Wera - waiting for its answer'}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Request {sent.request_id || 'n/a'}
                  </p>
                  {sent.outcome === 'failed' && messages.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
                      {messages.map((text) => (
                        <li key={text}>{text}</li>
                      ))}
                    </ul>
                  )}
                  {sent.outcome === 'failed' && sent.error && (
                    <p className="mt-2 text-ink">{sent.error}</p>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page disabled:opacity-60"
          >
            Close
          </button>
          {sent && sent.status === 'submitted' && (
            <button
              type="button"
              onClick={() => void checkStatus(sent)}
              disabled={checking}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-primary px-4 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
            >
              {checking && <Loader2 size={14} className="animate-spin" />}
              Check status
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!preview?.can_push || sending || loading}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={14} />
            {sent ? `Send again` : `Send to ${label}`}
          </button>
        </footer>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Send the menu to ${label}?`}
        target={preview?.merchant_id ? `Wera merchant ${preview.merchant_id}` : undefined}
        consequences={[
          `Sends ${preview?.counts.items ?? 0} items with their ${label} prices.`,
          `The ${label} menu for this outlet is replaced by this one.`,
          'It can take 5-10 minutes to show up.',
        ]}
        note="You can send again after changing prices or items."
        confirmLabel="Send menu"
        tone="primary"
        loading={sending}
        zClassName="z-[90]"
        onConfirm={() => void handleSend()}
        onClose={() => setConfirmOpen(false)}
      />
    </div>,
    document.body,
  )
}
