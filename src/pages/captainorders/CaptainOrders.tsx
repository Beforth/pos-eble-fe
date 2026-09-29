import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../auth/AuthContext'
import { showToast } from '../../utils/toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CaptainOrdersHeader } from '../../components/captainorders/CaptainOrdersHeader'
import {
  BillPanel,
  type BillChargesSnapshot,
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
  type MenuItemRow,
  useBillingMenu,
} from '../../utils/menuAdapter'
import { useDiningTables } from '../../utils/diningTables'
import {
  labelForOrderType,
  kotTicketAmount,
  nextKotNoForTable,
  ticketsForTable,
  type KotTicket,
  type KotViewOrderType,
} from '../../mocks/kotViewData'
import {
  allocateBillNoApi,
  createKotApi,
  createOrderApi,
  deleteDraftBillApi,
  kotEventToTicket,
  listDraftBillsApi,
  markKotReadyApi,
  saveDraftBillApi,
  settleOrderApi,
  splitOrderApi,
  updateDraftBillApi,
  updateKotApi,
  type CreateKotPayload,
  type KotEventData,
  type KotOrderType,
  type OrderDto,
} from '../../services/orderService'
import { getItemInitials, itemNameMatchesQuery } from '../../utils/itemSearch'
import { recordCoverSize } from '../../utils/coverSizeStore'
import {
  toDraftBillPayload,
  type DraftBill,
} from '../../utils/draftBillStore'
import {
  appendKotTicket,
  getTableSession,
  loadAllKotTickets,
  markTablePrinted,
  removeKotTicket,
  replaceKotTickets,
  settleTableSession,
  upsertKotTicketFromServer,
} from '../../utils/tableStatusStore'
import {
  sendKotForOrder,
  settleKotOrder,
  type KotTaxTotals,
} from '../../services/kotOrderFlow'
import {
  computeTax,
  DEFAULT_TAX_SETTINGS,
  type TaxableItem,
  type TaxBreakdownLine,
  type TaxSettings,
} from '../../utils/taxEngine'
import { useOutletSettings } from '../../services/useOutletSettings'
import { subscribeToRail } from '../../services/liveRailClient'

const FAVORITES_ID = 'favorites'
const ALL_CATEGORIES_ID = 'all-categories'

const EMPTY_CUSTOMER: CustomerDetails = {
  mobile: '',
  name: '',
  address: '',
  locality: '',
  gstNo: '',
}

const KOT_ORDER_TYPE_UPPER: Record<KotViewOrderType, KotOrderType> = {
  'dine-in': 'DINE IN',
  delivery: 'DELIVERY',
  'pick-up': 'PICK UP',
  other: 'OTHER',
}

function orderTypeForApi(orderType: OrderType): 'dine-in' | 'delivery' | 'pick-up' {
  switch (orderType) {
    case 'delivery':
      return 'delivery'
    case 'pick-up':
      return 'pick-up'
    case 'other':
      return 'pick-up'
    case 'dine-in':
    default:
      return 'dine-in'
  }
}

