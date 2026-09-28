import { useCallback, useMemo, useState } from 'react'
import { showToast } from '../../utils/toast'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_SUPPLIER_WRITE_PERMISSION,
  INV_WRITE_PERMISSION,
  categoryIdByName,
  createCategoryApi,
  createRawMaterialApi,
  createSupplierApi,
  createUnitApi,
  unitIdByName,
  type InventoryCategory,
  type InventoryUnit,
  type RawMaterial,
  type Supplier,
} from '../../services/inventoryService'
import {
  QuickAddRawMaterialModal,
  type QuickAddRawMaterialValues,
} from './QuickAddRawMaterialModal'
import { QuickAddSupplierModal } from './QuickAddSupplierModal'
import { QuickAddUnitModal } from './QuickAddUnitModal'
import { QuickAddCategoryModal } from './QuickAddCategoryModal'

export type InventoryQuickAddKind =
  | 'supplier'
  | 'raw-material'
  | 'unit'
  | 'category'

type KindMap = {
  supplier: Supplier
  'raw-material': RawMaterial
  unit: InventoryUnit
  category: InventoryCategory
}

type Frame =
  | { kind: 'supplier'; onPicked?: (row: Supplier) => void }
  | { kind: 'raw-material'; onPicked?: (row: RawMaterial) => void }
  | { kind: 'unit'; onPicked?: (row: InventoryUnit) => void }
  | { kind: 'category'; onPicked?: (row: InventoryCategory) => void }

export function prependById<T extends { id: string }>(prev: T[], row: T): T[] {
  if (prev.some((item) => item.id === row.id)) {
    return prev.map((item) => (item.id === row.id ? row : item))
  }
  return [row, ...prev]
}

interface UseInventoryQuickAddOptions {
  onSupplierCreated?: (row: Supplier) => void
  onRawMaterialCreated?: (row: RawMaterial) => void
  onUnitCreated?: (row: InventoryUnit) => void
  onCategoryCreated?: (row: InventoryCategory) => void
}

export function useInventoryQuickAdd(options: UseInventoryQuickAddOptions = {}) {
  const { encryptedOutletId, hasPermission } = useAuth()
  const { units, categories, upsertUnit, upsertCategory } = useInventoryMasters()
  const [stack, setStack] = useState<Frame[]>([])
  const [saving, setSaving] = useState(false)

  const canCreateSupplier = hasPermission(INV_SUPPLIER_WRITE_PERMISSION)
  const canCreateMaster = hasPermission(INV_WRITE_PERMISSION)

  const canCreate = useCallback(
    (kind: InventoryQuickAddKind) =>
      kind === 'supplier' ? canCreateSupplier : canCreateMaster,
    [canCreateMaster, canCreateSupplier],
  )

  const closeTop = useCallback(() => {
    setStack((prev) => prev.slice(0, -1))
  }, [])

  const open = useCallback(
    <K extends InventoryQuickAddKind>(
      kind: K,
      onPicked?: (row: KindMap[K]) => void,
    ) => {
      if (!canCreate(kind)) return
      setStack((prev) => [...prev, { kind, onPicked } as Frame])
    },
    [canCreate],
  )

  const handler = useCallback(
    <K extends InventoryQuickAddKind>(
      kind: K,
      onPicked?: (row: KindMap[K]) => void,
    ): (() => void) | undefined => {
      if (!canCreate(kind)) return undefined
      return () => open(kind, onPicked)
    },
    [canCreate, open],
  )

  const current = stack[stack.length - 1] ?? null

  async function saveSupplier(values: {
    name: string
    company: string
    phone: string
    registeredUnderGst: boolean
    type: string
  }): Promise<boolean> {
    if (current?.kind !== 'supplier') return false
    setSaving(true)
    try {
      const row = await createSupplierApi({
        name: values.name,
        company: values.company,
        phone: values.phone,
        registered_under_gst: values.registeredUnderGst,
        type: values.type.toLowerCase(),
      })
      options.onSupplierCreated?.(row)
      current.onPicked?.(row)
      showToast(`${row.name} added`)
      return true
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to add supplier')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveUnit(name: string): Promise<boolean> {
    if (current?.kind !== 'unit') return false
    setSaving(true)
    try {
      const row = await createUnitApi(name)
      upsertUnit(row)
      options.onUnitCreated?.(row)
      current.onPicked?.(row)
      showToast(`${row.name} added`)
      return true
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to add unit')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveCategory(name: string): Promise<boolean> {
    if (current?.kind !== 'category') return false
    setSaving(true)
    try {
      const row = await createCategoryApi({
        name,
        parent_id: null,
      })
      upsertCategory(row)
      options.onCategoryCreated?.(row)
      current.onPicked?.(row)
      showToast(`${row.name} added`)
      return true
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to add category',
      )
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveRawMaterial(
    values: QuickAddRawMaterialValues,
  ): Promise<boolean> {
    if (current?.kind !== 'raw-material') return false
    if (!encryptedOutletId) {
      showToast('Select an outlet before adding raw materials')
      return false
    }
    const purchaseIds = values.purchaseUnits
      .map((name) => unitIdByName(units, name))
      .filter((id): id is string => Boolean(id))
    const consumptionId = unitIdByName(units, values.consumptionUnit)
    if (purchaseIds.length === 0 || !consumptionId) {
      showToast('Create a unit before adding raw materials')
      return false
    }
    setSaving(true)
    try {
      const row = await createRawMaterialApi(encryptedOutletId, {
        name: values.name,
        purchase_unit_ids: purchaseIds,
        consumption_unit_id: consumptionId,
        conversion_purchase_unit_id: purchaseIds[0],
        category_id: categoryIdByName(categories, values.category) ?? null,
      })
      options.onRawMaterialCreated?.(row)
      current.onPicked?.(row)
      showToast(`${row.name} added`)
      return true
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to add raw material',
      )
      return false
    } finally {
      setSaving(false)
    }
  }

  const unitOptions = useMemo(
    () => units.filter((row) => row.is_active).map((row) => row.name),
    [units],
  )
  const categoryOptions = useMemo(
    () => categories.map((row) => row.name),
    [categories],
  )

  const host = (
    <>
      <QuickAddSupplierModal
        open={current?.kind === 'supplier'}
        onClose={closeTop}
        saving={saving}
        onSave={saveSupplier}
      />
      <QuickAddUnitModal
        open={current?.kind === 'unit'}
        onClose={closeTop}
        saving={saving}
        onSave={saveUnit}
      />
      <QuickAddCategoryModal
        open={current?.kind === 'category'}
        onClose={closeTop}
        saving={saving}
        onSave={saveCategory}
      />
      <QuickAddRawMaterialModal
        open={stack.some((frame) => frame.kind === 'raw-material')}
        onClose={closeTop}
        saving={saving}
        unitOptions={unitOptions}
        categoryOptions={categoryOptions}
        onAddUnit={
          canCreateMaster
            ? (apply) => open('unit', (row) => apply(row.name))
            : undefined
        }
        onAddCategory={
          canCreateMaster
            ? (apply) => open('category', (row) => apply(row.name))
            : undefined
        }
        captureEscape={current?.kind === 'raw-material'}
        onSave={saveRawMaterial}
      />
    </>
  )

  return { handler, host, canCreate, open }
}
