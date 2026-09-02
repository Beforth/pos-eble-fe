import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CaptainOrdersHeader } from '../../components/captainorders/CaptainOrdersHeader'
import {
  BillPanel,
  type CartLine,
  type CustomerDetails,
  type OrderType,
  type PaymentMethod,
} from '../../components/captainorders/BillPanel'
import { AlertDialog } from '../../components/captainorders/AlertDialog'
import { CategoryRail } from '../../components/captainorders/CategoryRail'
import { ItemGrid } from '../../components/captainorders/ItemGrid'
import { KotView } from '../../components/captainorders/KotView'
import { FinalBillCustomerModal } from '../../components/captainorders/FinalBillCustomerModal'
import { DummyBillModal, type DummyBillData } from '../../components/captainorders/DummyBillModal'
import { OpenItemModal } from '../../components/captainorders/OpenItemModal'
import { OtherPaymentModal, type OtherPaymentDetails } from '../../components/captainorders/OtherPaymentModal'
import { OrderNotesModal } from '../../components/captainorders/OrderNotesModal'
import { DraftBillsModal } from '../../components/captainorders/DraftBillsModal'
import { SaveDraftNameModal } from '../../components/captainorders/SaveDraftNameModal'
import { PartPaymentView } from '../../components/captainorders/PartPaymentView'
import { SplitBillModal } from '../../components/captainorders/SplitBillModal'
import {
  baseMenuCategories,
  menuItems,
  type MenuItemRow,
} from '../../mocks/menuItemsData'
import { billingTables } from '../../mocks/billingTables'
import {
  labelForOrderType,
  kotTicketAmount,
  nextKotNoForTable,
  ticketsForTable,
  type KotTicket,
} from '../../mocks/kotViewData'
import { getItemInitials, itemNameMatchesQuery } from '../../utils/itemSearch'
import { recordCoverSize } from '../../utils/coverSizeStore'
import {
  loadDraftBills,
  upsertDraftBill,
  deleteDraftBill,
  type DraftBill,
} from '../../utils/draftBillStore'
import {
  appendKotTicket,
  loadAllKotTickets,
  markTablePrinted,
  replaceKotTickets,
  settleTableSession,
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

export default function CaptainOrders() {
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
  const [mobilePane, setMobilePane] = useState<'menu' | 'bill'>('menu')
  const [kotTickets, setKotTickets] = useState<KotTicket[]>(() =>
    loadAllKotTickets(),
  )
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
  const [draftsOpen, setDraftsOpen] = useState(false)
  const [draftCount, setDraftCount] = useState(() => loadDraftBills().length)
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [saveDraftOpen, setSaveDraftOpen] = useState(false)

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

  function clearBillForNextCustomer() {
    setLines([])
    setOrderNote('')
    setOrderType('dine-in')
    setPayment('cash')
    setTableId('')
    setGuests(0)
    setComplimentary(false)
    setItsPaid(false)
    setLoyalty(false)
    setFeedbackSms(false)
    setCustomer(EMPTY_CUSTOMER)
    setCustomerErrors({})
    setShowCustomerErrors(false)
    setCustomerFormOpen(false)
    setSettlementAmount(null)
    setOtherPayment(null)
    setActiveDraftId(null)
  }

  function refreshDraftCount() {
    setDraftCount(loadDraftBills().length)
  }

  function saveCurrentAsDraft(customerName: string) {
    if (lines.length === 0) {
      showToast('Add items before saving a draft')
      return
    }
    const saved = upsertDraftBill({
      id: activeDraftId ?? undefined,
      tableId,
      tableNo: selectedTableNo,
      guests,
      orderType,
      payment,
      lines,
      orderNote,
      customer: {
        ...customer,
        name: customerName,
      },
    })
    setActiveDraftId(saved.id)
    refreshDraftCount()
    setSaveDraftOpen(false)
    clearBillForNextCustomer()
    showToast(`Draft saved for ${customerName}`)
  }

  function startSaveDraft() {
    if (lines.length === 0) {
      showToast('Add items before saving a draft')
      return
    }
    setSaveDraftOpen(true)
  }

  function resumeDraft(draft: DraftBill) {
    setLines(draft.lines)
    setTableId(draft.tableId)
    setGuests(draft.guests)
    setOrderType(draft.orderType)
    setPayment(draft.payment === 'part' ? 'cash' : draft.payment)
    setOrderNote(draft.orderNote)
    setCustomer(draft.customer)
    setActiveDraftId(draft.id)
    setDraftsOpen(false)
    setPartPaymentOpen(false)
    setKotViewOpen(false)
    showToast(
      draft.tableNo !== 'No table'
        ? `Draft resumed · Table ${draft.tableNo}`
        : 'Draft resumed',
    )
  }

  function newOrder() {
    navigate('/table-view?from=captain')
  }

  const tableKotTickets = useMemo(
    () => ticketsForTable(kotTickets, tableId),
    [kotTickets, tableId],
  )

  const hasTableSelected = Boolean(tableId)

  const tableKotSummary = useMemo(
    () =>
      tableKotTickets.map((t) => ({
        id: t.id,
        kotNo: t.kotNo,
        amount: kotTicketAmount(t),
        createdAt: t.createdAt,
        items: t.items.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          note: item.note,
        })),
      })),
    [tableKotTickets],
  )

  const currentLinesTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.qty, 0),
    [lines],
  )

  const selectedQtyByItemId = useMemo(() => {
    const map: Record<string, number> = {}
    for (const line of lines) {
      map[line.itemId] = (map[line.itemId] ?? 0) + line.qty
    }
    return map
  }, [lines])

  const kotTotal = useMemo(
    () => tableKotSummary.reduce((sum, k) => sum + k.amount, 0),
    [tableKotSummary],
  )

  // No table: KOTs only appear on Kot View — not under the bill items list.
  const billTotal = hasTableSelected
    ? currentLinesTotal + kotTotal
    : currentLinesTotal

  const payableTotal = settlementAmount ?? billTotal

  const cartItemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty, 0),
    [lines],
  )

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
    const kotKey = tableId || `order-${orderType}-${Date.now()}`
    const kotNo = nextKotNoForTable(kotTickets, kotKey)
    const displayTableNo =
      table?.tableNo ??
      (orderType === 'delivery'
        ? 'Delivery'
        : orderType === 'pick-up'
          ? 'Pick Up'
          : orderType === 'other'
            ? 'Other'
            : 'Counter')
    return {
      id: `kot-${kotKey}-${kotNo}-${Date.now()}`,
      kotNo,
      tableId: tableId || 'no-table',
      tableNo: displayTableNo,
      orderType,
      biller: 'biller (biller)',
      persons: guests > 0 ? guests : table?.persons ?? 0,
      createdAt: Date.now(),
      status: 'active',
      note: note?.trim() || undefined,
      items: sourceLines.map((line) => ({
        id: line.id,
        itemId: line.itemId,
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

      // Print / eBill → green (printed). Keep KOTs until settlement.
      if (action === 'Save & Print' || action === 'Save & eBill') {
        markTablePrinted(kotKey)
      }
      // Do not clear table KOTs here — settlement clears to blank.
      setLines([])
      setOrderNote('')

      // Stash cover size persons on session via guests for later settlement
      if (coverPersons > 0) {
        setGuests(coverPersons)
      }
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
    if (activeDraftId) {
      deleteDraftBill(activeDraftId)
      setActiveDraftId(null)
      refreshDraftCount()
    }

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
          ? `eBill #${bill} generated · table printed`
          : `Bill #${bill} ready to print · table printed`,
      )
      return
    }

    showToast(
      `Bill #${bill} · Table ${selectedTableNo} · ${kotCount} KOT${kotCount === 1 ? '' : 's'} merged · saved`,
    )
  }

  function finalizeTableSettlement(amount: number) {
    if (!hasTableSelected) {
      setSettlementAmount(amount)
      showToast(`Settlement saved · ₹${amount}`)
      return
    }
    const kotsSnapshot = ticketsForTable(kotTickets, tableId)
    const coverPersons =
      guests > 0
        ? guests
        : Math.max(0, ...kotsSnapshot.map((k) => k.persons), 0)
    if (coverPersons > 0) {
      recordCoverSize(coverPersons, selectedTableNo)
    }
    const remaining = kotTickets.filter((t) => t.tableId !== tableId)
    settleTableSession(tableId, remaining)
    setKotTickets(remaining)
    setLines([])
    setOrderNote('')
    setSettlementAmount(null)
    setGuests(0)
    setTableId('')
    if (activeDraftId) {
      deleteDraftBill(activeDraftId)
      setActiveDraftId(null)
      refreshDraftCount()
    }
    showToast(`Settled ₹${amount} · table cleared`)
    navigate('/table-view')
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
        const next = appendKotTicket(ticket)
        setKotTickets(next)
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

      const next = appendKotTicket(ticket)
      setKotTickets(next)
      setLines([])
      setOrderNote('')
      const destLabel = ticket.tableNo ? `${ticket.tableNo}` : labelForOrderType(ticket.orderType)
      showToast(
        action === 'KOT & Print'
          ? `${destLabel} · KOT ${ticket.kotNo} sent · Print started`
          : `${destLabel} · KOT ${ticket.kotNo} sent`,
      )
      if (hasTableSelected) {
        navigate('/table-view')
      }
      return
    }

    if (action === 'Save' || action === 'Save & Print' || action === 'Save & eBill') {
      startFinalBill(action)
      return
    }

    if (action === 'Draft') {
      startSaveDraft()
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

      <CaptainOrdersHeader
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
          if (hasTableSelected) {
            navigate('/table-view')
          }
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
          onPrint={() => {
            setPartPaymentOpen(false)
            startFinalBill('Save & Print')
          }}
        />
      ) : kotViewOpen ? (
        <KotView
          tickets={kotTickets}
          onBack={() => setKotViewOpen(false)}
          onFoodReady={(id) => {
            setKotTickets((prev) => {
              const next = prev.map((t) =>
                t.id === id ? { ...t, status: 'ready' as const } : t,
              )
              replaceKotTickets(next)
              return next
            })
            showToast('Marked as Food Is Ready')
          }}
          onDismiss={(id) => {
            setKotTickets((prev) => {
              const next = prev.filter((t) => t.id !== id)
              replaceKotTickets(next)
              return next
            })
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
            const remaining = kotTickets.filter(
              (t) => !ticketIds.includes(t.id),
            )
            if (settledTableId && settledTableId !== 'no-table') {
              settleTableSession(settledTableId, remaining)
            } else {
              replaceKotTickets(remaining)
            }
            setKotTickets(remaining)
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
            if (settledTableId && settledTableId !== 'no-table') {
              navigate('/table-view')
            }
          }}
        />
      ) : (
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Mobile / tablet: Menu | Bill switcher */}
        <div className="flex shrink-0 gap-1 border-b border-line bg-card p-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePane('menu')}
            className={`h-10 flex-1 rounded-lg text-sm font-semibold transition-colors ${
              mobilePane === 'menu'
                ? 'bg-primary text-white'
                : 'bg-page text-ink hover:bg-page/80'
            }`}
          >
            Menu
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('bill')}
            className={`relative h-10 flex-1 rounded-lg text-sm font-semibold transition-colors ${
              mobilePane === 'bill'
                ? 'bg-primary text-white'
                : 'bg-page text-ink hover:bg-page/80'
            }`}
          >
            Bill
            {cartItemCount > 0 ? (
              <span
                className={`ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                  mobilePane === 'bill'
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/15 text-primary'
                }`}
              >
                {cartItemCount}
              </span>
            ) : null}
          </button>
        </div>

        <div
          className={`relative min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)] ${
            mobilePane === 'menu' ? 'flex' : 'hidden'
          } lg:flex`}
        >
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
            {/* Desktop category rail */}
            <div className="hidden lg:flex">
              <CategoryRail
                categories={RAIL_CATEGORIES}
                activeId={railCategoryId}
                onSelect={(id) => {
                  setRailCategoryId(id)
                  setDropdownCategory('all')
                }}
              />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {/* Mobile / tablet horizontal categories */}
              <div className="shrink-0 border-b border-line bg-card lg:hidden">
                <div className="flex gap-1.5 overflow-x-auto px-2 py-2 [scrollbar-width:thin]">
                  {RAIL_CATEGORIES.map((cat) => {
                    const active = cat.id === railCategoryId
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setRailCategoryId(cat.id)
                          setDropdownCategory('all')
                        }}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-primary text-white'
                            : cat.id === 'favorites'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-page text-ink hover:bg-page/80'
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

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
                selectedQtyByItemId={selectedQtyByItemId}
                showFavoriteHeart={railCategoryId === FAVORITES_ID}
                showOpenItem={railCategoryId === FAVORITES_ID}
                onOpenItemClick={() => setOpenItemModalOpen(true)}
              />
            </div>
          </div>

          {/* Mobile sticky cart bar */}
          <div className="shrink-0 border-t border-line bg-card p-2 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">
                  {cartItemCount} item{cartItemCount === 1 ? '' : 's'}
                </p>
                <p className="text-sm font-bold text-ink">
                  ₹{payableTotal.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAction('KOT')}
                className="h-10 rounded-lg border border-line bg-card px-3 text-sm font-semibold text-ink hover:bg-page"
              >
                KOT
              </button>
              <button
                type="button"
                onClick={() => setMobilePane('bill')}
                className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                View Bill
              </button>
            </div>
          </div>
        </div>

        <div
          className={`min-h-0 w-full shrink-0 flex-col overflow-hidden lg:flex lg:w-[440px] xl:w-[480px] ${
            mobilePane === 'bill' ? 'flex flex-1' : 'hidden'
          }`}
        >
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
            onRemoveKotItem={({ ticketId, itemId, reason }) => {
              setKotTickets((prev) => {
                const next = prev
                  .map((ticket) => {
                    if (ticket.id !== ticketId) return ticket
                    const items = ticket.items.filter((item) => item.id !== itemId)
                    return { ...ticket, items }
                  })
                  .filter((ticket) => ticket.items.length > 0)
                replaceKotTickets(next)
                return next
              })
              showToast(`Item removed · ${reason}`)
            }}
            onClearItems={() => {
              if (lines.length === 0) return
              setLines([])
              showToast('All items removed')
            }}
            onSettleSave={finalizeTableSettlement}
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
            onOpenDrafts={() => setDraftsOpen(true)}
            draftCount={draftCount}
          />
        </div>
      </div>
      )}

      <DraftBillsModal
        open={draftsOpen}
        onClose={() => setDraftsOpen(false)}
        onResume={resumeDraft}
      />

      <SaveDraftNameModal
        open={saveDraftOpen}
        initialName={customer.name}
        onClose={() => setSaveDraftOpen(false)}
        onConfirm={saveCurrentAsDraft}
      />
    </div>
  )
}