function paymentTypeLabel(method: PaymentMethod, otherType?: string): string {
  switch (method) {
    case 'cash':
      return 'Cash'
    case 'card':
      return 'Card'
    case 'due':
      return 'Due'
    case 'part':
      return 'Part'
    case 'other':
    default:
      return otherType?.trim() || 'Other'
  }
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

function findByShortCode(
  items: MenuItemRow[],
  codeInput: string,
): MenuItemRow | null {
  const raw = codeInput.trim()
  if (!raw) return null
  const code = normalizeShortCode(raw)
  return (
    items.find(
      (item) =>
        item.available &&
        (item.shortCode === raw || normalizeShortCode(item.shortCode) === code),
    ) ?? null
  )
}

function findBySearchQuery(
  items: MenuItemRow[],
  query: string,
): MenuItemRow | null {
  const q = query.trim()
  if (!q) return null

  const matches = items.filter(
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
  const { user, encryptedOutletId, token } = useAuth()
  const billerName = user?.name?.trim() || user?.identifier?.trim() || ''
  const [searchParams] = useSearchParams()
  const [billNo, setBillNo] = useState('')

  const {
    items: menuItems,
    categories: menuReferenceCategories,
    status: menuStatus,
    error: menuError,
    reload: reloadMenu,
  } = useBillingMenu()
  const { tables: billingTableRows, tablesById } = useDiningTables()

  // Outlet tax switches (tax-before-discount, tax-on-charges, …). The engine
  // falls back to its documented defaults while this loads or when the group
  // has not been saved yet, so billing never blocks on settings.
  const { data: calcSettings } = useOutletSettings('calculations')
  const calcTaxSettings = useMemo<Partial<TaxSettings>>(() => {
    const record = calcSettings as Record<string, unknown> | null
    if (!record) return {}
    return {
      taxBeforeDiscount: Boolean(record.tax_before_discount),
      backwardTaxAfterDiscount: Boolean(record.backward_tax_after_discount),
      taxOnDeliveryCharge: Boolean(record.tax_on_delivery_charge),
      taxOnContainerCharge: Boolean(record.tax_on_container_charge),
    }
  }, [calcSettings])

  /** Menu rows keyed by item id — the tax slabs the engine prices lines with. */
  const taxSource = useMemo(() => {
    const map = new Map<string, TaxableItem>()
    for (const item of menuItems) {
      map.set(item.id, { taxes: item.taxes ?? [], ignoreTax: item.ignoreTax ?? false })
    }
    return map
  }, [menuItems])

  const menuCategories = useMemo(
    () =>
      menuReferenceCategories.filter(
        (cat) =>
          cat.is_active && menuItems.some((item) => item.categoryId === cat.id),
      ),
    [menuReferenceCategories, menuItems],
  )

  const railCategories = useMemo(
    () => [
      { id: FAVORITES_ID, name: 'Favorite Items' },
      { id: ALL_CATEGORIES_ID, name: 'All Categories' },
      ...menuCategories.map((cat) => ({ id: cat.id, name: cat.name })),
    ],
    [menuCategories],
  )

  function kotPayloadFromTicket(ticket: KotTicket): CreateKotPayload {
    return {
      order_type: KOT_ORDER_TYPE_UPPER[ticket.orderType] ?? 'OTHER',
      source: ticket.source,
      table_id: ticket.tableId === 'no-table' ? '' : ticket.tableId,
      table_no: ticket.tableId === 'no-table' ? '' : ticket.tableNo,
      guests: ticket.persons ?? 0,
      customer_name: ticket.customerName?.trim() || '',
      // A KOT sent from a resumed draft consumes that draft server-side, so it
      // leaves the drafts list instead of lingering as a resumable copy.
      draft_id: activeDraftId ?? undefined,
      item_count: ticket.items.length,
      items: ticket.items.map((item) => ({
        name: item.name,
        note: item.note,
        qty: item.qty,
        unit_price: item.price,
        total_price: Math.round(item.price * item.qty * 100) / 100,
      })),
    }
  }

  /** Price a set of KOT tickets with the shared tax engine, so the running
   *  order, the printed bill and the money step use one set of totals. */
  function kotTaxTotals(tickets: KotTicket[]): KotTaxTotals {
    const result = computeTax(
      tickets.flatMap((ticket) =>
        ticket.items
          .filter((item) => Boolean(item.itemId))
          .map((item) => ({
            itemId: item.itemId as string,
            price: item.price,
            qty: item.qty,
          })),
      ),
      taxSource,
      { settings: { ...DEFAULT_TAX_SETTINGS, ...calcTaxSettings } },
    )
    return {
      tax: result.total,
      taxBreakdown: result.breakdown,
      addedToTotal: result.addedToTotal,
    }
  }

  async function sendKotViaApi(ticket: KotTicket): Promise<KotTicket> {
    if (!encryptedOutletId) {
      throw new Error('No outlet selected — open Captain Orders from the sidebar')
    }
    // Captured before the send: the payload stamps the draft on the KOT, so
    // once the ticket lands the draft is gone from the list and is no longer
    // the active one.
    const draftId = activeDraftId
    let sent: KotTicket
    if (ticket.tableId === 'no-table') {
      const saved = await createKotApi(encryptedOutletId, kotPayloadFromTicket(ticket))
      sent = { ...ticket, id: saved.id, kotNo: saved.kot_no }
    } else {
      const result = await sendKotForOrder({
        outletId: encryptedOutletId,
        tableId: ticket.tableId,
        ticket,
        payload: kotPayloadFromTicket(ticket),
        orderType: orderTypeForApi(ticket.orderType),
        orderTypeLabel: labelForOrderType(ticket.orderType),
        allTableTickets: [...tableKotTickets, ticket],
        tax: kotTaxTotals([...tableKotTickets, ticket]),
      })
      sent = result.ticket
    }
    if (draftId) {
      setActiveDraftId(null)
      void refreshDraftCount()
    }
    return sent
  }

  async function createAndSettleServerOrder(params: {
    orderType: KotViewOrderType
    items: { name: string; qty: number; price: number }[]
    subtotal: number
    tax: number
    /** Per-tax amounts so the server can re-add the forward slice if it recomputes. */
    taxBreakdown: TaxBreakdownLine[]
    roundOff: number
    discount: number
    grandTotal: number
    /** Tendered cash (may be lower than grandTotal → the balance books as due). */
    receivedAmount: number
    customerName: string
    customerPhone: string
    paymentLabel: string
  }): Promise<OrderDto> {
    if (!encryptedOutletId) throw new Error('No outlet selected')
    const items = params.items.map((item) => ({
      name: item.name,
      qty: item.qty,
      unit_price: item.price,
      total_price: Math.round(item.price * item.qty * 100) / 100,
    }))
    const order = await createOrderApi(encryptedOutletId, {
      order_type: orderTypeForApi(params.orderType),
      order_type_label: labelForOrderType(params.orderType),
      customer_name: params.customerName.trim(),
      customer_phone: params.customerPhone.trim(),
      payment_type: params.paymentLabel,
      source: 'captain',
      my_amount: params.subtotal,
      tax: params.tax,
      tax_breakdown: params.taxBreakdown,
      round_off: params.roundOff,
      discount: params.discount,
      grand_total: params.grandTotal,
      items,
    })
    await settleOrderApi(encryptedOutletId, order.id, {
      payment_type: params.paymentLabel,
      my_amount: params.subtotal,
      tax: params.tax,
      tax_breakdown: params.taxBreakdown,
      round_off: params.roundOff,
      discount: params.discount,
      grand_total: params.grandTotal,
      received_amount: params.receivedAmount,
      settlement_by: billerName || undefined,
    })
    return order
  }

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
  const [focusKotNo, setFocusKotNo] = useState<number | null>(null)
  /** KOT opened from Kot View — always shown on the bill even without a table. */
  const [pinnedKotId, setPinnedKotId] = useState<string | null>(null)
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
  /** Delivery extras captured when Save / Save & Print is clicked. */
  const [pendingCharges, setPendingCharges] =
    useState<BillChargesSnapshot | null>(null)
  const [draftsOpen, setDraftsOpen] = useState(false)
  const [draftCount, setDraftCount] = useState(0)
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [saveDraftOpen, setSaveDraftOpen] = useState(false)

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listDraftBillsApi(encryptedOutletId)
      .then((rows) => {
        if (!cancelled) setDraftCount(rows.length)
      })
      .catch(() => {
        if (!cancelled) setDraftCount(0)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  useEffect(() => {
    if (!encryptedOutletId || !token) return

    const handleKotRemoved = (id: string) => {
      removeKotTicket(id)
      setKotTickets(loadAllKotTickets())
    }

    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event, data) => {
        if (event === 'kot.prep' || event === 'kot.modified') {
          upsertKotTicketFromServer(kotEventToTicket(data as KotEventData))
          setKotTickets(loadAllKotTickets())
          return
        }
        if (event === 'kot.deleted') {
          handleKotRemoved((data as { id: string }).id)
          return
        }
        if (event === 'kot.cancelled' || event === 'kot.used_in_bill') {
          handleKotRemoved((data as KotEventData).id)
        }
      },
    })
  }, [encryptedOutletId, token])

  useEffect(() => {
    const nextTableId = searchParams.get('tableId')
    if (nextTableId) {
      setTableId(nextTableId)
      const table = tablesById[nextTableId]
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
  }, [searchParams, tablesById])

  const favoriteIds = useMemo(
    () =>
      new Set(
        menuItems
          .filter((i) => i.isFavorite)
          .slice(0, 12)
          .map((i) => i.id),
      ),
    [menuItems],
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
  }, [railCategoryId, dropdownCategory, search, shortCode, favoriteIds, menuItems])


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
    const item = findBySearchQuery(menuItems, search)
    if (!item) {
      showToast('No matching item found')
      return
    }
    addItem(item)
    setSearch('')
    showToast(`Added ${item.name}`)
  }

  function quickAddFromShortCode() {
    const item = findByShortCode(menuItems, shortCode)
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

  function changeLineNote(lineId: string, note: string) {
    setLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, note } : line)),
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

  async function refreshDraftCount() {
    if (!encryptedOutletId) return
    try {
      const rows = await listDraftBillsApi(encryptedOutletId)
      setDraftCount(rows.length)
    } catch {
      setDraftCount(0)
    }
  }

  async function saveCurrentAsDraft(customerName: string) {
    if (lines.length === 0) {
      showToast('Add items before saving a draft')
      return
    }
    if (!encryptedOutletId) {
      showToast('No outlet selected — open Captain Orders from the sidebar')
      return
    }
    const payload = toDraftBillPayload({
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
    try {
      const saved = activeDraftId
        ? await updateDraftBillApi(encryptedOutletId, activeDraftId, payload)
        : await saveDraftBillApi(encryptedOutletId, {
            ...payload,
            client_key: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          })
      setActiveDraftId(saved.id)
      await refreshDraftCount()
      setSaveDraftOpen(false)
      clearBillForNextCustomer()
      showToast(`Draft saved for ${customerName}`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save the draft',
      )
    }
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
    setPinnedKotId(null)
    setFocusKotNo(null)
    navigate('/table-view?from=captain')
  }

  const tableKotTickets = useMemo(
    () => ticketsForTable(kotTickets, tableId),
    [kotTickets, tableId],
  )

  const hasTableSelected = Boolean(tableId)

  const tableKotSummary = useMemo(() => {
    const toSummary = (t: KotTicket) => ({
      id: t.id,
      kotNo: t.kotNo,
      amount: kotTicketAmount(t),
      createdAt: t.createdAt,
      items: t.items.map((item) => ({
        id: item.id,
        // Carried through so the bill panel can price KOT lines with the same
        // tax engine as the live cart — a table bill is mostly KOT lines.
        itemId: item.itemId,
        name: item.name,
        qty: item.qty,
        price: item.price,
        note: item.note,
      })),
    })

    if (hasTableSelected) {
      const base = tableKotTickets.map(toSummary)
      if (
        pinnedKotId &&
        !base.some((row) => row.id === pinnedKotId)
      ) {
        const pinned = kotTickets.find((t) => t.id === pinnedKotId)
        if (pinned) return [...base, toSummary(pinned)]
      }
      return base
    }

    if (pinnedKotId) {
      const pinned = kotTickets.find((t) => t.id === pinnedKotId)
      return pinned ? [toSummary(pinned)] : []
    }
    return []
  }, [hasTableSelected, tableKotTickets, pinnedKotId, kotTickets])

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

  // Table KOTs (and a KOT pinned from Kot View) fold into the bill total.
  const billTotal =
    hasTableSelected || pinnedKotId
      ? currentLinesTotal + kotTotal
      : currentLinesTotal

  const payableTotal =
    pendingCharges?.settlementTotal ?? settlementAmount ?? billTotal

  const cartItemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty, 0),
    [lines],
  )

  const selectedTableNo =
    tablesById[tableId]?.tableNo ?? 'No table'

  useEffect(() => {
    setSettlementAmount(null)
  }, [billTotal])

  function createKotFromLines(
    sourceLines: CartLine[],
    note?: string,
  ): KotTicket | null {
    if (sourceLines.length === 0) return null
    const table = tablesById[tableId]
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
      source: 'captain',
      biller: billerName,
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
        note: line.note,
      })),
    }
  }

  async function settleTableBill(
    action: 'Save' | 'Save & Print' | 'Save & eBill',
    customerInfo: { name: string; phone: string },
  ) {
    const bill = ensureBillNo()
    const kotKey = tableId || 'no-table'
    let settledBillNo: number | null = null

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
    // Bill panel priced tax over the same cart (live lines + sent KOTs), so the
    // print bill reuses it: only the forward slice is added to the subtotal,
    // which keeps Round Off to settlement rounding rather than a tax residual.
    const tax = pendingCharges?.tax ?? 0
    const taxAddedToTotal = pendingCharges?.taxAddedToTotal ?? 0
    const taxBreakdown = pendingCharges?.taxBreakdown ?? []
    const isDelivery = orderType === 'delivery'
    const deliveryCharge = isDelivery ? (pendingCharges?.deliveryCharge ?? 0) : 0
    const containerCharge = isDelivery
      ? (pendingCharges?.containerCharge ?? 0)
      : 0
    const customerPaidAmt = isDelivery ? (pendingCharges?.customerPaid ?? 0) : 0
    const tipAmt = isDelivery ? (pendingCharges?.tip ?? 0) : 0
    const discountAmt = pendingCharges?.discount ?? 0
    const roundOffAmt = pendingCharges?.roundOff ?? 0
    const computedTotal =
      Math.round(
        (subtotal -
          discountAmt +
          taxAddedToTotal +
          deliveryCharge +
          containerCharge +
          roundOffAmt) *
          100,
      ) / 100
    const total =
      pendingCharges?.settlementTotal ?? settlementAmount ?? computedTotal

    // Counter (no-table) sales become a real (paid) order on the server so
    // every screen + the rail sees them. Table settlements happen later at
    // the money step (finalizeTableSettlement / KotView settle).
    if (!hasTableSelected) {
      try {
        const order = await createAndSettleServerOrder({
          orderType,
          items: items.map((item) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
          })),
          subtotal,
          tax,
          taxBreakdown,
          roundOff: roundOffAmt,
          discount: discountAmt,
          grandTotal: total,
          receivedAmount: total,
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          paymentLabel: paymentTypeLabel(payment, otherPayment?.type),
        })
        settledBillNo = order.bill_no ? Number(order.bill_no) : null
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : 'Failed to save the bill',
        )
        return
      }
    }

    setFinalBillOpen(false)
    setKotViewOpen(false)
    setSettlementAmount(null)
    setPendingCharges(null)
    setCustomer((prev) => ({
      ...prev,
      name: customerInfo.name,
      mobile: customerInfo.phone,
    }))
    if (activeDraftId) {
      if (encryptedOutletId) {
        deleteDraftBillApi(encryptedOutletId, activeDraftId).catch(() => undefined)
      }
      setActiveDraftId(null)
      refreshDraftCount()
    }

    if (action === 'Save & Print' || action === 'Save & eBill') {
      let billNoValue = String(bill)
      if (settledBillNo) {
        billNoValue = String(settledBillNo)
      } else if (encryptedOutletId) {
        const session = getTableSession(tableId)
        if (session?.orderId) {
          try {
            const order = await allocateBillNoApi(
              encryptedOutletId,
              session.orderId,
              orderTypeForApi(orderType),
            )
            if (order.bill_no) billNoValue = String(order.bill_no)
          } catch {
            // Keep the local counter — allocation is best-effort at print time.
          }
        }
      }
      setDummyBill({
        billNo: billNoValue,
        mode: action === 'Save & eBill' ? 'ebill' : 'print',
        tableNo: selectedTableNo,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        paymentLabel: paymentTypeLabel(payment, otherPayment?.type),
        createdAt: Date.now(),
        items,
        kotCount,
        subtotal,
        tax,
        taxBreakdown,
        total,
        roundOff: roundOffAmt,
        discount: discountAmt,
        orderType,
        deliveryCharge,
        containerCharge,
        customerPaid: customerPaidAmt,
        tip: tipAmt,
      })
      setDummyBillOpen(true)
      showToast(
        action === 'Save & eBill'
          ? `eBill #${billNoValue} generated · table printed`
          : `Bill #${billNoValue} ready to print · table printed`,
      )
      return
    }

    showToast(
      `Bill #${bill} · Table ${selectedTableNo} · ${kotCount} KOT${kotCount === 1 ? '' : 's'} merged · saved`,
    )
  }

  async function finalizeTableSettlement(amount: number, due = 0) {
    if (!hasTableSelected) {
      setSettlementAmount(amount)
      showToast(
        `Settlement saved · ₹${amount}${due > 0 ? ` · Due ₹${due}` : ''}`,
      )
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
    if (!encryptedOutletId) {
      showToast('No outlet selected — open Captain Orders from the sidebar')
      return
    }
    try {
      const session = getTableSession(tableId)
      await settleKotOrder({
        outletId: encryptedOutletId,
        orderId: session?.orderId ?? null,
        orderType: orderTypeForApi(orderType),
        orderTypeLabel: labelForOrderType(orderType),
        tickets: kotsSnapshot,
        tax: kotTaxTotals(kotsSnapshot),
        paymentLabel: paymentTypeLabel(payment, otherPayment?.type),
        customerName: customer.name,
        customerPhone: customer.mobile,
        settlementBy: billerName || undefined,
        grandTotal: amount,
      })
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to settle the order',
      )
      return
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
      if (encryptedOutletId) {
        deleteDraftBillApi(encryptedOutletId, activeDraftId).catch(() => undefined)
      }
      setActiveDraftId(null)
      refreshDraftCount()
    }
    showToast(
      `Settled ₹${amount} · table cleared${due > 0 ? ` · Due ₹${due}` : ''}`,
    )
    navigate('/table-view')
  }

  async function startFinalBill(action: 'Save' | 'Save & Print' | 'Save & eBill') {
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
        try {
          const saved = await sendKotViaApi(ticket)
          const next = appendKotTicket(saved)
          setKotTickets(next)
          setLines([])
          setOrderNote('')
        } catch (error) {
          showToast(
            error instanceof Error ? error.message : 'Failed to send KOT',
          )
          return
        }
      }
    }

    setFinalBillAction(action)
    setFinalBillOpen(true)
  }

  async function handleAction(
    action: string,
    charges?: BillChargesSnapshot,
  ) {
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

      let saved: KotTicket
      try {
        saved = await sendKotViaApi(ticket)
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to send KOT')
        return
      }

      const next = appendKotTicket(saved)
      setKotTickets(next)
      setLines([])
      setOrderNote('')
      const destLabel = saved.tableNo ? `${saved.tableNo}` : labelForOrderType(saved.orderType)
      showToast(
        action === 'KOT & Print'
          ? `${destLabel} · KOT ${saved.kotNo} sent · Print started`
          : `${destLabel} · KOT ${saved.kotNo} sent`,
      )
      if (hasTableSelected) {
        navigate('/table-view')
      }
      return
    }

    if (action === 'Save' || action === 'Save & Print' || action === 'Save & eBill') {
      setPendingCharges(charges ?? null)
      await startFinalBill(action)
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
        onClose={() => {
          setFinalBillOpen(false)
          setPendingCharges(null)
        }}
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
        onSave={async ({ mode, amounts, itemGroups }) => {
          let serverNote = ''
          if (
            mode === 'item' &&
            itemGroups &&
            itemGroups.length >= 2 &&
            hasTableSelected &&
            encryptedOutletId
          ) {
            const session = getTableSession(tableId)
            if (session?.orderId) {
              try {
                await splitOrderApi(
                  encryptedOutletId,
                  session.orderId,
                  itemGroups.map((group) => ({
                    order_type: orderTypeForApi(orderType),
                    order_type_label: labelForOrderType(orderType),
                    customer_name: customer.name,
                    customer_phone: customer.mobile,
                    payment_type: paymentTypeLabel(payment, otherPayment?.type),
                    items: lines
                      .filter((line) => group.includes(line.id))
                      .map((line) => ({
                        name: line.name,
                        note: line.note,
                        qty: line.qty,
                        unit_price: line.price,
                        total_price:
                          Math.round(line.price * line.qty * 100) / 100,
                      })),
                  })),
                )
                serverNote = ` · split into ${itemGroups.length} server orders`
              } catch (error) {
                showToast(
                  error instanceof Error
                    ? error.message
                    : 'Failed to split the bill',
                )
                return
              }
            }
          }
          setSplitOpen(false)
          ensureBillNo()
          const summary = amounts.map((a) => `₹${a.toFixed(2)}`).join(' + ')
          const label =
            mode === 'portion'
              ? 'Portion'
              : mode === 'percentage'
                ? 'Percentage'
                : 'Item'
          showToast(`Bill split (${label}): ${summary}${serverNote}`)
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
          onOpenInBilling={(ticket) => {
            setOrderType(ticket.orderType)
            let nextTableId = ''
            if (ticket.tableId && ticket.tableId !== 'no-table') {
              nextTableId = ticket.tableId
            } else if (ticket.tableNo) {
              const match = billingTableRows.find(
                (row) =>
                  row.tableNo === ticket.tableNo ||
                  String(row.tableNo) === String(ticket.tableNo),
              )
              if (match) nextTableId = match.id
            }
            if (nextTableId) {
              setTableId(nextTableId)
              if (ticket.persons > 0) setGuests(ticket.persons)
            }
            if (ticket.customerName) {
              setCustomer((prev) =>
                prev.name.trim()
                  ? prev
                  : { ...prev, name: ticket.customerName ?? '' },
              )
            }
            setPinnedKotId(ticket.id)
            setFocusKotNo(ticket.kotNo)
            setKotViewOpen(false)
            setMobilePane('bill')
            showToast(
              nextTableId
                ? `Opened KOT ${ticket.kotNo} · Table ${ticket.tableNo}`
                : `Opened KOT ${ticket.kotNo}`,
            )
          }}
          onFoodReady={async (id) => {
            const ticket = kotTickets.find((t) => t.id === id)
            if (!ticket || ticket.status === 'ready') return
            try {
              if (encryptedOutletId && !ticket.id.startsWith('kot-')) {
                await markKotReadyApi(encryptedOutletId, ticket.id)
              }
              setKotTickets((prev) => {
                const next = prev.map((t) =>
                  t.id === id ? { ...t, status: 'ready' as const } : t,
                )
                replaceKotTickets(next)
                return next
              })
              showToast('Marked as Food Is Ready')
            } catch (error) {
              showToast(
                error instanceof Error
                  ? error.message
                  : 'Failed to mark KOT as ready',
              )
            }
          }}
          onDismiss={async (id) => {
            const ticket = kotTickets.find((t) => t.id === id)
            try {
              if (ticket && encryptedOutletId && !ticket.id.startsWith('kot-')) {
                await updateKotApi(encryptedOutletId, ticket.id, {
                  status: 'Cancelled',
                })
              }
              setKotTickets((prev) => {
                const next = prev.filter((t) => t.id !== id)
                replaceKotTickets(next)
                return next
              })
              showToast('KOT cancelled')
            } catch (error) {
              showToast(
                error instanceof Error ? error.message : 'Failed to cancel KOT',
              )
            }
          }}
          onSettleSave={async ({ tableId: settledTableId, ticketIds, result }) => {
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
            if (!encryptedOutletId) {
              showToast('No outlet selected — open Captain Orders from the sidebar')
              return
            }
            try {
              const session =
                settledTableId && settledTableId !== 'no-table'
                  ? getTableSession(settledTableId)
                  : null
              await settleKotOrder({
                outletId: encryptedOutletId,
                orderId: session?.orderId ?? null,
                orderType: orderTypeForApi(
                  settled[0]?.orderType ?? 'dine-in',
                ),
                orderTypeLabel: labelForOrderType(
                  settled[0]?.orderType ?? 'dine-in',
                ),
                tickets: settled,
                tax: kotTaxTotals(settled),
                paymentLabel: paymentTypeLabel(
                  result.payment,
                  result.otherType,
                ),
                customerName: result.customerName || settled[0]?.customerName || '',
                customerPhone: '',
                settlementBy: billerName || undefined,
                grandTotal: result.settlementAmount,
              })
            } catch (error) {
              showToast(
                error instanceof Error ? error.message : 'Failed to settle the order',
              )
              return
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
              }${result.due > 0 ? ` · Due ₹${result.due}` : ''}`,
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
            {menuStatus === 'loading' ? (
              <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-page text-sm text-muted">
                Loading menu…
              </div>
            ) : menuStatus === 'error' ? (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-page p-6 text-center">
                <p className="text-sm font-semibold text-ink">
                  Could not load the menu
                </p>
                <p className="max-w-sm text-xs text-muted">{menuError}</p>
                <button
                  type="button"
                  onClick={() => void reloadMenu()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
            {/* Desktop category rail */}
            <div className="hidden lg:flex">
              <CategoryRail
                categories={railCategories}
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
                  {railCategories.map((cat) => {
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
                categoryOptions={menuCategories.map((c) => ({
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
              </>
            )}
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
            tableKots={tableKotSummary}
            focusKotNo={focusKotNo}
            taxSource={taxSource}
            taxSettings={calcTaxSettings}
            orderType={orderType}
            payment={payment}
            tableId={tableId}
            tables={billingTableRows}
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
            onTableIdChange={(id) => {
              setTableId(id)
              setPinnedKotId(null)
              setFocusKotNo(null)
            }}
            onGuestsChange={setGuests}
            onComplimentaryChange={setComplimentary}
            onItsPaidChange={setItsPaid}
            onLoyaltyChange={setLoyalty}
            onFeedbackSmsChange={setFeedbackSms}
            onQtyChange={changeQty}
            onRemoveLine={(id) =>
              setLines((prev) => prev.filter((line) => line.id !== id))
            }
            onLineNoteChange={changeLineNote}
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
            onOpenDrafts={() => {
              refreshDraftCount()
              setDraftsOpen(true)
            }}
            draftCount={draftCount}
          />
        </div>
      </div>
      )}

      <DraftBillsModal
        open={draftsOpen}
        outletId={encryptedOutletId ?? ''}
        onClose={() => {
          setDraftsOpen(false)
          refreshDraftCount()
        }}
        onResume={resumeDraft}
        onDraftsChange={setDraftCount}
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
