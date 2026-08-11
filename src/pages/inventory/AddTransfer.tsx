import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  FilePlus2,
  Plus,
  Store,
  Trash2,
  Truck,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { OtherDetailsDrawer } from '../../components/inventory/OtherDetailsDrawer'
import { SelectPurchaseOrderModal } from '../../components/inventory/SelectPurchaseOrderModal'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'
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

const RESTAURANTS = [
  'The Bandhan',
  "Annapurna's Rajubhai Dabeliwale — Dadar",
  "Annapurna's Rajubhai Dabeliwale — Andheri",
]
const SUPPLIERS = ['The Bandhan', 'Fresh Mart', 'Daily Dairy', 'Veggie Hub']
const CATEGORIES = [
  'Rice/pulses/flours',
  'Bread/dairy',
  'Oils/masala/salt/sugar',
  'Ready To Cook/ready To Eat',
  'Sauces/dressings/marinades',
  'Snacks',
  'Packaging/storage',
  'Fruits/vegetables',
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
const PAYMENT_METHODS = ['Cash', 'Card', 'Cheque', 'Other']

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

export default function AddTransfer() {
  const navigate = useNavigate()
  const [transferTo, setTransferTo] = useState<'supplier' | 'restaurant'>(
    'restaurant',
  )
  const [party, setParty] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('2026-08-11')
  const [challanNo, setChallanNo] = useState('')
  const [category, setCategory] = useState('')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [paymentType, setPaymentType] = useState<'unpaid' | 'paid'>('unpaid')
  const [paymentDate, setPaymentDate] = useState('2026-08-11')
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [updateStock, setUpdateStock] = useState(true)
  const [recipientCanEdit, setRecipientCanEdit] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [noteLineId, setNoteLineId] = useState<string | null>(null)
  const [selectItemAlertOpen, setSelectItemAlertOpen] = useState(false)
  const [poSelectOpen, setPoSelectOpen] = useState(false)
  const [otherDetailsOpen, setOtherDetailsOpen] = useState(false)
  const [moreActionOpen, setMoreActionOpen] = useState(false)
  const moreActionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moreActionOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (
        moreActionRef.current &&
        !moreActionRef.current.contains(event.target as Node)
      ) {
        setMoreActionOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [moreActionOpen])

  const grandTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const amount =
          toNumber(line.amount) || toNumber(line.qty) * toNumber(line.price)
        return sum + amount
      }, 0),
    [lines],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function clearAllLines() {
    setLines([emptyLine()])
  }

  function removeSelectedLines() {
    const selected = lines.filter((line) => line.selected)
    if (selected.length === 0) {
      showToast('Select at least one row to remove')
      return
    }
    const remaining = lines.filter((line) => !line.selected)
    setLines(remaining.length > 0 ? remaining : [emptyLine()])
  }

  function updateLine(id: string, patch: Partial<LineItem>) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line
        const next = { ...line, ...patch }
        if ('rawMaterial' in patch) {
          const material = RAW_MATERIALS.find(
            (m) => m.name === patch.rawMaterial,
          )
          if (material && !next.unit) next.unit = material.unit
        }
        if ('qty' in patch || 'price' in patch) {
          const qty = toNumber(next.qty)
          const price = toNumber(next.price)
          if (qty > 0 && price > 0) {
            next.amount = formatAmount(qty * price)
          }
        }
        return next
      }),
    )
  }

  function toggleAll(checked: boolean) {
    setLines((prev) => prev.map((line) => ({ ...line, selected: checked })))
  }

  function handleSave() {
    if (!party) {
      setError(
        transferTo === 'restaurant'
          ? 'Please select a restaurant'
          : 'Please select a supplier / third party',
      )
      return
    }
    if (!invoiceDate) {
      setError('Invoice date is required')
      return
    }
    const validLine = lines.some(
      (line) => line.rawMaterial && toNumber(line.qty) > 0 && line.unit,
    )
    if (!validLine) {
      setError('Add at least one raw material with qty and unit')
      return
    }
    if (paymentType === 'paid') {
      if (!paymentDate) {
        setError('Payment date is required')
        return
      }
      if (!paidAmount.trim() || toNumber(paidAmount) <= 0) {
        setError('Paid amount is required')
        return
      }
      if (!paymentMethod) {
        setError('Please select a payment method')
        return
      }
    }
    setError('')
    setToast('Transfer saved')
    window.setTimeout(() => {
      setToast(null)
      navigate('/inventory/transfer')
    }, 900)
  }

  const allSelected = lines.length > 0 && lines.every((line) => line.selected)
  const noteLine = lines.find((line) => line.id === noteLineId)
  const partyOptions = transferTo === 'restaurant' ? RESTAURANTS : SUPPLIERS

  return (
    <InventoryPageShell activeItem="transfer">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-lg font-bold text-ink">Add Transfer</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink">To</span>
            <div className="inline-flex overflow-hidden rounded-md border border-line">
              <button
                type="button"
                onClick={() => {
                  setTransferTo('supplier')
                  setParty('')
                }}
                className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
                  transferTo === 'supplier'
                    ? 'bg-primary text-white'
                    : 'bg-card text-ink hover:bg-page'
                }`}
              >
                <Truck size={15} />
                Supplier/Third Party
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferTo('restaurant')
                  setParty('')
                }}
                className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
                  transferTo === 'restaurant'
                    ? 'bg-primary text-white'
                    : 'bg-card text-ink hover:bg-page'
                }`}
              >
                <Store size={15} />
                Restaurant
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPoSelectOpen(true)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Select Purchase Order &gt;
        </button>
      </div>

      <div className="mb-4 space-y-4 rounded-xl border border-line bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SearchableSelect
            label={
              transferTo === 'restaurant'
                ? 'Restaurant'
                : 'Supplier/Third Party'
            }
            required
            value={party}
            options={partyOptions}
            placeholder="Please select"
            searchPlaceholder="Search"
            onChange={setParty}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Invoice Date <span className="text-primary">*</span>
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(event) => setInvoiceDate(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Challan No.
            </label>
            <input
              type="text"
              value={challanNo}
              onChange={(event) => setChallanNo(event.target.value)}
              placeholder="Challan Number"
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-end">
            <OutlineButton
              variant="gray"
              onClick={() => setOtherDetailsOpen(true)}
            >
              Other Details
            </OutlineButton>
          </div>
        </div>
        <div className="max-w-sm">
          <SearchableSelect
            label="Category"
            value={category}
            options={CATEGORIES}
            placeholder="Please Select Category"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setCategory}
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <OutlineButton onClick={() => setLines((prev) => [...prev, emptyLine()])}>
          <Plus size={15} />
          Add New
        </OutlineButton>
        <div ref={moreActionRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={moreActionOpen}
            onClick={() => setMoreActionOpen((prev) => !prev)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            More Action
            <ChevronDown size={14} className="text-muted" />
          </button>
          {moreActionOpen ? (
            <ul
              role="menu"
              className="absolute right-0 z-40 mt-1.5 min-w-[200px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg"
            >
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    clearAllLines()
                    setMoreActionOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
                >
                  Clear all
                </button>
              </li>
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    showToast('Set as favourite')
                    setMoreActionOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
                >
                  Set As Favourite
                </button>
              </li>
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    showToast('Removed from favourite')
                    setMoreActionOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
                >
                  Remove from Favorite
                </button>
              </li>
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    removeSelectedLines()
                    setMoreActionOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
                >
                  Remove
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-card">
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
                <td className="px-3 py-2.5">
                  <select
                    value={line.rawMaterial}
                    onChange={(event) => {
                      const material = RAW_MATERIALS.find(
                        (m) => m.name === event.target.value,
                      )
                      updateLine(line.id, {
                        rawMaterial: event.target.value,
                        unit: material?.unit ?? line.unit,
                      })
                    }}
                    className="h-9 w-full min-w-[180px] rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Select/Add Raw Material</option>
                    {RAW_MATERIALS.map((material) => (
                      <option key={material.name} value={material.name}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={line.qty}
                    onChange={(event) =>
                      updateLine(line.id, { qty: event.target.value })
                    }
                    className="h-9 w-24 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
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
                    className="h-9 w-28 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Add note"
                      onClick={() => {
                        if (!line.rawMaterial.trim()) {
                          setSelectItemAlertOpen(true)
                          return
                        }
                        setNoteLineId(line.id)
                      }}
                      className={`inline-flex size-8 items-center justify-center rounded-md border border-line bg-page ${
                        line.note
                          ? 'text-primary'
                          : 'text-ink hover:bg-line/40'
                      }`}
                    >
                      <FilePlus2 size={15} strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove row"
                      onClick={() =>
                        setLines((prev) => {
                          const next = prev.filter((row) => row.id !== line.id)
                          return next.length > 0 ? next : [emptyLine()]
                        })
                      }
                      className="rounded p-1.5 text-primary hover:bg-primary/10"
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
        <div className="w-full max-w-2xl space-y-3 text-sm">
          <div className="ml-auto w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between text-ink">
              <span className="font-semibold">Grand Total</span>
              <span className="font-semibold">{formatAmount(grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-ink">Payment Type</span>
              <div className="inline-flex overflow-hidden rounded-md border border-line">
                <button
                  type="button"
                  onClick={() => setPaymentType('unpaid')}
                  className={`h-8 px-3 text-xs font-semibold ${
                    paymentType === 'unpaid'
                      ? 'bg-primary text-white'
                      : 'bg-card text-ink hover:bg-page'
                  }`}
                >
                  Unpaid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('paid')
                    if (!paidAmount) {
                      setPaidAmount(
                        grandTotal ? formatAmount(grandTotal) : '',
                      )
                    }
                    if (!paymentMethod) setPaymentMethod('Cash')
                  }}
                  className={`h-8 px-3 text-xs font-semibold ${
                    paymentType === 'paid'
                      ? 'bg-primary text-white'
                      : 'bg-card text-ink hover:bg-page'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>
          </div>
          {paymentType === 'paid' ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">
                  Payment Date <span className="text-primary">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  className="h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">
                  Paid Amount <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={paidAmount}
                  onChange={(event) => setPaidAmount(event.target.value)}
                  placeholder="0.000"
                  className="h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <SearchableSelect
                label="Payment Method"
                required
                value={paymentMethod}
                options={PAYMENT_METHODS}
                placeholder="Select method"
                searchPlaceholder="Search"
                includePlaceholderOption={false}
                dropdownPlacement="above"
                onChange={setPaymentMethod}
              />
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-primary">{error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={updateStock}
              onChange={(event) => setUpdateStock(event.target.checked)}
              className="size-4 accent-primary"
            />
            Update Inventory Stock
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={recipientCanEdit}
              onChange={(event) => setRecipientCanEdit(event.target.checked)}
              className="size-4 accent-primary"
            />
            Recipient can edit the invoice
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/transfer')}
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

      <SelectPurchaseOrderModal
        open={poSelectOpen}
        onClose={() => setPoSelectOpen(false)}
        onSelect={(poNumber) => {
          setChallanNo(poNumber)
          setPoSelectOpen(false)
          showToast(`Selected ${poNumber}`)
        }}
      />
      <OtherDetailsDrawer
        open={otherDetailsOpen}
        onClose={() => setOtherDetailsOpen(false)}
        variant="transfer"
      />
      <SelectRecordAlert
        open={selectItemAlertOpen}
        message="Please select Item."
        onClose={() => setSelectItemAlertOpen(false)}
      />
    </InventoryPageShell>
  )
}
