import { useCallback, useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, HandCoins } from 'lucide-react'
import { FilterSelect } from '../../components/all-orders/FilterSelect'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import { ListSearch } from '../../components/common/ListSearch'
import { Table, type Column } from '../../components/common/Table'
import { useListQuery } from '../../hooks/useListQuery'
import { formatINR } from '../../utils/format'
import {
  PAYMENT_MODE_OPTIONS,
  billPending,
  billStatus,
  clientDue,
  type DueClient,
  type DuePaymentMode,
  type DueBill,
  type DuePayment,
  type DueSale,
} from '../../mocks/duePaymentsData'
import {
  collectDuePaymentApi,
  customerHistoryApi,
  toDueClient,
} from '../../services/customerService'
import { useAuth } from '../../auth/AuthContext'
import { DuePaymentsShell } from './DuePaymentsShell'

type DetailTab = 'outstanding' | 'sales' | 'payments'

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'outstanding', label: 'Outstanding Bills' },
  { id: 'sales', label: 'Sales History' },
  { id: 'payments', label: 'Payment History' },
]

function dueClientFromHistory(history: {
  customer: { id: string; name: string; phone: string }
  bills: import('../../services/customerService').DueBillDto[]
  payments: import('../../services/customerService').DuePaymentDto[]
  total_billed: string
  total_collected: string
  outstanding: string
}): DueClient {
  return toDueClient({
    id: history.customer.id,
    name: history.customer.name,
    phone: history.customer.phone,
    bills: history.bills,
    payments: history.payments,
    total_billed: history.total_billed,
    total_collected: history.total_collected,
    outstanding: history.outstanding,
  })
}

export default function DuePaymentClient() {
  const { clientId } = useParams()
  const { encryptedOutletId } = useAuth()
  const [client, setClient] = useState<DueClient | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [amount, setAmount] = useState('0.00')
  const [mode, setMode] = useState<DuePaymentMode>('Cash')
  const [tab, setTab] = useState<DetailTab>('outstanding')
  const [settleOpen, setSettleOpen] = useState(false)

  const loadClient = useCallback(async () => {
    if (!encryptedOutletId) {
      showToast('No outlet selected — open from the sidebar')
      setLoaded(true)
      return
    }
    try {
      const history = await customerHistoryApi(encryptedOutletId, clientId as string)
      setClient(dueClientFromHistory(history))
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load customer',
      )
    } finally {
      setLoaded(true)
    }
  }, [encryptedOutletId, clientId])

  useEffect(() => {
    loadClient()
  }, [loadClient])

  const due = client ? clientDue(client) : 0

  const outstandingBills = useMemo(
    () => (client ? client.bills.filter((bill) => billPending(bill) > 0) : []),
    [client],
  )

