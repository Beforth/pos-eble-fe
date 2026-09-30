import { useEffect, useState, type ReactNode } from 'react'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../services/apiClient'
import { getUserApi, type UserSummary } from '../../services/userService'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

function DetailCell({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line pb-4 last:border-0 last:pb-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="break-words text-sm text-ink">{children}</span>
    </div>
  )
}

export default function ViewBiller() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getUserApi(id)
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'Failed to load billing user',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const goBack = () => navigate('/management/user-management/biller-app')

  const displayName =
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    '—'

  const joined =
    user && user.date_joined
      ? new Date(user.date_joined).toLocaleString('en-IN')
      : '—'

  return (
    <ReportsPageShell
      title={
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back to Biller App"
            data-tooltip="Back to Biller App"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <ArrowLeft size={18} />
          </button>
          View Billing User
        </span>
      }
      activeItem="user-mgmt-biller-app"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton variant="gray" onClick={goBack}>
            Back
          </OutlineButton>
          {id ? (
            <PrimaryButton
              onClick={() =>
                navigate(
                  `/management/user-management/biller-app/edit/${id}`,
                )
              }
            >
              Edit
            </PrimaryButton>
          ) : null}
        </div>
      }
    >
      {error ? (
        <div className="rounded-xl border border-line bg-card p-6 text-sm text-danger">
          {error}
        </div>
      ) : user === null ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-line bg-card text-muted">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Basic Details
            </h2>
            <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
              <DetailCell label="Name">{displayName}</DetailCell>
              <DetailCell label="User Name">{user.username || '—'}</DetailCell>
              <DetailCell label="User Code">
                {user.user_code || '—'}
              </DetailCell>
              <DetailCell label="Role">{user.role?.name ?? '—'}</DetailCell>
              <DetailCell label="Status">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`size-2 rounded-full ${
                      user.is_active ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-hidden="true"
                  />
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </DetailCell>
              <DetailCell label="User Passcode">
                {user.passcode || '—'}
              </DetailCell>
              <DetailCell label="Swipe Code">
                {user.swipe_code || '—'}
              </DetailCell>
              <DetailCell label="Discount Capping">
                {user.discount_capping || '—'}
              </DetailCell>
              <DetailCell label="Discount Value">
                {user.discount_value ?? '—'}
              </DetailCell>
              <DetailCell label="Email">{user.email || '—'}</DetailCell>
              <DetailCell label="Phone">{user.phone || '—'}</DetailCell>
              <DetailCell label="Date Joined">{joined}</DetailCell>
            </div>
          </div>

          {user.memberships.length > 0 ? (
            <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold text-ink">
                Member Outlets
              </h2>
              <div className="flex flex-col divide-y divide-line">
                {user.memberships.map((membership) => (
                  <div
                    key={membership.outlet_id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm text-ink">
                      {membership.outlet_name}
                      {membership.outlet_code
                        ? ` (${membership.outlet_code})`
                        : ''}
                    </span>
                    <span className="flex items-center gap-2">
                      {membership.is_default ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          Default
                        </span>
                      ) : null}
                      {membership.groups.length > 0 ? (
                        <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-muted">
                          {membership.groups.join(', ')}
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {user.permissions.length > 0 ? (
            <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold text-ink">
                Permissions
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full bg-page px-3 py-1 text-xs font-medium text-ink"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </ReportsPageShell>
  )
}