import { useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  Loader2,
  Pencil,
  Plus,
  Printer as PrinterIcon,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { PrinterAssignModal, PrinterFormModal } from '../../components/billing/PrinterModals'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import {
  createPrinterApi,
  deletePrinterApi,
  listPrintersApi,
  updatePrinterApi,
  type PrinterJob,
  type PrinterRecord,
  type PrinterType,
} from '../../services/outletService'
import { useNewOrder } from '../../state/useNewOrder'
import { PRINTER_TYPE_LABEL } from '../../utils/printerOptions'
import { showToast } from '../../utils/toast'

const SETUP_TIPS = [
  'Install the printer driver on this computer and check it prints a Windows test page.',
  'Add the printer here with a clear name (for example "Kitchen printer").',
  'Use Assign to choose what it prints: Bill, KOT or Report.',
  'Use the print icon to send a test page, then set your preferred bill and KOT layout under Bill/KOT Preferred Configuration.',
]

const iconBtn =
  'inline-flex size-9 items-center justify-center rounded-lg bg-page text-ink hover:bg-line/60'

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export default function BillingPrinters() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, isAdmin, hasPermission } = useAuth()
  // Everyone with billing can see the list; only outlet management changes it.
  const canManage = isAdmin || hasPermission('outlets.change_outlet')
  const [billNo, setBillNo] = useState('')
  const [printers, setPrinters] = useState<PrinterRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)
  const [form, setForm] = useState<{ printer: PrinterRecord | null } | null>(null)
  const [assigning, setAssigning] = useState<PrinterRecord | null>(null)
  const [deleting, setDeleting] = useState<PrinterRecord | null>(null)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      setPrinters(await listPrintersApi(encryptedOutletId))
    } catch (error) {
      showToast(errorText(error, 'Failed to load printers'))
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  async function handleSave(values: { name: string; type: PrinterType }) {
    if (!encryptedOutletId) return
    const payload = { name: values.name, printer_type: values.type }
    try {
      if (form?.printer) {
        await updatePrinterApi(encryptedOutletId, form.printer.id, payload)
        showToast('Printer updated')
      } else {
        await createPrinterApi(encryptedOutletId, payload)
        showToast('Printer added')
      }
      setForm(null)
      await load()
    } catch (error) {
      showToast(errorText(error, 'Failed to save printer'))
    }
  }

  async function handleAssign(jobs: PrinterJob[]) {
    if (!encryptedOutletId || !assigning) return
    try {
      await updatePrinterApi(encryptedOutletId, assigning.id, { assigned_for: jobs })
      showToast('Printer assignment saved')
      setAssigning(null)
      await load()
    } catch (error) {
      showToast(errorText(error, 'Failed to save assignment'))
    }
  }

  async function handleDelete() {
    if (!encryptedOutletId || !deleting) return
    try {
      await deletePrinterApi(encryptedOutletId, deleting.id)
      showToast('Printer removed')
      setDeleting(null)
      await load()
    } catch (error) {
      showToast(errorText(error, 'Failed to remove printer'))
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      {form ? (
        <PrinterFormModal
          printer={form.printer}
          onClose={() => setForm(null)}
          onSave={(values) => void handleSave(values)}
        />
      ) : null}
      {assigning ? (
        <PrinterAssignModal
          printer={assigning}
          onClose={() => setAssigning(null)}
          onSave={(jobs) => void handleAssign(jobs)}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove this printer?"
        target={deleting?.name}
        message="It stops being used for the jobs assigned to it."
        confirmLabel="Remove"
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Printer Listing</h1>
          <div className="flex items-center gap-2">
            {canManage ? (
              <button
                type="button"
                onClick={() => navigate('/management/configuration/outlet/print')}
                className="inline-flex h-9 items-center rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
              >
                Bill/KOT Preferred Configuration
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate('/billing/operations')}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Manage Printers</h2>
            <p className="text-sm text-muted">Manage printer preferences &amp; configuration</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHelpOpen((open) => !open)}
              aria-expanded={helpOpen}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary bg-card px-4 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <PrinterIcon size={14} />
              Printer Setup Help
              <ChevronDown size={14} className={helpOpen ? 'rotate-180' : ''} />
            </button>
            {canManage ? (
              <button
                type="button"
                onClick={() => setForm({ printer: null })}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                <Plus size={14} />
                Add Printer
              </button>
            ) : null}
          </div>
        </div>

        {helpOpen ? (
          <ol className="mb-4 list-decimal space-y-1 rounded-xl border border-line bg-card py-3 pl-9 pr-4 text-sm text-ink">
            {SETUP_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-[1.4fr_1fr_auto] gap-4 bg-page px-5 py-4 text-sm font-bold text-ink">
            <span>Printer Name</span>
            <span>Printer Type</span>
            <span className="text-right">Printer Actions</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              Loading printers…
            </div>
          ) : printers.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted">
              {canManage
                ? 'No printers yet. Use Add Printer to set one up.'
                : 'No printers have been set up for this outlet.'}
            </div>
          ) : (
            printers.map((printer) => {
              const ebill = printer.printer_type === 'ebill'
              const jobs: string[] = ebill ? ['eBill'] : printer.assigned_for
              return (
                <div
                  key={printer.id}
                  className="grid grid-cols-[1.4fr_1fr_auto] items-center gap-4 border-t border-line px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base text-ink">{printer.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted">
                      Assigned for:
                      {jobs.length === 0 ? (
                        <span className="rounded-full bg-page px-2 py-0.5 text-xs text-ink">
                          Not Assigned
                        </span>
                      ) : (
                        jobs.map((job) => (
                          <span
                            key={job}
                            className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {job}
                          </span>
                        ))
                      )}
                    </p>
                  </div>
                  <span className="text-sm text-ink">
                    {PRINTER_TYPE_LABEL[printer.printer_type]}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    {canManage ? (
                      <button
                        type="button"
                        aria-label={`Edit ${printer.name}`}
                        data-tooltip="Edit printer"
                        onClick={() => setForm({ printer })}
                        className={iconBtn}
                      >
                        <Pencil size={16} />
                      </button>
                    ) : null}
                    {canManage && !ebill ? (
                      <button
                        type="button"
                        aria-label={`Remove ${printer.name}`}
                        data-tooltip="Remove printer"
                        onClick={() => setDeleting(printer)}
                        className={iconBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                    {ebill ? null : (
                      <button
                        type="button"
                        aria-label={`Test print on ${printer.name}`}
                        data-tooltip="Test print"
                        onClick={() => window.print()}
                        className={iconBtn}
                      >
                        <PrinterIcon size={16} />
                      </button>
                    )}
                    {canManage && !ebill ? (
                      <button
                        type="button"
                        onClick={() => setAssigning(printer)}
                        className="inline-flex h-9 items-center rounded-lg border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page"
                      >
                        Assign
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
