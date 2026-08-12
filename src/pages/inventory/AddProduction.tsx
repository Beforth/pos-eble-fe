import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { ProductionMoreOptionsDrawer } from '../../components/inventory/ProductionMoreOptionsDrawer'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface ToMaterialRow {
  id: string
  productionName: string
  rawMaterial: string
  qty: string
  unit: string
}

const RAW_MATERIALS = [
  { name: 'Tomatoes', unit: 'Kg' },
  { name: 'Onion', unit: 'Kg' },
  { name: 'Paneer', unit: 'Kg' },
  { name: 'Milk', unit: 'Ltr' },
  { name: 'Butter', unit: 'Kg' },
  { name: 'Flour', unit: 'Kg' },
  { name: 'Dabeli Masala Mix', unit: 'Kg' },
]
const UNITS = ['Kg', 'Ltr', 'Pcs', 'Box', 'Packet', 'Cup']

export default function AddProduction() {
  const navigate = useNavigate()
  const [productionName, setProductionName] = useState('')
  const [rawMaterial, setRawMaterial] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')
  const [rows, setRows] = useState<ToMaterialRow[]>([])
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [moreOptions, setMoreOptions] = useState({
    defaultQuantity: '',
    description: '',
    autoProduction: false,
  })

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleAdd() {
    if (!productionName.trim()) {
      setError('Production name is required')
      return
    }
    if (!rawMaterial) {
      setError('Please select a raw material')
      return
    }
    if (!qty.trim() || Number(qty) <= 0) {
      setError('Quantity is required')
      return
    }
    if (!unit) {
      setError('Please select a unit')
      return
    }
    setError('')
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random()}`,
        productionName: productionName.trim(),
        rawMaterial,
        qty,
        unit,
      },
    ])
    setRawMaterial('')
    setQty('')
    setUnit('')
    showToast('Raw material added')
  }

  function handleSave() {
    if (!productionName.trim()) {
      setError('Production name is required')
      return
    }
    if (rows.length === 0) {
      setError('Add at least one to raw material')
      return
    }
    setError('')
    setToast('Production process saved')
    window.setTimeout(() => {
      setToast(null)
      navigate('/inventory/production-master')
    }, 900)
  }

  return (
    <InventoryPageShell activeItem="production-master">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Add Production Process</h1>
        <p className="mt-1 text-sm text-muted">
          Create or modify production process you just need to add from and to
          raw material here.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">
                To Raw Material
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                This refers to the process where the raw material is the final
                output of a production or conversion activity.
              </p>
            </div>
          </div>
          <OutlineButton variant="gray" onClick={() => setMoreOpen(true)}>
            More Option
          </OutlineButton>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_0.7fr_0.8fr_auto] lg:items-end">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Production Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={productionName}
              onChange={(event) => setProductionName(event.target.value)}
              placeholder="Enter production name"
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <SearchableSelect
            label="Raw Material"
            required
            value={rawMaterial}
            options={RAW_MATERIALS.map((m) => m.name)}
            placeholder="Select Raw Material"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={(value) => {
              setRawMaterial(value)
              const material = RAW_MATERIALS.find((m) => m.name === value)
              if (material && !unit) setUnit(material.unit)
            }}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Quantity <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              placeholder="Quantity"
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <SearchableSelect
            label="Unit"
            required
            value={unit}
            options={UNITS}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setUnit}
          />
          <div className="flex items-end">
            <OutlineButton onClick={handleAdd}>
              <Plus size={15} />
              Add
            </OutlineButton>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="mt-5 overflow-x-auto rounded-lg border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
                <tr>
                  <th className="px-3 py-2.5">Production Name</th>
                  <th className="px-3 py-2.5">Raw Material</th>
                  <th className="px-3 py-2.5">Quantity</th>
                  <th className="px-3 py-2.5">Unit</th>
                  <th className="px-3 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-3 py-2.5 text-ink">{row.productionName}</td>
                    <td className="px-3 py-2.5 text-ink">{row.rawMaterial}</td>
                    <td className="px-3 py-2.5 text-ink">{row.qty}</td>
                    <td className="px-3 py-2.5 text-ink">{row.unit}</td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        aria-label="Remove row"
                        onClick={() =>
                          setRows((prev) =>
                            prev.filter((item) => item.id !== row.id),
                          )
                        }
                        className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-xs text-primary">{error}</p> : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => navigate('/inventory/production-master')}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>

      <ProductionMoreOptionsDrawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        initialValues={moreOptions}
        onSave={(values) => {
          setMoreOptions(values)
          if (values.defaultQuantity && !qty) {
            setQty(values.defaultQuantity)
          }
          showToast('More options saved')
        }}
      />
    </InventoryPageShell>
  )
}
