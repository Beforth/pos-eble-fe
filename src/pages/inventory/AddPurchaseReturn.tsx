import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Copy,
  MoreVertical,
  Plus,
  Store,
  Trash2,
  Truck,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OtherDetailsDrawer } from '../../components/inventory/OtherDetailsDrawer'
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
  createPurchaseReturnApi,
  getPurchaseReturnApi,
  listAllRawMaterialsApi,
  listSuppliersApi,
  updatePurchaseReturnApi,
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
  }
}

function toNumber(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatAmount(value: number) {
  return value.toFixed(3)
}

export default function AddPurchaseReturn() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_PURCHASE_WRITE_PERMISSION)
  const isEdit = Boolean(id)
  const { units, loadMasters } = useInventoryMasters()
  const [returnTo, setReturnTo] = useState<'supplier' | 'restaurant'>(
    'restaurant',
  )
  const [supplier, setSupplier] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  )
  const [deliveryTime, setDeliveryTime] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [deliveryCharges, setDeliveryCharges] = useState(0)
  const [recipientCanEdit, setRecipientCanEdit] = useState(true)
  const [error, setError] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>(
    [],
  )

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
      .catch(() => setRawMaterials([]))
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
    getPurchaseReturnApi(encryptedOutletId, id)
      .then((row) => {
        setReturnTo(row.source_type === 'supplier' ? 'supplier' : 'restaurant')
        setSupplier(row.supplier_name ?? '')
        setRestaurant(row.restaurant_name ?? '')
        setDeliveryDate(row.delivery_date)
        setDeliveryTime(row.delivery_time ? String(row.delivery_time).slice(0, 5) : '')
        setPoNumber(row.po_number)
        setDeliveryCharges(Number(row.delivery_charges) || 0)
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
              }))
            : [emptyLine()],
        )
      })
      .catch((err) => {
        showToast(
          err instanceof ApiError ? err.message : 'Unable to load purchase return',
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

  function duplicateLine(id: string) {
    setLines((prev) => {
      const index = prev.findIndex((line) => line.id === id)
      if (index < 0) return prev
      const source = prev[index]
      const copy: LineItem = {
        ...source,
        id: `line-${Date.now()}-${Math.random()}`,
        selected: false,
      }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    setLines((prev) => prev.map((line) => ({ ...line, selected: checked })))
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
          Number(line.price) > 0,
      )
      return next.length ? next : [emptyLine()]
    })
    showToast('Empty rows cleared')
  }

  function exportLinesCsv() {
    downloadCsv(
      ['raw_material', 'qty', 'unit', 'price', 'amount'],
      lines.map((line) => [
        line.rawMaterial,
        line.qty,
        line.unit,
        line.price,
        line.amount,
      ]),
      `purchase-return-lines-${poNumber || 'draft'}.csv`,
    )
    showToast('Lines exported')
  }

  async function handleSave() {
    if (!canWrite || !encryptedOutletId) return
    if (returnTo === 'supplier' && !supplier) {
      setError('Please select a supplier')
      return
    }
    if (returnTo === 'restaurant' && !restaurant) {
      setError('Please select a restaurant')
      return
    }
    if (!deliveryDate) {
      setError('Delivery date is required')
      return
    }
    const validLines = lines.filter(
      (line) => line.rawMaterial && toNumber(line.qty) > 0 && line.unit,
    )
    if (validLines.length === 0) {
      setError('Add at least one raw material with qty and unit')
      return
    }
    setError('')
    setSaving(true)
    try {
      const payload = {
        source_type: returnTo,
        supplier_id:
          returnTo === 'supplier'
            ? suppliers.find((row) => row.name === supplier)?.id ?? null
            : null,
        restaurant_id:
          returnTo === 'restaurant'
            ? restaurants.find((row) => row.name === restaurant)?.id ?? null
            : null,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime || null,
        po_number: poNumber,
        recipient_can_edit: recipientCanEdit,
        subtotal: String(totals.subTotal),
        delivery_charges: String(deliveryCharges),
        grand_total: String(totals.grand),
        lines: validLines.map((line) => {
          const raw = rawMaterials.find((row) => row.name === line.rawMaterial)
          const unit = units.find((row) => row.name === line.unit)
          if (!raw || !unit) throw new Error('Select a saved raw material and unit')
          return {
            raw_material_id: raw.id,
            qty: line.qty,
            unit_id: unit.id,
            price: line.price || '0',
            amount: line.amount || String(toNumber(line.qty) * toNumber(line.price)),
          }
        }),
      }
      if (isEdit && id) await updatePurchaseReturnApi(encryptedOutletId, id, payload)
      else await createPurchaseReturnApi(encryptedOutletId, payload)
      showToast(isEdit ? 'Purchase return updated' : 'Purchase return saved')
      navigate('/inventory/purchase-return')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to save purchase return',
      )
    } finally {
      setSaving(false)
    }
  }

  const allSelected = lines.length > 0 && lines.every((line) => line.selected)

  return (
    <InventoryPageShell activeItem="purchase-return">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          {isEdit ? 'Edit Purchase Return' : 'Add Purchase Return'}
        </h1>
        <div className="inline-flex overflow-hidden rounded-md border border-line">
          <button
            type="button"
            onClick={() => setReturnTo('supplier')}
            className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
              returnTo === 'supplier'
                ? 'bg-primary text-white'
                : 'bg-card text-ink hover:bg-page'
            }`}
          >
            <Truck size={15} />
            Supplier
          </button>
          <button
            type="button"
            onClick={() => setReturnTo('restaurant')}
            className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${
              returnTo === 'restaurant'
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
        {returnTo === 'supplier' ? (
          <div className="min-w-[200px] flex-1">
            <SearchableSelect
              label={<>Supplier <span className="text-primary">*</span></>}
              required
              value={supplier}
              options={supplierNames}
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
              options={restaurantNames}
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
        <OutlineButton variant="gray" onClick={() => setDetailsOpen(true)}>
          Other Details
        </OutlineButton>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <OutlineButton onClick={() => setLines((prev) => [...prev, emptyLine()])}>
          <Plus size={15} />
          Add New
        </OutlineButton>
        <ActionDropdown
          label="More Actions"
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
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Duplicate row"
                      onClick={() => duplicateLine(line.id)}
                      className="rounded p-1.5 text-muted hover:bg-page hover:text-ink"
                    >
                      <Copy size={15} />
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
            onClick={() => navigate('/inventory/purchase-return')}
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

      <OtherDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        variant="sales"
      />
    </InventoryPageShell>
  )
}
