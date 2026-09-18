import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { StockUpdateCycleSelect, type StockUpdateCycle } from '../../components/inventory/StockUpdateCycleSelect'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WRITE_PERMISSION,
  getInventorySettingsApi,
  updateInventorySettingsApi,
  type InventorySettings,
} from '../../services/inventoryService'

const CYCLE_VALUES: StockUpdateCycle[] = [
  'all',
  'daily',
  'weekly',
  'bi-weekly',
  'monthly',
  'yearly',
]

function isCycle(value: string): value is StockUpdateCycle {
  return (CYCLE_VALUES as string[]).includes(value)
}

export default function InventorySettings() {
  const { encryptedOutletId, hasPermission, user } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<InventorySettings | null>(null)

  useEffect(() => {
    if (!encryptedOutletId) return
    setLoading(true)
    getInventorySettingsApi(encryptedOutletId)
      .then(setSettings)
      .catch((err) => {
        showToast(
          err instanceof ApiError
            ? err.message
            : 'Unable to load inventory settings',
        )
      })
      .finally(() => setLoading(false))
  }, [encryptedOutletId])

  async function handleSave() {
    if (!encryptedOutletId || !settings || !canWrite) return
    setSaving(true)
    try {
      const updated = await updateInventorySettingsApi(encryptedOutletId, {
        stock_update_cycle: settings.stock_update_cycle,
        default_update_inventory_stock:
          settings.default_update_inventory_stock,
        allow_negative_stock: settings.allow_negative_stock,
        sales_invoice_label: settings.sales_invoice_label,
        sales_rounding: settings.sales_rounding,
        show_cess_tax: settings.show_cess_tax,
        use_avg_purchase_price: settings.use_avg_purchase_price,
        sales_terms: settings.sales_terms,
      })
      setSettings(updated)
      showToast('Settings saved')
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to save settings',
      )
    } finally {
      setSaving(false)
    }
  }

  function patch(partial: Partial<InventorySettings>) {
    setSettings((prev) => (prev ? { ...prev, ...partial } : prev))
  }

  return (
    <InventoryPageShell activeItem="settings">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Inventory Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Outlet preferences for stock posting and sales documents
            {user?.outlet ? ` · ${user.outlet}` : ''}.
          </p>
        </div>
        {canWrite ? (
          <PrimaryButton onClick={() => void handleSave()} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save Changes'}
          </PrimaryButton>
        ) : null}
      </div>

      {loading || !settings ? (
        <div className="rounded-xl border border-line bg-card px-6 py-16 text-center text-sm text-muted">
          Loading…
        </div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-card p-4 sm:p-5">
            <h2 className="mb-4 text-base font-semibold text-ink">Stock</h2>
            <div className="space-y-4">
              <StockUpdateCycleSelect
                value={
                  isCycle(settings.stock_update_cycle)
                    ? settings.stock_update_cycle
                    : 'daily'
                }
                onChange={(value) => patch({ stock_update_cycle: value })}
              />
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={settings.default_update_inventory_stock}
                  onChange={(event) =>
                    patch({
                      default_update_inventory_stock: event.target.checked,
                    })
                  }
                  className="size-4 accent-primary"
                />
                Default “Update inventory stock” on for new documents
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={settings.allow_negative_stock}
                  onChange={(event) =>
                    patch({ allow_negative_stock: event.target.checked })
                  }
                  className="size-4 accent-primary"
                />
                Allow negative stock balances
              </label>
              <p className="text-xs text-muted">
                Negative stock is stored as a preference for now; posting still
                blocks insufficient qty until this flag is enforced on the
                ledger.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-card p-4 sm:p-5">
            <h2 className="mb-4 text-base font-semibold text-ink">
              Sales documents
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Invoice label
                </label>
                <input
                  type="text"
                  value={settings.sales_invoice_label}
                  onChange={(event) =>
                    patch({ sales_invoice_label: event.target.value })
                  }
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Rounding
                </label>
                <select
                  value={settings.sales_rounding}
                  onChange={(event) =>
                    patch({ sales_rounding: event.target.value })
                  }
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="none">None</option>
                  <option value="normal">Normal</option>
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={settings.show_cess_tax}
                  onChange={(event) =>
                    patch({ show_cess_tax: event.target.checked })
                  }
                  className="size-4 accent-primary"
                />
                Show CESS tax
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={settings.use_avg_purchase_price}
                  onChange={(event) =>
                    patch({ use_avg_purchase_price: event.target.checked })
                  }
                  className="size-4 accent-primary"
                />
                Use average purchase price
              </label>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Terms &amp; conditions
                </label>
                <textarea
                  value={settings.sales_terms}
                  onChange={(event) =>
                    patch({ sales_terms: event.target.value })
                  }
                  rows={4}
                  className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </InventoryPageShell>
  )
}
