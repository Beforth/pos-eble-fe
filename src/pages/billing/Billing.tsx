import { useMemo, useState } from 'react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  BillPanel,
  type CartLine,
  type OrderType,
  type PaymentMethod,
} from '../../components/billing/BillPanel'
import { CategoryRail } from '../../components/billing/CategoryRail'
import { ItemGrid } from '../../components/billing/ItemGrid'
import {
  baseMenuCategories,
  menuItems,
  type MenuItemRow,
} from '../../mocks/menuItemsData'
import { billingTables } from '../../mocks/billingTables'

const FAVORITES_ID = 'favorites'

const RAIL_CATEGORIES = [
  { id: FAVORITES_ID, name: 'Favorite Items' },
  ...baseMenuCategories.map((c) => ({ id: c.id, name: c.name })),
]

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

  const favoriteIds = useMemo(
    () => new Set(menuItems.filter((i) => i.hasImage).slice(0, 12).map((i) => i.id)),
    [],
  )

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.available && search === '' && shortCode === '') {
        // still show unavailable so staff can see them dimmed
      }
      if (railCategoryId === FAVORITES_ID) {
        if (!favoriteIds.has(item.id)) return false
      } else if (item.categoryId !== railCategoryId) {
        return false
      }
      if (dropdownCategory !== 'all' && item.categoryId !== dropdownCategory) {
        return false
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (!item.name.toLowerCase().includes(q)) return false
      }
      if (shortCode.trim()) {
        if (!item.shortCode.includes(shortCode.trim())) return false
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

  function changeQty(lineId: string, qty: number) {
    if (qty < 1) {
      setLines((prev) => prev.filter((line) => line.id !== lineId))
      return
    }
    setLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, qty } : line)),
    )
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
    showToast('New order started')
  }

  function handleAction(action: string) {
    if (action === 'Hold' || action.startsWith('Save') || action.startsWith('KOT')) {
      if (lines.length === 0 && action !== 'Hold') {
        showToast('Add items before continuing')
        return
      }
    }
    showToast(`${action} — coming soon`)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={newOrder}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1">
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
            categoryOptions={baseMenuCategories.map((c) => ({
              id: c.id,
              name: c.name,
            }))}
            onAddItem={addItem}
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
          onOrderTypeChange={setOrderType}
          onPaymentChange={setPayment}
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
        />
      </div>
    </div>
  )
}
