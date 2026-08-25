import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download,
  Eye,
  HandCoins,
  Search,
  Trash2,
  TrendingUp,
  Users,
  CheckCircle,
} from 'lucide-react'
import { AlertDialog } from '../../components/billing/AlertDialog'
import { Card } from '../../components/common/Card'
import { Table, type Column } from '../../components/common/Table'
import { FilterSelect } from '../../components/all-orders/FilterSelect'
import { PageContainer } from '../../components/layout/PageContainer'
import { formatINR } from '../../utils/format'
import {
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  clientDue,
  getDueClients,
  monthlyPaid,
  monthlyTaken,
  removeDueClient,
  setDueClients,
  type DueClient,
} from '../../mocks/duePaymentsData'
import { DuePaymentsShell } from './DuePaymentsShell'

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'due-desc', label: 'Highest Due' },
  { value: 'due-asc', label: 'Lowest Due' },
]

function downloadStatement(client: DueClient, month: number, year: number) {
  const due = clientDue(client)
  const taken = monthlyTaken(client, month, year)
  const paid = monthlyPaid(client, month, year)
  const lines = [
    'Customer,Phone,Outlet,Monthly Taken,Monthly Paid,Total Due',
    `"${client.name}","${client.phone}","${client.outlet}",${taken.toFixed(2)},${paid.toFixed(2)},${due.toFixed(2)}`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${client.name.replace(/\s+/g, '-').toLowerCase()}-due-statement.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function DuePayments() {
  const navigate = useNavigate()
  const now = new Date()
  const [clients, setClients] = useState<DueClient[]>(() => getDueClients())
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [month, setMonth] = useState(String(now.getMonth()))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const monthIndex = Number(month)
  const yearNumber = Number(year)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function persist(next: DueClient[]) {
    setDueClients(next)
    setClients(next)
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = clients.filter((client) => {
      if (!q) return true
      return (
        client.name.toLowerCase().includes(q) || client.phone.includes(q)
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
      if (sortBy === 'due-desc') return clientDue(b) - clientDue(a)
      if (sortBy === 'due-asc') return clientDue(a) - clientDue(b)
      return a.name.localeCompare(b.name)
    })
  }, [clients, search, sortBy])

  const totalCredit = rows.reduce((sum, client) => sum + clientDue(client), 0)
  const totalClients = rows.length
  const totalTaken = rows.reduce(
    (sum, client) => sum + monthlyTaken(client, monthIndex, yearNumber),
    0,
  )
  const totalPaid = rows.reduce(
    (sum, client) => sum + monthlyPaid(client, monthIndex, yearNumber),
    0,
  )
  const removeTarget = clients.find((client) => client.id === removeId) ?? null

  const columns: Column<DueClient>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      render: (row) => (
        <span className="font-semibold text-ink">{row.name}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => <span className="text-ink">{row.phone}</span>,
    },
    {
      key: 'outlet',
      header: 'Outlet',
      render: (row) => <span className="text-ink">{row.outlet}</span>,
    },
    {
      key: 'taken',
      header: 'Monthly Taken',
      align: 'right',
      render: (row) => (
        <span className="font-semibold tabular-nums text-primary">
          {formatINR(monthlyTaken(row, monthIndex, yearNumber), 2)}
        </span>
      ),
    },
    {
      key: 'paid',
      header: 'Monthly Paid',
      align: 'right',
      render: (row) => (
        <span className="font-semibold tabular-nums text-success">
          {formatINR(monthlyPaid(row, monthIndex, yearNumber), 2)}
        </span>
      ),
    },
    {
      key: 'due',
      header: 'Total Due',
      align: 'right',
      render: (row) => (
        <span className="font-bold tabular-nums text-primary">
          {formatINR(clientDue(row), 2)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="View details"
            aria-label={`View ${row.name}`}
            onClick={() => navigate(`/due-payments/${row.id}`)}
            className="flex size-8 items-center justify-center rounded-md border border-line bg-card text-muted transition-colors hover:border-muted hover:bg-page hover:text-ink"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            title="Remove client"
            aria-label={`Remove ${row.name}`}
            onClick={() => setRemoveId(row.id)}
            className="flex size-8 items-center justify-center rounded-md border border-line bg-card text-danger transition-colors hover:border-danger/40 hover:bg-page"
          >
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            title="Download statement"
            aria-label={`Download statement for ${row.name}`}
            onClick={() => {
              downloadStatement(row, monthIndex, yearNumber)
              showToast('Statement downloaded')
            }}
            className="flex size-8 items-center justify-center rounded-md border border-line bg-card text-muted transition-colors hover:border-muted hover:bg-page hover:text-ink"
          >
            <Download size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DuePaymentsShell>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(removeTarget)}
        title="Remove client"
        message={
          removeTarget
            ? `Remove ${removeTarget.name} from due payment settlement? Outstanding balance will no longer appear in this list.`
            : ''
        }
        onClose={() => setRemoveId(null)}
        onOk={() => {
          if (!removeTarget) return
          removeDueClient(removeTarget.id)
          persist(getDueClients())
          setRemoveId(null)
          showToast(`${removeTarget.name} removed`)
        }}
      />

      <PageContainer
        title="Due Payment Settlement"
        onRefresh={() => setClients(getDueClients())}
        refreshHoverRotate={false}
      >
        <p className="-mt-1 mb-4 text-sm text-muted">
          Manage outstanding balances and payments
        </p>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-card p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HandCoins size={18} />
              </span>
            </div>
            <p className="text-sm font-medium text-muted">Total Due</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
              {formatINR(totalCredit, 2)}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Users size={18} />
              </span>
            </div>
            <p className="text-sm font-medium text-muted">Total Clients</p>
            <p className="mt-1 text-2xl font-bold text-ink">{totalClients}</p>
          </div>
          <div className="rounded-xl border border-line bg-card p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <TrendingUp size={18} />
              </span>
            </div>
            <p className="text-sm font-medium text-muted">Monthly Taken</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
              {formatINR(totalTaken, 2)}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-success/10 text-success">
                <CheckCircle size={18} />
              </span>
            </div>
            <p className="text-sm font-medium text-muted">Monthly Paid</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-success">
              {formatINR(totalPaid, 2)}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <label className="min-w-[200px] flex-1 text-xs text-muted">
            Search
            <span className="relative mt-1 block">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or phone..."
                className="h-9 w-full rounded-lg border border-line bg-card pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              />
            </span>
          </label>
          <FilterSelect
            label="Sort by"
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            className="w-[160px]"
          />
          <FilterSelect
            label="Month"
            value={month}
            onChange={setMonth}
            options={MONTH_OPTIONS}
            className="w-[140px]"
          />
          <FilterSelect
            label="Year"
            value={year}
            onChange={setYear}
            options={YEAR_OPTIONS}
            className="w-[110px]"
          />
        </div>

        <Card bodyClassName="p-0">
          <Table
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyMessage="No credit clients found."
          />
        </Card>
      </PageContainer>
    </DuePaymentsShell>
  )
}
