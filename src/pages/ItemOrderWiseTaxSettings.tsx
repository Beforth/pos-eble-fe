import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { listTaxesApi, updateTaxApi } from '../services/menuService'
import { useAuth } from '../auth/AuthContext'
import { showToast } from '../utils/toast'
import type { Tax } from '../types/menu'

type TaxCalcMode = 'item' | 'order'

/**
 * Item-vs-order-wise is a per-tax flag (`menus.Tax.item_order_wise`), not an
 * outlet-wide switch, so this screen writes the flag onto every tax of the
 * outlet. Order-wise taxes run once on the whole bill; item-wise taxes are
 * priced on each line and then summed.
 */
export default function ItemOrderWiseTaxSettings() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [mode, setMode] = useState<TaxCalcMode>('order')
  const [initialMode, setInitialMode] = useState<TaxCalcMode | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) return
    listTaxesApi(encryptedOutletId)
      .then((rows: Tax[]) => {
        if (cancelled || rows.length === 0) return
        // Only infer the current mode when the taxes agree; a mixed set has no
        // single answer to pre-select, so leave the default and let the user pick.
        const flags = new Set(rows.map((row) => (row.item_order_wise ? 'order' : 'item')))
        if (flags.size === 1) {
          const value = flags.has('order') ? 'order' : 'item'
          setMode(value)
          setInitialMode(value)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load taxes',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  function goBack() {
    navigate('/menu/taxes')
  }

  async function handleSave() {
    if (!encryptedOutletId) return
    setSaving(true)
    try {
      const rows = await listTaxesApi(encryptedOutletId)
      // Sequential on purpose: each write is a separate small PATCH, and a
      // burst of them is pointless for a handful of taxes.
      for (const row of rows) {
        await updateTaxApi(encryptedOutletId, row.id, {
          item_order_wise: mode === 'order',
        })
      }
      setInitialMode(mode)
      showToast(
        rows.length === 0
          ? 'No taxes configured yet'
          : `Taxes set to ${mode}-wise`,
      )
      goBack()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save tax settings',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <MenuPageShell
      backTo="/menu/taxes"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/taxes" className="text-primary hover:underline">
            Tax Configuration
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">
            Item / Order wise Tax Settings
          </span>
        </span>
      }
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-card">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-ink">
            Item / Order Wise Tax Settings
          </h2>
        </div>

        <div className="px-5 py-6 sm:px-6">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="radio"
                name="tax-calc-mode"
                checked={mode === 'item'}
                onChange={() => setMode('item')}
                className="size-4 cursor-pointer accent-primary"
              />
              Calculate Tax on Item Wise
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="radio"
                name="tax-calc-mode"
                checked={mode === 'order'}
                onChange={() => setMode('order')}
                className="size-4 cursor-pointer accent-primary"
              />
              Calculate Tax on Order Wise
            </label>
          </div>
          <p className="mt-4 text-xs text-muted">
            This applies to every tax configured for the outlet. Item-wise taxes
            are priced on each line and then summed; order-wise taxes run once
            on the whole bill. Taxes already assigned to items keep working
            either way — only the basis changes.
            {initialMode && initialMode !== mode
              ? ' Unsaved change.'
              : ''}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-page/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-primary bg-card px-4 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
