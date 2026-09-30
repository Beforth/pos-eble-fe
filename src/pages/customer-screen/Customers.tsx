import { useCallback, useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
<<<<<<< HEAD
import { ArrowLeft, Plus, Tv, Users } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { CustomerHistoryModal } from '../../components/billing/CustomerHistoryModal'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { AddCustomerModal } from './AddCustomerModal'
=======
import { ArrowLeft, Loader, Plus, Search, Tv, Users } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
>>>>>>> origin/main
import {
  CustomerHistoryModal,
  type CustomerHistoryOrder,
  type CustomerHistoryPayment,
} from '../../components/billing/CustomerHistoryModal'
import { AddCustomerModal } from './AddCustomerModal'
import { money } from './customersData'
import { useAuth } from '../../auth/AuthContext'
import {
  customerHistoryApi,
  listCustomersApi,
  listDueClientsApi,
  type CustomerDto,
  type CustomerHistoryDto,
} from '../../services/customerService'

type CustomerFilter = 'all' | 'due'

const FILTERS: { id: CustomerFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'due', label: 'Due' },
]

interface HistoryState {
  customer: CustomerDto
  data: CustomerHistoryDto
}

function formatHistoryDate(value: string): string {
  const parsed = new Date(value.includes(' ') ? value.replace(' ', 'T') : value)
  if (!Number.isFinite(parsed.getTime())) return value
  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function Customers() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [filter, setFilter] = useState<CustomerFilter>('all')
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [dues, setDues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerDto | null>(null)
  const [history, setHistory] = useState<HistoryState | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadDues = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      const rows = await listDueClientsApi(encryptedOutletId)
      const map: Record<string, string> = {}
      for (const row of rows) map[row.id] = row.outstanding
      setDues(map)
    } catch {
      setDues({})
    }
  }, [encryptedOutletId])

<<<<<<< HEAD
  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      if (filter === 'due' && customer.dueAmount <= 0) return false
      if (filter === 'loyalty' && customer.loyaltyPoints <= 0) return false
      return true
    })
  }, [customers, filter])

  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      filtered,
      (customer) => [
        customer.name,
        customer.phone,
        customer.email,
        customer.locality,
        customer.address,
        customer.dueAmount,
        customer.loyaltyPoints,
        customer.lastVisit,
      ],
      (customer, key) => {
        if (key === 'phone') return customer.phone
        if (key === 'email') return customer.email
        if (key === 'address') return customer.address
        if (key === 'locality') return customer.locality
        if (key === 'due') return customer.dueAmount
        if (key === 'loyalty') return customer.loyaltyPoints
        if (key === 'lastVisit') return customer.lastVisit
        return customer.name
      },
    )
=======
  useEffect(() => {
    void loadDues()
  }, [loadDues])

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const rows = await listCustomersApi(
          encryptedOutletId,
          search.trim() || undefined,
        )
        if (!cancelled) setCustomers(rows)
      } catch (err) {
        if (!cancelled) {
          showToast(
            err instanceof Error ? err.message : 'Failed to load customers',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 350)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [encryptedOutletId, search])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter((customer) => {
      if (filter === 'due') {
        if (Number(dues[customer.id] ?? '0') <= 0) return false
      }
      if (!q) return true
      return (
        customer.name.toLowerCase().includes(q) ||
        customer.phone.toLowerCase().includes(q) ||
        customer.gstin.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.address.toLowerCase().includes(q)
      )
    })
  }, [customers, dues, filter, search])
