import { useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader2, Plus, Workflow, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  getCustomOrderStatusesApi,
  saveCustomOrderStatusesApi,
  type CustomStatusStage,
} from '../../services/outletService'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

const MAX_PER_STAGE = 3

type Draft = { key: number; name: string }
type Drafts = Record<CustomStatusStage, Draft[]>

/** The built-in steps in order; `after` is the slot that follows each one. */
const FLOW: Array<{ label: string; tone: string; after?: CustomStatusStage }> = [
  { label: 'Order Accepted', tone: 'bg-primary', after: 'accepted' },
  { label: 'Food Is Ready', tone: 'bg-orange-500', after: 'food_ready' },
  { label: 'Dispatched', tone: 'bg-blue-500', after: 'dispatched' },
  { label: 'Delivered', tone: 'bg-lime-600' },
]

let nextKey = 1

function Connector() {
  return <div className="h-10 w-0 border-l-2 border-dashed border-line" />
}

export default function BillingCustomOrderStatus() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, isAdmin, hasPermission } = useAuth()
  // Everyone with billing can see the flow; only outlet management changes it.
  const canManage = isAdmin || hasPermission('outlets.change_outlet')
  const [billNo, setBillNo] = useState('')
  const [drafts, setDrafts] = useState<Drafts>({ accepted: [], food_ready: [], dispatched: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      const { statuses } = await getCustomOrderStatusesApi(encryptedOutletId)
      const next: Drafts = { accepted: [], food_ready: [], dispatched: [] }
      for (const row of statuses) {
        next[row.after_stage].push({ key: nextKey++, name: row.name })
      }
      setDrafts(next)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load statuses')
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  function add(stage: CustomStatusStage) {
    setDrafts((cur) =>
      cur[stage].length >= MAX_PER_STAGE
        ? cur
        : { ...cur, [stage]: [...cur[stage], { key: nextKey++, name: '' }] },
    )
  }

  function rename(stage: CustomStatusStage, key: number, name: string) {
    setDrafts((cur) => ({
      ...cur,
      [stage]: cur[stage].map((d) => (d.key === key ? { ...d, name } : d)),
    }))
  }

  function remove(stage: CustomStatusStage, key: number) {
    setDrafts((cur) => ({ ...cur, [stage]: cur[stage].filter((d) => d.key !== key) }))
  }

  async function handleSave() {
    if (!encryptedOutletId) return
    const payload = (Object.keys(drafts) as CustomStatusStage[]).flatMap((stage) =>
      drafts[stage].map((d) => ({ after_stage: stage, name: d.name.trim() })),
    )
    if (payload.some((p) => !p.name)) {
      showToast('Give every new status a name, or remove it')
      return
    }
    setSaving(true)
    try {
      await saveCustomOrderStatusesApi(encryptedOutletId, payload)
      showToast('Custom order statuses saved')
      await load()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save statuses')
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Custom Order Status Configuration</h1>
          <button
            type="button"
            onClick={() => navigate('/billing/operations')}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="p-4">
            <div className="flex gap-4 rounded-xl border border-blue-300 bg-blue-50/60 p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Workflow size={22} />
              </span>
              <div>
                <h2 className="text-base font-bold text-ink">Add customized order status</h2>
                <p className="mt-1 text-sm text-ink">
                  Tired of manually tracking orders in the reports? Streamline your operations with
                  customized order statuses! This feature lets you add custom status buttons to live
                  view and KDS order cards to easily keep track of each order. Stop wasting time and
                  energy on manual updates and take advantage of this convenient solution that allows
                  you to keep your staff up-to-date with the progress of their orders in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-line px-4 py-8">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
                <Loader2 size={16} className="animate-spin" />
                Loading statuses…
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-xl flex-col items-center">
                {FLOW.map((step) => {
                  const stage = step.after
                  const items = stage ? drafts[stage] : []
                  return (
                    <div key={step.label} className="flex w-full flex-col items-center">
                      <span
                        className={`min-w-[180px] rounded-md px-6 py-2 text-center text-sm font-bold text-white ${step.tone}`}
                      >
                        {step.label}
                      </span>
                      {stage ? (
                        <>
                          <Connector />
                          <div className="flex w-full flex-col items-center gap-2">
                            {items.map((item) => (
                              <div
                                key={item.key}
                                className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5"
                              >
                                <input
                                  value={item.name}
                                  onChange={(e) => rename(stage, item.key, e.target.value)}
                                  readOnly={!canManage}
                                  maxLength={30}
                                  autoFocus={canManage && item.name === ''}
                                  placeholder="Status name"
                                  aria-label={`Custom status after ${step.label}`}
                                  className="h-8 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                                />
                                {canManage ? (
                                  <button
                                    type="button"
                                    onClick={() => remove(stage, item.key)}
                                    aria-label="Remove status"
                                    data-tooltip="Remove status"
                                    className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-page hover:text-ink"
                                  >
                                    <X size={14} />
                                  </button>
                                ) : null}
                              </div>
                            ))}
                            {canManage && items.length < MAX_PER_STAGE ? (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => add(stage)}
                                  aria-label={`Add status after ${step.label}`}
                                  data-tooltip="Add status"
                                  className="inline-flex size-14 items-center justify-center rounded-full bg-page text-ink hover:bg-line/60"
                                >
                                  <Plus size={18} />
                                </button>
                                <span className="rounded-full bg-blue-50 px-6 py-3 text-sm text-ink">
                                  Add up to {MAX_PER_STAGE} new status buttons here
                                </span>
                              </div>
                            ) : null}
                          </div>
                          <Connector />
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {canManage ? (
            <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
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
                disabled={saving || loading}
                className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
