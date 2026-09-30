<<<<<<< HEAD
import { useState } from 'react'
=======
import { useCallback, useEffect, useMemo, useState } from 'react'
>>>>>>> origin/main

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import {
  Download,
  Eye,
  HandCoins,
<<<<<<< HEAD
  Trash2,
=======
  Search,
>>>>>>> origin/main
  TrendingUp,
  Users,
  CheckCircle,
} from 'lucide-react'
import { Card } from '../../components/common/Card'
import { ListSearch } from '../../components/common/ListSearch'
import { Table, type Column } from '../../components/common/Table'
import { FilterSelect } from '../../components/all-orders/FilterSelect'
import { PageContainer } from '../../components/layout/PageContainer'
import { useListQuery } from '../../hooks/useListQuery'
import { formatINR } from '../../utils/format'
import {
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  clientDue,
  monthlyPaid,
  monthlyTaken,
  type DueClient,
} from '../../mocks/duePaymentsData'
import { listDueClientsApi, toDueClient } from '../../services/customerService'
import { useAuth } from '../../auth/AuthContext'
import { DuePaymentsShell } from './DuePaymentsShell'

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
  const { encryptedOutletId } = useAuth()
  const now = new Date()
<<<<<<< HEAD
  const [clients, setClients] = useState<DueClient[]>(() => getDueClients())
=======
  const [clients, setClients] = useState<DueClient[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
>>>>>>> origin/main
  const [month, setMonth] = useState(String(now.getMonth()))
  const [year, setYear] = useState(String(now.getFullYear()))

  const monthIndex = Number(month)
  const yearNumber = Number(year)
  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      clients,
      (client) => [client.name, client.phone, client.outlet],
      (client, key) => {
        if (key === 'phone') return client.phone
        if (key === 'outlet') return client.outlet
        if (key === 'taken') return monthlyTaken(client, monthIndex, yearNumber)
        if (key === 'paid') return monthlyPaid(client, monthIndex, yearNumber)
        if (key === 'due') return clientDue(client)
        return client.name
      },
    )

  const loadClients = useCallback(async () => {
    if (!encryptedOutletId) {
      showToast('No outlet selected — open from the sidebar')
      return
    }
    try {
      const dueClients = await listDueClientsApi(encryptedOutletId)
      setClients(dueClients.map(toDueClient))
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load due payments',
      )
    }
  }, [encryptedOutletId])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const totalCredit = visible.reduce((sum, client) => sum + clientDue(client), 0)
  const totalClients = visible.length
  const totalTaken = visible.reduce(
    (sum, client) => sum + monthlyTaken(client, monthIndex, yearNumber),
    0,
  )
  const totalPaid = visible.reduce(
    (sum, client) => sum + monthlyPaid(client, monthIndex, yearNumber),
    0,
  )

  const columns: Column<DueClient>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-ink">{row.name}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (row) => <span className="text-ink">{row.phone}</span>,
    },
    {
<<<<<<< HEAD
      key: 'outlet',
      header: 'Outlet',
      sortable: true,
      render: (row) => <span className="text-ink">{row.outlet}</span>,
    },
    {
=======
>>>>>>> origin/main
      key: 'taken',
      header: 'Monthly Taken',
      align: 'right',
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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

      <PageContainer
        title="Due Payment Settlement"
        onRefresh={loadClients}
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
          <div className="min-w-[200px] flex-1">
            <p className="mb-1 text-xs text-muted">Search</p>
            <ListSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by name or phone..."
              className="sm:max-w-none"
            />
          </div>
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
            rows={visible}
            rowKey={(row) => row.id}
            emptyMessage="No credit clients found."
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={toggleSort}
          />
        </Card>
      </PageContainer>
    </DuePaymentsShell>
  )
}
