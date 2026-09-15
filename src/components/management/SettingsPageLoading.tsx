import { ReportsPageShell } from '../layout/ReportsPageShell'

/** Placeholder shell shown while a configuration page loads from the API. */
export function SettingsPageLoading() {
  return (
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      <div className="py-12 text-center text-sm text-muted">
        Loading settings…
      </div>
    </ReportsPageShell>
  )
}