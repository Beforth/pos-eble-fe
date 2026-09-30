import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import {
  Copy,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../services/apiClient'
import {
  deleteUserApi,
  listUsersApi,
  updateUserApi,
  type UserSummary,
} from '../../services/userService'
import { useRoles } from '../../state/RoleContext'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface TabMeta {
  id: string
  label: string
  nameColumn: string
}

const FALLBACK_ROLE_TABS: Omit<TabMeta, 'nameColumn'>[] = [
  { id: 'biller', label: 'Biller' },
  { id: 'captain', label: 'Captain' },
  { id: 'delivery-boy', label: 'Delivery Boy' },
  { id: 'waiter', label: 'Waiter' },
  { id: 'order-acceptance', label: 'Order Acceptance App' },
]

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}

function userMatchesRole(user: UserSummary, tabId: string): boolean {
  const roleId = user.role ? slugify(user.role.name) : ''
  return roleId === tabId
}

function StatusSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
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
  const { roles } = useRoles()
  const [activeTabId, setActiveTabId] = useState('all')
  const [users, setUsers] = useState<UserSummary[] | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const tabs = useMemo<TabMeta[]>(() => {
    const roleTabs: TabMeta[] =
      roles.length > 0
        ? roles.map((role) => ({
            id: slugify(role.name),
            label: role.name,
            nameColumn: 'Name',
          }))
        : FALLBACK_ROLE_TABS.map((tab) => ({ ...tab, nameColumn: 'Name' }))
    return [
      { id: 'all', label: 'All Users', nameColumn: 'Name' },
      ...roleTabs,
    ]
  }, [roles])

  const activeTab =
    tabs.find((tab) => tab.id === activeTabId) ??
    tabs[0] ?? { id: 'all', label: 'All Users', nameColumn: 'Name' }

  useEffect(() => {
    if (activeTabId !== 'all' && !tabs.some((tab) => tab.id === activeTabId)) {
      setActiveTabId('all')
    }
  }, [tabs, activeTabId])

  const rows = useMemo(() => {
    if (!users) return []
    if (activeTabId === 'all') return users
    return users.filter((user) => userMatchesRole(user, activeTabId))
  }, [users, activeTabId])

  const allSelected = useMemo(
    () => rows.length > 0 && selectedIds.size === rows.length,
    [rows, selectedIds],
  )

  useEffect(() => {
    let cancelled = false
    setError(null)
    listUsersApi()
      .then((data) => {
        if (cancelled) return
        setUsers(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(
          err instanceof ApiError ? err.message : 'Failed to load billing users',
        )
      })
    return () => {
      cancelled = true
    }
  }, [])


  function handleTabChange(tabId: string) {
    setActiveTabId(tabId)
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

  async function setActive(user: UserSummary, active: boolean) {
    try {
      setTogglingId(user.id)
      const updated = await updateUserApi(user.id, { is_active: active })
      setUsers((prev) =>
        prev ? prev.map((item) => (item.id === user.id ? updated : item)) : prev,
      )
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update status',
      )
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(user: UserSummary) {
    try {
      setDeletingId(user.id)
      await deleteUserApi(user.id)
      setUsers((prev) =>
        prev ? prev.filter((item) => item.id !== user.id) : prev,
      )
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(user.id)
        return next
      })
      showToast(`Deleted ${user.name}`)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return
    const user = deleteTarget
    setDeleteTarget(null)
    await handleDelete(user)
  }

  return (
    <ReportsPageShell
      title={activeTab.label}
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

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {tabs.map((tab) => {
          const active = activeTabId === tab.id
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

      {error ? (
        <div className="rounded-xl border border-line bg-card p-6 text-sm text-danger">
          {error}
        </div>
      ) : users === null ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-line bg-card text-muted">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          {rows.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page text-muted">
                <Search size={36} strokeWidth={1.75} />
              </span>
              <p className="text-base font-bold text-ink">No Results Found.</p>
              <p className="mt-1 text-sm text-muted">
                {activeTabId === 'all'
                  ? 'There are no billing users yet.'
                  : `There are no users in the ${activeTab.label} filter.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
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
                    <th className="px-4 py-3">{activeTab.nameColumn}</th>
                    <th className="px-4 py-3">User Name</th>
                    {activeTabId === 'all' ? (
                      <th className="px-4 py-3">Role</th>
                    ) : null}
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
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-ink">{row.username}</td>
                      {activeTabId === 'all' ? (
                        <td className="px-4 py-3 text-muted">
                          {row.role?.name ?? '—'}
                        </td>
                      ) : null}
                      <td className="px-4 py-3 text-muted">
                        {row.user_code || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusSwitch
                          checked={row.is_active}
                          disabled={togglingId === row.id}
                          onChange={(active) => setActive(row, active)}
                          label={`${row.name} status`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            aria-label={`View ${row.name}`}
                            data-tooltip="View details"
                            onClick={() =>
                              navigate(
                                `/management/user-management/biller-app/view/${row.id}`,
                              )
                            }
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${row.name}`}
                            data-tooltip="Edit user"
                            onClick={() =>
                              navigate(
                                `/management/user-management/biller-app/edit/${row.id}`,
                              )
                            }
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Copy ${row.name}`}
                            data-tooltip="Copy user name"
                            onClick={() => {
                              void navigator.clipboard?.writeText(row.username)
                              showToast(`Copied ${row.username}`)
                            }}
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${row.name}`}
                            data-tooltip="Delete user"
                            disabled={deletingId === row.id}
                            onClick={() => setDeleteTarget(row)}
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === row.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
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
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        target={deleteTarget?.name}
        message={`${deleteTarget?.name ?? 'This user'} will no longer be able to sign in, and will be removed from every outlet and role assignment.`}
        consequences={[
          'Sessions end immediately and the account is blocked at login.',
          'Outlet access and role assignments are revoked.',
          'Their past orders, bills and reports are kept.',
        ]}
        note="The account is archived, not erased — the login name stays reserved so it is never reassigned to someone else."
        confirmLabel="Delete user"
        loading={deletingId === deleteTarget?.id}
        onConfirm={() => void confirmDeleteUser()}
        onClose={() => setDeleteTarget(null)}
      />
    </ReportsPageShell>
  )
}