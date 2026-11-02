import { useCallback, useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ChefHat, Pencil, Plus, Trash2 } from 'lucide-react'
import { showToast } from '../../utils/toast'
import { useNavigate } from '../../utils/inventoryRouter'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { BatchExpiryCell } from '../../components/inventory/BatchExpiryCell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { useMenuItemPicker } from '../../components/inventory/useMenuItemPicker'
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
  createFinishedGoodApi,
  deleteFinishedGoodBatchApi,
  listAllFinishedGoodsApi,
  listFinishedGoodBatchesApi,
  updateFinishedGoodApi,
  type FinishedGood,
  type FinishedGoodBatch,
  type GoodsCategory,
  type MenuItemRef,
} from '../../services/inventoryService'

const STOCKED_CATEGORIES: { value: GoodsCategory; label: string }[] = [
  { value: 'finished', label: 'Finished Good' },
  { value: 'semi_finished', label: 'Semi Finished Good' },
]

function trimQty(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? String(Number(parsed.toFixed(3))) : value
}

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary'
const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted'

export default function FinishedGoods() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_PRODUCTION_WRITE_PERMISSION)
  const { units, loadMasters } = useInventoryMasters()
  const [goods, setGoods] = useState<FinishedGood[]>([])
  const [batches, setBatches] = useState<FinishedGoodBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const picker = useMenuItemPicker(encryptedOutletId)
  // The menu item chosen for the new stock record (the object, not just its name).
  const [pickedItem, setPickedItem] = useState<MenuItemRef | null>(null)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [unitName, setUnitName] = useState('')
  const [goodsCategory, setGoodsCategory] = useState<GoodsCategory>('finished')
  const [minStock, setMinStock] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [linkChoice, setLinkChoice] = useState<Record<string, MenuItemRef>>({})
  const [pendingDelete, setPendingDelete] = useState<FinishedGoodBatch | null>(null)

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    try {
      const [goodRows, batchPage] = await Promise.all([
        listAllFinishedGoodsApi(encryptedOutletId),
        listFinishedGoodBatchesApi(encryptedOutletId),
      ])
      setGoods(goodRows)
      setBatches(batchPage.results)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to load finished goods')
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    void load()
  }, [load])

  const unlinked = goods.filter((row) => !row.menu_item_id)

  function openCreate() {
    setPickedItem(null)
    setUnitName('')
    setGoodsCategory('finished')
    setMinStock('')
    setError('')
    setFormOpen(true)
  }

  async function save() {
    if (!encryptedOutletId || !canWrite) return
    const item = pickedItem
    const unit = units.find((row) => row.name === unitName)
    if (!item) return setError('Choose the menu item you keep in stock.')
    if (!unit) return setError('Choose the unit it is counted in.')
    setError('')
    setSaving(true)
    try {
      await createFinishedGoodApi(encryptedOutletId, {
        menu_item_id: item.id,
        unit_id: unit.id,
        goods_category: goodsCategory,
        min_stock_level: minStock || '0',
      })
      showToast(`${item.name} is now kept in stock`)
      setFormOpen(false)
      await load()
      await picker.reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save')
    } finally {
      setSaving(false)
    }
  }

  async function link(good: FinishedGood) {
    if (!encryptedOutletId) return
    const item = linkChoice[good.id]
    if (!item) return showToast('Choose the menu item first')
    try {
      await updateFinishedGoodApi(encryptedOutletId, good.id, { menu_item_id: item.id })
      showToast(`${good.name} linked to ${item.name}`)
      await load()
      await picker.reload()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to link')
    }
  }

  /** Open the full menu item page; it brings the new item back here. */
  function addMenuItem(linkForGoodId?: string) {
    const back = linkForGoodId
      ? `${location.pathname}?linkFor=${encodeURIComponent(linkForGoodId)}`
      : location.pathname
    navigate(`/menu/add-item?returnTo=${encodeURIComponent(back)}`)
  }

  // Coming back from the menu item page: use the item that was just made.
  useEffect(() => {
    const id = searchParams.get('menuItem')
    if (!id) return
    const made: MenuItemRef = {
      id,
      name: searchParams.get('menuItemName') ?? '',
      category_name: '',
    }
    const linkFor = searchParams.get('linkFor')
    if (linkFor) {
      setLinkChoice((prev) => ({ ...prev, [linkFor]: made }))
    } else {
      setPickedItem(made)
      setFormOpen(true)
    }
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  async function confirmDelete() {
    if (!pendingDelete || !encryptedOutletId) return
    try {
      await deleteFinishedGoodBatchApi(encryptedOutletId, pendingDelete.id)
      showToast('Batch deleted and stock restored')
      await load()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to delete batch')
    }
  }

  return (
    <InventoryPageShell activeItem="finished-goods">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Finished Goods</h1>
          <p className="text-sm text-muted">
            {loading
              ? 'Loading…'
              : `${goods.length} menu item${goods.length === 1 ? '' : 's'} kept in stock · ${batches.length} recent batch${batches.length === 1 ? '' : 'es'}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => navigate('/inventory/finished-goods/make')}
            disabled={goods.length === 0}
            title={goods.length === 0 ? 'Add a menu item to stock first' : undefined}
          >
            <ChefHat size={15} />
            Make / Add Production
          </PrimaryButton>
          {canWrite ? (
            <OutlineButton onClick={openCreate}>
              <Plus size={15} />
              Create New
            </OutlineButton>
          ) : null}
        </div>
      </div>

      {unlinked.length > 0 && canWrite ? (
        <div className="mb-4 rounded-xl border border-line bg-card p-4">
          <h2 className="text-sm font-bold text-ink">Link to a menu item</h2>
          <p className="mb-3 text-xs text-muted">
            These were added by name before finished goods became menu items. Link each
            to its menu item so sales can use its stock.
          </p>
          <div className="space-y-2">
            {unlinked.map((good) => (
              <div key={good.id} className="flex flex-wrap items-center gap-3">
                <span className="w-40 text-sm font-medium text-ink">{good.name}</span>
                <div className="w-72">
                  <SearchableSelect
                    value={linkChoice[good.id]?.name ?? ''}
                    options={picker.items.map((item) => item.name)}
                    placeholder="Select menu item"
                    onChange={(name) => {
                      const found = picker.items.find((item) => item.name === name)
                      if (found) setLinkChoice((prev) => ({ ...prev, [good.id]: found }))
                    }}
                    onSearchChange={picker.setQuery}
                    onLoadMore={picker.loadMore}
                    hasMore={picker.hasMore}
                    loadingMore={picker.loading}
                    onAddNew={() => addMenuItem(good.id)}
                    addNewLabel="Add new menu item"
                  />
                </div>
                <OutlineButton onClick={() => void link(good)}>Link</OutlineButton>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {formOpen ? (
        <div className="mb-4 rounded-xl border border-line bg-card p-4">
          <h2 className="mb-1 text-sm font-bold text-ink">Keep a menu item in stock</h2>
          <p className="mb-3 text-xs text-muted">
            Its recipe (raw materials for one unit) is set in Item Recipes. Making a
            batch uses that recipe; selling it follows the goods category.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SearchableSelect
              label={<span className={labelClass}>Menu item</span>}
              value={pickedItem?.name ?? ''}
              options={picker.items.map((item) => item.name)}
              placeholder="Select menu item"
              onChange={(name) =>
                setPickedItem(picker.items.find((item) => item.name === name) ?? null)
              }
              onSearchChange={picker.setQuery}
              onLoadMore={picker.loadMore}
              hasMore={picker.hasMore}
              loadingMore={picker.loading}
              onAddNew={() => addMenuItem()}
              addNewLabel="Add new menu item"
            />
            <SearchableSelect
              label={<span className={labelClass}>Counted in</span>}
              value={unitName}
              options={units.map((unit) => unit.name)}
              placeholder="Select unit"
              onChange={setUnitName}
            />
            <div>
              <label className={labelClass}>Goods category</label>
              <select
                value={goodsCategory}
                onChange={(event) => setGoodsCategory(event.target.value as GoodsCategory)}
                className={inputClass}
              >
                {STOCKED_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Minimum stock</label>
              <input
                type="number"
                min="0"
                step="any"
                value={minStock}
                onChange={(event) => setMinStock(event.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>
          {error ? <p className="mt-3 text-sm font-medium text-primary">{error}</p> : null}
          <div className="mt-4 flex justify-end gap-2">
            <OutlineButton variant="gray" onClick={() => setFormOpen(false)}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={() => void save()} disabled={saving || !canWrite}>
              {saving ? 'Saving…' : 'Save'}
            </PrimaryButton>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold text-ink">Recent batches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Batch no</th>
                <th className="px-4 py-3">Finished good</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3 text-right">Made</th>
                <th className="px-4 py-3">Recipe</th>
                <th className="px-4 py-3">Raw materials used</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    {loading ? 'Loading…' : 'No batches recorded yet.'}
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
                        .map(
                          (line) =>
                            `${line.raw_material_name} ${trimQty(line.qty)} ${line.unit_name}`,
                        )
                        .join(' · ')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <RowActionButton
                          boxed
                          label="Make again"
                          onClick={() =>
                            navigate(
                              `/inventory/finished-goods/make?good=${batch.finished_good_id}`,
                            )
                          }
                        >
                          <ChefHat size={15} strokeWidth={1.75} />
                        </RowActionButton>
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
                            label="Delete batch"
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
