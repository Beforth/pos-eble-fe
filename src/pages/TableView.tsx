import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../utils/toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, Plus, RefreshCw } from 'lucide-react'
import { BillingHeader } from '../components/billing/BillingHeader'
import { CaptainOrdersHeader } from '../components/captainorders/CaptainOrdersHeader'
import {
  TABLE_STATUS_LEGEND,
  tableCardClass,
  type TableFloorStatus,
} from '../mocks/billingTables'
import {
  formatElapsedMinutes,
  formatTableAmount,
  loadTableSessions,
  loadTableStatuses,
  type TableSession,
} from '../utils/tableStatusStore'
import { useAuth } from '../auth/AuthContext'
import { listDiningAreasApi } from '../services/menuService'
import { subscribeToRail } from '../services/liveRailClient'
import type { DiningArea } from '../types/menu'

const AREA_ORDER = ['Ground Floor', 'BASEMENT', 'Party Hall'] as const

export default function TableView() {
  const navigate = useNavigate()
  const { encryptedOutletId, token, canAccess } = useAuth()
  const [searchParams] = useSearchParams()
  const [billNo, setBillNo] = useState('')
  const [moveKot, setMoveKot] = useState(false)
  const [apiAreas, setApiAreas] = useState<DiningArea[]>([])
  const [statuses, setStatuses] = useState<Record<string, TableFloorStatus>>(
    () => loadTableStatuses(),
  )
  const [sessions, setSessions] = useState<Record<string, TableSession>>(() =>
    loadTableSessions(),
  )
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listDiningAreasApi(encryptedOutletId)
      .then((data) => {
        if (!cancelled) setApiAreas(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          showToast(
            err instanceof Error ? err.message : 'Failed to load tables',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  useEffect(() => {
    if (!encryptedOutletId || !token) return

    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event) => {
        if (
          event === 'kot.prep' ||
          event === 'kot.modified' ||
          event === 'kot.cancelled' ||
          event === 'kot.used_in_bill' ||
          event === 'kot.deleted' ||
          event === 'order.settle'
        ) {
          reloadFloor()
        }
      },
    })
  }, [encryptedOutletId, token])

  const areas = useMemo(() => {
    const nameOrder = new Map<string, number>()
    AREA_ORDER.forEach((name, i) => nameOrder.set(name, i))
    const sorted = [...apiAreas].sort((a, b) => {
      const ai = nameOrder.get(a.name) ?? a.position
      const bi = nameOrder.get(b.name) ?? b.position
      return ai - bi
    })
    return sorted.map((area) => ({
      name: area.name,
      tables: area.tables.map((t) => ({
        id: t.id,
        tableNo: t.table_no,
        persons: t.persons,
      })),
    }))
  }, [apiAreas])


  function reloadFloor() {
    setStatuses(loadTableStatuses())
    setSessions(loadTableSessions())
  }

  function handleRefresh() {
    reloadFloor()
    showToast('Table view refreshed')
  }

  /**
   * The order-taking screen this floor plan feeds. A captain is denied the
   * billing right, so they get `?from=captain` on the URL and everything here
   * must follow them into Captain Orders; a biller stays on Billing. A user who
   * cannot open Billing at all is treated as a captain even without the flag,
   * so a stray `/table-view` never dead-ends on a denied screen.
   */
  const isCaptainMode =
    searchParams.get('from') === 'captain' || !canAccess('/billing')
  const orderBase = isCaptainMode ? '/captain-orders' : '/billing'

  function openTable(tableId: string, tableNo: string, persons: number) {
    const query = `tableId=${encodeURIComponent(tableId)}&tableNo=${encodeURIComponent(tableNo)}&persons=${persons}`
    navigate(`${orderBase}?${query}`)
  }

  function viewTable(tableId: string, tableNo: string, persons: number) {
    const query = `tableId=${encodeURIComponent(tableId)}&tableNo=${encodeURIComponent(tableNo)}&persons=${persons}&view=1`
    navigate(`${orderBase}?${query}`)
  }

  function openOrderType(type: 'delivery' | 'pick-up') {
    navigate(`${orderBase}?orderType=${type}`)
  }

  function openNoTable() {
    navigate(orderBase)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">

      {isCaptainMode ? (
        <CaptainOrdersHeader
          billNo={billNo}
          onBillNoChange={setBillNo}
          onNewOrder={() => {
            setBillNo('')
            showToast('Select a table to start a new order')
          }}
          onViewKot={() => navigate('/captain-orders/kot')}
        />
      ) : (
        <BillingHeader
          billNo={billNo}
          onBillNoChange={setBillNo}
          onNewOrder={() => {
            setBillNo('')
            showToast('Select a table to start a new order')
          }}
          onViewKot={() => navigate('/billing?kot=1')}
        />
      )}

      <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5">
        <h1 className="text-base font-semibold text-ink">Table View</h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-tooltip="Refresh"
            aria-label="Refresh"
            onClick={handleRefresh}
            className="inline-flex size-9 items-center justify-center rounded border border-line text-muted hover:bg-page hover:text-ink"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            onClick={() => openOrderType('delivery')}
            className="inline-flex h-9 items-center rounded bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Delivery
          </button>
          <button
            type="button"
            onClick={() => openOrderType('pick-up')}
            className="inline-flex h-9 items-center rounded bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Pick Up
          </button>
          {canAccess('/menu/tables') && (
            <button
              type="button"
              onClick={() => navigate('/menu/tables')}
              className="inline-flex h-9 items-center gap-1 rounded bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Table
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-white px-4 py-4 sm:px-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <span
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                moveKot ? 'bg-primary' : 'bg-[#cfcfcf]'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={moveKot}
                onChange={(event) => setMoveKot(event.target.checked)}
              />
              <span
                className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
                  moveKot ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
            Move KOT / Items
          </label>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:ml-auto">
            {TABLE_STATUS_LEGEND.map((item) => (
              <div
                key={item.id}
                className="inline-flex items-center gap-1.5 text-xs text-ink"
              >
                <span
                  className={`size-3.5 shrink-0 rounded-sm ${item.swatch}`}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
            Quick Orders
          </h2>
          <button
            type="button"
            aria-label="Start order without a table"
            data-tooltip="Start order without a table"
            onClick={openNoTable}
            className="flex size-[72px] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#bdbdbd] bg-[#e8e8e8] text-ink transition hover:brightness-95 sm:size-20"
          >
            <span className="text-xs font-bold">No Table</span>
            <span className="text-[10px] text-muted">Walk-in</span>
          </button>
        </div>

        <div className="space-y-6">
          {areas.map((area) => (
            <section key={area.name}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
                {area.name}
              </h2>
              <div className="flex flex-wrap gap-3">
                {area.tables.map((table) => {
                  const status = statuses[table.id] ?? 'blank'
                  const session = sessions[table.id]
                  const actionable =
                    (status === 'running-kot' || status === 'printed') &&
                    Boolean(session)

                  if (actionable && session) {
                    return (
                      <div
                        key={table.id}
                        className={`relative flex h-[100px] w-[88px] flex-col items-center justify-center rounded-md border-2 px-1 pb-3 pt-1 text-center sm:h-[108px] sm:w-24 ${tableCardClass(status)}`}
                      >
                        <p className="text-[10px] font-medium leading-tight opacity-90">
                          {formatElapsedMinutes(session.startedAt, now)}
                        </p>
                        <p className="text-lg font-bold leading-tight">
                          {table.tableNo}
                        </p>
                        <p className="text-[11px] font-bold leading-tight">
                          {formatTableAmount(session.amount)}
                        </p>
                        <button
                          type="button"
                          data-tooltip="View order"
                          aria-label={`View table ${table.tableNo}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            viewTable(
                              table.id,
                              table.tableNo,
                              session.persons || table.persons,
                            )
                          }}
                          className="absolute -bottom-3 left-1/2 inline-flex size-7 -translate-x-1/2 items-center justify-center rounded border border-ink/40 bg-white text-ink shadow-sm hover:bg-page"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={table.id}
                      type="button"
                      aria-label={`Table ${table.tableNo}`}
                      data-tooltip={`Table ${table.tableNo}`}
                      onClick={() =>
                        openTable(table.id, table.tableNo, table.persons)
                      }
                      className={`flex size-[72px] items-center justify-center rounded-md border-2 text-base font-semibold transition hover:brightness-95 sm:size-20 ${tableCardClass(status)}`}
                    >
                      {table.tableNo}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
