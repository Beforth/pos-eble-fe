import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, HandCoins } from 'lucide-react'
import { FilterSelect } from '../../components/all-orders/FilterSelect'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import { Table, type Column } from '../../components/common/Table'
import { formatINR } from '../../utils/format'
import {
  PAYMENT_MODE_OPTIONS,
  applyDuePayment,
  billPending,
  billStatus,
  clientDue,
  getDueClient,
  type DueClient,
  type DuePaymentMode,
  type DueBill,
  type DuePayment,
  type DueSale,
} from '../../mocks/duePaymentsData'
import { DuePaymentsShell } from './DuePaymentsShell'

type DetailTab = 'outstanding' | 'sales' | 'payments'

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'outstanding', label: 'Outstanding Bills' },
  { id: 'sales', label: 'Sales History' },
  { id: 'payments', label: 'Payment History' },
]

export default function DuePaymentClient() {
  const { clientId } = useParams()
  const [client, setClient] = useState<DueClient | null>(() =>
    clientId ? getDueClient(clientId) : null,
  )
  const [amount, setAmount] = useState('0.00')
  const [mode, setMode] = useState<DuePaymentMode>('Cash')
  const [tab, setTab] = useState<DetailTab>('outstanding')
  const [toast, setToast] = useState<string | null>(null)
  const [settleOpen, setSettleOpen] = useState(false)

  const due = client ? clientDue(client) : 0

  const outstandingBills = useMemo(
    () => (client ? client.bills.filter((bill) => billPending(bill) > 0) : []),
    [client],
  )

  if (!clientId || !client) {
    return <Navigate to="/due-payments" replace />
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function receive(value: number) {
    if (!client) return
    if (value <= 0) {
      showToast('Enter an amount greater than 0')
      return
    }
    if (value > due + 0.001) {
      showToast('Amount cannot exceed current balance')
      return
    }
    const next = applyDuePayment(client.id, value, mode)
    if (!next) {
      showToast('Could not apply payment')
      return
    }
    setClient(next)
    setAmount('0.00')
    showToast(`Received ${formatINR(value, 2)} via ${mode}`)
  }

  const outstandingColumns: Column<DueBill>[] = [
    {
      key: 'billNo',
      header: 'Bill #',
      render: (row) => <span className="font-medium text-ink">{row.billNo}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-ink">{row.date}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-ink">{formatINR(row.total, 2)}</span>
      ),
    },
    {
      key: 'paid',
      header: 'Paid',
      align: 'right',
      render: (row) => (
        <span className="font-semibold tabular-nums text-success">
          {formatINR(row.paid, 2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
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
      render: (row) => <span className="font-medium text-ink">{row.billNo}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-ink">{row.date}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-ink">{formatINR(row.total, 2)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
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
      render: (row) => <span className="text-ink">{row.date}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      render: (row) => <span className="text-ink">{row.method}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-semibold tabular-nums text-success">
          {formatINR(row.amount, 2)}
        </span>
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
            <Table
              columns={outstandingColumns}
              rows={outstandingBills}
              rowKey={(row) => row.id}
              emptyMessage="No outstanding bills."
            />
          </Card>
        ) : null}

        {tab === 'sales' ? (
          <Card bodyClassName="p-0">
            <Table
              columns={salesColumns}
              rows={client.sales}
              rowKey={(row) => row.id}
              emptyMessage="No sales records."
            />
          </Card>
        ) : null}

        {tab === 'payments' ? (
          <Card bodyClassName="p-0">
            <Table
              columns={paymentColumns}
              rows={client.payments}
              rowKey={(row) => row.id}
              emptyMessage="No payments recorded."
            />
          </Card>
        ) : null}
      </main>
    </DuePaymentsShell>
  )
}
