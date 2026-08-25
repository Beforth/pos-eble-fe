import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard,
  MapPin,
  MonitorSmartphone,
  Phone,
  Plus,
  Store,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../components/menu/MenuActionButtons'
import { deleteOutlet, getOutlets, type OutletData } from '../mocks/outletStore'

const TONE_PRIMARY = 'bg-primary/10 text-primary'
const TONE_ACCENT = 'bg-accent/15 text-accent'
const TONE_GREEN = 'bg-emerald-50 text-emerald-600'

export default function MenuManagement() {
  const navigate = useNavigate()
  const [outlets, setOutlets] = useState<OutletData[]>([])

  const refresh = useCallback(() => {
    setOutlets(getOutlets())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [refresh])

  const stats = useMemo(() => {
    const allCuisines = new Set(outlets.flatMap((o) => o.cuisines))
    const allPayments = new Set(outlets.flatMap((o) => o.paymentTypes))
    return {
      totalOutlets: outlets.length,
      totalCuisines: allCuisines.size,
      totalPayments: allPayments.size,
    }
  }, [outlets])

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete outlet "${name}"?`)) return
    deleteOutlet(id)
    refresh()
  }

  return (
    <MenuPageShell
      title={<span className="text-primary">Menu Management</span>}
      backTo="/dashboard"
    >
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
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
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
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${TONE_GREEN}`}>
              <CreditCard size={17} />
            </span>
            <p className="text-sm font-medium text-muted">Payment Methods</p>
          </div>
          <p className="text-2xl font-bold tracking-tight text-ink">
            {stats.totalPayments}
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
                onView={() =>
                  navigate('/menu/add-outlet', {
                    state: { outletId: outlet.id },
                  })
                }
                onDelete={() => handleDelete(outlet.id, outlet.outletName)}
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
    </MenuPageShell>
  )
}

function OutletCard({
  outlet,
  onView,
  onDelete,
}: {
  outlet: OutletData
  onView: () => void
  onDelete: () => void
}) {
  return (
    <article className="group relative flex flex-col rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Store size={18} />
        </span>
        <span className="inline-flex h-6 items-center rounded-full bg-page px-2.5 text-xs font-medium text-muted">
          {outlet.outletType}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-ink">{outlet.outletName}</h3>
      {outlet.outletAlias ? (
        <p className="mt-0.5 text-xs text-muted">{outlet.outletAlias}</p>
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
          View Details
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-danger"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  )
}
