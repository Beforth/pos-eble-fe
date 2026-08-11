import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { KotView } from '../../components/billing/KotView'
import { FinalBillCustomerModal } from '../../components/billing/FinalBillCustomerModal'
import { DummyBillModal, type DummyBillData } from '../../components/billing/DummyBillModal'
import { OpenItemModal } from '../../components/billing/OpenItemModal'
import { OtherPaymentModal, type OtherPaymentDetails } from '../../components/billing/OtherPaymentModal'
import { OrderNotesModal } from '../../components/billing/OrderNotesModal'
import { PartPaymentView } from '../../components/billing/PartPaymentView'
import { SplitBillModal } from '../../components/billing/SplitBillModal'
import {
  baseMenuCategories,
  menuItems,
  type MenuItemRow,
} from '../../mocks/menuItemsData'
import { billingTables } from '../../mocks/billingTables'
import {
  kotTicketAmount,
  nextKotNoForTable,
  ticketsForTable,
  type KotTicket,
} from '../../mocks/kotViewData'
import { getItemInitials, itemNameMatchesQuery } from '../../utils/itemSearch'
import { recordCoverSize } from '../../utils/coverSizeStore'
import {
  getTableStatus,
  setTableStatus,
} from '../../utils/tableStatusStore'

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
  gstNo: '',
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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [billNo, setBillNo] = useState('')
  const [railCategoryId, setRailCategoryId] = useState(FAVORITES_ID)
  const [dropdownCategory, setDropdownCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [lines, setLines] = useState<CartLine[]>([])
  const [orderType, setOrderType] = useState<OrderType>(() => {
    const ot = searchParams.get('orderType')
    if (ot === 'delivery' || ot === 'pick-up' || ot === 'dine-in' || ot === 'other') {
      return ot
    }
    return 'dine-in'
  })
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [tableId, setTableId] = useState(() => searchParams.get('tableId') ?? '')
  const [guests, setGuests] = useState(() => {
    const p = Number(searchParams.get('persons'))
    return Number.isFinite(p) && p > 0 ? Math.floor(p) : 0
  })
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
  const [notesOpen, setNotesOpen] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [openItemModalOpen, setOpenItemModalOpen] = useState(false)
  const [kotViewOpen, setKotViewOpen] = useState(
    () => searchParams.get('kot') === '1',
  )
  const [kotTickets, setKotTickets] = useState<KotTicket[]>([])
  const [finalBillOpen, setFinalBillOpen] = useState(false)
  const [finalBillAction, setFinalBillAction] = useState<
    'Save' | 'Save & Print' | 'Save & eBill'
  >('Save & Print')
  const [dummyBillOpen, setDummyBillOpen] = useState(false)
  const [dummyBill, setDummyBill] = useState<DummyBillData | null>(null)
  const [otherPaymentOpen, setOtherPaymentOpen] = useState(false)
  const [otherPayment, setOtherPayment] = useState<OtherPaymentDetails | null>(
    null,
  )
  const [paymentBeforeOther, setPaymentBeforeOther] =
    useState<PaymentMethod>('cash')
  const [settlementAmount, setSettlementAmount] = useState<number | null>(null)

  useEffect(() => {
    const nextTableId = searchParams.get('tableId')
    if (nextTableId) {
      setTableId(nextTableId)
      const table = billingTables.find((t) => t.id === nextTableId)
      const personsParam = Number(searchParams.get('persons'))
      if (Number.isFinite(personsParam) && personsParam > 0) {
        setGuests(Math.floor(personsParam))
      } else if (table) {
        setGuests(table.persons)
      }
    }
    const ot = searchParams.get('orderType')
    if (ot === 'delivery' || ot === 'pick-up' || ot === 'dine-in' || ot === 'other') {
      setOrderType(ot)
    }
    if (searchParams.get('kot') === '1') {
      setKotViewOpen(true)
    }
  }, [searchParams])

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

  /** Colour tables only from order activity — never from selection alone. */
  function markTableFromActivity(
    status: 'running' | 'running-kot' | 'printed' | 'paid',
    id = tableId,
  ) {
    if (!id) return
    if (status === 'running' && getTableStatus(id) !== 'blank') return
    setTableStatus(id, status)
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
    markTableFromActivity('running')
  }

  function addOpenItem(item: { name: string; price: number }) {
    const itemId = `open-${item.name.toLowerCase()}-${item.price}`
    setLines((prev) => {
      const existing = prev.find((line) => line.itemId === itemId)
      if (existing) {
        return prev.map((line) =>
          line.id === existing.id ? { ...line, qty: line.qty + 1 } : line,
        )
      }
      return [
        ...prev,
        {
          id: `line-${itemId}-${Date.now()}`,
          itemId,
          name: item.name,
          price: item.price,
          qty: 1,
        },
      ]
    })
    markTableFromActivity('running')
    showToast(`Added ${item.name}`)
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
    if (billTotal <= 0) {
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
    if (method === 'other') {
      setPaymentBeforeOther(payment === 'other' ? 'cash' : payment)
      setOtherPaymentOpen(true)
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
      setOtherPayment(null)
      return
    }
    setPayment(method)
    setPartPaymentOpen(false)
    setCustomerFormOpen(false)
    setShowCustomerErrors(false)
    setCustomerErrors({})
    setCustomer(EMPTY_CUSTOMER)
    setOtherPayment(null)
  }

  function newOrder() {
    navigate('/table-view')
  }

  const tableKotTickets = useMemo(
    () => ticketsForTable(kotTickets, tableId),
    [kotTickets, tableId],
  )

  const hasTableSelected = Boolean(tableId)

  const tableKotSummary = useMemo(
    () =>
      tableKotTickets.map((t) => ({
        kotNo: t.kotNo,
        amount: kotTicketAmount(t),
      })),
    [tableKotTickets],
  )

  const currentLinesTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.qty, 0),
    [lines],
  )

  const kotTotal = useMemo(
    () => tableKotSummary.reduce((sum, k) => sum + k.amount, 0),
    [tableKotSummary],
  )

  // No table: KOTs only appear on Kot View — not under the bill items list.
  const billTotal = hasTableSelected
    ? currentLinesTotal + kotTotal
    : currentLinesTotal

  const payableTotal = settlementAmount ?? billTotal

  const selectedTableNo =
    billingTables.find((t) => t.id === tableId)?.tableNo ?? 'No table'

  useEffect(() => {
    setSettlementAmount(null)
  }, [billTotal])

  function createKotFromLines(
    sourceLines: CartLine[],
    note?: string,
  ): KotTicket | null {
    if (sourceLines.length === 0) return null
    const table = billingTables.find((t) => t.id === tableId)
    const kotKey = tableId || 'no-table'
    const kotNo = nextKotNoForTable(kotTickets, kotKey)
    return {
      id: `kot-${kotKey}-${kotNo}-${Date.now()}`,
      kotNo,
      tableId: kotKey,
      tableNo: table?.tableNo ?? 'NT',
      orderType,
      biller: 'biller (biller)',
      persons: guests > 0 ? guests : table?.persons ?? 0,
      createdAt: Date.now(),
      status: 'active',
      note: note?.trim() || undefined,
      items: sourceLines.map((line) => ({
        id: line.id,
        name: line.name,
        qty: line.qty,
        price: line.price,
      })),
    }
  }

  function settleTableBill(
    action: 'Save' | 'Save & Print' | 'Save & eBill',
    customerInfo: { name: string; phone: string },
  ) {
    const bill = ensureBillNo()
    const kotKey = tableId || 'no-table'

    let items: {
      name: string
      qty: number
      price: number
      kotNo?: number
    }[]
    let kotCount: number

    if (!hasTableSelected) {
      // No table: bill current cart only; KOTs stay on Kot View only.
      items = lines.map((line) => ({
        name: line.name,
        qty: line.qty,
        price: line.price,
      }))
      kotCount = 0
      setLines([])
      setOrderNote('')
    } else {
      const kotsSnapshot = ticketsForTable(kotTickets, kotKey)
      kotCount = kotsSnapshot.length
      items = kotsSnapshot.flatMap((kot) =>
        kot.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          kotNo: kot.kotNo,
        })),
      )
      const coverPersons =
        guests > 0
          ? guests
          : Math.max(0, ...kotsSnapshot.map((k) => k.persons), 0)
      if (coverPersons > 0) {
        recordCoverSize(coverPersons, selectedTableNo)
      }
      if (hasTableSelected) {
        setTableStatus(
          kotKey,
          action === 'Save & Print' || action === 'Save & eBill'
            ? 'printed'
            : 'paid',
        )
      }
      setKotTickets((prev) => prev.filter((t) => t.tableId !== kotKey))
      setLines([])
      setOrderNote('')
    }

    if (!hasTableSelected && guests > 0) {
      recordCoverSize(guests, selectedTableNo)
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const tax = Math.round(subtotal * 0.05 * 100) / 100
    const computedTotal = Math.round((subtotal + tax) * 100) / 100
    const total = settlementAmount ?? computedTotal

    setFinalBillOpen(false)
    setKotViewOpen(false)
    setSettlementAmount(null)
    setCustomer((prev) => ({
      ...prev,
      name: customerInfo.name,
      mobile: customerInfo.phone,
    }))

    if (action === 'Save & Print' || action === 'Save & eBill') {
      setDummyBill({
        billNo: bill,
        mode: action === 'Save & eBill' ? 'ebill' : 'print',
        tableNo: selectedTableNo,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        paymentLabel:
          payment === 'other' && otherPayment
            ? otherPayment.type
            : payment,
        createdAt: Date.now(),
        items,
        kotCount,
        subtotal,
        tax,
        total,
      })
      setDummyBillOpen(true)
      showToast(
        action === 'Save & eBill'
          ? `eBill #${bill} generated`
          : `Bill #${bill} ready to print`,
      )
      return
    }

    showToast(
      `Bill #${bill} · Table ${selectedTableNo} · ${kotCount} KOT${kotCount === 1 ? '' : 's'} merged · saved`,
    )
  }

  function startFinalBill(action: 'Save' | 'Save & Print' | 'Save & eBill') {
    if (!hasTableSelected) {
      if (lines.length === 0) {
        showToast('Add items before saving the bill')
        return
      }
      if (payment === 'due' && !isCustomerComplete(customer)) {
        setCustomerFormOpen(true)
        setShowCustomerErrors(true)
        setCustomerErrors(customerFieldErrors(customer))
        showToast('Customer details are compulsory for Due payment')
        return
      }
      setFinalBillAction(action)
      setFinalBillOpen(true)
      return
    }

    const hasKots = tableKotTickets.length > 0
    if (!hasKots && lines.length === 0) {
      showToast('Add items or send a KOT before saving the bill')
      return
    }
    if (payment === 'due' && !isCustomerComplete(customer)) {
      setCustomerFormOpen(true)
      setShowCustomerErrors(true)
      setCustomerErrors(customerFieldErrors(customer))
      showToast('Customer details are compulsory for Due payment')
      return
    }

    // Include any unsent items as the next KOT before merging the bill.
    if (lines.length > 0) {
      const ticket = createKotFromLines(lines, orderNote)
      if (ticket) {
        setKotTickets((prev) => [...prev, ticket])
        setLines([])
        setOrderNote('')
      }
    }

    setFinalBillAction(action)
    setFinalBillOpen(true)
  }

  function handleAction(action: string) {
    if (action === 'Split') {
      if (billTotal <= 0) {
        showToast('Add items before splitting the bill')
        return
      }
      setSplitOpen(true)
      return
    }

    if (action === 'KOT' || action === 'KOT & Print') {
      if (lines.length === 0) {
        showToast('Add items before sending KOT')
        return
      }
      if (payment === 'due' && !isCustomerComplete(customer)) {
        setCustomerFormOpen(true)
        setShowCustomerErrors(true)
        setCustomerErrors(customerFieldErrors(customer))
        showToast('Customer details are compulsory for Due payment')
        return
      }

      const ticket = createKotFromLines(lines, orderNote)
      if (!ticket) return

      setKotTickets((prev) => [...prev, ticket])
      setLines([])
      setOrderNote('')
      setKotViewOpen(true)
      if (ticket.tableId !== 'no-table') {
        setTableStatus(ticket.tableId, 'running-kot')
      }
      showToast(
        action === 'KOT & Print'
          ? `Table ${ticket.tableNo} · KOT ${ticket.kotNo} sent · Print started`
          : `Table ${ticket.tableNo} · KOT ${ticket.kotNo} sent to kitchen`,
      )
      return
    }

    if (action === 'Save' || action === 'Save & Print' || action === 'Save & eBill') {
      startFinalBill(action)
      return
    }

    if (action === 'Hold') {
      if (lines.length === 0 && tableKotTickets.length === 0) {
        showToast('Nothing to hold')
        return
      }
      showToast(`Table ${selectedTableNo} held`)
      return
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
        onViewKot={() => setKotViewOpen(true)}
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

      <OrderNotesModal
        open={notesOpen}
        value={orderNote}
        onClose={() => setNotesOpen(false)}
        onSave={(comment) => {
          setOrderNote(comment)
          setNotesOpen(false)
          showToast(
            comment ? 'Order notes saved' : 'Order notes cleared',
          )
        }}
      />

      <OpenItemModal
        open={openItemModalOpen}
        onClose={() => setOpenItemModalOpen(false)}
        onSave={addOpenItem}
      />

      <OtherPaymentModal
        open={otherPaymentOpen}
        initial={otherPayment ?? undefined}
        onNo={() => {
          setOtherPaymentOpen(false)
          if (payment !== 'other') {
            setPayment(paymentBeforeOther)
          }
        }}
        onYes={(details) => {
          setOtherPayment(details)
          setPayment('other')
          setOtherPaymentOpen(false)
          setPartPaymentOpen(false)
          showToast(`Other payment · ${details.type}`)
        }}
      />

      <FinalBillCustomerModal
        open={finalBillOpen}
        kotCount={hasTableSelected ? tableKotTickets.length : 0}
        total={payableTotal}
        tableNo={selectedTableNo}
        confirmLabel={
          finalBillAction === 'Save & eBill'
            ? 'Generate eBill'
            : finalBillAction === 'Save'
              ? 'Save Bill'
              : 'Generate Bill'
        }
        initial={{ name: customer.name, phone: customer.mobile }}
        onClose={() => setFinalBillOpen(false)}
        onConfirm={(info) => settleTableBill(finalBillAction, info)}
      />

      <DummyBillModal
        open={dummyBillOpen}
        bill={dummyBill}
        onClose={() => {
          setDummyBillOpen(false)
          setDummyBill(null)
        }}
      />

      <SplitBillModal
        open={splitOpen}
        total={payableTotal}
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
          payableAmount={payableTotal}
          onBackToOrder={() => {
            setPartPaymentOpen(false)
            setPayment('cash')
          }}
          onNewOrder={newOrder}
          onPrint={() => showToast('Print — coming soon')}
          onEBill={() => showToast('EBill — coming soon')}
        />
      ) : kotViewOpen ? (
        <KotView
          tickets={kotTickets}
          onBack={() => setKotViewOpen(false)}
          onFoodReady={(id) => {
            setKotTickets((prev) =>
              prev.map((t) =>
                t.id === id ? { ...t, status: 'ready' as const } : t,
              ),
            )
            showToast('Marked as Food Is Ready')
          }}
          onDismiss={(id) => {
            setKotTickets((prev) => prev.filter((t) => t.id !== id))
            showToast('KOT cancelled')
          }}
          onSettleSave={({ tableId: settledTableId, ticketIds, result }) => {
            const settled = kotTickets.filter((t) => ticketIds.includes(t.id))
            const coverPersons = Math.max(
              0,
              ...settled.map((t) => t.persons),
              0,
            )
            const tableLabel = settled[0]?.tableNo ?? 'NT'
            if (coverPersons > 0) {
              recordCoverSize(coverPersons, tableLabel)
            }
            if (settledTableId && settledTableId !== 'no-table') {
              setTableStatus(settledTableId, 'paid')
            }
            setKotTickets((prev) =>
              prev.filter((t) => !ticketIds.includes(t.id)),
            )
            if (settledTableId === tableId || settledTableId === 'no-table') {
              setLines([])
              setOrderNote('')
            }
            setPayment(result.payment)
            showToast(
              `Settled ₹${result.settlementAmount} · ${result.payment}${
                result.returnToCustomer > 0
                  ? ` · Return ₹${result.returnToCustomer}`
                  : ''
              }`,
            )
          }}
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
            showOpenItem={railCategoryId === FAVORITES_ID}
            onOpenItemClick={() => setOpenItemModalOpen(true)}
          />
        </div>

        <BillPanel
          lines={lines}
          tableKots={hasTableSelected ? tableKotSummary : []}
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
          onClearItems={() => {
            if (lines.length === 0) return
            setLines([])
            showToast('All items removed')
          }}
          onSettleSave={(amount) => {
            setSettlementAmount(amount)
            showToast(`Settlement saved · ₹${amount}`)
          }}
          onAction={handleAction}
          onCustomerChange={(next) => {
            setCustomer(next)
            if (showCustomerErrors) {
              setCustomerErrors(customerFieldErrors(next))
            }
          }}
          onCustomerFormOpenChange={setCustomerFormOpen}
          onNotesClick={() => setNotesOpen(true)}
          hasOrderNote={Boolean(orderNote.trim())}
        />
      </div>
      )}
    </div>
  )
}
