import { useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  getCurrencyRatesApi,
  saveCurrencyRatesApi,
  type CurrencyRates,
} from '../../services/outletService'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

type Entry = { code: string; rateText: string; printOnBill: boolean }

export default function BillingCurrencyConversion() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, isAdmin, hasPermission } = useAuth()
  // Everyone with billing can see the rates; only outlet management changes them.
  const canManage = isAdmin || hasPermission('outlets.change_outlet')
  const [billNo, setBillNo] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [base, setBase] = useState('INR')
  const [maxPrinted, setMaxPrinted] = useState(3)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const apply = useCallback((data: CurrencyRates) => {
    setBase(data.base_currency)
    setMaxPrinted(data.max_printed_on_bill)
    setEntries(
      data.currencies.map((c) => ({
        code: c.code,
        rateText: c.rate == null ? '' : String(c.rate),
        printOnBill: c.print_on_bill,
      })),
    )
  }, [])

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      apply(await getCurrencyRatesApi(encryptedOutletId))
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load currencies')
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, apply])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  const printedCount = entries.filter((e) => e.printOnBill).length

  function patch(code: string, changes: Partial<Entry>) {
    setEntries((cur) => cur.map((e) => (e.code === code ? { ...e, ...changes } : e)))
  }

  async function handleSave() {
    if (!encryptedOutletId) return
    for (const entry of entries) {
      const text = entry.rateText.trim()
      if (text !== '' && !(Number(text) > 0)) {
        showToast(`${entry.code}: the rate must be a number above zero`)
        return
      }
      if (entry.printOnBill && text === '') {
        showToast(`${entry.code}: enter a rate before selecting it for the bill`)
        return
      }
    }
    setSaving(true)
    try {
      const saved = await saveCurrencyRatesApi(
        encryptedOutletId,
        entries.map((e) => ({
          code: e.code,
          rate: e.rateText.trim() === '' ? null : Number(e.rateText),
          print_on_bill: e.printOnBill,
        })),
      )
      apply(saved)
      showToast('Currency rates saved')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save currency rates')
    } finally {
      setSaving(false)
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

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Currency listing</h1>
          <button
            type="button"
            onClick={() => navigate('/billing/operations')}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>
        <p className="mb-3 text-right text-sm text-blue-600">
          Note: The user can select up to {maxPrinted} currency to be printed in the bill
        </p>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              Loading currencies…
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-2 bg-page text-sm font-bold text-ink md:grid">
                <span className="px-5 py-4">Base currency</span>
                <span className="px-5 py-4">Base currency</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2">
                {entries.map((entry) => {
                  const blocked = !entry.printOnBill && printedCount >= maxPrinted
                  return (
                    <div
                      key={entry.code}
                      className="grid grid-cols-[auto_auto_minmax(0,1fr)_3.5rem_2rem] items-center gap-x-3 border-t border-line px-5 py-3 text-sm text-ink"
                    >
                      <span className="whitespace-nowrap">1 {base}</span>
                      <span>=</span>
                      <input
                        value={entry.rateText}
                        readOnly={!canManage}
                        onChange={(e) => patch(entry.code, { rateText: e.target.value })}
                        inputMode="decimal"
                        aria-label={`Rate for ${entry.code}`}
                        className="h-10 w-full min-w-0 rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary read-only:bg-page"
                      />
                      <span className="font-medium">{entry.code}</span>
                      <input
                        type="checkbox"
                        checked={entry.printOnBill}
                        disabled={!canManage || blocked}
                        onChange={(e) => patch(entry.code, { printOnBill: e.target.checked })}
                        aria-label={`Print ${entry.code} on the bill`}
                        className="size-4 accent-[var(--color-primary)]"
                      />
                    </div>
                  )
                })}
              </div>
              {canManage ? (
                <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
                  <button
                    type="button"
                    onClick={() => void load()}
                    disabled={saving}
                    className="inline-flex h-10 items-center rounded-lg border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
