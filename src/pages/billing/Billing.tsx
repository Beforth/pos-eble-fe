import { useMemo, useState } from 'react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  BillPanel,
  type CartLine,
  type CustomerDetails,
  type OrderType,
  type PaymentMethod,
} from '../../components/billing/BillPanel'
import { AlertDialog } from '../../components/billing/AlertDialog'
import { CategoryRail } from '../../components/billing/CategoryRail'
import { ItemGrid } from '../../components/billing/ItemGrid'
import { PartPaymentView } from '../../components/billing/PartPaymentView'
import { SplitBillModal } from '../../components/billing/SplitBillModal'
import {
  baseMenuCategories,
  menuItems,
  type MenuItemRow,
} from '../../mocks/menuItemsData'
import { billingTables } from '../../mocks/billingTables'
import { getItemInitials, itemNameMatchesQuery } from '../../utils/itemSearch'

const FAVORITES_ID = 'favorites'
const ALL_CATEGORIES_ID = 'all-categories'

const RAIL_CATEGORIES = [
  { id: FAVORITES_ID, name: 'Favorite Items' },
  { id: ALL_CATEGORIES_ID, name: 'All Categories' },
  ...baseMenuCategories.map((c) => ({ id: c.id, name: c.name })),
]

const EMPTY_CUSTOMER: CustomerDetails = {
  mobile: '',
  name: '',
  address: '',
  locality: '',
}

function isCustomerComplete(customer: CustomerDetails) {
  return (
    customer.mobile.trim().length >= 10 &&
    customer.name.trim().length > 0 &&
    customer.address.trim().length > 0 &&
    customer.locality.trim().length > 0
  )
}

function customerFieldErrors(customer: CustomerDetails) {
  return {
    mobile: customer.mobile.trim().length < 10,
    name: customer.name.trim().length === 0,
    address: customer.address.trim().length === 0,
    locality: customer.locality.trim().length === 0,
  }
}

function normalizeShortCode(value: string): string {
  return value.trim().replace(/^0+(\d)/, '$1')
}

function findByShortCode(codeInput: string): MenuItemRow | null {
  const raw = codeInput.trim()
  if (!raw) return null
  const code = normalizeShortCode(raw)
  return (
    menuItems.find(
      (item) =>
        item.available &&
        (item.shortCode === raw || normalizeShortCode(item.shortCode) === code),
    ) ?? null
  )
}

function findBySearchQuery(query: string): MenuItemRow | null {
  const q = query.trim()
  if (!q) return null

  const matches = menuItems.filter(
    (item) => item.available && itemNameMatchesQuery(item.name, q),
  )
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0]

  const initialsQuery = q.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (initialsQuery.length >= 2) {
    const exactInitial = matches.find(
      (item) => getItemInitials(item.name) === initialsQuery,
    )
    if (exactInitial) return exactInitial
  }

  const exactName = matches.find(
    (item) => item.name.toLowerCase() === q.toLowerCase(),
  )
  if (exactName) return exactName

  return matches[0]
}

