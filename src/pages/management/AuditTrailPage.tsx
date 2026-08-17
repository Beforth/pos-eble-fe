import { ShieldCheck } from 'lucide-react'
import { AuditTrailPageShell } from '../../components/layout/AuditTrailPageShell'

export default function AuditTrailPage() {
  return (
    <AuditTrailPageShell>
      <div className="flex min-h-[580px] h-full flex-col items-center justify-center rounded-xl border border-line bg-card p-8 text-center shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-xs">
          <ShieldCheck size={28} />
        </div>

        <h1 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-ink">
          Audit trail
        </h1>

        <div className="mt-3 max-w-md space-y-1 text-xs sm:text-sm font-medium text-muted leading-relaxed">
          <p>
            Every action across your account — logged, searchable, and
            timestamped.
          </p>
          <p>
            Use it to track changes, investigate issues, or stay
            audit-ready.
          </p>
        </div>
      </div>
    </AuditTrailPageShell>
  )
}
