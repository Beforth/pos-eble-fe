import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  Boxes,
  FileText,
  Info,
  Lightbulb,
  Search,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'

function EmptyIllustration() {
  return (
    <span className="relative mb-3 inline-flex text-muted">
      <FileText size={48} strokeWidth={1.25} className="text-muted/50" />
      <Search
        size={22}
        className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
      />
    </span>
  )
}

function WidgetCard({
  title,
  icon,
  children,
  className = '',
  headerRight,
}: {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  headerRight?: ReactNode
}) {
  return (
    <article
      className={`flex flex-col rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      {(title || headerRight || icon) && (
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <div className="flex items-center gap-2">
            {title ? (
              <h2 className="text-sm font-semibold text-ink">{title}</h2>
            ) : null}
            {icon}
          </div>
          {headerRight}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">{children}</div>
    </article>
  )
}

export default function InventoryOldDashboard() {
  const navigate = useNavigate()

  return (
    <InventoryPageShell activeItem="dashboard">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Inventory Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">Old dashboard view</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="h-9 rounded-lg border border-primary bg-card px-3 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          New Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* COGS */}
        <WidgetCard
          className="min-h-[280px] xl:col-span-5"
          headerRight={
            <button
              type="button"
              aria-label="Tip"
              className="rounded p-1 text-accent hover:bg-page"
            >
              <Lightbulb size={16} />
            </button>
          }
        >
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <EmptyIllustration />
            <p className="text-sm font-semibold text-ink">
              No Consumption Data Found.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs text-ink outline-none">
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 days</option>
            </select>
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs text-ink outline-none">
              <option>Category</option>
            </select>
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs text-ink outline-none">
              <option>Top 10</option>
            </select>
          </div>
        </WidgetCard>

        {/* Current Stock Price */}
        <WidgetCard
          className="min-h-[280px] xl:col-span-4"
          headerRight={
            <button
              type="button"
              aria-label="Info"
              className="rounded p-1 text-muted hover:bg-page"
            >
              <Info size={16} />
            </button>
          }
        >
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <EmptyIllustration />
            <p className="max-w-[220px] text-sm font-semibold text-ink">
              Add Up Your Purchase To Find The Current Stock Price.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs text-ink outline-none">
              <option>All Category</option>
            </select>
            <Link
              to="/inventory"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View →
            </Link>
          </div>
        </WidgetCard>

        {/* Right column */}
        <div className="flex flex-col gap-4 xl:col-span-3">
          <WidgetCard
            title="Pending Tasks"
            className="min-h-[130px] flex-1"
          >
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <EmptyIllustration />
              <p className="text-xs font-medium text-muted">
                There Is Currently No Data Available To Display.
              </p>
            </div>
          </WidgetCard>

          <WidgetCard
            title="Manage Profitability"
            className="min-h-[130px] flex-1"
            headerRight={
              <select className="h-7 rounded-md border border-line bg-card px-1.5 text-[11px] text-ink outline-none">
                <option>Today</option>
              </select>
            }
          >
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <EmptyIllustration />
              <p className="text-xs font-medium text-muted">
                There Is Currently No Data Available To Display.
              </p>
            </div>
          </WidgetCard>
        </div>

        {/* New Purchase */}
        <WidgetCard
          title="New Purchase"
          className="min-h-[240px] xl:col-span-7"
          icon={
            <Info size={14} className="text-muted" aria-hidden="true" />
          }
          headerRight={
            <select className="h-7 rounded-md border border-line bg-card px-1.5 text-[11px] text-ink outline-none">
              <option>3 days</option>
              <option>7 days</option>
            </select>
          }
        >
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <EmptyIllustration />
            <p className="mb-3 text-sm font-semibold text-ink">
              Add Up Your Purchase
            </p>
            <button
              type="button"
              className="h-9 rounded-lg border border-line bg-page px-4 text-sm font-semibold text-ink hover:bg-line/40"
            >
              Add Purchase
            </button>
          </div>
        </WidgetCard>

        {/* Raw Material Tracking */}
        <WidgetCard
          title="Raw Material Tracking"
          className="min-h-[240px] xl:col-span-5"
          icon={<Boxes size={15} className="text-muted" />}
        >
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <EmptyIllustration />
            <p className="text-xs font-medium text-muted">
              There Is Currently No Data Available To Display.
            </p>
          </div>
        </WidgetCard>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-ink">
            Here, You can customise the inventory dashboard, view the necessary
            widgets, and adjust the widget&apos;s priority.
          </p>
        </div>
        <button
          type="button"
          className="h-9 shrink-0 rounded-lg border border-primary bg-card px-4 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Customize
        </button>
      </div>
    </InventoryPageShell>
  )
}
