import { useNavigate } from 'react-router-dom'
import { MonitorSmartphone, UtensilsCrossed } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'

export default function MenuManagement() {
  const navigate = useNavigate()

  return (
    <MenuPageShell
      title={<span className="text-primary">Menu Management</span>}
      backTo="/dashboard"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col items-start rounded-xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UtensilsCrossed size={24} />
          </span>
          <h2 className="text-sm font-semibold text-deep">All In One Menu</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Manage Menu &amp; it&apos;s related configuration from below.
          </p>
          <button
            type="button"
            onClick={() => navigate('/menu/all-in-one')}
            className="mt-5 h-9 rounded-lg border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            Manage Menu
          </button>
        </article>

        <article className="flex flex-col items-start rounded-xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MonitorSmartphone size={24} />
          </span>
          <h2 className="text-sm font-semibold text-deep">Add Virtual Outlet</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Create a new virtual outlet and have the ability to control the menu
            independently.
          </p>
          <button
            type="button"
            className="mt-5 h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Add Outlet
          </button>
        </article>
      </div>
    </MenuPageShell>
  )
}