export default function Billing() {
  const [billNo, setBillNo] = useState('')
  const [railCategoryId, setRailCategoryId] = useState(FAVORITES_ID)
  const [dropdownCategory, setDropdownCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [lines, setLines] = useState<CartLine[]>([])
  const [orderType, setOrderType] = useState<OrderType>('dine-in')
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [tableId, setTableId] = useState(billingTables[1]?.id ?? billingTables[0].id)
  const [guests, setGuests] = useState(billingTables[1]?.persons ?? 4)
  const [complimentary, setComplimentary] = useState(false)
  const [itsPaid, setItsPaid] = useState(false)
  const [loyalty, setLoyalty] = useState(false)
  const [feedbackSms, setFeedbackSms] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [splitOpen, setSplitOpen] = useState(false)
  const [partPaymentOpen, setPartPaymentOpen] = useState(false)
  const [dueAlertOpen, setDueAlertOpen] = useState(false)
  const [customerFormOpen, setCustomerFormOpen] = useState(false)
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER)
  const [customerErrors, setCustomerErrors] = useState<
    Partial<Record<keyof CustomerDetails, boolean>>
  >({})
  const [showCustomerErrors, setShowCustomerErrors] = useState(false)

  const favoriteIds = useMemo(
    () => new Set(menuItems.filter((i) => i.hasImage).slice(0, 12).map((i) => i.id)),
    [],
  )

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (railCategoryId === FAVORITES_ID) {
        if (!favoriteIds.has(item.id)) return false
      } else if (railCategoryId === ALL_CATEGORIES_ID) {
        // show every item across all sub-categories
      } else if (item.categoryId !== railCategoryId) {
        return false
      }
      if (dropdownCategory !== 'all' && item.categoryId !== dropdownCategory) {
        return false
      }
      if (search.trim()) {
        if (!itemNameMatchesQuery(item.name, search)) return false
      }
      if (shortCode.trim()) {
        const code = shortCode.trim().replace(/^0+(\d)/, '$1')
        const itemCode = item.shortCode.replace(/^0+(\d)/, '$1')
        if (itemCode !== code && item.shortCode !== shortCode.trim()) {
          return false
        }
      }
      return true
    })
  }, [railCategoryId, dropdownCategory, search, shortCode, favoriteIds])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  function addItem(item: MenuItemRow) {
    if (!item.available) return
    setLines((prev) => {
      const existing = prev.find((line) => line.itemId === item.id)
      if (existing) {
        return prev.map((line) =>
          line.id === existing.id ? { ...line, qty: line.qty + 1 } : line,
        )
      }
      return [
        ...prev,
        {
          id: `line-${item.id}-${Date.now()}`,
          itemId: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
        },
      ]
    })
  }

  function quickAddFromSearch() {
    const item = findBySearchQuery(search)
    if (!item) {
      showToast('No matching item found')
      return
    }
    addItem(item)
    setSearch('')
    showToast(`Added ${item.name}`)
  }

  function quickAddFromShortCode() {
    const item = findByShortCode(shortCode)
    if (!item) {
      showToast('No item for this short code')
      return
    }
    addItem(item)
    setShortCode('')
    showToast(`Added ${item.name}`)
  }

  function changeQty(lineId: string, qty: number) {
    if (qty < 1) {
      setLines((prev) => prev.filter((line) => line.id !== lineId))
      return
    }
    setLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, qty } : line)),
    )
  }

  function ensureBillNo() {
    if (billNo.trim()) return billNo.trim()
    const next = String(800 + Math.floor(Math.random() * 199) + 1)
    setBillNo(next)
    return next
  }

  function openPartPayment() {
    if (lines.length === 0) {
      showToast('Add items before part payment')
      setPayment('cash')
      return
    }
    ensureBillNo()
    setPayment('part')
    setPartPaymentOpen(true)
  }

  function handlePaymentChange(method: PaymentMethod) {
    if (method === 'part') {
      openPartPayment()
      return
    }
    if (method === 'due') {
      if (!customer.mobile.trim()) {
        setDueAlertOpen(true)
        return
      }
      if (!isCustomerComplete(customer)) {
        setPayment('due')
        setCustomerFormOpen(true)
        setShowCustomerErrors(true)
        setCustomerErrors(customerFieldErrors(customer))
        showToast('Please fill all compulsory customer fields')
        return
      }
      setPayment('due')
      setPartPaymentOpen(false)
      return
    }
    setPayment(method)
    setPartPaymentOpen(false)
    setCustomerFormOpen(false)
    setShowCustomerErrors(false)
    setCustomerErrors({})
    setCustomer(EMPTY_CUSTOMER)
  }

  function newOrder() {
    setLines([])
    setOrderType('dine-in')
    setPayment('cash')
    setComplimentary(false)
    setItsPaid(false)
    setLoyalty(false)
    setFeedbackSms(false)
    setBillNo('')
    setSearch('')
    setShortCode('')
    setPartPaymentOpen(false)
    setSplitOpen(false)
    setDueAlertOpen(false)
    setCustomerFormOpen(false)
    setCustomer(EMPTY_CUSTOMER)
    setCustomerErrors({})
    setShowCustomerErrors(false)
    showToast('New order started')
  }

  const billTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.qty, 0),
    [lines],
  )

  function handleAction(action: string) {
    if (action === 'Split') {
      if (lines.length === 0) {
        showToast('Add items before splitting the bill')
        return
      }
      setSplitOpen(true)
      return
    }
    if (action === 'Hold' || action.startsWith('Save') || action.startsWith('KOT')) {
      if (lines.length === 0 && action !== 'Hold') {
        showToast('Add items before continuing')
        return
      }
      if (payment === 'due' && !isCustomerComplete(customer)) {
        setCustomerFormOpen(true)
        setShowCustomerErrors(true)
        setCustomerErrors(customerFieldErrors(customer))
        showToast('Customer details are compulsory for Due payment')
        return
      }
    }
    showToast(`${action} — coming soon`)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={newOrder}
      />

      <AlertDialog
        open={dueAlertOpen}
        message="Customer phone is mandatory."
        onClose={() => setDueAlertOpen(false)}
        onOk={() => {
          setDueAlertOpen(false)
          setPayment('due')
          setCustomerFormOpen(true)
          setShowCustomerErrors(true)
          setCustomerErrors(customerFieldErrors(customer))
        }}
      />

      <SplitBillModal
        open={splitOpen}
        total={billTotal}
        lines={lines}
        onClose={() => setSplitOpen(false)}
        onSave={({ mode, amounts }) => {
          setSplitOpen(false)
          ensureBillNo()
          setPayment('part')
          setPartPaymentOpen(true)
          const summary = amounts.map((a) => `₹${a.toFixed(2)}`).join(' + ')
          const label =
            mode === 'portion'
              ? 'Portion'
              : mode === 'percentage'
                ? 'Percentage'
                : 'Item'
          showToast(`Bill split (${label}): ${summary}`)
        }}
      />

      {partPaymentOpen ? (
        <PartPaymentView
          billNo={billNo}
          payableAmount={billTotal}
          onBackToOrder={() => {
            setPartPaymentOpen(false)
            setPayment('cash')
          }}
          onNewOrder={newOrder}
          onPrint={() => showToast('Print — coming soon')}
          onEBill={() => showToast('EBill — coming soon')}
        />
      ) : (
      <div className="flex min-h-0 flex-1 flex-col gap-0 lg:flex-row lg:p-0">
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)]">
          <CategoryRail
            categories={RAIL_CATEGORIES}
            activeId={railCategoryId}
            onSelect={(id) => {
              setRailCategoryId(id)
              setDropdownCategory('all')
            }}
          />
          <ItemGrid
            items={filteredItems}
            categoryFilter={dropdownCategory}
            search={search}
            shortCode={shortCode}
            onCategoryFilterChange={setDropdownCategory}
            onSearchChange={setSearch}
            onShortCodeChange={setShortCode}
            onSearchSubmit={quickAddFromSearch}
            onShortCodeSubmit={quickAddFromShortCode}
            categoryOptions={baseMenuCategories.map((c) => ({
              id: c.id,
              name: c.name,
            }))}
            onAddItem={addItem}
            showFavoriteHeart={railCategoryId === FAVORITES_ID}
          />
        </div>

        <BillPanel
          lines={lines}
          orderType={orderType}
          payment={payment}
          tableId={tableId}
          guests={guests}
          complimentary={complimentary}
          itsPaid={itsPaid}
          loyalty={loyalty}
          feedbackSms={feedbackSms}
          customer={customer}
          customerFormOpen={customerFormOpen}
          customerErrors={showCustomerErrors ? customerErrors : undefined}
          onOrderTypeChange={setOrderType}
          onPaymentChange={handlePaymentChange}
          onTableIdChange={setTableId}
          onGuestsChange={setGuests}
          onComplimentaryChange={setComplimentary}
          onItsPaidChange={setItsPaid}
          onLoyaltyChange={setLoyalty}
          onFeedbackSmsChange={setFeedbackSms}
          onQtyChange={changeQty}
          onRemoveLine={(id) =>
            setLines((prev) => prev.filter((line) => line.id !== id))
          }
          onAction={handleAction}
          onCustomerChange={(next) => {
            setCustomer(next)
            if (showCustomerErrors) {
              setCustomerErrors(customerFieldErrors(next))
            }
          }}
          onCustomerFormOpenChange={setCustomerFormOpen}
        />
      </div>
      )}
    </div>
  )
}
