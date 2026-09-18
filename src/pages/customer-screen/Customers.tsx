import { useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Tv, Users } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { CustomerHistoryModal } from '../../components/billing/CustomerHistoryModal'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { AddCustomerModal } from './AddCustomerModal'
import {
  customersList,
  money,
  type CustomerRow,
} from './customersData'

type CustomerFilter = 'all' | 'due' | 'loyalty'

const FILTERS: { id: CustomerFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'due', label: 'Due' },
  { id: 'loyalty', label: 'Loyalty' },
]

export default function Customers() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [filter, setFilter] = useState<CustomerFilter>('all')
  const [customers, setCustomers] = useState<CustomerRow[]>(() => [
    ...customersList,
  ])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerRow | null>(null)
  const [historyCustomer, setHistoryCustomer] = useState<CustomerRow | null>(
    null,
  )


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

  const dueTotal = customers.reduce((sum, row) => sum + row.dueAmount, 0)

  function handleSave(
    next: Omit<CustomerRow, 'id' | 'orders' | 'lastVisit'> & { id?: string },
  ) {
    if (next.id) {
      setCustomers((prev) =>
        prev.map((row) =>
          row.id === next.id
            ? {
                ...row,
                name: next.name,
                phone: next.phone,
                email: next.email,
                address: next.address,
                locality: next.locality,
                dueAmount: next.dueAmount,
                loyaltyPoints: next.loyaltyPoints,
              }
            : row,
        ),
      )
      showToast('Customer updated')
    } else {
      const duplicate = customers.some((row) => row.phone === next.phone)
      if (duplicate) {
        showToast('A customer with this phone already exists')
        return
      }
      setCustomers((prev) => [
        {
          ...next,
          id: `c-${Date.now()}`,
          lastVisit: '—',
          orders: [],
        },
        ...prev,
      ])
      showToast('Customer added')
    }
    setFormOpen(false)
    setEditing(null)
  }

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
          <ListSearch
            value={search}
            onChange={setSearch}
            placeholder="Search name, phone, locality"
            className="max-w-sm"
          />
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
                <th className="border-b border-line px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    No customers found for this filter.
                  </td>
                </tr>
              ) : (
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
              )}
            </tbody>
          </table>
        </div>
      </main>

      <AddCustomerModal
        open={formOpen}
        customer={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />

      <CustomerHistoryModal
        open={Boolean(historyCustomer)}
        customerName={historyCustomer?.name ?? ''}
        customerMobile={historyCustomer?.phone ?? ''}
        orders={historyCustomer?.orders ?? []}
        onClose={() => setHistoryCustomer(null)}
      />
    </div>
  )
}
