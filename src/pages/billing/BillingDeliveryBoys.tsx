import { useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileX, Loader2, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { deleteDeliveryBoyApi, listDeliveryBoysApi } from '../../services/deliveryBoyService'
import type { UserSummary } from '../../services/userService'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

const HEADINGS = ['Name', 'User Name', 'User Code', 'Phone Number', 'Status', '']

const iconBtn =
  'inline-flex size-9 items-center justify-center rounded-lg bg-page text-ink hover:bg-line/60'

export default function BillingDeliveryBoys() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { isAdmin, hasPermission } = useAuth()
  const canAdd = isAdmin || hasPermission('accounts.add_user')
  const canChange = isAdmin || hasPermission('accounts.change_user')
  const canDelete = isAdmin || hasPermission('accounts.delete_user')
  const [billNo, setBillNo] = useState('')
  const [boys, setBoys] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<UserSummary | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setBoys(await listDeliveryBoysApi())
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load delivery boys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteDeliveryBoyApi(deleting.id)
      showToast('Delivery boy removed')
      setDeleting(null)
      await load()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to remove delivery boy')
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove this delivery boy?"
        target={deleting?.name || deleting?.username}
        message="They can no longer sign in."
        confirmLabel="Remove"
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Delivery Boy Listing</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              aria-label="Refresh list"
              data-tooltip="Refresh list"
              className="inline-flex size-9 items-center justify-center rounded-lg text-ink hover:bg-card"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            {canAdd ? (
              <button
                type="button"
                onClick={() => navigate('/billing/delivery-boys/new')}
                className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Add Delivery Boy
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate('/billing/operations')}
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          </div>
        </div>

        {loading && boys.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-12 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading delivery boys…
          </div>
        ) : boys.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-xl border border-line bg-card px-6 py-10 text-center">
            <FileX size={64} strokeWidth={1.2} className="text-muted/60" />
            <p className="text-sm text-muted">Records not available</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-page">
                    {HEADINGS.map((heading) => (
                      <th
                        key={heading || 'actions'}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 text-left text-sm font-bold text-ink"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {boys.map((boy) => (
                    <tr key={boy.id} className="border-t border-line">
                      <td className="px-4 py-3 font-semibold text-ink">
                        {boy.name || boy.first_name}
                      </td>
                      <td className="px-4 py-3 text-ink">{boy.username}</td>
                      <td className="px-4 py-3 text-ink">{boy.user_code ?? ''}</td>
                      <td className="px-4 py-3 tabular-nums text-ink">{boy.phone ?? ''}</td>
                      <td className="px-4 py-3 text-ink">
                        {boy.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {canChange ? (
                            <button
                              type="button"
                              aria-label={`Edit ${boy.name || boy.username}`}
                              data-tooltip="Edit delivery boy"
                              onClick={() =>
                                navigate(
                                  `/billing/delivery-boys/${encodeURIComponent(boy.id)}/edit`,
                                )
                              }
                              className={iconBtn}
                            >
                              <Pencil size={16} />
                            </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              type="button"
                              aria-label={`Remove ${boy.name || boy.username}`}
                              data-tooltip="Remove delivery boy"
                              onClick={() => setDeleting(boy)}
                              className={iconBtn}
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
