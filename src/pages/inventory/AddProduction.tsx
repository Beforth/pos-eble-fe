import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { ProductionMoreOptionsDrawer } from '../../components/inventory/ProductionMoreOptionsDrawer'
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
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_PRODUCTION_WRITE_PERMISSION,
  createProductionProcessApi,
  listAllRawMaterialsApi,
  unitIdByName,
  type RawMaterial,
} from '../../services/inventoryService'

interface FromRow {
  id: string
  rawMaterial: string
  qty: string
  unit: string
}

export default function AddProduction() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_PRODUCTION_WRITE_PERMISSION)
  const { units, loadMasters } = useInventoryMasters()
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [productionName, setProductionName] = useState('')
  const [toMaterial, setToMaterial] = useState('')
  const [toQty, setToQty] = useState('1')
  const [toUnit, setToUnit] = useState('')
  const [fromMaterial, setFromMaterial] = useState('')
  const [fromQty, setFromQty] = useState('')
  const [fromUnit, setFromUnit] = useState('')
  const [fromRows, setFromRows] = useState<FromRow[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [moreOptions, setMoreOptions] = useState({
    defaultQuantity: '',
    description: '',
    autoProduction: false,
  })
  const quickAdd = useInventoryQuickAdd({
    onRawMaterialCreated: (row) =>
      setMaterials((prev) => prependById(prev, row)),
  })
  const draft = useInventoryFormDraft(
    `rajubhai.inventory.production.${encryptedOutletId ?? 'unknown'}.new`,
    {
      productionName,
      toMaterial,
      toQty,
      toUnit,
      fromMaterial,
      fromQty,
      fromUnit,
      fromRows,
      moreOptions,
    },
    (saved) => {
      setProductionName(saved.productionName)
      setToMaterial(saved.toMaterial)
      setToQty(saved.toQty)
      setToUnit(saved.toUnit)
      setFromMaterial(saved.fromMaterial)
      setFromQty(saved.fromQty)
      setFromUnit(saved.fromUnit)
      setFromRows(saved.fromRows)
      setMoreOptions(saved.moreOptions)
    },
  )

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  useEffect(() => {
    if (!encryptedOutletId) return
    listAllRawMaterialsApi(encryptedOutletId)
      .then(setMaterials)
      .catch((err) => {
        showToast(
          err instanceof ApiError ? err.message : 'Unable to load raw materials',
        )
      })
  }, [encryptedOutletId])

  const materialNames = materials.map((row) => row.name)
  const unitNames = units.map((row) => row.name)

  function materialByName(name: string) {
    return materials.find((row) => row.name === name)
  }

  function handleAddFrom() {
    if (!fromMaterial) {
      setError('Please select a from raw material')
      return
    }
    if (!fromQty.trim() || Number(fromQty) <= 0) {
      setError('From quantity is required')
      return
    }
    if (!fromUnit) {
      setError('Please select a from unit')
      return
    }
    if (toMaterial && fromMaterial === toMaterial) {
      setError('From raw material cannot match the To output')
      return
    }
    setError('')
    setFromRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random()}`,
        rawMaterial: fromMaterial,
        qty: fromQty,
        unit: fromUnit,
      },
    ])
    setFromMaterial('')
    setFromQty('')
    setFromUnit('')
    showToast('From raw material added')
  }

  async function handleSave() {
    if (!canWrite || !encryptedOutletId) return
    if (!productionName.trim()) {
      setError('Production name is required')
      return
    }
    const output = materialByName(toMaterial)
    if (!output) {
      setError('Please select a To raw material')
      return
    }
    if (!toQty.trim() || Number(toQty) <= 0) {
      setError('To quantity is required')
      return
    }
    const outputUnitId = unitIdByName(units, toUnit)
    if (!outputUnitId) {
      setError('Please select a To unit')
      return
    }
    if (fromRows.length === 0) {
      setError('Add at least one From raw material')
      return
    }
    const lines: { raw_material_id: string; qty: string; unit_id: string }[] =
      []
    for (const row of fromRows) {
      const raw = materialByName(row.rawMaterial)
      const unitId = unitIdByName(units, row.unit)
      if (!raw || !unitId) {
        setError('From lines must use valid raw materials and units')
        return
      }
      lines.push({
        raw_material_id: raw.id,
        qty: row.qty,
        unit_id: unitId,
      })
    }
    setError('')
    setSaving(true)
    try {
      await createProductionProcessApi(encryptedOutletId, {
        name: productionName.trim(),
        output_raw_material_id: output.id,
        output_qty: toQty,
        output_unit_id: outputUnitId,
        default_quantity: moreOptions.defaultQuantity || null,
        description: moreOptions.description,
        auto_production: moreOptions.autoProduction,
        lines,
      })
      draft.clearDraft()
      showToast('Production process saved')
      navigate('/inventory/production-master')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to save production',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <InventoryPageShell activeItem="production-master">
      <DraftRecoveryBanner
        visible={draft.hasDraft}
        onRestore={draft.restoreDraft}
        onDiscard={draft.discardDraft}
      />
      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Add Production Process</h1>
        <p className="mt-1 text-sm text-muted">
          Create a process with From (input) lines and one To (output) raw
          material.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-line bg-card p-4 sm:p-5">
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
                Final output of this production or conversion activity.
              </p>
            </div>
          </div>
          <OutlineButton variant="gray" onClick={() => setMoreOpen(true)}>
            More Option
          </OutlineButton>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_0.7fr_0.8fr] lg:items-end">
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
          <div>
            <SearchableSelect
              label="Raw Material"
              required
              value={toMaterial}
              options={materialNames}
              placeholder="Select Raw Material"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={(value) => {
                setToMaterial(value)
                const material = materialByName(value)
                if (material?.consumption_unit?.name && !toUnit) {
                  setToUnit(material.consumption_unit.name)
                }
              }}
              onAddNew={quickAdd.handler('raw-material', (row) => {
                setToMaterial(row.name)
                if (!toUnit) setToUnit(row.consumption_unit.name)
              })}
            />
            {encryptedOutletId ? (
              <StockAvailabilityButton
                outletId={encryptedOutletId}
                material={materials.find((row) => row.name === toMaterial)}
              />
            ) : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Quantity <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={toQty}
              onChange={(event) => setToQty(event.target.value)}
              placeholder="Quantity"
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <SearchableSelect
            label="Unit"
            required
            value={toUnit}
            options={unitNames}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setToUnit}
            onAddNew={quickAdd.handler('unit', (row) => setToUnit(row.name))}
          />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package size={20} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink">
              From Raw Material
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Inputs consumed when this process runs.
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.7fr_0.8fr_auto] lg:items-end">
          <div>
            <SearchableSelect
              label="Raw Material"
              required
              value={fromMaterial}
              options={materialNames}
              placeholder="Select Raw Material"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={(value) => {
                setFromMaterial(value)
                const material = materialByName(value)
                if (material?.consumption_unit?.name && !fromUnit) {
                  setFromUnit(material.consumption_unit.name)
                }
              }}
              onAddNew={quickAdd.handler('raw-material', (row) => {
                setFromMaterial(row.name)
                if (!fromUnit) setFromUnit(row.consumption_unit.name)
              })}
            />
            {encryptedOutletId ? (
              <StockAvailabilityButton
                outletId={encryptedOutletId}
                material={materials.find((row) => row.name === fromMaterial)}
              />
            ) : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Quantity <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={fromQty}
              onChange={(event) => setFromQty(event.target.value)}
              placeholder="Quantity"
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <SearchableSelect
            label="Unit"
            required
            value={fromUnit}
            options={unitNames}
            placeholder="Select Unit"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setFromUnit}
            onAddNew={quickAdd.handler('unit', (row) => setFromUnit(row.name))}
          />
          <div className="flex items-end">
            <OutlineButton onClick={handleAddFrom}>
              <Plus size={15} />
              Add
            </OutlineButton>
          </div>
        </div>

        {fromRows.length > 0 ? (
          <div className="mt-5 overflow-x-auto rounded-lg border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
                <tr>
                  <th className="px-3 py-2.5">Raw Material</th>
                  <th className="px-3 py-2.5">Quantity</th>
                  <th className="px-3 py-2.5">Unit</th>
                  <th className="px-3 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {fromRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-b-0 ${
                      getInsufficientStockMaterial(error) === row.rawMaterial
                        ? 'bg-red-50 outline outline-1 outline-red-200'
                        : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 text-ink">
                      {row.rawMaterial}
                      {encryptedOutletId ? (
                        <StockAvailabilityButton
                          outletId={encryptedOutletId}
                          material={materials.find(
                            (m) => m.name === row.rawMaterial,
                          )}
                        />
                      ) : null}
                      {getInsufficientStockMaterial(error) ===
                      row.rawMaterial ? (
                        <StockShortfallNote
                          available={
                            materials.find(
                              (m) => m.name === row.rawMaterial,
                            )?.stock_qty ?? '0'
                          }
                          availableUnit={
                            materials.find(
                              (m) => m.name === row.rawMaterial,
                            )?.consumption_unit.name
                          }
                          required={row.qty || '0'}
                          requiredUnit={row.unit}
                        />
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-ink">{row.qty}</td>
                    <td className="px-3 py-2.5 text-ink">{row.unit}</td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        aria-label="Remove row"
                        onClick={() =>
                          setFromRows((prev) =>
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

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => navigate('/inventory/production-master')}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          {canWrite ? (
            <PrimaryButton
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </PrimaryButton>
          ) : null}
        </div>
      </div>

      <ProductionMoreOptionsDrawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        initialValues={moreOptions}
        onSave={(values) => {
          setMoreOptions(values)
          setMoreOpen(false)
        }}
      />
      {quickAdd.host}
    </InventoryPageShell>
  )
}
