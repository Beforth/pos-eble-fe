import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgePercent,
  Check,
  ChevronDown,
  FilePenLine,
  FileText,
  Info,
  MoreVertical,
  Pencil,
  Plus,
  Store,
  Trash2,
  Truck,
  Upload,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
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
  cgst: string
  sgst: string
  igst: string
  note: string
}

const RESTAURANTS = [
  'The Bandhan',
  "Annapurna's Rajubhai Dabeliwale — Dadar",
  "Annapurna's Rajubhai Dabeliwale — Andheri",
]
const SUPPLIERS = ['The Bandhan', 'Fresh Mart', 'Daily Dairy', 'Veggie Hub']
const RAW_MATERIALS = [
  { name: 'Tomatoes', unit: 'Kg' },
  { name: 'Onion', unit: 'Kg' },
  { name: 'Paneer', unit: 'Kg' },
  { name: 'Milk', unit: 'Ltr' },
  { name: 'Butter', unit: 'Kg' },
  { name: 'Flour', unit: 'Kg' },
]
const UNITS = ['Kg', 'Ltr', 'Pcs', 'Box', 'Packet']
const PAYMENT_METHODS = ['Cash', 'Card', 'Cheque', 'Online', 'Other']

function emptyLine(): LineItem {
  return {
    id: `line-${Date.now()}-${Math.random()}`,
    selected: false,
    rawMaterial: '',
    qty: '',
    unit: '',
    price: '',
    amount: '',
    cgst: '',
    sgst: '',
    igst: '',
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

export default function AddSalesReturn() {
  const navigate = useNavigate()
  const [returnFrom, setReturnFrom] = useState<'supplier' | 'restaurant'>(
    'restaurant',
  )
  const [party, setParty] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('2026-08-11')
  const [creditNoteNo, setCreditNoteNo] = useState('1')
  const [creditNoteEditable, setCreditNoteEditable] = useState(false)
  const [saleInvoiceNo, setSaleInvoiceNo] = useState('')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [discount, setDiscount] = useState(0)
  const [otherCharges, setOtherCharges] = useState(0)
  const [otherTaxes, setOtherTaxes] = useState(0)
  const [paymentType, setPaymentType] = useState<'unpaid' | 'paid'>('unpaid')
  const [paymentDate, setPaymentDate] = useState('2026-08-11')
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [updateStock, setUpdateStock] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [noteLineId, setNoteLineId] = useState<string | null>(null)
  const [selectItemAlertOpen, setSelectItemAlertOpen] = useState(false)
  const [purchaseReturnOpen, setPurchaseReturnOpen] = useState(false)
  const [discountType, setDiscountType] = useState<
    'invoice' | 'raw-material'
  >('invoice')
  const [discountTypeOpen, setDiscountTypeOpen] = useState(false)
  const discountTypeRef = useRef<HTMLDivElement>(null)
  const [moreActionOpen, setMoreActionOpen] = useState(false)
  const moreActionRef = useRef<HTMLDivElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!discountTypeOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (
        discountTypeRef.current &&
        !discountTypeRef.current.contains(event.target as Node)
      ) {
        setDiscountTypeOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [discountTypeOpen])

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

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function clearAllLines() {
    setLines([emptyLine()])
    showToast('All rows cleared')
  }

  function removeSelectedLines() {
    const selected = lines.filter((line) => line.selected)
    if (selected.length === 0) {
      showToast('Select at least one row')
      return
    }
    const remaining = lines.filter((line) => !line.selected)
    setLines(remaining.length > 0 ? remaining : [emptyLine()])
    showToast('Selected rows removed')
  }

  const totals = useMemo(() => {
    let subTotal = 0
    let lineTax = 0
    for (const line of lines) {
      const amount =
        toNumber(line.amount) || toNumber(line.qty) * toNumber(line.price)
      subTotal += amount
      lineTax +=
        (amount *
          (toNumber(line.cgst) + toNumber(line.sgst) + toNumber(line.igst))) /
        100
    }
    const grand = subTotal - discount + otherCharges + lineTax + otherTaxes
    return {
      subTotal,
      lineTax,
      grand: Math.max(0, grand),
    }
  }, [lines, discount, otherCharges, otherTaxes])

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
    if (!party) {
      setError(
        returnFrom === 'restaurant'
          ? 'Please select a restaurant'
          : 'Please select a supplier',
      )
      return
    }
    if (!invoiceDate) {
      setError('Invoice date is required')
      return
    }
    if (!creditNoteNo.trim()) {
      setError('Credit note number is required')
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
    setToast('Sales return saved')
    window.setTimeout(() => {
      setToast(null)
      navigate('/inventory/sales-return')
    }, 900)
  }

  const allSelected = lines.length > 0 && lines.every((line) => line.selected)
  const noteLine = lines.find((line) => line.id === noteLineId)
  const partyOptions = returnFrom === 'restaurant' ? RESTAURANTS : SUPPLIERS

  return (
    <InventoryPageShell activeItem="sales-return">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-lg font-bold text-ink">Add Sales Return</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink">From</span>
            <div className="inline-flex overflow-hidden rounded-md border border-line">
              <button
                type="button"
                onClick={() => {
                  setReturnFrom('supplier')
                  setParty('')
                }}
                className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
                  returnFrom === 'supplier'
                    ? 'bg-primary text-white'
                    : 'bg-card text-ink hover:bg-page'
                }`}
              >
                <Truck size={15} />
                Supplier
              </button>
              <button
                type="button"
                onClick={() => {
                  setReturnFrom('restaurant')
                  setParty('')
                }}
                className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
                  returnFrom === 'restaurant'
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
          onClick={() => setPurchaseReturnOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <FileText size={15} />
          Select Purchase Return &gt;
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-line bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SearchableSelect
            label={returnFrom === 'restaurant' ? 'Restaurant' : 'Supplier'}
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
              Credit Note No. <span className="text-primary">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={creditNoteNo}
                disabled={!creditNoteEditable}
                onChange={(event) => setCreditNoteNo(event.target.value)}
                aria-disabled={!creditNoteEditable}
                className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${
                  creditNoteEditable
                    ? 'border-line bg-card text-ink focus:border-primary'
                    : 'cursor-not-allowed border-line/70 bg-page text-muted opacity-70'
                }`}
              />
              <button
                type="button"
                aria-label={
                  creditNoteEditable
                    ? 'Lock credit note number'
                    : 'Edit credit note number'
                }
                aria-pressed={creditNoteEditable}
                title={
                  creditNoteEditable
                    ? 'Lock credit note number'
                    : 'Click to edit credit note number'
                }
                onClick={() => setCreditNoteEditable((prev) => !prev)}
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-md border ${
                  creditNoteEditable
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-line bg-card text-muted hover:bg-page hover:text-ink'
                }`}
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink">
              Sale Invoice No.
              <span title="Enter the original sale invoice number for this return">
                <Info size={13} className="text-muted" />
              </span>
            </label>
            <input
              type="text"
              value={saleInvoiceNo}
              onChange={(event) => setSaleInvoiceNo(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <OutlineButton onClick={() => setLines((prev) => [...prev, emptyLine()])}>
          <Plus size={15} />
          Add New
        </OutlineButton>
        <div ref={discountTypeRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={discountTypeOpen}
            onClick={() => setDiscountTypeOpen((prev) => !prev)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <BadgePercent size={15} className="text-muted" />
            {discountType === 'invoice'
              ? 'At Invoice Level'
              : 'At Raw Material Level'}
            <ChevronDown size={14} className="text-muted" />
          </button>
          {discountTypeOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-1.5 min-w-[220px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg"
            >
              <p className="border-b border-line px-3 py-2 text-sm font-semibold text-ink">
                Discount Type
              </p>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDiscountType('invoice')
                  setDiscountTypeOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-ink ${
                  discountType === 'invoice'
                    ? 'bg-primary/10 font-medium'
                    : 'hover:bg-page'
                }`}
              >
                <span>At invoice level</span>
                {discountType === 'invoice' ? (
                  <Check size={15} className="shrink-0 text-success" />
                ) : null}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDiscountType('raw-material')
                  setDiscountTypeOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-ink ${
                  discountType === 'raw-material'
                    ? 'bg-primary/10 font-medium'
                    : 'hover:bg-page'
                }`}
              >
                <span>At raw material level</span>
                {discountType === 'raw-material' ? (
                  <Check size={15} className="shrink-0 text-success" />
                ) : null}
              </button>
            </div>
          ) : null}
        </div>
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
              className="absolute right-0 z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg"
            >
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    clearAllLines()
                    setMoreActionOpen(false)
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-ink hover:bg-page"
                >
                  Clear all
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
                  className="w-full px-3 py-2.5 text-left text-sm text-ink hover:bg-page"
                >
                  Remove
                </button>
              </li>
            </ul>
          ) : null}
        </div>
        <OutlineButton
          variant="gray"
          onClick={() => uploadInputRef.current?.click()}
        >
          <Upload size={15} />
          Upload Invoice
        </OutlineButton>
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) showToast(`Uploaded ${file.name}`)
            event.target.value = ''
          }}
        />
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
              <th className="px-3 py-3">Tax (%)</th>
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
                  <div className="flex gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="CGST %"
                      value={line.cgst}
                      onChange={(event) =>
                        updateLine(line.id, { cgst: event.target.value })
                      }
                      className="h-9 w-[68px] rounded-md border border-line px-1.5 text-xs outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="SGST %"
                      value={line.sgst}
                      onChange={(event) =>
                        updateLine(line.id, { sgst: event.target.value })
                      }
                      className="h-9 w-[68px] rounded-md border border-line px-1.5 text-xs outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="IGST %"
                      value={line.igst}
                      onChange={(event) =>
                        updateLine(line.id, { igst: event.target.value })
                      }
                      className="h-9 w-[68px] rounded-md border border-line px-1.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
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
                      className={`inline-flex size-8 items-center justify-center rounded-md border border-line bg-card ${
                        line.note
                          ? 'text-primary'
                          : 'text-ink hover:bg-page'
                      }`}
                    >
                      <FilePenLine size={15} strokeWidth={1.75} />
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
                      className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
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
            onClick={() =>
              setDiscount((prev) => (prev ? 0 : Math.min(totals.subTotal, 10)))
            }
            className="flex w-full items-center justify-between text-left text-primary hover:underline"
          >
            <span>+ Total Discount</span>
            <span className="font-semibold text-primary">
              - {formatAmount(discount)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOtherCharges((prev) => (prev ? 0 : 25))}
            className="flex w-full items-center justify-between text-left text-primary hover:underline"
          >
            <span>+ Add Other Charges</span>
            <span className="font-medium text-ink">
              {formatAmount(otherCharges)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOtherTaxes((prev) => (prev ? 0 : 5))}
            className="flex w-full items-center justify-between text-left text-primary hover:underline"
          >
            <span>+ Other Taxes</span>
            <span className="font-medium text-ink">
              {formatAmount(otherTaxes)}
            </span>
          </button>
          <div className="flex items-center justify-between border-t border-line pt-2 text-base font-bold text-ink">
            <span>Grand Total</span>
            <span>{formatAmount(totals.grand)}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
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
                      totals.grand ? formatAmount(totals.grand) : '',
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
          {paymentType === 'paid' ? (
            <div className="space-y-3 rounded-lg border border-line bg-page/60 p-3">
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
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={updateStock}
            onChange={(event) => setUpdateStock(event.target.checked)}
            className="size-4 accent-primary"
          />
          Update Inventory Stock
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/sales-return')}
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
        open={purchaseReturnOpen}
        title="Purchase Return"
        onClose={() => setPurchaseReturnOpen(false)}
        onSelect={(poNumber) => {
          setCreditNoteNo(poNumber)
          setPurchaseReturnOpen(false)
          showToast(`Selected ${poNumber}`)
        }}
      />
      <SelectRecordAlert
        open={selectItemAlertOpen}
        message="Please select Item."
        onClose={() => setSelectItemAlertOpen(false)}
      />
    </InventoryPageShell>
  )
}
