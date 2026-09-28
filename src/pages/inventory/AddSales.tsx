import { useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BadgePercent,
  Check,
  ChevronDown,
  FilePenLine,
  MoreVertical,
  Plus,
  Store,
  Trash2,
  Truck,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { OtherDetailsDrawer } from '../../components/inventory/OtherDetailsDrawer'
import { PaymentHistoryPanel } from '../../components/inventory/PaymentHistoryPanel'
import { SelectPurchaseOrderModal } from '../../components/inventory/SelectPurchaseOrderModal'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  DraftRecoveryBanner,
  getInsufficientStockMaterial,
  StockAvailabilityButton,
  StockShortfallNote,
  useInventoryFormDraft,
} from '../../components/inventory/InventoryStockAssist'
import {
  prependById,
  useInventoryQuickAdd,
} from '../../components/inventory/InventoryQuickAdd'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import { listOutletsApi } from '../../services/outletService'
import {
  INV_SALES_WRITE_PERMISSION,
  createSaleApi,
  getSaleApi,
  listAllRawMaterialsApi,
  listCategoriesApi,
  listSuppliersApi,
  updateSaleApi,
  type InventoryCategory,
  type RawMaterial,
  type Supplier,
} from '../../services/inventoryService'

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

export default function AddSales() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_SALES_WRITE_PERMISSION)
  const isEdit = Boolean(id)
  const { units, loadMasters } = useInventoryMasters()
  const [saleTo, setSaleTo] = useState<'supplier' | 'restaurant'>('restaurant')
  const [party, setParty] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  )
  const [invoiceNo, setInvoiceNo] = useState('')
  const [category, setCategory] = useState('')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [discount, setDiscount] = useState(0)
  const [otherCharges, setOtherCharges] = useState(0)
  const [otherTaxes, setOtherTaxes] = useState(0)
  const [paymentType, setPaymentType] = useState<'unpaid' | 'paid'>('unpaid')
  const [paymentDate, setPaymentDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  )
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [updateStock, setUpdateStock] = useState(true)
  const [recipientCanEdit, setRecipientCanEdit] = useState(true)
  const [error, setError] = useState('')
  const [noteLineId, setNoteLineId] = useState<string | null>(null)
  const [selectItemAlertOpen, setSelectItemAlertOpen] = useState(false)
  const [poSelectOpen, setPoSelectOpen] = useState(false)
  const [otherDetailsOpen, setOtherDetailsOpen] = useState(false)
  const [discountType, setDiscountType] = useState<
    'invoice' | 'raw-material'
  >('invoice')
  const [discountTypeOpen, setDiscountTypeOpen] = useState(false)
  const discountTypeRef = useRef<HTMLDivElement>(null)
  const [moreActionOpen, setMoreActionOpen] = useState(false)
  const moreActionRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [restaurants, setRestaurants] = useState<
    { id: string; name: string }[]
  >([])
  const quickAdd = useInventoryQuickAdd({
    onSupplierCreated: (row) => setSuppliers((prev) => prependById(prev, row)),
    onRawMaterialCreated: (row) =>
      setRawMaterials((prev) => prependById(prev, row)),
    onCategoryCreated: (row) => setCategories((prev) => prependById(prev, row)),
  })
  const draft = useInventoryFormDraft(
    `rajubhai.inventory.sale.${encryptedOutletId ?? 'unknown'}.${id ?? 'new'}`,
    {
      saleTo,
      party,
      invoiceDate,
      invoiceNo,
      category,
      lines,
      discount,
      otherCharges,
      otherTaxes,
      paymentType,
      paymentDate,
      paidAmount,
      paymentMethod,
      updateStock,
      recipientCanEdit,
    },
    (saved) => {
      setSaleTo(saved.saleTo)
      setParty(saved.party)
      setInvoiceDate(saved.invoiceDate)
      setInvoiceNo(saved.invoiceNo)
      setCategory(saved.category)
      setLines(saved.lines)
      setDiscount(saved.discount)
      setOtherCharges(saved.otherCharges)
      setOtherTaxes(saved.otherTaxes)
      setPaymentType(saved.paymentType)
      setPaymentDate(saved.paymentDate)
      setPaidAmount(saved.paidAmount)
      setPaymentMethod(saved.paymentMethod)
      setUpdateStock(saved.updateStock)
      setRecipientCanEdit(saved.recipientCanEdit)
    },
  )

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

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    if (!encryptedOutletId) return
    void listSuppliersApi().then(setSuppliers).catch(() => setSuppliers([]))
    void listCategoriesApi().then(setCategories).catch(() => setCategories([]))
    void listAllRawMaterialsApi(encryptedOutletId)
      .then(setRawMaterials)
      .catch((err) => {
        setRawMaterials([])
        showToast(
          err instanceof ApiError
            ? err.message
            : 'Unable to load raw materials',
        )
      })
    void listOutletsApi()
      .then((rows) =>
        setRestaurants(
          rows
            .filter((row) => row.encrypted_id !== encryptedOutletId)
            .map((row) => ({
              id: row.encrypted_id,
              name: row.outlet_name,
            })),
        ),
      )
      .catch(() => setRestaurants([]))
  }, [encryptedOutletId])

  useEffect(() => {
    if (!id || !encryptedOutletId) return
    getSaleApi(encryptedOutletId, id)
      .then((row) => {
        setSaleTo(row.source_type === 'supplier' ? 'supplier' : 'restaurant')
        setParty(row.supplier_name || row.restaurant_name || '')
        setInvoiceDate(row.invoice_date)
        setInvoiceNo(row.invoice_number)
        setDiscount(Number(row.discount) || 0)
        setOtherCharges(Number(row.other_charges) || 0)
        setOtherTaxes(Number(row.other_taxes) || 0)
        setPaymentType(row.payment_status === 'paid' ? 'paid' : 'unpaid')
        setPaymentDate(row.payment_date || new Date().toISOString().slice(0, 10))
        setPaidAmount(row.paid_amount)
        setPaymentMethod(row.payment_method || 'Cash')
        setUpdateStock(row.update_inventory_stock)
        setRecipientCanEdit(row.recipient_can_edit)
        setLines(
          row.lines.length
            ? row.lines.map((line) => ({
                id: `line-${line.raw_material_id}-${Math.random()}`,
                selected: false,
                rawMaterial: line.raw_material_name,
                qty: line.qty,
                unit: line.unit_name,
                price: line.price,
                amount: line.amount,
                cgst: line.cgst,
                sgst: line.sgst,
                igst: line.igst,
                note: line.note,
              }))
            : [emptyLine()],
        )
      })
      .catch((err) => {
        showToast(err instanceof ApiError ? err.message : 'Unable to load sale')
      })
  }, [id, encryptedOutletId])

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

  const visibleRawMaterials = useMemo(() => {
    if (!category) return rawMaterials
    return rawMaterials.filter(
      (row) =>
        row.category?.name === category ||
        row.sub_category?.name === category,
    )
  }, [rawMaterials, category])
  const rawNames = visibleRawMaterials.map((row) => row.name)
  const unitNames = units.filter((row) => row.is_active).map((row) => row.name)
  const categoryNames = categories.map((row) => row.name)
  const supplierNames = suppliers.filter((row) => row.is_active).map((row) => row.name)
  const restaurantNames = restaurants.map((row) => row.name)

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

  async function handleSave() {
    if (!canWrite || !encryptedOutletId) return
    if (!party) {
      setError(
        saleTo === 'restaurant'
          ? 'Please select a restaurant'
          : 'Please select a supplier / third party',
      )
      return
    }
    if (!invoiceDate) {
      setError('Invoice date is required')
      return
    }
    const validLines = lines.filter(
      (line) => line.rawMaterial && toNumber(line.qty) > 0 && line.unit,
    )
    if (validLines.length === 0) {
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
    let payloadLines
    try {
      payloadLines = validLines.map((line) => {
        const raw = rawMaterials.find((row) => row.name === line.rawMaterial)
        const unit = units.find((row) => row.name === line.unit)
        if (!raw || !unit) {
          throw new Error('Select a saved raw material and unit')
        }
        return {
          raw_material_id: raw.id,
          qty: line.qty,
          unit_id: unit.id,
          price: line.price || '0',
          amount: line.amount || String(toNumber(line.qty) * toNumber(line.price)),
          cgst: line.cgst || '0',
          sgst: line.sgst || '0',
          igst: line.igst || '0',
          note: line.note,
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save sale')
      return
    }
    setError('')
    setSaving(true)
    try {
      const payload = {
        source_type: saleTo,
        supplier_id:
          saleTo === 'supplier'
            ? suppliers.find((row) => row.name === party)?.id ?? null
            : null,
        restaurant_id:
          saleTo === 'restaurant'
            ? restaurants.find((row) => row.name === party)?.id ?? null
            : null,
        invoice_date: invoiceDate,
        invoice_number: invoiceNo,
        subtotal: String(totals.subTotal),
        discount: String(discount),
        other_charges: String(otherCharges),
        other_taxes: String(otherTaxes),
        grand_total: String(totals.grand),
        payment_status: paymentType,
        payment_date: paymentType === 'paid' ? paymentDate : null,
        paid_amount: paymentType === 'paid' ? paidAmount : '0',
        payment_method: paymentType === 'paid' ? paymentMethod : '',
        update_inventory_stock: updateStock,
        recipient_can_edit: recipientCanEdit,
        lines: payloadLines,
      }
      if (isEdit && id) await updateSaleApi(encryptedOutletId, id, payload)
      else await createSaleApi(encryptedOutletId, payload)
      draft.clearDraft()
      showToast(isEdit ? 'Sale updated' : 'Sale saved')
      navigate('/inventory/sales')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save sale')
    } finally {
      setSaving(false)
    }
  }

  const allSelected = lines.length > 0 && lines.every((line) => line.selected)
  const noteLine = lines.find((line) => line.id === noteLineId)
  const partyOptions = saleTo === 'restaurant' ? restaurantNames : supplierNames

  return (
    <InventoryPageShell activeItem="sales">
      <DraftRecoveryBanner
        visible={draft.hasDraft}
        onRestore={draft.restoreDraft}
        onDiscard={draft.discardDraft}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-lg font-bold text-ink">
            {isEdit ? 'Edit Sale' : 'Add Sale'}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink">To</span>
            <div className="inline-flex overflow-hidden rounded-md border border-line">
              <button
                type="button"
                onClick={() => {
                  setSaleTo('supplier')
                  setParty('')
                }}
                className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
                  saleTo === 'supplier'
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
                  setSaleTo('restaurant')
                  setParty('')
                }}
                className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
                  saleTo === 'restaurant'
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
              saleTo === 'restaurant' ? 'Restaurant' : 'Supplier/Third Party'
            }
            required
            value={party}
            options={partyOptions}
            placeholder="Please select"
            searchPlaceholder="Search"
            onChange={setParty}
            onAddNew={
              saleTo === 'supplier'
                ? quickAdd.handler('supplier', (row) => setParty(row.name))
                : undefined
            }
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
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(event) => setInvoiceNo(event.target.value)}
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
            options={categoryNames}
            placeholder="Please Select Category"
            searchPlaceholder="Search"
            includePlaceholderOption
            onChange={setCategory}
            onAddNew={quickAdd.handler('category', (row) =>
              setCategory(row.name),
            )}
          />
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
              <th className="px-3 py-3">Tax (%)</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr
                key={line.id}
                className={`border-b border-line last:border-b-0 ${
                  getInsufficientStockMaterial(error) === line.rawMaterial
                    ? 'bg-red-50 outline outline-1 outline-red-200'
                    : ''
                }`}
              >
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
                <td className="min-w-[200px] px-3 py-2.5 relative z-0 [&:has([aria-expanded=true])]:z-30">
                  <SearchableSelect
                    value={line.rawMaterial}
                    options={rawNames}
                    placeholder="Select/Add Raw Material"
                    searchPlaceholder="Search materials..."
                    compact
                    dropdownPlacement="auto"
                    onChange={(value) => {
                      const material = visibleRawMaterials.find(
                        (m) => m.name === value,
                      )
                      updateLine(line.id, {
                        rawMaterial: value,
                        unit:
                          material?.consumption_unit.name ?? line.unit,
                      })
                    }}
                    onAddNew={quickAdd.handler('raw-material', (row) =>
                      updateLine(line.id, {
                        rawMaterial: row.name,
                        unit: row.consumption_unit.name,
                      }),
                    )}
                  />
                  {encryptedOutletId ? (
                    <StockAvailabilityButton
                      outletId={encryptedOutletId}
                      material={rawMaterials.find(
                        (row) => row.name === line.rawMaterial,
                      )}
                    />
                  ) : null}
                  {getInsufficientStockMaterial(error) === line.rawMaterial ? (
                    <StockShortfallNote
                      available={
                        rawMaterials.find(
                          (row) => row.name === line.rawMaterial,
                        )?.stock_qty ?? '0'
                      }
                      availableUnit={
                        rawMaterials.find(
                          (row) => row.name === line.rawMaterial,
                        )?.consumption_unit.name
                      }
                      required={line.qty || '0'}
                      requiredUnit={line.unit}
                    />
                  ) : null}
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
                    {unitNames.map((unit) => (
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
                      className={`inline-flex size-8 items-center justify-center rounded-md border border-line bg-page ${
                        line.note
                          ? 'text-primary'
                          : 'text-ink hover:bg-line/40'
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

      {isEdit && id && encryptedOutletId ? (
        <PaymentHistoryPanel
          outletId={encryptedOutletId}
          documentType="sale"
          documentId={id}
          canAdd={canWrite}
        />
      ) : null}

      {error ? (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-xs font-medium ${
            getInsufficientStockMaterial(error)
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'text-primary'
          }`}
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex flex-wrap gap-4">
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/sales')}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <PrimaryButton onClick={() => void handleSave()} disabled={saving || !canWrite}>
            {saving ? 'Saving…' : 'Save Changes'}
          </PrimaryButton>
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
          setInvoiceNo(poNumber)
          setPoSelectOpen(false)
          showToast(`Selected ${poNumber}`)
        }}
      />
      <OtherDetailsDrawer
        open={otherDetailsOpen}
        onClose={() => setOtherDetailsOpen(false)}
      />
      <SelectRecordAlert
        open={selectItemAlertOpen}
        message="Please select Item."
        onClose={() => setSelectItemAlertOpen(false)}
      />
      {quickAdd.host}
    </InventoryPageShell>
  )
}