<<<<<<< HEAD
  const outstandingQuery = useListQuery(
    outstandingBills,
    (row) => [row.billNo, row.date, row.total, row.paid, billStatus(row), billPending(row)],
    (row, key) => {
      if (key === 'date') return row.date
      if (key === 'total') return row.total
      if (key === 'paid') return row.paid
      if (key === 'status') return billStatus(row)
      if (key === 'pending') return billPending(row)
      return row.billNo
    },
  )
  const salesQuery = useListQuery(
    client?.sales ?? [],
    (row) => [row.billNo, row.date, row.total, row.status, row.pending],
    (row, key) => {
      if (key === 'date') return row.date
      if (key === 'total') return row.total
      if (key === 'status') return row.status
      if (key === 'pending') return row.pending
      return row.billNo
    },
  )
  const paymentsQuery = useListQuery(
    client?.payments ?? [],
    (row) => [row.date, row.method, row.amount],
    (row, key) => {
      if (key === 'method') return row.method
      if (key === 'amount') return row.amount
      return row.date
    },
  )

  if (!clientId || !client) {
=======
  if (!clientId || (!client && loaded)) {
>>>>>>> origin/main
    return <Navigate to="/due-payments" replace />
  }
  if (!client) {
    return (
      <DuePaymentsShell>
        <main className="px-4 py-4 sm:px-5">
          <p className="py-8 text-center text-sm text-muted">Loading…</p>
        </main>
      </DuePaymentsShell>
    )
  }

  async function receive(value: number) {
    if (!client || !encryptedOutletId) return
    if (value <= 0) {
      showToast('Enter an amount greater than 0')
      return
    }
    if (value > due + 0.001) {
      showToast('Amount cannot exceed current balance')
      return
    }
    try {
      await collectDuePaymentApi(encryptedOutletId, client.id, {
        amount: value,
        method: mode,
      })
      await loadClient()
      setAmount('0.00')
      showToast(`Received ${formatINR(value, 2)} via ${mode}`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Could not apply payment',
      )
    }
  }

  const outstandingColumns: Column<DueBill>[] = [
    {
      key: 'billNo',
      header: 'Bill #',
      sortable: true,
      render: (row) => <span className="font-medium text-ink">{row.billNo}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => <span className="text-ink">{row.date}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="tabular-nums text-ink">{formatINR(row.total, 2)}</span>
      ),
    },
    {
      key: 'paid',
      header: 'Paid',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-semibold tabular-nums text-success">
          {formatINR(row.paid, 2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        const status = billStatus(row)
        const variant =
          status === 'Paid'
            ? 'success'
            : status === 'Partial'
              ? 'accent'
              : 'primary'
        return (
          <Badge variant={variant} size="sm" dot>
            {status}
          </Badge>
        )
      },
    },
    {
      key: 'pending',
      header: 'Pending',
      align: 'right',
      sortable: true,
      render: (row) => {
        const pending = billPending(row)
        return (
          <span
            className={`font-semibold tabular-nums ${pending > 0 ? 'text-primary' : 'text-success'}`}
          >
            {formatINR(pending, 2)}
          </span>
        )
      },
    },
  ]

  const salesColumns: Column<DueSale>[] = [
    {
      key: 'billNo',
      header: 'Bill #',
      sortable: true,
      render: (row) => <span className="font-medium text-ink">{row.billNo}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => <span className="text-ink">{row.date}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="tabular-nums text-ink">{formatINR(row.total, 2)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <Badge
          variant={row.status === 'Credit' ? 'accent' : 'success'}
          size="sm"
          dot
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'pending',
      header: 'Pending',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span
          className={`tabular-nums ${row.pending > 0 ? 'font-semibold text-primary' : 'text-ink'}`}
        >
          {formatINR(row.pending, 2)}
        </span>
      ),
    },
  ]

  const paymentColumns: Column<DuePayment>[] = [
    {
      key: 'date',
      header: 'Payment Date',
      sortable: true,
      render: (row) => <span className="text-ink">{row.date}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      sortable: true,
      render: (row) => <span className="text-ink">{row.method}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="font-semibold tabular-nums text-success">
          {formatINR(row.amount, 2)}
        </span>
      ),
    },
  ]

  return (
    <DuePaymentsShell>

      <ConfirmDeleteModal
        open={settleOpen}
        title="Settle All Outstanding"
        message={`Are you sure you want to settle the full outstanding balance of ${formatINR(due, 2)} for ${client.name} via ${mode}?`}
        confirmLabel="Settle"
        onClose={() => setSettleOpen(false)}
        onConfirm={() => receive(due)}
      />

      <main className="px-4 py-4 sm:px-5">
        <Link
          to="/due-payments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to Due Payments
        </Link>

        <div className="mt-4 mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="text-xl font-bold text-ink">{client.name}</h1>
            <p className="mt-0.5 text-sm text-muted">{client.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-line bg-card p-4">
              <div className="mb-2 flex items-center gap-2.5">
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-lg ${due > 0 ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}
                >
                  <HandCoins size={18} />
                </span>
                <p className="text-sm font-medium text-muted">
                  Current Balance
                </p>
              </div>
              <p
                className={`text-2xl font-bold tabular-nums ${due > 0 ? 'text-primary' : 'text-success'}`}
              >
                {formatINR(due, 2)}
              </p>
            </div>
          </div>
        </div>

        <Card title="Receive Payment" className="mb-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[160px] text-xs text-muted">
              Amount
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-1 block h-9 w-40 rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <FilterSelect
              label="Payment Mode"
              value={mode}
              onChange={(value) => setMode(value as DuePaymentMode)}
              options={PAYMENT_MODE_OPTIONS.map((option) => ({
                value: option,
                label: option,
              }))}
              className="w-[160px]"
            />
            <Button
              variant="success"
              onClick={() => receive(Number(amount))}
              disabled={due <= 0}
            >
              Receive Payment
            </Button>
            <Button
              variant="danger"
              onClick={() => setSettleOpen(true)}
              disabled={due <= 0}
            >
              Settle All Outstanding
            </Button>
          </div>
        </Card>

        <div className="mb-5 flex items-center gap-1 border-b border-line">
          {TABS.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {tab === 'outstanding' ? (
          <Card bodyClassName="p-0">
            <div className="border-b border-line p-3">
              <ListSearch
                value={outstandingQuery.search}
                onChange={outstandingQuery.setSearch}
                placeholder="Search outstanding bills"
              />
            </div>
            <Table
              columns={outstandingColumns}
              rows={outstandingQuery.visible}
              rowKey={(row) => row.id}
              emptyMessage="No outstanding bills."
              sortKey={outstandingQuery.sortKey}
              sortDir={outstandingQuery.sortDir}
              onSort={outstandingQuery.toggleSort}
            />
          </Card>
        ) : null}

        {tab === 'sales' ? (
          <Card bodyClassName="p-0">
            <div className="border-b border-line p-3">
              <ListSearch
                value={salesQuery.search}
                onChange={salesQuery.setSearch}
                placeholder="Search sales"
              />
            </div>
            <Table
              columns={salesColumns}
              rows={salesQuery.visible}
              rowKey={(row) => row.id}
              emptyMessage="No sales records."
              sortKey={salesQuery.sortKey}
              sortDir={salesQuery.sortDir}
              onSort={salesQuery.toggleSort}
            />
          </Card>
        ) : null}

        {tab === 'payments' ? (
          <Card bodyClassName="p-0">
            <div className="border-b border-line p-3">
              <ListSearch
                value={paymentsQuery.search}
                onChange={paymentsQuery.setSearch}
                placeholder="Search payments"
              />
            </div>
            <Table
              columns={paymentColumns}
              rows={paymentsQuery.visible}
              rowKey={(row) => row.id}
              emptyMessage="No payments recorded."
              sortKey={paymentsQuery.sortKey}
              sortDir={paymentsQuery.sortDir}
              onSort={paymentsQuery.toggleSort}
            />
          </Card>
        ) : null}
      </main>
    </DuePaymentsShell>
  )
}
