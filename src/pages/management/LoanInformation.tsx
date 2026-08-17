import { useState } from 'react'
import { Search } from 'lucide-react'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'

export default function LoanInformation() {
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <ReportsPageShell
      title="Loan Information"
      activeItem="acct-loan-information"
      actions={
        <ExportExcelMenu
          onExportPage={() => showToast('Exporting current page…')}
          onExportAll={() => showToast('Exporting all loans…')}
        />
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page text-muted">
          <Search size={36} strokeWidth={1.75} />
        </span>
        <p className="text-base font-bold text-ink">No Results Found.</p>
        <p className="mt-1 text-sm text-muted">
          We couldn&apos;t find a match for your search.
        </p>
      </div>
    </ReportsPageShell>
  )
}