>>>>>>> origin/main

  const dueTotal = useMemo(
    () =>
      Object.values(dues).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [dues],
  )

  function handleSaved() {
    setFormOpen(false)
    setEditing(null)
    void loadDues()
    if (!encryptedOutletId) return
    listCustomersApi(encryptedOutletId, search.trim() || undefined)
      .then(setCustomers)
      .catch(() => undefined)
  }

  function openHistory(customer: CustomerDto) {
    if (!encryptedOutletId) return
    setHistory({
      customer,
      data: {
        customer,
        bills: [],
        payments: [],
        total_billed: '0',
        total_collected: '0',
        outstanding: '0',
      },
    })
    setHistoryLoading(true)
    customerHistoryApi(encryptedOutletId, customer.id)
      .then((data) => setHistory({ customer, data }))
      .catch((err) => {
        showToast(
          err instanceof Error ? err.message : 'Failed to load history',
        )
      })
      .finally(() => setHistoryLoading(false))
  }

  const historyOrders = useMemo<CustomerHistoryOrder[]>(
    () =>
      history
        ? history.data.bills.map((bill) => ({
            id: `${bill.order}-bill`,
            billNo: bill.bill_no || bill.order_no || '—',
            date: formatHistoryDate(bill.created_at),
            amount: Number(bill.total),
            paid: Number(bill.paid),
            remaining: Number(bill.remaining),
            items: [],
          }))
        : [],
    [history],
  )

  const historyPayments = useMemo<CustomerHistoryPayment[]>(
    () =>
      history
        ? history.data.payments.map((payment) => ({
            id: payment.id,
            date: formatHistoryDate(payment.created_at),
            method: payment.method || 'Cash',
            amount: Number(payment.amount),
          }))
        : [],
    [history],
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">

      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => navigate('/table-view')}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-card px-4 py-2">
        <div className="flex items-center gap-2 text-ink">
          <Users size={18} className="text-primary" />
          <h1 className="text-sm font-semibold">Customers</h1>
          <span className="text-xs text-muted">({customers.length})</span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/customer-display')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-semibold text-ink hover:border-primary hover:text-primary"
          >
            <Tv size={14} />
            Display
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={14} />
            Add Customer
          </button>
          <button
            type="button"
            onClick={() => navigate('/configuration')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary bg-card px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card px-4 py-3 sm:px-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
<<<<<<< HEAD
          <ListSearch
            value={search}
            onChange={setSearch}
            placeholder="Search name, phone, locality"
            className="max-w-sm"
          />
=======
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, GSTIN"
              className="h-9 w-full rounded-lg border border-line bg-card pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
>>>>>>> origin/main
          <div className="flex items-center gap-1">
            {FILTERS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`h-9 rounded-lg px-3 text-sm font-semibold ${
                  filter === tab.id
                    ? 'bg-primary text-white'
                    : 'border border-line text-ink hover:bg-page'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="ml-auto text-xs font-medium text-ink">
            Total Due:{' '}
            <span className="text-primary">₹{money(dueTotal)}</span>
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded border border-line">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-page text-left text-xs font-semibold text-ink">
<<<<<<< HEAD
                <SortableTh
                  columnKey="name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Name
                </SortableTh>
                <SortableTh
                  columnKey="phone"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Phone
                </SortableTh>
                <SortableTh
                  columnKey="email"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Email
                </SortableTh>
                <SortableTh
                  columnKey="address"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Address
                </SortableTh>
                <SortableTh
                  columnKey="locality"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Locality
                </SortableTh>
                <SortableTh
                  columnKey="due"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                  className="border-b border-line px-3 py-2.5"
                >
                  Due (₹)
                </SortableTh>
                <SortableTh
                  columnKey="loyalty"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                  className="border-b border-line px-3 py-2.5"
                >
                  Loyalty
                </SortableTh>
                <SortableTh
                  columnKey="lastVisit"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="border-b border-line px-3 py-2.5"
                >
                  Last Visit
                </SortableTh>
=======
                <th className="border-b border-line px-3 py-2.5">Name</th>
                <th className="border-b border-line px-3 py-2.5">Phone</th>
                <th className="border-b border-line px-3 py-2.5">Email</th>
                <th className="border-b border-line px-3 py-2.5">GSTIN</th>
                <th className="border-b border-line px-3 py-2.5">Address</th>
                <th className="border-b border-line px-3 py-2.5 text-right">
                  Due (₹)
                </th>
>>>>>>> origin/main
                <th className="border-b border-line px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {visible.length === 0 ? (
=======
              {loading ? (
>>>>>>> origin/main
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      Loading customers…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    No customers found for this filter.
                  </td>
                </tr>
              ) : (
<<<<<<< HEAD
                visible.map((customer) => (
                  <tr key={customer.id} className="hover:bg-page/70">
                    <td className="border-b border-line px-3 py-2 font-semibold text-ink">
                      {customer.name}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-ink">
                      {customer.phone}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-ink">
                      {customer.email || '—'}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-ink">
                      {customer.address || '—'}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-ink">
                      {customer.locality || '—'}
                    </td>
                    <td
                      className={`border-b border-line px-3 py-2 text-right tabular-nums ${
                        customer.dueAmount > 0
                          ? 'font-semibold text-primary'
                          : 'text-ink'
                      }`}
                    >
                      {money(customer.dueAmount)}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-right tabular-nums text-ink">
                      {customer.loyaltyPoints}
                    </td>
                    <td className="border-b border-line px-3 py-2 whitespace-nowrap text-ink">
                      {customer.lastVisit}
                    </td>
                    <td className="border-b border-line px-3 py-2">
                      <div className="flex flex-wrap items-center gap-x-1 text-sm">
                        <button
                          type="button"
                          onClick={() => setHistoryCustomer(customer)}
                          className="font-semibold text-primary underline decoration-primary/40 hover:text-primary-hover"
                        >
                          History
                        </button>
                        <span className="text-muted">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(customer)
                            setFormOpen(true)
                          }}
                          className="font-semibold text-primary underline decoration-primary/40 hover:text-primary-hover"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
=======
                rows.map((customer) => {
                  const dueAmount = Number(dues[customer.id] ?? '0') || 0
                  return (
                    <tr key={customer.id} className="hover:bg-page/70">
                      <td className="border-b border-line px-3 py-2 font-semibold text-ink">
                        {customer.name}
                      </td>
                      <td className="border-b border-line px-3 py-2 text-ink">
                        {customer.phone}
                      </td>
                      <td className="border-b border-line px-3 py-2 text-ink">
                        {customer.email || '—'}
                      </td>
                      <td className="border-b border-line px-3 py-2 text-ink">
                        {customer.gstin || '—'}
                      </td>
                      <td className="border-b border-line px-3 py-2 text-ink">
                        {customer.address || '—'}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-2 text-right tabular-nums ${
                          dueAmount > 0
                            ? 'font-semibold text-primary'
                            : 'text-ink'
                        }`}
                      >
                        {money(dueAmount)}
                      </td>
                      <td className="border-b border-line px-3 py-2">
                        <div className="flex flex-wrap items-center gap-x-1 text-sm">
                          <button
                            type="button"
                            onClick={() => openHistory(customer)}
                            className="font-semibold text-primary underline decoration-primary/40 hover:text-primary-hover"
                          >
                            History
                          </button>
                          <span className="text-muted">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(customer)
                              setFormOpen(true)
                            }}
                            className="font-semibold text-primary underline decoration-primary/40 hover:text-primary-hover"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
>>>>>>> origin/main
              )}
            </tbody>
          </table>
        </div>
      </main>

      <AddCustomerModal
        open={formOpen}
        customer={editing}
        outletId={encryptedOutletId ?? ''}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSaved={handleSaved}
      />

      <CustomerHistoryModal
        open={Boolean(history)}
        customerName={history?.customer.name ?? ''}
        customerMobile={history?.customer.phone ?? ''}
        orders={historyOrders}
        payments={historyPayments}
        loading={historyLoading}
        onClose={() => {
          setHistory(null)
          setHistoryLoading(false)
        }}
      />
    </div>
  )
}