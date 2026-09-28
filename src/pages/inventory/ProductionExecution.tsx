import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  DraftRecoveryBanner,
  getInsufficientStockMaterial,
  StockAvailabilityButton,
  StockShortfallNote,
  useInventoryFormDraft,
} from '../../components/inventory/InventoryStockAssist'
import {
  INV_PRODUCTION_WRITE_PERMISSION,
  createProductionRunApi,
  listAllProductionProcessesApi,
  listAllRawMaterialsApi,
  type ProductionProcess,
  type RawMaterial,
} from '../../services/inventoryService'

const PRODUCTION_TYPES = [
  'Direct Production',
  'Production against PO',
] as const

function typeToApi(label: string) {
  return label === 'Production against PO' ? 'against_po' : 'direct'
}

function DropdownMenu({
  label,
  icon,
  items,
}: {
  label: string
  icon?: ReactNode
  items: { label: string; onClick?: () => void }[]
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        {icon}
        {label}
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[200px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function EmptyPanel({ title }: { title?: string }) {
  return (
    <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <span className="relative mb-4 text-muted">
        <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
        <Search
          size={24}
          className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
        />
      </span>
      <p className="text-base font-semibold text-ink">
        {title ?? 'No Data Available'}
      </p>
    </div>
  )
}

export default function ProductionExecution() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_PRODUCTION_WRITE_PERMISSION)
  const [productionType, setProductionType] =
    useState<string>('Direct Production')
  const [processQuery, setProcessQuery] = useState('')
  const [processes, setProcesses] = useState<ProductionProcess[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [outputQty, setOutputQty] = useState('')
  const [withPrice, setWithPrice] = useState(false)
  const [noRecordAlertOpen, setNoRecordAlertOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const draft = useInventoryFormDraft(
    `rajubhai.inventory.production-execution.${
      encryptedOutletId ?? 'unknown'
    }`,
    { productionType, selectedId, outputQty, withPrice },
    (saved) => {
      setProductionType(saved.productionType)
      setSelectedId(saved.selectedId)
      setOutputQty(saved.outputQty)
      setWithPrice(saved.withPrice)
    },
  )

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    try {
      const rows = await listAllProductionProcessesApi(encryptedOutletId)
      setProcesses(rows.filter((row) => row.is_active))
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Unable to load production processes',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!encryptedOutletId) return
    listAllRawMaterialsApi(encryptedOutletId)
      .then(setRawMaterials)
      .catch(() => setRawMaterials([]))
  }, [encryptedOutletId])

  const filtered = useMemo(() => {
    const q = processQuery.trim().toLowerCase()
    if (!q) return processes
    return processes.filter((row) => row.name.toLowerCase().includes(q))
  }, [processes, processQuery])

  const selected = processes.find((row) => row.id === selectedId) ?? null

  useEffect(() => {
    if (!selected) {
      setOutputQty('')
      return
    }
    setOutputQty(
      selected.default_quantity || selected.output_qty || '1',
    )
  }, [selected])

  async function handleConvert() {
    if (!canWrite || !encryptedOutletId) return
    if (!selected) {
      setNoRecordAlertOpen(true)
      return
    }
    if (!outputQty.trim() || Number(outputQty) <= 0) {
      showToast('Enter a valid output quantity')
      return
    }
    if (typeToApi(productionType) === 'against_po') {
      showToast('Select a purchase order for against-PO production')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createProductionRunApi(encryptedOutletId, {
        process_id: selected.id,
        production_type: typeToApi(productionType),
        output_qty: outputQty,
        with_price: withPrice,
      })
      draft.clearDraft()
      showToast('Converted to production')
      setSelectedId(null)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to create production run',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <InventoryPageShell activeItem="production-execution">
      <DraftRecoveryBanner
        visible={draft.hasDraft}
        onRestore={draft.restoreDraft}
        onDiscard={draft.discardDraft}
      />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px]">
            <SearchableSelect
              label="Production Type"
              value={productionType}
              options={[...PRODUCTION_TYPES]}
              placeholder="Select type"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setProductionType}
            />
          </div>
          <OutlineButton onClick={() => void load()}>Search</OutlineButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu
            label="Generate Production Plan"
            icon={<FileText size={15} className="text-muted" />}
            items={[
              {
                label: 'Export PDF',
                onClick: () => {
                  downloadCsv(
                    [
                      'name',
                      'output_raw_material',
                      'output_qty',
                      'output_unit',
                      'inputs',
                    ],
                    filtered.map((row) => [
                      row.name,
                      row.output_raw_material_name,
                      row.output_qty,
                      row.output_unit_name,
                      row.lines.length,
                    ]),
                    'production-plan.csv',
                  )
                  showToast('Exported PDF')
                },
              },
              {
                label: 'Export Excel',
                onClick: () => {
                  downloadCsv(
                    [
                      'name',
                      'output_raw_material',
                      'output_qty',
                      'output_unit',
                      'inputs',
                    ],
                    filtered.map((row) => [
                      row.name,
                      row.output_raw_material_name,
                      row.output_qty,
                      row.output_unit_name,
                      row.lines.length,
                    ]),
                    'production-plan-excel.csv',
                  )
                  showToast('Exported Excel')
                },
              },
            ]}
          />
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-4 py-3">
            <h2 className="mb-3 text-sm font-semibold text-ink">
              Select Production Processes
            </h2>
            <label className="relative block">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={processQuery}
                onChange={(event) => setProcessQuery(event.target.value)}
                placeholder="Search"
                className="h-9 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
          {loading ? (
            <p className="p-4 text-sm text-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <EmptyPanel />
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {filtered.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className={`flex w-full items-start justify-between gap-3 border-b border-line px-4 py-3 text-left hover:bg-page ${
                      selectedId === row.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {row.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        To: {row.output_raw_material_name} · {row.lines.length}{' '}
                        inputs
                      </span>
                    </span>
                    <span className="text-xs text-muted">
                      {row.output_qty} {row.output_unit_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">
              Ready For Production
            </h2>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  withPrice ? 'bg-primary' : 'bg-line'
                }`}
              >
                <input
                  type="checkbox"
                  checked={withPrice}
                  onChange={(event) => setWithPrice(event.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`absolute left-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                    withPrice ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
              With Price
            </label>
          </div>
          {!selected ? (
            <EmptyPanel title="Select a process" />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-ink">{selected.name}</p>
                <p className="mt-1 text-xs text-muted">
                  Output: {selected.output_raw_material_name} (
                  {selected.output_unit_name})
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Produce quantity
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={outputQty}
                  onChange={(event) => setOutputQty(event.target.value)}
                  className="h-10 w-full max-w-xs rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
                    <tr>
                      <th className="px-3 py-2">From</th>
                      <th className="px-3 py-2">Base Qty</th>
                      <th className="px-3 py-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines.map((line) => {
                      const failing =
                        getInsufficientStockMaterial(error) ===
                        line.raw_material_name
                      const stockMaterial = rawMaterials.find(
                        (raw) => raw.id === line.raw_material_id,
                      )
                      const baseQty = Number(selected.output_qty) || 1
                      const scale =
                        (Number(outputQty) || baseQty) / baseQty
                      return (
                        <tr
                          key={`${line.raw_material_id}-${line.unit_id}`}
                          className={`border-b border-line last:border-b-0 ${
                            failing
                              ? 'bg-red-50 outline outline-1 outline-red-200'
                              : ''
                          }`}
                        >
                          <td className="px-3 py-2 text-ink">
                            {line.raw_material_name}
                            {encryptedOutletId && stockMaterial ? (
                              <StockAvailabilityButton
                                outletId={encryptedOutletId}
                                material={stockMaterial}
                              />
                            ) : null}
                            {failing ? (
                              <StockShortfallNote
                                available={
                                  stockMaterial?.stock_qty ?? '0'
                                }
                                availableUnit={
                                  stockMaterial?.consumption_unit.name
                                }
                                required={(Number(line.qty) * scale).toFixed(3)}
                                requiredUnit={line.unit_name}
                              />
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-ink">{line.qty}</td>
                          <td className="px-3 py-2 text-ink">{line.unit_name}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {error ? (
        <p
          className={`rounded-md px-3 py-2 text-xs font-medium ${
            getInsufficientStockMaterial(error)
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'text-primary'
          }`}
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        {canWrite ? (
          <PrimaryButton
            onClick={() => void handleConvert()}
            disabled={saving}
          >
            {saving ? 'Converting…' : 'Convert To Production'}
          </PrimaryButton>
        ) : null}
      </div>

      <SelectRecordAlert
        open={noRecordAlertOpen}
        message="No record found."
        onClose={() => setNoRecordAlertOpen(false)}
      />
    </InventoryPageShell>
  )
}
