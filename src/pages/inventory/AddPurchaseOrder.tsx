import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  FilePenLine,
  MoreVertical,
  Plus,
  StickyNote,
  Store,
  Trash2,
  Truck,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface LineItem {
  id: string
  selected: boolean
  rawMaterial: string
  qty: string
  unit: string
  price: string
  amount: string
  note: string
}

const SUPPLIERS = ['The Bandhan', 'Fresh Mart', 'Daily Dairy', 'Veggie Hub']
const RESTAURANTS = [
  "Annapurna's Rajubhai Dabeliwale — Dadar",
  "Annapurna's Rajubhai Dabeliwale — Andheri",
]
const RAW_MATERIALS = [
  { name: 'Tomatoes', unit: 'Kg' },
  { name: 'Onion', unit: 'Kg' },
  { name: 'Paneer', unit: 'Kg' },
  { name: 'Milk', unit: 'Ltr' },
  { name: 'Butter', unit: 'Kg' },
  { name: 'Flour', unit: 'Kg' },
]
const UNITS = ['Kg', 'Ltr', 'Pcs', 'Box', 'Packet']

function emptyLine(): LineItem {
  return {
    id: `line-${Date.now()}-${Math.random()}`,
    selected: false,
    rawMaterial: '',
    qty: '',
    unit: '',
    price: '',
    amount: '',
    note: '',
  }
}

