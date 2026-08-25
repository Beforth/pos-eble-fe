import type { ReactNode } from 'react'

export function ConfigSectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] [&:has([aria-expanded=true])]:z-30">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 max-w-3xl text-xs leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="border-t border-line px-4 py-4">{children}</div>
      ) : null}
    </section>
  )
}

export function ConfigFormRow({
  label,
  required,
  align = 'start',
  children,
}: {
  label: ReactNode
  required?: boolean
  align?: 'center' | 'start'
  children: ReactNode
}) {
  return (
    <div
      className={`grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4 ${
        align === 'center' ? 'sm:items-center' : 'sm:items-start'
      }`}
    >
      <label className="text-sm font-medium text-ink sm:pt-2.5">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function MutedHelp({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
  )
}

export function ConfigSaveBar({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        Save Changes
      </button>
    </div>
  )
}

export function ConfigBreadcrumb({
  onNavigate,
  current,
  parent = 'Outlet Configuration',
}: {
  onNavigate: () => void
  current: string
  parent?: string
}) {
  return (
    <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
      <span
        role="button"
        tabIndex={0}
        onClick={onNavigate}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onNavigate()
        }}
        className="cursor-pointer text-primary hover:underline"
      >
        {parent}
      </span>
      <span className="font-normal text-muted">&gt;</span>
      <span className="font-semibold text-ink">{current}</span>
    </span>
  )
}
