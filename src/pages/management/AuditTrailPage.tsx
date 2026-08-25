import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ClipboardList,
  FilePenLine,
  Printer,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { AuditTrailPageShell } from '../../components/layout/AuditTrailPageShell'

const QUICK_LINKS = [
  {
    id: 'order-modification',
    label: 'Order Modification Audit',
    description:
      'Every order-level edit — items, quantities, and rates — with who changed what and when.',
    icon: FilePenLine,
    to: '/management/order-modification',
  },
  {
    id: 'after-print-modification',
    label: 'After Print Modification',
    description:
      'Bills edited after printing, so nothing slips past the counter unnoticed.',
    icon: Printer,
    to: '/report/after-print-modification',
  },
  {
    id: 'after-print-payment',
    label: 'After Print Payment',
    description:
      'Payment mode and amount changes recorded after a bill has been printed.',
    icon: Wallet,
    to: '/report/payment-changes',
  },
  {
    id: 'kot-modification-report',
    label: 'KOT Modification Report',
    description:
      'Kitchen tickets modified or cancelled after being sent, with full timestamps.',
    icon: ClipboardList,
    to: '/report/kots',
  },
]

export default function AuditTrailPage() {
  const navigate = useNavigate()

  return (
    <AuditTrailPageShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
            Audit trail
          </h1>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-card p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:flex-row sm:text-left">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Every action across your account — logged, searchable, and
              timestamped.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Use the reports below to track changes, investigate issues, or
              stay audit-ready.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => navigate(link.to)}
                className="group flex w-full cursor-pointer items-start gap-4 rounded-xl border border-line bg-card p-5 text-left transition-colors hover:border-primary/30 hover:bg-page"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    {link.label}
                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-muted transition-colors group-hover:text-primary"
                    />
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {link.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <p className="px-1 text-xs leading-relaxed text-muted">
          Audit records are retained for your records and cannot be edited or
          deleted from the outlet side. For older logs, contact support.
        </p>
      </div>
    </AuditTrailPageShell>
  )
}
