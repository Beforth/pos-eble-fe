import { useEffect } from 'react'

import { showToast } from '../../utils/toast'
import { Pencil, Plus, RefreshCcw, Search, Trash2, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useListQuery } from '../../hooks/useListQuery'
import { ApiError } from '../../services/apiClient'
import { deleteRoleApi, type Role } from '../../services/roleService'
import { useRoles } from '../../state/RoleContext'

export default function RoleManagement() {
  const navigate = useNavigate()
  const { roles, status, error, loadRoles, removeRole } = useRoles()
  const loading = status === 'loading'
  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      roles,
      (role) => [role.name, role.code, role.description],
      (role, key) => {
        if (key === 'code') return role.code
        if (key === 'description') return role.description
        return role.name
      },
    )


  useEffect(() => {
    void loadRoles()
  }, [loadRoles])

  async function handleDelete(role: Role) {
    try {
      await deleteRoleApi(role.id)
      removeRole(role.id)
      showToast(`Deleted ${role.name}`)
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to delete role.',
      )
    }
  }

  return (
    <ReportsPageShell
      title="Roles"
      activeItem="user-mgmt-roles"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton
            variant="gray"
            onClick={() => void loadRoles({ force: true })}
          >
            <RefreshCcw size={15} />
            Sync
          </OutlineButton>
          <PrimaryButton
            onClick={() => navigate('/management/user-management/roles/add')}
          >
            <Plus size={15} />
            Create Role
          </PrimaryButton>
        </div>
      }
    >

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        {error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-danger/10 text-danger">
              <Search size={36} strokeWidth={1.75} />
            </span>
            <p className="text-base font-bold text-ink">{error}</p>
            <p className="mt-1 text-sm text-muted">
              Try syncing again or check your connection.
            </p>
          </div>
        ) : loading ? (
          <div className="flex min-h-[360px] items-center justify-center text-sm text-muted">
            Loading roles…
          </div>
        ) : roles.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page text-muted">
              <UserRound size={36} strokeWidth={1.75} />
            </span>
            <p className="text-base font-bold text-ink">No Roles Found.</p>
            <p className="mt-1 text-sm text-muted">
              Create a role to start assigning user types.
            </p>
          </div>
        ) : (
          <div>
            <div className="border-b border-line p-4">
              <ListSearch
                value={search}
                onChange={setSearch}
                placeholder="Search roles"
              />
            </div>
          {visible.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-16 text-center">
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
                  <SortableTh
                    columnKey="name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-3"
                  >
                    Role
                  </SortableTh>
                  <SortableTh
                    columnKey="code"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-3"
                  >
                    Code
                  </SortableTh>
                  <SortableTh
                    columnKey="description"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-3"
                  >
                    Description
                  </SortableTh>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b border-line last:border-0 hover:bg-page/50"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      {role.name}
                    </td>
                    <td className="px-4 py-3 text-muted">{role.code}</td>
                    <td className="px-4 py-3 text-muted">
                      {role.description || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          aria-label={`Edit ${role.name}`}
                          onClick={() =>
                            navigate(
                              `/management/user-management/roles/${role.id}`,
                            )
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${role.name}`}
                          onClick={() => void handleDelete(role)}
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
        )}
      </div>
    </ReportsPageShell>
  )
}