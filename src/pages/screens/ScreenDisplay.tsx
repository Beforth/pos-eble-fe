import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCheck,
  Eye,
  MonitorSmartphone,
  Plus,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  categoryName,
  debugScreenMatch,
  filterTicketForScreen,
  type FilteredScreenTicket,
  type KotScreen,
} from '../../mocks/screensData'
import {
  headerClassForOrderType,
  labelForOrderType,
  sortKotTicketsForDisplay,
  type KotTicket,
} from '../../mocks/kotViewData'
import { fetchScreen } from '../../services/screenService'
import { getMenuItemById } from '../../mocks/menuItemsData'
import {
  appendKotTicket,
  loadAllKotTickets,
  removeKotTicket,
} from '../../utils/tableStatusStore'
import { upsertScreen } from '../../utils/screenStore'
import { EditScreenModal } from '../../components/screens/EditScreenModal'

const POLL_INTERVAL_MS = 1500
const TICK_INTERVAL_MS = 1000

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const hh = Math.floor(totalSec / 3600)
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  return hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ScreenDisplay() {
  const { id } = useParams<{ id: string }>()
  const [screen, setScreen] = useState<KotScreen | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [tickets, setTickets] = useState<KotTicket[]>([])
  const [now, setNow] = useState(Date.now())
  const [editOpen, setEditOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }

  const loadScreenData = useCallback(() => {
    if (!id) return
    fetchScreen(id)
      .then((entry) => {
        if (entry) {
          setScreen(entry)
          setNotFound(false)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
  }, [id])

  useEffect(() => {
    loadScreenData()
  }, [loadScreenData])

  const refreshTickets = useCallback(() => {
    setTickets(loadAllKotTickets())
  }, [])

  useEffect(() => {
    refreshTickets()
    const interval = window.setInterval(refreshTickets, POLL_INTERVAL_MS)

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === 'pos-eble-all-kot-tickets' ||
        event.key === 'pos-eble-kot-screens'
      ) {
        refreshTickets()
        loadScreenData()
      }
    }

    const onCustomEvent = () => {
      refreshTickets()
      loadScreenData()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('pos-eble-all-kot-tickets', onCustomEvent)
    window.addEventListener('pos-eble-kot-screens', onCustomEvent)

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('pos-eble-kot-sync')
      channel.onmessage = () => {
        refreshTickets()
        loadScreenData()
      }
    } catch {
      // Fallback
    }

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('pos-eble-all-kot-tickets', onCustomEvent)
      window.removeEventListener('pos-eble-kot-screens', onCustomEvent)
      if (channel) channel.close()
    }
  }, [refreshTickets, loadScreenData])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [])

  const filtered = useMemo(() => {
    if (!screen) return []
    const entries = sortKotTicketsForDisplay(tickets)
      .map((ticket) => filterTicketForScreen(ticket, screen))
      .filter((entry): entry is FilteredScreenTicket => entry !== null)
    return [...entries].reverse()
  }, [tickets, screen])

  function handleComplete(ticketId: string) {
    const updated = removeKotTicket(ticketId)
    setTickets(updated)
    showToast('KOT completed / cleared')
  }

  function handleEnableAllCategories() {
    if (!screen) return
    const updated = upsertScreen({
      id: screen.id,
      name: screen.name,
      categoryIds: [],
      itemIds: [],
    })
    setScreen(updated)
    showToast('Screen updated: Showing all categories')
  }

  function handleCreateSampleKot() {
    const sample: KotTicket = {
      id: `kot-T1-1-${Date.now()}`,
      kotNo: 1,
      tableId: 't1',
      tableNo: 'T1',
      orderType: 'dine-in',
      biller: 'biller (biller)',
      persons: 2,
      createdAt: Date.now(),
      status: 'active',
      items: [
        {
          id: `line-i1-${Date.now()}`,
          itemId: 'i1',
          name: 'Paani Puri',
          qty: 2,
          price: 78.9,
        },
        {
          id: `line-i8-${Date.now() + 1}`,
          itemId: 'i8',
          name: 'Regular Dabeli',
          qty: 1,
          price: 40,
        },
      ],
      note: 'Extra spicy',
    }
    const next = appendKotTicket(sample)
    setTickets(next)
    showToast('Demo KOT created for Table T1')
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 text-center">
        <MonitorSmartphone size={40} className="mb-4 text-muted" />
        <p className="text-base font-semibold text-ink">Screen not found</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Screen &ldquo;{id}&rdquo; was not found in storage.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/screens"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <ArrowLeft size={16} />
            Back to Screens
          </Link>
          <button
            type="button"
            onClick={() => {
              if (id) {
                const created = upsertScreen({
                  id,
                  name: 'Kitchen Display Screen',
                  categoryIds: [],
                  itemIds: [],
                })
                setScreen(created)
                setNotFound(false)
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-page"
          >
            <Sparkles size={16} className="text-primary" />
            Initialize this Screen
          </button>
        </div>
      </div>
    )
  }

  if (!screen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-sm text-muted">
        Loading screen…
      </div>
    )
  }

  const isMasterScreen =
    (screen.categoryIds?.length ?? 0) === 0 &&
    (screen.itemIds?.length ?? 0) === 0

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <EditScreenModal
        open={editOpen}
        screen={screen}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          setScreen(updated)
          setEditOpen(false)
          showToast(`"${updated.name}" updated`)
        }}
      />

      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-card px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/screens"
            aria-label="Back to screens"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-muted hover:bg-page hover:text-ink"
          >
            <ArrowLeft size={17} />
          </Link>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <MonitorSmartphone size={18} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-ink sm:text-lg">
                {screen.name}
              </h1>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                title="Configure screen filters"
                className="inline-flex items-center gap-1 rounded-md border border-line bg-page px-2 py-0.5 text-xs font-medium text-muted hover:border-primary/40 hover:text-primary"
              >
                <Settings size={13} />
                Filters
              </button>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              {isMasterScreen ? (
                <span className="rounded border border-success/40 bg-success/10 px-1.5 py-px text-[11px] font-medium text-success">
                  All Categories (Master Screen)
                </span>
              ) : (
                <>
                  {screen.categoryIds.map((categoryId) => (
                    <span
                      key={categoryId}
                      className="rounded border border-line bg-page px-1.5 py-px text-[11px] text-muted"
                    >
                      {categoryName(categoryId)}
                    </span>
                  ))}
                  {(screen.itemIds ?? []).map((itemId) => {
                    const item = getMenuItemById(itemId)
                    if (!item) return null
                    return (
                      <span
                        key={itemId}
                        className="rounded border border-primary/40 bg-primary/5 px-1.5 py-px text-[11px] text-ink"
                      >
                        {item.name}
                      </span>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-xs sm:text-sm">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="font-semibold text-ink">{filtered.length} Pending</span>
            </span>
          </div>
          <span className="rounded-lg border border-line bg-page px-2.5 py-1 font-mono text-xs text-muted">
            {new Date(now).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MonitorSmartphone size={30} />
          </span>
          <p className="text-base font-semibold text-ink">No pending KOTs</p>
          <p className="mt-1 max-w-md text-sm text-muted">
            {isMasterScreen
              ? 'New KOTs sent from Billing will appear here in real time.'
              : `This screen is currently listening for: ${screen.categoryIds.map(categoryName).join(', ') || 'Selected items'}.`}
          </p>

          {/* Quick Action if categories mismatched */}
          {tickets.length > 0 && !isMasterScreen ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleEnableAllCategories}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                <Eye size={14} />
                Show All Categories on this Screen
              </button>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-xs font-semibold text-ink hover:bg-page"
              >
                <Settings size={14} />
                Edit Category Filters
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/billing"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                <Plus size={14} />
                Go to Billing & Place Order
              </Link>
              <button
                type="button"
                onClick={handleCreateSampleKot}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-xs font-semibold text-ink hover:bg-page"
              >
                <Sparkles size={14} className="text-primary" />
                Add Demo KOT
              </button>
            </div>
          ) : null}

          {tickets.length > 0 ? (
            <details className="mt-6 w-full max-w-lg rounded-xl border border-dashed border-primary/50 bg-card p-3.5 text-left shadow-xs">
              <summary className="cursor-pointer text-xs font-semibold text-primary">
                Diagnostics ({tickets.length} KOTs in storage)
              </summary>
              <div className="mt-2 space-y-3 text-[11px] text-muted">
                <div>
                  <p className="font-semibold text-ink">Active Screen Filters:</p>
                  <p>
                    {screen.categoryIds.length > 0
                      ? screen.categoryIds
                          .map((cId) => `${cId} (${categoryName(cId)})`)
                          .join(', ')
                      : 'None (Showing all categories)'}
                  </p>
                </div>
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-lg border border-line bg-page p-2.5"
                  >
                    <div className="flex items-center justify-between font-semibold text-ink">
                      <span>
                        {ticket.tableNo} · KOT #{ticket.kotNo} · {ticket.orderType}
                      </span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                        {ticket.status}
                      </span>
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {debugScreenMatch(ticket).map((item, index) => (
                        <li
                          key={`${ticket.id}-${index}`}
                          className="flex items-center justify-between border-t border-line/60 pt-0.5"
                        >
                          <span className="font-medium text-ink">
                            &ldquo;{item.name}&rdquo;
                          </span>
                          <span>
                            Category: {item.categoryId ? categoryName(item.categoryId) : 'Uncategorized'} · Diet: {item.diet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(({ ticket, items, amount }) => {
              const isReady = ticket.status === 'ready'
              return (
                <article
                  key={ticket.id}
                  className={`flex flex-col overflow-hidden rounded-xl border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all ${
                    isReady
                      ? 'border-success/60 ring-1 ring-success/30'
                      : 'border-line hover:border-primary/40'
                  }`}
                >
                  <header
                    className={`flex items-start justify-between gap-2 px-3 py-2 text-xs font-semibold ${headerClassForOrderType(ticket.orderType)}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight">
                        {ticket.tableNo} {labelForOrderType(ticket.orderType)}
                      </p>
                      <p className="mt-0.5 opacity-90">KOT #{ticket.kotNo}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <p className="font-mono tabular-nums">
                        {formatElapsed(now - ticket.createdAt)}
                      </p>
                      <p className="tabular-nums opacity-80 text-[11px]">
                        {formatTime(ticket.createdAt)}
                      </p>
                    </div>
                  </header>

                  <div className="flex flex-1 flex-col px-3 py-2.5">
                    {ticket.persons > 0 ? (
                      <p className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted">
                        <Users size={12} />
                        {ticket.persons} Persons
                      </p>
                    ) : (
                      <div className="mb-1" />
                    )}

                    <ul className="flex-1 space-y-1.5">
                      {items.map((item) => (
                        <li
                          key={`${ticket.id}-${item.id}`}
                          className="flex items-start justify-between gap-2 border-b border-line/40 pb-1 last:border-b-0"
                        >
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span
                              className={`size-1.5 shrink-0 rounded-full ${
                                isReady ? 'bg-success' : 'bg-primary'
                              }`}
                            />
                            <span className="min-w-0 truncate text-sm font-semibold text-ink">
                              {item.name}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-bold tabular-nums text-ink">
                            ×{item.qty}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {ticket.note ? (
                      <p className="mt-2 rounded-lg bg-secondary/15 px-2 py-1 text-xs font-medium text-accent">
                        Note: {ticket.note}
                      </p>
                    ) : null}

                    <div className="mt-2 flex items-center justify-between border-t border-dashed border-line pt-2">
                      <p className="text-xs text-muted">{ticket.biller}</p>
                      <p className="text-sm font-bold text-ink">
                        ₹{amount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-line pt-2">
                      <button
                        type="button"
                        onClick={() => handleComplete(ticket.id)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-line bg-page px-2.5 text-xs font-semibold text-muted hover:bg-card hover:text-primary"
                        title="Clear from kitchen screen"
                      >
                        <CheckCheck size={14} />
                        Done
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </main>
      )}
    </div>
  )
}
