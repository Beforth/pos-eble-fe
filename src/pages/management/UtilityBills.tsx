import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface UtilityOperatorRow {
  id: string
  operator: string
  type: string
  status: 'Active' | 'Inactive'
}

export default function UtilityBills() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [operatorQuery, setOperatorQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [rows] = useState<UtilityOperatorRow[]>([])

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => row.operator.toLowerCase().includes(q))
  }, [rows, appliedQuery])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setAppliedQuery(operatorQuery.trim())
  }

  function handleShowAll() {
    setOperatorQuery('')
    setAppliedQuery('')
  }

  return (
    <ReportsPageShell
      title="Utility Bill Operator"
      activeItem="acct-utility-bills"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PrimaryButton
            onClick={() =>
              navigate('/management/accounting/utility-bills/add')
            }
          >
            <Plus size={15} />
            Add Utility Bill Operator
          </PrimaryButton>
          <ActionDropdown
            options={[
              {
                label: 'Active',
                onClick: () => showToast('Marked active'),
              },
              {
                label: 'Inactive',
                onClick: () => showToast('Marked inactive'),
              },
              {
                label: 'Delete',
                danger: true,
                onClick: () => showToast('Delete selected'),
              },
            ]}
          />
          <ExportExcelMenu
            onExportPage={() => showToast('Exporting current page…')}
            onExportAll={() => showToast('Exporting all records…')}
          />
        </div>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line p-4 sm:p-5">
          <label
            htmlFor="utility-operator"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Operator
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="utility-operator"
              type="text"
              value={operatorQuery}
              onChange={(event) => setOperatorQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              className="h-9 min-w-[200px] flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary sm:max-w-xs"
            />
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Show All
            </OutlineButton>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page">
              <Search
                size={48}
                strokeWidth={1.25}
                className="text-muted/45"
              />
            </span>
            <p className="text-base font-semibold text-ink">No Results Found.</p>
            <p className="mt-1 text-sm text-muted">
              We couldn&apos;t find a match for your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-page/50"
                  >
                    <td className="px-4 py-3 text-ink">{row.operator}</td>
                    <td className="px-4 py-3 text-ink">{row.type}</td>
                    <td className="px-4 py-3 text-ink">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ReportsPageShell>
  )
}
