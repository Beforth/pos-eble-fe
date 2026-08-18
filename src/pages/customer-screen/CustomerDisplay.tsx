import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '../../components/brand/BrandLogo'
import { brand } from '../../theme/brand'
import {
  KOT_STORE_EVENT,
  loadAllKotTickets,
} from '../../utils/tableStatusStore'
import {
  messageForStatus,
  sortDisplayTickets,
  toDisplayTicket,
  type DisplayTicket,
} from './customerDisplayData'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatClock(now: Date) {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function readBoardTickets(): DisplayTicket[] {
  return sortDisplayTickets(loadAllKotTickets().map(toDisplayTicket))
}

function Card({ ticket }: { ticket: DisplayTicket }) {
  const isReady = ticket.status === 'ready'

  return (
    <article
      className={`customer-board-card ${
        isReady ? 'customer-board-card-ready' : 'customer-board-card-prep'
      }`}
    >
      <p className="customer-board-kicker">
        {isReady ? 'Ready' : 'Preparing'}
      </p>
      <p className="customer-board-token">{ticket.tokenNo}</p>
      <p className="customer-board-name">{ticket.customerName}</p>
      <p className="customer-board-msg">{messageForStatus(ticket.status)}</p>
    </article>
  )
}

export default function CustomerDisplay() {
  const navigate = useNavigate()
  const [now, setNow] = useState(() => new Date())
  const [tickets, setTickets] = useState<DisplayTicket[]>(() =>
    readBoardTickets(),
  )

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(clock)
  }, [])

  useEffect(() => {
    function refresh() {
      setTickets(readBoardTickets())
    }
    window.addEventListener('storage', refresh)
    window.addEventListener(KOT_STORE_EVENT, refresh)
    window.addEventListener('pos-eble-all-kot-tickets', refresh)
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('pos-eble-kot-sync')
      channel.onmessage = refresh
    } catch {
      // Fallback
    }
    const poll = window.setInterval(refresh, 1000)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(KOT_STORE_EVENT, refresh)
      window.removeEventListener('pos-eble-all-kot-tickets', refresh)
      if (channel) channel.close()
      window.clearInterval(poll)
    }
  }, [])

  const readyCount = tickets.filter((ticket) => ticket.status === 'ready').length
  const preparingCount = tickets.length - readyCount

  return (
    <div className="customer-display-shell">
      <header className="customer-display-header">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo size={40} />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-ink sm:text-lg">
              {brand.shortName}
            </h1>
            <p className="truncate text-xs text-muted">Token board</p>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="customer-stat-pill customer-stat-ready">
            Ready {readyCount}
          </span>
          <span className="customer-stat-pill customer-stat-prep">
            Preparing {preparingCount}
          </span>
          <p className="hidden rounded-md border border-line bg-card px-2.5 py-1 font-sans text-sm font-semibold tabular-nums text-ink sm:block">
            {formatClock(now)}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-xs font-medium text-muted hover:bg-page hover:text-ink"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5">
        {tickets.length === 0 ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-4 text-center">
            <BrandLogo size={56} />
            <p className="mt-3 text-lg font-semibold text-ink">{brand.shortName}</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              No running orders. Tokens appear here after a KOT is sent from billing.
            </p>
          </div>
        ) : (
          <div className="customer-board-grid">
            {tickets.map((ticket) => (
              <Card key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
