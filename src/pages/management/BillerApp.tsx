import { useMemo, useState } from 'react'
import {
  Copy,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

type TabId =
  | 'biller'
  | 'captain'
  | 'delivery-boy'
  | 'waiter'
  | 'order-acceptance'

interface BillerUser {
  id: string
  displayName: string
  userName: string
  userCode: string
  active: boolean
}

const TABS: Array<{ id: TabId; label: string; nameColumn: string }> = [
  { id: 'biller', label: 'Biller', nameColumn: 'Biller Name' },
  { id: 'captain', label: 'Captain', nameColumn: 'Captain Name' },
  { id: 'delivery-boy', label: 'Delivery Boy', nameColumn: 'Delivery Boy Name' },
  { id: 'waiter', label: 'Waiter', nameColumn: 'Waiter Name' },
  {
    id: 'order-acceptance',
    label: 'Order Acceptance App',
    nameColumn: 'User Name',
  },
]

const INITIAL_USERS: Record<TabId, BillerUser[]> = {
  biller: [
    {
      id: 'b1',
      displayName: 'Amit Thakkar',
      userName: 'Amit',
      userCode: '-',
      active: true,
    },
    {
      id: 'b2',
      displayName: 'Utkarsh Gosavi',
      userName: 'Utkarsh',
      userCode: '-',
      active: true,
    },
    {
      id: 'b3',
      displayName: 'Devesh Jobanputra',
      userName: 'Devesh',
      userCode: '-',
      active: true,
    },
  ],
  captain: [],
  'delivery-boy': [],
  waiter: [],
  'order-acceptance': [],
}

function StatusSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-line'
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function BillerApp() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('biller')
  const [usersByTab, setUsersByTab] =
    useState<Record<TabId, BillerUser[]>>(INITIAL_USERS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0]
  const rows = usersByTab[activeTab]

  const allSelected = useMemo(
    () => rows.length > 0 && selectedIds.size === rows.length,
    [rows, selectedIds],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId)
    setSelectedIds(new Set())
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(rows.map((row) => row.id)))
  }

  function setActive(id: string, active: boolean) {
    setUsersByTab((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((row) =>
        row.id === id ? { ...row, active } : row,
      ),
    }))
  }

  function handleDelete(id: string, name: string) {
    setUsersByTab((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((row) => row.id !== id),
    }))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    showToast(`Deleted ${name}`)
  }

  return (
    <ReportsPageShell
      title={activeTabMeta.label}
      activeItem="user-mgmt-biller-app"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton
            variant="gray"
            onClick={() => showToast('Sync code generated')}
          >
            Sync Code
          </OutlineButton>
          <PrimaryButton
            onClick={() =>
              navigate('/management/user-management/biller-app/add')
            }
          >
            <Plus size={15} />
            Create
          </PrimaryButton>
        </div>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'border-b-2 border-primary font-semibold text-primary'
                  : 'border-b-2 border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        {rows.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page text-muted">
              <Search size={36} strokeWidth={1.75} />
            </span>
            <p className="text-base font-bold text-ink">No Results Found.</p>
            <p className="mt-1 text-sm text-muted">
              We couldn&apos;t find a match for your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="size-4 cursor-pointer accent-primary"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-3">{activeTabMeta.nameColumn}</th>
                  <th className="px-4 py-3">User Name</th>
                  <th className="px-4 py-3">User Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-page/50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="size-4 cursor-pointer accent-primary"
                        aria-label={`Select ${row.displayName}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {row.displayName}
                    </td>
                    <td className="px-4 py-3 text-ink">{row.userName}</td>
                    <td className="px-4 py-3 text-muted">{row.userCode}</td>
                    <td className="px-4 py-3">
                      <StatusSwitch
                        checked={row.active}
                        onChange={(active) => setActive(row.id, active)}
                        label={`${row.displayName} status`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          aria-label={`View ${row.displayName}`}
                          onClick={() =>
                            showToast(`Viewing ${row.displayName}`)
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit ${row.displayName}`}
                          onClick={() =>
                            showToast(`Edit ${row.displayName}`)
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Copy ${row.displayName}`}
                          onClick={() => {
                            void navigator.clipboard?.writeText(row.userName)
                            showToast(`Copied ${row.userName}`)
                          }}
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${row.displayName}`}
                          onClick={() =>
                            handleDelete(row.id, row.displayName)
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
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
