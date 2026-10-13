import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import { Pencil, Plus, RefreshCcw, Search, Trash2, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { ApiError } from '../../services/apiClient'
import { deleteRoleApi, type Role } from '../../services/roleService'
import { useRoles } from '../../state/RoleContext'

export default function RoleManagement() {
  const navigate = useNavigate()
  const { roles, status, error, loadRoles, removeRole } = useRoles()
  const loading = status === 'loading'
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState(false)


  useEffect(() => {
    void loadRoles()
  }, [loadRoles])

  async function handleDelete(role: Role) {
    try {
      setDeleting(true)
      await deleteRoleApi(role.id)
      removeRole(role.id)
      showToast(`Deleted ${role.name}`)
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to delete role.',
      )
    } finally {
      setDeleting(false)
    }
  }

  async function confirmDeleteRole() {
    if (!deleteTarget) return
    const role = deleteTarget
    setDeleteTarget(null)
    await handleDelete(role)
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
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
                          data-tooltip={`Edit ${role.name}`}
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
                          data-tooltip={`Delete ${role.name}`}
                          onClick={() => setDeleteTarget(role)}
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
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete role"
        target={deleteTarget?.name}
        message={`${deleteTarget?.name ?? 'This role'} will stop appearing when you assign users to outlets.`}
        consequences={[
          'Anyone still assigned to this role loses its permissions.',
          'Its saved permission settings are archived along with it.',
          'Past orders and bills keep whatever access they were created under.',
        ]}
        note="The role is archived, not erased, so it can be brought back if it is needed again."
        confirmLabel="Delete role"
        loading={deleting}
        onConfirm={() => void confirmDeleteRole()}
        onClose={() => setDeleteTarget(null)}
      />
    </ReportsPageShell>
  )
}