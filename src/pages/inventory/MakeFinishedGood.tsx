import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNavigate } from '../../utils/inventoryRouter'
import { Pencil, Trash2 } from 'lucide-react'
import { showToast } from '../../utils/toast'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { BatchExpiryCell } from '../../components/inventory/BatchExpiryCell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  FinishedGoodIngredients,
  buildIngredientLines,
  newIngredientRow,
  type IngredientRow,
} from '../../components/inventory/FinishedGoodIngredients'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_PRODUCTION_WRITE_PERMISSION,
  createFinishedGoodBatchApi,
  deleteFinishedGoodBatchApi,
  listAllFinishedGoodsApi,
  listAllRawMaterialsApi,
  listFinishedGoodBatchesApi,
  updateFinishedGoodBatchApi,
  type FinishedGood,
  type FinishedGoodBatch,
  type RawMaterial,
} from '../../services/inventoryService'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary'
const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted'

function trimQty(value: string | number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? String(Number(parsed.toFixed(3))) : String(value)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/** The saved recipe scaled to `qty`, as editable rows. */
function recipeRows(good: FinishedGood, qty: string): IngredientRow[] {
  if (!good.recipe) return []
  const per = Number(good.recipe.batch_qty)
  const wanted = Number(qty)
  const factor = per > 0 && wanted > 0 ? wanted / per : 0
  return good.recipe.lines.map((line) =>
    newIngredientRow({
      rawMaterial: line.raw_material_name,
      qty: factor > 0 ? trimQty(Number(line.qty) * factor) : '',
      unit: line.unit_name,
    }),
  )
}

export default function MakeFinishedGood() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  // `?batch=<id>` edits an existing batch instead of recording a new one.
  const editId = searchParams.get('batch')
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_PRODUCTION_WRITE_PERMISSION)
  const { units, loadMasters } = useInventoryMasters()
  const [goods, setGoods] = useState<FinishedGood[]>([])
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [batches, setBatches] = useState<FinishedGoodBatch[]>([])
  const [goodName, setGoodName] = useState('')
  const [qty, setQty] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [batchDate, setBatchDate] = useState(todayIso)
  const [note, setNote] = useState('')
  const [rows, setRows] = useState<IngredientRow[]>([])
  // Once the user edits the ingredient rows by hand, stop re-scaling the recipe.
  const [touched, setTouched] = useState(false)
  const [saveAsRecipe, setSaveAsRecipe] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<FinishedGoodBatch | null>(null)

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  const good = goods.find((row) => row.name === goodName) ?? null

  const loadBatches = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      const page = await listFinishedGoodBatchesApi(encryptedOutletId)
      setBatches(page.results)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to load batches')
    }
  }, [encryptedOutletId])

  const loadAll = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      const [goodRows, rawRows] = await Promise.all([
        listAllFinishedGoodsApi(encryptedOutletId),
        listAllRawMaterialsApi(encryptedOutletId),
      ])
      setGoods(goodRows)
      setMaterials(rawRows)
      const wanted = searchParams.get('good')
      const preset = goodRows.find((row) => row.id === wanted)
      if (preset) setGoodName(preset.name)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to load finished goods')
    }
    await loadBatches()
  }, [encryptedOutletId, searchParams, loadBatches])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  // Fill the rows from the recipe whenever the item or quantity changes, until
  // the user starts editing them. A new item resets the hand edits.
  useEffect(() => {
    if (!editId) setTouched(false)
  }, [goodName, editId])

  useEffect(() => {
    if (touched || editId) return
    setRows(good ? recipeRows(good, qty) : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [good, qty, touched, editId])

  // Load the batch being edited once the batches have arrived.
  const [loadedEditId, setLoadedEditId] = useState<string | null>(null)
  const editing = editId ? batches.find((row) => row.id === editId) ?? null : null
  useEffect(() => {
    if (!editing || loadedEditId === editing.id) return
    setLoadedEditId(editing.id)
    setGoodName(editing.finished_good_name)
    setQty(trimQty(editing.qty))
    setBatchNo(editing.batch_no)
    setBatchDate(editing.batch_date)
    setExpiryDate(editing.expiry_date ?? '')
    setNote(editing.note)
    setTouched(true)
    setRows(
      editing.lines.map((line) =>
        newIngredientRow({
          rawMaterial: line.raw_material_name,
          qty: trimQty(line.qty),
          unit: line.unit_name,
        }),
      ),
    )
  }, [editing, loadedEditId])

  const hasRecipe = Boolean(good?.recipe)
  const unitName = good?.unit_name ?? ''

  const ingredientList = useMemo(
    () => materials.filter((item) => item.name !== goodName),
    [materials, goodName],
  )

  async function save() {
    if (!encryptedOutletId || !canWrite || !good) return
    if (!(Number(qty) > 0)) return setError(`Enter how many ${unitName || 'units'} you made.`)
    const { lines, error: lineError } = buildIngredientLines(rows, materials, units)
    if (lineError) return setError(lineError)
    if (lines.length === 0) {
      return setError(
        hasRecipe
          ? 'Add the raw materials you used.'
          : `${good.name} has no recipe. Add the raw materials you used.`,
      )
    }
    setError('')
    setSaving(true)
    try {
      if (editing) {
        await updateFinishedGoodBatchApi(encryptedOutletId, editing.id, {
          batch_no: batchNo,
          qty,
          batch_date: batchDate,
          expiry_date: expiryDate || null,
          note,
          lines,
        })
        showToast('Batch updated')
        navigate('/inventory/finished-goods')
        return
      }
      await createFinishedGoodBatchApi(encryptedOutletId, {
        finished_good_id: good.id,
        batch_no: batchNo.trim() || undefined,
        qty,
        batch_date: batchDate,
        expiry_date: expiryDate || null,
        note,
        lines,
        save_as_recipe: !hasRecipe && saveAsRecipe,
      })
      showToast(`${trimQty(qty)} ${unitName} ${good.name} added to stock`)
      setQty('')
      setBatchNo('')
      setExpiryDate('')
      setNote('')
      setTouched(false)
      setRows([])
      await loadAll()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || !encryptedOutletId) return
    try {
      await deleteFinishedGoodBatchApi(encryptedOutletId, pendingDelete.id)
      showToast('Batch deleted and stock restored')
      await loadAll()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to delete')
    }
  }

  return (
    <InventoryPageShell activeItem="finished-goods">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">
          {editing ? `Edit batch · ${editing.finished_good_name}` : 'Make / Add Production'}
        </h1>
        <p className="text-sm text-muted">
          Record what you made. The raw materials you used come off stock and the
          finished goods are added.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-line bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <SearchableSelect
            label={<span className={labelClass}>Finished good</span>}
            value={goodName}
            options={goods.map((row) => row.name)}
            placeholder="Select item"
            disabled={Boolean(editing)}
            onChange={setGoodName}
          />
          <div>
            <label className={labelClass}>
              Quantity made{unitName ? ` (${unitName})` : ''}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              placeholder="e.g. 20"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Batch number</label>
            <input
              value={batchNo}
              onChange={(event) => setBatchNo(event.target.value)}
              placeholder={editing ? '' : 'Auto'}
              maxLength={32}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              value={batchDate}
              max={todayIso()}
              onChange={(event) => setBatchDate(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Expiry date</label>
            <input
              type="date"
              value={expiryDate}
              min={batchDate || undefined}
              onChange={(event) => setExpiryDate(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Note</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
        </div>

        {good ? (
          <div className="mt-5 border-t border-line pt-4">
            <h2 className="text-sm font-bold text-ink">Raw materials used</h2>
            <p className="mb-3 text-xs text-muted">
              {editing
                ? 'Change what this batch used or made. Stock is corrected when you save.'
                : hasRecipe
                ? 'Filled in from the recipe for this quantity. Change anything that was different this time.'
                : `${good.name} has no recipe yet. Tell us which raw materials you used.`}
            </p>
            <FinishedGoodIngredients
              rows={rows}
              onChange={(next) => {
                setTouched(true)
                setRows(next)
              }}
              materials={ingredientList}
              units={units}
              excludeName={goodName}
            />
            {!hasRecipe && !editing ? (
              <label className="mt-4 flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={saveAsRecipe}
                  onChange={(event) => setSaveAsRecipe(event.target.checked)}
                  className="size-4 accent-primary"
                />
                Save this as the recipe for {good.name}
              </label>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm font-medium text-primary">{error}</p> : null}
        <div className="mt-4 flex justify-end">
          <PrimaryButton onClick={() => void save()} disabled={saving || !canWrite || !good}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add to stock'}
          </PrimaryButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold text-ink">Recent batches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Batch no</th>
                <th className="px-4 py-3">Finished good</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3 text-right">Made</th>
                <th className="px-4 py-3">Recipe</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    No batches recorded yet.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr
                    key={batch.id}
                    className="border-b border-line transition-colors last:border-b-0 hover:bg-surface-tint/20"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">{batch.batch_no}</td>
                    <td className="px-4 py-3 font-medium text-ink">{batch.finished_good_name}</td>
                    <td className="px-4 py-3 text-muted">{batch.category_name || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{batch.batch_date}</td>
                    <td className="px-4 py-3">
                      <BatchExpiryCell expiry={batch.expiry_date} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">
                      {trimQty(batch.qty)} {batch.unit_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          batch.used_recipe
                            ? 'bg-success/10 text-success'
                            : 'bg-page text-muted'
                        }`}
                      >
                        {batch.used_recipe ? 'With recipe' : 'No recipe'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {batch.lines
                        .map((line) => `${line.raw_material_name} ${trimQty(line.qty)} ${line.unit_name}`)
                        .join(' · ')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Edit"
                            onClick={() =>
                              navigate(`/inventory/finished-goods/make?batch=${batch.id}`)
                            }
                          >
                            <Pencil size={15} strokeWidth={1.75} />
                          </RowActionButton>
                        ) : null}
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Delete"
                            onClick={() => setPendingDelete(batch)}
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </RowActionButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <OutlineButton variant="gray" onClick={() => window.history.back()}>
          Back
        </OutlineButton>
      </div>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Confirm Delete"
        message="Deleting this batch gives the raw materials back to stock and removes the finished goods it added. Continue?"
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </InventoryPageShell>
  )
}
