import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  MapPin,
  MonitorSmartphone,
  Phone,
  Plus,
  Store,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react'
import { BillingHeader } from '../components/billing/BillingHeader'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../components/menu/MenuActionButtons'
import { useAuth } from '../auth/AuthContext'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { TooltipWrapper } from '../components/common/TooltipWrapper'
import { OutletDetailsModal } from '../components/menu/OutletDetailsModal'
import {
  deleteOutletApi,
  getOutletApi,
  listOutletsApi,
  type OutletSummary,
} from '../services/outletService'
import { showToast } from '../utils/toast'
import { useNewOrder } from '../state/useNewOrder'

const TONE_PRIMARY = 'bg-primary/10 text-primary'
const TONE_ACCENT = 'bg-accent/15 text-accent'

/**
 * Menu Management. `standalone` puts the very same screen on a billing page
 * (`/billing/menu`) under the billing header instead of the Menu section's shell.
 */
export default function MenuManagement({ standalone = false }: { standalone?: boolean }) {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const { encryptedOutletId } = useAuth()
  const [outlets, setOutlets] = useState<OutletSummary[]>([])
  const [viewing, setViewing] = useState<OutletSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OutletSummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const memberships = await listOutletsApi()
      setOutlets(
        await Promise.all(memberships.map((m) => getOutletApi(m.encrypted_id))),
      )
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load outlets.')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [refresh])

  async function confirmDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await deleteOutletApi(deleteTarget.id)
      showToast('Outlet deleted successfully')
      setDeleteTarget(null)
      await refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete outlet.')
    } finally {
      setDeleting(false)
    }
  }

  const stats = useMemo(() => {
    const allCuisines = new Set(outlets.flatMap((o) => o.cuisines))
    return {
      totalOutlets: outlets.length,
      totalCuisines: allCuisines.size,
    }
  }, [outlets])

  const content = (
    <>
      {/* ── Header ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Menu Management</h1>
          <p className="mt-0.5 text-sm text-muted">
            Manage menu channels, outlets &amp; configuration
          </p>
        </div>
        <PrimaryButton onClick={() => navigate('/menu/add-outlet')}>
          <Plus size={15} />
          <span>Add Outlet</span>
        </PrimaryButton>
      </div>

      {/* ── Stats Row ── */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${TONE_PRIMARY}`}>
              <Store size={17} />
            </span>
            <p className="text-sm font-medium text-muted">Total Outlets</p>
          </div>
          <p className="text-2xl font-bold tracking-tight text-ink">
            {stats.totalOutlets}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${TONE_ACCENT}`}>
              <UtensilsCrossed size={17} />
            </span>
            <p className="text-sm font-medium text-muted">Cuisines</p>
          </div>
          <p className="text-2xl font-bold tracking-tight text-ink">
            {stats.totalCuisines}
          </p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <section className="mb-6">
        <h2 className="mb-3 text-base font-bold text-ink">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/menu/all-in-one')}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-8 text-left transition-colors hover:border-primary/35 hover:bg-page/50"
          >
            <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${TONE_PRIMARY}`}>
              <UtensilsCrossed size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                All In One Menu
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Manage menu &amp; its related configuration across all channels
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/menu/add-outlet')}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-8 text-left transition-colors hover:border-primary/35 hover:bg-page/50"
          >
            <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${TONE_ACCENT}`}>
              <MonitorSmartphone size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                Add Virtual Outlet
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Create a new virtual outlet with independent menu control
              </span>
            </span>
          </button>
        </div>
      </section>

      {/* ── Your Outlets ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Your Outlets{' '}
            <span className="font-normal text-muted">
              ({outlets.length})
            </span>
          </h2>
          {outlets.length > 0 ? (
            <OutlineButton
              onClick={() => navigate('/menu/add-outlet')}
            >
              <Plus size={14} />
              <span>Add Outlet</span>
            </OutlineButton>
          ) : null}
        </div>

        {outlets.length === 0 ? (
          <div className="rounded-xl border border-line bg-card px-6 py-16 text-center">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-page text-muted">
              <Store size={22} />
            </span>
            <p className="text-base font-semibold text-ink">No outlets yet</p>
            <p className="mt-1 text-sm text-muted">
              Create your first outlet to start managing menus independently.
            </p>
            <div className="mx-auto mt-5">
              <PrimaryButton onClick={() => navigate('/menu/add-outlet')}>
                <Plus size={15} />
                <span>Create Outlet</span>
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {outlets.map((outlet) => (
              <OutletCard
                key={outlet.id}
                outlet={outlet}
                isActive={outlet.id === encryptedOutletId}
                onView={() => setViewing(outlet)}
                onEdit={() => navigate(`/menu/outlet/${outlet.id}/edit`)}
                onDelete={() => setDeleteTarget(outlet)}
              />
            ))}
            <button
              type="button"
              onClick={() => navigate('/menu/add-outlet')}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-transparent p-8 text-muted transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Add Outlet</span>
            </button>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete outlet"
        target={deleteTarget?.name}
        message="This outlet will be removed from your outlet list and the outlet switcher."
        note="The outlet is archived, not erased. Its orders and history are kept."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />

      <OutletDetailsModal
        outlet={viewing}
        onClose={() => setViewing(null)}
        onEdit={() => {
          if (viewing) navigate(`/menu/outlet/${viewing.id}/edit`)
        }}
      />
    </>
  )

  if (standalone) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-page">
        <BillingHeader
          billNo={billNo}
          onBillNoChange={setBillNo}
          onNewOrder={() => startNewOrder()}
          onViewKot={() => navigate('/billing?kot=1')}
        />
        <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
          <h1 className="text-lg font-bold text-primary">Menu Management</h1>
          <button
            type="button"
            onClick={() => navigate('/billing/operations')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{content}</div>
      </div>
    )
  }

  return (
    <MenuPageShell
      title={<span className="text-primary">Menu Management</span>}
      backTo="/dashboard"
    >
      {content}
    </MenuPageShell>
  )
}

function OutletCard({
  outlet,
  isActive,
  onView,
  onEdit,
  onDelete,
}: {
  outlet: OutletSummary
  isActive: boolean
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="group relative flex flex-col rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Store size={18} />
        </span>
        <span className="inline-flex h-6 items-center rounded-full bg-page px-2.5 text-xs font-medium text-muted">
          {outlet.outlet_type}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-ink">{outlet.name}</h3>
      {outlet.alias ? (
        <p className="mt-0.5 text-xs text-muted">{outlet.alias}</p>
      ) : null}

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Phone size={12} />
          <span>{outlet.phone || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <MapPin size={12} />
          <span>
            {[outlet.area, outlet.city].filter(Boolean).join(', ') || '—'}
          </span>
        </div>
      </div>

      {outlet.cuisines.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {outlet.cuisines.slice(0, 3).map((c) => (
            <span
              key={c}
              className="inline-flex h-5 items-center rounded bg-primary/8 px-1.5 text-[10px] font-medium text-primary"
            >
              {c}
            </span>
          ))}
          {outlet.cuisines.length > 3 ? (
            <span className="inline-flex h-5 items-center rounded bg-page px-1.5 text-[10px] font-medium text-muted">
              +{outlet.cuisines.length - 3}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <button
          type="button"
          onClick={onView}
          className="h-8 flex-1 rounded-md border border-line bg-page text-xs font-medium text-ink transition-colors hover:bg-card"
        >
          View
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="h-8 flex-1 rounded-md border border-line bg-page text-xs font-medium text-ink transition-colors hover:bg-card"
        >
          Edit
        </button>
        <TooltipWrapper
          label={
            isActive
              ? 'Switch to another outlet to delete this one'
              : 'Delete outlet'
          }
        >
          <button
            type="button"
            aria-label="Delete outlet"
            disabled={isActive}
            onClick={onDelete}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
          >
            <Trash2 size={14} />
          </button>
        </TooltipWrapper>
      </div>
    </article>
  )
}
