import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Eye, FileX, Loader2, Search } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { FilterSelect } from '../../components/all-orders/FilterSelect'
import { clientDue, latestBill, type DueClient } from '../../mocks/duePaymentsData'
import { listDueClientsApi, toDueClient } from '../../services/customerService'
import { downloadCsv } from '../../utils/exportCsv'
import { formatINR } from '../../utils/format'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'due-desc', label: 'Highest Due' },
  { value: 'due-asc', label: 'Lowest Due' },
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
]

/** Dues move when a bill is settled at any counter, so the list refetches on a timer. */
const POLL_MS = 15_000

const HEADINGS = ['Customer Name', 'Phone', 'Last Bill', 'Total Due (₹)', '']

export default function BillingDuePayments() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')

  const [clients, setClients] = useState<DueClient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')

  const load = useCallback(
    async (quiet: boolean) => {
      if (!encryptedOutletId) return
      try {
        const result = await listDueClientsApi(encryptedOutletId)
        setClients(result.map(toDueClient))
      } catch (error) {
        if (!quiet) {
          showToast(error instanceof Error ? error.message : 'Failed to load due payments')
        }
      } finally {
        setLoading(false)
      }
    },
    [encryptedOutletId],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load(false)
    const timer = window.setInterval(() => {
      if (!document.hidden) void load(true)
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [load])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = clients.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q),
    )
    return list.sort((a, b) => {
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
      if (sortBy === 'due-desc') return clientDue(b) - clientDue(a)
      if (sortBy === 'due-asc') return clientDue(a) - clientDue(b)
      const diff = (latestBill(b)?.dateMs ?? 0) - (latestBill(a)?.dateMs ?? 0)
      if (sortBy === 'date-desc') return diff || a.name.localeCompare(b.name)
      if (sortBy === 'date-asc') return -diff || a.name.localeCompare(b.name)
      return a.name.localeCompare(b.name)
    })
  }, [clients, search, sortBy])

  function downloadReport() {
    if (rows.length === 0) {
      showToast('No due payments to report')
      return
    }
    downloadCsv(
      `due-payment-report-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Customer', 'Phone', 'Last Bill', 'Total Due'],
      rows.map((c) => [c.name, c.phone, latestBill(c)?.date ?? '', clientDue(c)]),
    )
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Due Payment Management</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadReport}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Get Due Payment Report
            </button>
            <button
              type="button"
              onClick={() => navigate('/billing/operations')}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen((open) => !open)}
          aria-expanded={searchOpen}
          className="mb-3 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <Search size={14} />
          Search
          <ChevronDown size={14} className={searchOpen ? 'rotate-180' : ''} />
        </button>

        {searchOpen ? (
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-3">
            <label className="min-w-[200px] flex-1 text-xs text-muted">
              Customer
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              />
            </label>
            <FilterSelect
              label="Sort by"
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS}
              className="w-[160px]"
            />
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-12 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading due payments…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-xl border border-line bg-card px-6 py-10 text-center">
            <FileX size={64} strokeWidth={1.2} className="text-muted/60" />
            <p className="text-sm text-muted">Records not available</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-page">
                    {HEADINGS.map((heading) => (
                      <th
                        key={heading || 'actions'}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 text-left text-sm font-bold text-ink"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((client) => (
                    <tr key={client.id} className="border-b border-line">
                      <td className="px-4 py-3 font-semibold text-ink">{client.name}</td>
                      <td className="px-4 py-3 tabular-nums text-ink">{client.phone}</td>
                      <td className="px-4 py-3 text-ink">{latestBill(client)?.date ?? '—'}</td>
                      <td className="px-4 py-3 font-bold tabular-nums text-primary">
                        {formatINR(clientDue(client), 2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            aria-label={`View ${client.name}`}
                            data-tooltip="View details"
                            onClick={() => navigate(`/due-payments/${client.id}`)}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-ink hover:bg-page"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
