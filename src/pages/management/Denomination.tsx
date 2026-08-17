import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  ActionDropdown,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

export default function Denomination() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <ReportsPageShell
      title="Denomination"
      activeItem="acct-denomination"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PrimaryButton
            onClick={() => navigate('/management/accounting/denomination/add')}
          >
            <Plus size={16} />
            Add Denomination
          </PrimaryButton>
          <ActionDropdown
            label="Action"
            options={[
              {
                label: 'Export Excel',
                onClick: () => showToast('Exporting Excel…'),
              },
              {
                label: 'Refresh',
                onClick: () => showToast('List refreshed'),
              },
            ]}
          />
        </div>
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