function toNumber(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatAmount(value: number) {
  return value.toFixed(3)
}

export default function AddPurchaseOrder() {
  const navigate = useNavigate()
  const [orderFrom, setOrderFrom] = useState<'supplier' | 'restaurant'>(
    'restaurant',
  )
  const [supplier, setSupplier] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('2026-08-10')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [poNumber] = useState('PO0000000001')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [deliveryCharges, setDeliveryCharges] = useState(0)
  const [recipientCanEdit, setRecipientCanEdit] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [noteLineId, setNoteLineId] = useState<string | null>(null)

  const totals = useMemo(() => {
    let subTotal = 0
    for (const line of lines) {
      const amount =
        toNumber(line.amount) || toNumber(line.qty) * toNumber(line.price)
      subTotal += amount
    }
    return {
      subTotal,
      grand: Math.max(0, subTotal + deliveryCharges),
    }
  }, [lines, deliveryCharges])

  function updateLine(id: string, patch: Partial<LineItem>) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line
        const next = { ...line, ...patch }
        if ('qty' in patch || 'price' in patch) {
          const amount = toNumber(next.qty) * toNumber(next.price)
          next.amount = amount ? String(amount) : ''
        }
        return next
      }),
    )
  }

  function toggleAll(checked: boolean) {
    setLines((prev) => prev.map((line) => ({ ...line, selected: checked })))
  }

  function handleSave() {
    if (orderFrom === 'supplier' && !supplier) {
      setError('Please select a supplier')
      return
    }
    if (orderFrom === 'restaurant' && !restaurant) {
      setError('Please select a restaurant')
      return
    }
    if (!deliveryDate) {
      setError('Delivery date is required')
      return
    }
    const validLine = lines.some(
      (line) => line.rawMaterial && toNumber(line.qty) > 0 && line.unit,
    )
    if (!validLine) {
      setError('Add at least one raw material with qty and unit')
      return
    }
    setError('')
    setToast('Purchase order saved')
    window.setTimeout(() => {
      setToast(null)
      navigate('/inventory/purchase-order')
    }, 900)
  }

  const allSelected = lines.length > 0 && lines.every((line) => line.selected)
  const noteLine = lines.find((line) => line.id === noteLineId)

  return (
    <InventoryPageShell activeItem="purchase-order">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Add Purchase Order</h1>
        <div className="inline-flex overflow-hidden rounded-md border border-line">
          <button
            type="button"
            onClick={() => setOrderFrom('supplier')}
            className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
              orderFrom === 'supplier'
                ? 'bg-primary text-white'
                : 'bg-card text-ink hover:bg-page'
            }`}
          >
            <Truck size={15} />
            Supplier
          </button>
          <button
            type="button"
            onClick={() => setOrderFrom('restaurant')}
            className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
              orderFrom === 'restaurant'
                ? 'bg-primary text-white'
                : 'bg-card text-ink hover:bg-page'
            }`}
          >
            <Store size={15} />
            Restaurant
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        {orderFrom === 'supplier' ? (
          <div className="min-w-[200px] flex-1">
            <SearchableSelect
              label={<>Supplier <span className="text-primary">*</span></>}
              required
              value={supplier}
              options={SUPPLIERS}
              placeholder="Select Supplier"
              searchPlaceholder="Search suppliers..."
              onChange={setSupplier}
            />
          </div>
        ) : (
          <div className="min-w-[200px] flex-1">
            <SearchableSelect
              label={<>Restaurant <span className="text-primary">*</span></>}
              required
              value={restaurant}
              options={RESTAURANTS}
              placeholder="Select Restaurant"
              searchPlaceholder="Search restaurants..."
              onChange={setRestaurant}
            />
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Delivery Date <span className="text-primary">*</span>
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(event) => setDeliveryDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Delivery Time
          </label>
          <input
            type="text"
            value={deliveryTime}
            onChange={(event) => setDeliveryTime(event.target.value)}
            placeholder="HH:MM"
            className="h-10 w-28 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            PO Number
          </label>
          <input
            type="text"
            value={poNumber}
            readOnly
            className="h-10 w-40 rounded-md border border-line bg-page px-3 text-sm text-ink outline-none"
          />
        </div>
        <OutlineButton variant="gray">Other Details</OutlineButton>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <OutlineButton onClick={() => setLines((prev) => [...prev, emptyLine()])}>
          <Plus size={15} />
          Add New
        </OutlineButton>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          More Actions
          <ChevronDown size={14} className="text-muted" />
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:overflow-visible">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleAll(event.target.checked)}
                  className="size-4 accent-primary"
                  aria-label="Select all rows"
                />
              </th>
              <th className="px-3 py-3">
                Raw Material <span className="text-primary">*</span>
              </th>
              <th className="px-3 py-3">
                Qty <span className="text-primary">*</span>
              </th>
              <th className="px-3 py-3">
                Unit <span className="text-primary">*</span>
              </th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-line last:border-b-0">
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={line.selected}
                    onChange={(event) =>
                      updateLine(line.id, { selected: event.target.checked })
                    }
                    className="size-4 accent-primary"
                    aria-label="Select row"
                  />
                </td>
                <td className="px-3 py-2.5 relative z-0 [&:has([aria-expanded=true])]:z-30">
                  <SearchableSelect
                    value={line.rawMaterial}
                    options={RAW_MATERIALS.map((m) => m.name)}
                    placeholder="Select/Add Raw Material"
                    searchPlaceholder="Search materials..."
                    compact
                    dropdownPlacement="auto"
                    onChange={(value) => {
                      const material = RAW_MATERIALS.find((m) => m.name === value)
                      updateLine(line.id, {
                        rawMaterial: value,
                        unit: material?.unit ?? line.unit,
                      })
                    }}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={line.qty}
                    onChange={(event) =>
                      updateLine(line.id, { qty: event.target.value })
                    }
                    className="h-9 w-20 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={line.unit}
                    onChange={(event) =>
                      updateLine(line.id, { unit: event.target.value })
                    }
                    className="h-9 w-24 rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Unit</option>
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={line.price}
                    onChange={(event) =>
                      updateLine(line.id, { price: event.target.value })
                    }
                    className="h-9 w-24 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={line.amount}
                    onChange={(event) =>
                      updateLine(line.id, { amount: event.target.value })
                    }
                    className="h-9 w-24 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Add note"
                      onClick={() => setNoteLineId(line.id)}
                      className={`rounded p-1.5 hover:bg-page ${
                        line.note
                          ? 'text-primary'
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      {line.note ? (
                        <FilePenLine size={15} />
                      ) : (
                        <StickyNote size={15} />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label="Remove row"
                      disabled={lines.length <= 1}
                      onClick={() =>
                        setLines((prev) =>
                          prev.filter((row) => row.id !== line.id),
                        )
                      }
                      className="rounded p-1.5 text-muted hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-sm space-y-2 text-sm">
          <div className="flex items-center justify-between text-ink">
            <span className="inline-flex items-center gap-1">
              Sub Total
              <MoreVertical size={14} className="text-muted" />
            </span>
            <span className="font-semibold">{formatAmount(totals.subTotal)}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeliveryCharges((prev) => (prev ? 0 : 50))}
            className="flex w-full items-center justify-between text-left text-primary hover:underline"
          >
            <span>+ Delivery Charges</span>
            <span className="font-medium text-ink">
              {formatAmount(deliveryCharges)}
            </span>
          </button>
          <div className="flex items-center justify-between border-t border-line pt-2 text-base font-bold text-ink">
            <span>Grand Total</span>
            <span>{formatAmount(totals.grand)}</span>
          </div>
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-primary">{error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={recipientCanEdit}
            onChange={(event) => setRecipientCanEdit(event.target.checked)}
            className="size-4 accent-primary"
          />
          Recipient can edit the invoice
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/purchase-order')}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>

      {noteLine ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close note"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setNoteLineId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-line bg-card p-4 shadow-xl">
            <h3 className="mb-3 text-sm font-semibold text-ink">Item Note</h3>
            <textarea
              value={noteLine.note}
              onChange={(event) =>
                updateLine(noteLine.id, { note: event.target.value })
              }
              rows={4}
              placeholder="Add a note for this raw material"
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="mt-3 flex justify-end">
              <PrimaryButton onClick={() => setNoteLineId(null)}>
                Done
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </InventoryPageShell>
  )
}
