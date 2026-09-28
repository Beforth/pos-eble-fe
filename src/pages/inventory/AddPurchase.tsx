import { useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FilePenLine,
  Plus,
  StickyNote,
  Trash2,
  Upload,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { PaymentHistoryPanel } from '../../components/inventory/PaymentHistoryPanel'
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
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import { listOutletsApi } from '../../services/outletService'
import {
  INV_PURCHASE_WRITE_PERMISSION,
  createPurchaseApi,
  getPurchaseApi,
  listAllRawMaterialsApi,
  listSuppliersApi,
  updatePurchaseApi,
  type RawMaterial,
  type Supplier,
} from '../../services/inventoryService'
import { downloadCsv } from '../../utils/downloadFile'

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

export default function AddPurchase() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_PURCHASE_WRITE_PERMISSION)
  const isEdit = Boolean(id)
  const { units, loadMasters } = useInventoryMasters()
  const [purchaseFrom, setPurchaseFrom] = useState<'supplier' | 'restaurant'>(
    'supplier',
  )
  const [supplier, setSupplier] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  )
  const [invoiceNo, setInvoiceNo] = useState('')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [discount, setDiscount] = useState(0)
  const [otherCharges, setOtherCharges] = useState(0)
  const [otherTaxes, setOtherTaxes] = useState(0)
  const [paymentType, setPaymentType] = useState<'unpaid' | 'paid'>('unpaid')
  const [updateStock, setUpdateStock] = useState(true)
  const [error, setError] = useState('')
  const [noteLineId, setNoteLineId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [restaurants, setRestaurants] = useState<
    { id: string; name: string }[]
  >([])
  const [invoiceFileName, setInvoiceFileName] = useState<string | null>(null)
  const invoiceInputRef = useRef<HTMLInputElement>(null)
  const quickAdd = useInventoryQuickAdd({
    onSupplierCreated: (row) => setSuppliers((prev) => prependById(prev, row)),
    onRawMaterialCreated: (row) =>
      setRawMaterials((prev) => prependById(prev, row)),
  })
  const draft = useInventoryFormDraft(
    `rajubhai.inventory.purchase.${encryptedOutletId ?? 'unknown'}.${id ?? 'new'}`,
    {
      purchaseFrom,
      supplier,
      restaurant,
      invoiceDate,
      invoiceNo,
      lines,
      discount,
      otherCharges,
      otherTaxes,
      paymentType,
      updateStock,
    },
    (saved) => {
      setPurchaseFrom(saved.purchaseFrom)
      setSupplier(saved.supplier)
      setRestaurant(saved.restaurant)
      setInvoiceDate(saved.invoiceDate)
      setInvoiceNo(saved.invoiceNo)
      setLines(saved.lines)
      setDiscount(saved.discount)
      setOtherCharges(saved.otherCharges)
      setOtherTaxes(saved.otherTaxes)
      setPaymentType(saved.paymentType)
      setUpdateStock(saved.updateStock)
    },
  )

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
    const grand =
      subTotal - discount + otherCharges + lineTax + otherTaxes
    return {
      subTotal,
      lineTax,
      grand: Math.max(0, grand),
    }
  }, [lines, discount, otherCharges, otherTaxes])

  const supplierNames = suppliers.filter((row) => row.is_active).map((row) => row.name)
  const restaurantNames = restaurants.map((row) => row.name)
  const rawNames = rawMaterials.map((row) => row.name)
  const unitNames = units.filter((row) => row.is_active).map((row) => row.name)

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    if (!encryptedOutletId) return
    void listSuppliersApi().then(setSuppliers).catch(() => setSuppliers([]))
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
    getPurchaseApi(encryptedOutletId, id)
      .then((row) => {
        setPurchaseFrom(row.source_type === 'restaurant' ? 'restaurant' : 'supplier')
        setSupplier(row.supplier_name ?? '')
        setRestaurant(row.restaurant_name ?? '')
        setInvoiceDate(row.invoice_date)
        setInvoiceNo(row.invoice_number)
        setDiscount(Number(row.discount) || 0)
        setOtherCharges(Number(row.other_charges) || 0)
        setOtherTaxes(Number(row.other_taxes) || 0)
        setPaymentType(row.payment_status === 'paid' ? 'paid' : 'unpaid')
        setUpdateStock(row.update_inventory_stock)
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
        showToast(
          err instanceof ApiError ? err.message : 'Unable to load purchase',
        )
      })
  }, [id, encryptedOutletId])

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

  function applyInvoiceTax(cgst: string, sgst: string, igst: string) {
    setLines((prev) =>
      prev.map((line) => ({ ...line, cgst, sgst, igst })),
    )
    showToast('Tax applied at invoice level')
  }

  function deleteSelectedLines() {
    setLines((prev) => {
      const next = prev.filter((line) => !line.selected)
      return next.length ? next : [emptyLine()]
    })
    showToast('Selected rows removed')
  }

  function clearEmptyLines() {
    setLines((prev) => {
      const next = prev.filter(
        (line) =>
          line.rawMaterial.trim() ||
          line.qty.trim() ||
          toNumber(line.price) > 0,
      )
      return next.length ? next : [emptyLine()]
    })
    showToast('Empty rows cleared')
  }

  function exportLinesCsv() {
    downloadCsv(
      ['raw_material', 'qty', 'unit', 'price', 'amount', 'cgst', 'sgst', 'igst', 'note'],
      lines.map((line) => [
        line.rawMaterial,
        line.qty,
        line.unit,
        line.price,
        line.amount,
        line.cgst,
        line.sgst,
        line.igst,
        line.note,
      ]),
      `purchase-lines-${invoiceNo || 'draft'}.csv`,
    )
    showToast('Lines exported')
  }

  async function handleSave() {
    if (!canWrite || !encryptedOutletId) return
    if (purchaseFrom === 'supplier' && !supplier) {
      setError('Please select a supplier')
      return
    }
    if (purchaseFrom === 'restaurant' && !restaurant) {
      setError('Please select a restaurant')
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
    for (const [index, line] of validLines.entries()) {
      const raw = rawMaterials.find((row) => row.name === line.rawMaterial)
      const unit = units.find((row) => row.name === line.unit)
      if (!raw || !unit) {
        setError(`Row ${index + 1}: select a saved raw material and unit`)
        return
      }
      if (
        unit.id !== raw.consumption_unit.id &&
        unit.id !== raw.conversion_purchase_unit?.id
      ) {
        setError(
          `Row ${index + 1} (${raw.name}): ${unit.name} has no conversion configured. Use ${raw.consumption_unit.name}${
            raw.conversion_purchase_unit
              ? ` or ${raw.conversion_purchase_unit.name}`
              : ''
          }, or edit the raw material conversion first.`,
        )
        return
      }
    }
    const payloadLines = validLines.map((line, index) => {
      const raw = rawMaterials.find((row) => row.name === line.rawMaterial)
      const unit = units.find((row) => row.name === line.unit)
      if (!raw || !unit) {
        throw new Error(`Row ${index + 1}: invalid raw material or unit`)
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
    try {
      setError('')
      setSaving(true)
      const payload = {
        source_type: purchaseFrom,
        supplier_id:
          purchaseFrom === 'supplier'
            ? suppliers.find((row) => row.name === supplier)?.id ?? null
            : null,
        restaurant_id:
          purchaseFrom === 'restaurant'
            ? restaurants.find((row) => row.name === restaurant)?.id ?? null
            : null,
        invoice_date: invoiceDate,
        invoice_number: invoiceNo,
        subtotal: String(totals.subTotal),
        discount: String(discount),
        other_charges: String(otherCharges),
        other_taxes: String(otherTaxes),
        grand_total: String(totals.grand),
        payment_status: paymentType,
        update_inventory_stock: updateStock,
        lines: payloadLines,
      }
      if (isEdit && id) await updatePurchaseApi(encryptedOutletId, id, payload)
      else await createPurchaseApi(encryptedOutletId, payload)
      draft.clearDraft()
      showToast(isEdit ? 'Purchase updated' : 'Purchase saved')
      navigate('/inventory/purchase')
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Unable to save purchase',
      )
    } finally {
      setSaving(false)
    }
  }

  const allSelected = lines.length > 0 && lines.every((line) => line.selected)
  const noteLine = lines.find((line) => line.id === noteLineId)

  return (
    <InventoryPageShell activeItem="stock-purchase">
      <DraftRecoveryBanner
        visible={draft.hasDraft}
        onRestore={draft.restoreDraft}
        onDiscard={draft.discardDraft}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-lg font-bold text-ink">
            {isEdit ? 'Edit Purchase' : 'Add Purchase'}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink">Purchase From</span>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="add-purchase-from"
                checked={purchaseFrom === 'supplier'}
                onChange={() => setPurchaseFrom('supplier')}
                className="size-4 accent-primary"
              />
              Supplier
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="add-purchase-from"
                checked={purchaseFrom === 'restaurant'}
                onChange={() => setPurchaseFrom('restaurant')}
                className="size-4 accent-primary"
              />
              Restaurant
            </label>
          </div>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Select Purchase Order/Sales &gt;
        </button>
      </div>

      <div className="mb-4 grid gap-4 rounded-xl border border-line bg-card p-4 sm:grid-cols-3">
        {purchaseFrom === 'supplier' ? (
          <div>
            <SearchableSelect
              label={
                <>Supplier <span className="text-primary">*</span></>
              }
              required
              value={supplier}
              options={supplierNames}
              placeholder="Select Supplier"
              searchPlaceholder="Search suppliers..."
              onChange={setSupplier}
              onAddNew={quickAdd.handler('supplier', (row) =>
                setSupplier(row.name),
              )}
            />
          </div>
        ) : (
          <div>
            <SearchableSelect
              label={
                <>Restaurant <span className="text-primary">*</span></>
              }
              required
              value={restaurant}
              options={restaurantNames}
              placeholder="Select Restaurant"
              searchPlaceholder="Search restaurants..."
              onChange={setRestaurant}
            />
          </div>
        )}
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
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <OutlineButton onClick={() => setLines((prev) => [...prev, emptyLine()])}>
          <Plus size={15} />
          Add New
        </OutlineButton>
        <ActionDropdown
          label="At Invoice Level"
          options={[
            {
              label: 'Apply GST 2.5% + 2.5%',
              onClick: () => applyInvoiceTax('2.5', '2.5', '0'),
            },
            {
              label: 'Apply IGST 5%',
              onClick: () => applyInvoiceTax('0', '0', '5'),
            },
            {
              label: 'Clear line taxes',
              onClick: () => applyInvoiceTax('0', '0', '0'),
            },
          ]}
        />
        <ActionDropdown
          label="More Action"
          options={[
            {
              label: 'Delete selected',
              onClick: deleteSelectedLines,
              danger: true,
            },
            { label: 'Clear empty rows', onClick: clearEmptyLines },
            { label: 'Export lines (CSV)', onClick: exportLinesCsv },
            {
              label: 'Add blank row',
              onClick: () => setLines((prev) => [...prev, emptyLine()]),
            },
          ]}
        />
        <input
          ref={invoiceInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            setInvoiceFileName(file.name)
            showToast(`Invoice uploaded: ${file.name}`)
            event.target.value = ''
          }}
        />
        <OutlineButton onClick={() => invoiceInputRef.current?.click()}>
          <Upload size={15} />
          {invoiceFileName ? 'Replace Invoice' : 'Upload Invoice'}
        </OutlineButton>
        {invoiceFileName ? (
          <span className="max-w-[160px] truncate text-xs text-muted">
            {invoiceFileName}
          </span>
        ) : null}
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
                <td className="px-3 py-2.5 relative z-0 [&:has([aria-expanded=true])]:z-30">
                  <SearchableSelect
                    value={line.rawMaterial}
                    options={rawNames}
                    placeholder="Select/Add Raw Material"
                    searchPlaceholder="Search materials..."
                    compact
                    dropdownPlacement="auto"
                    onChange={(value) => {
                      const material = rawMaterials.find((m) => m.name === value)
                      updateLine(line.id, {
                        rawMaterial: value,
                        unit: material?.consumption_unit.name ?? line.unit,
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
            <span>Sub Total</span>
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
                onClick={() => setPaymentType('paid')}
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
      </div>

      {isEdit && id && encryptedOutletId ? (
        <PaymentHistoryPanel
          outletId={encryptedOutletId}
          documentType="purchase"
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
            onClick={() => navigate('/inventory/purchase')}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          {canWrite ? (
            <PrimaryButton onClick={() => void handleSave()}>
              {saving ? 'Saving…' : 'Save Changes'}
            </PrimaryButton>
          ) : null}
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
      {quickAdd.host}
    </InventoryPageShell>
  )
}
