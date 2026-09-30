import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ClipboardList,
  Copy,
  Eye,
  FileOutput,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  ActionDropdown,
  PrimaryButton,
  RowActionButton,
} from '../components/menu/MenuActionButtons'
import { formatDateTimeDisplay } from '../components/common/DateTimeField'
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'
import { AddNewItemsModal } from '../components/menu/AddNewItemsModal'
import { AddItemsGridModal } from '../components/menu/AddItemsGridModal'
import { MenuItemDetailsModal } from '../components/menu/MenuItemDetailsModal'
import { PublishDateModal } from '../components/menu/PublishDateModal'
import { UpdateAreaWisePriceModal } from '../components/menu/UpdateAreaWisePriceModal'
import { UpdateNutritionModal } from '../components/menu/UpdateNutritionModal'
import { SelectRecordAlert } from '../components/menu/SelectRecordAlert'
import { ShowChangesModal } from '../components/menu/ShowChangesModal'
import {
  MENU_CHANNELS,
  MENU_CHANNEL_SLUG,
  type MenuChannelId,
} from '../mocks/menuChannels'
import { useMenuChannels } from '../state/MenuChannelsContext'
import {
  listCategoriesApi,
  updateItemApi,
  deleteItemApi,
  listScheduledPublishesApi,
  createScheduledPublishApi,
  cancelScheduledPublishApi,
} from '../services/menuService'
import {
  fetchCategoryItemsCached,
  invalidateMenuItems,
} from '../state/menuItemsCache'
import type {
  Category,
  Item,
  ItemPayload,
  ScheduledPublish,
  ScheduledPublishLineInput,
} from '../types/menu'
import { showToast } from '../utils/toast'

const PAGE_SIZE = 11

const ACTION_OPTIONS = [
  'Available',
  'Update Online Availability',
  'Active/Inactive Areas',
  'Mark As Veg',
  'Mark As Non Veg',
  'Mark As Egg Item',
  'Remove Items',
  'Update Favorite Item',
  'Update Ignore Tax',
  'Update Ignore Discount',
  'Update Ignore Packing Charge (Online)',
  'Update Swiggy recommended',
  'Disable Swiggy POP Items',
  'Update in Captain',
  'Update Quantity Popup',
  'Update in Kiosk',
  'Update Dinein QR',
  'Update Pickup QR',
  'Mark Out of Stock',
  'Mark In Stock',
  'Mark Do Not Track',
  'Update MRP tag',
  'Remove Nutrition Data',
  'Remove Image(s)',
  'Remove Serve(s)',
  'Update Dine In Order Type',
  'Update Delivery Order Type',
  'Update Pick Up Order Type',
  'Update service/goods tag',
  'Create Self Item Recipe',
  'Update Image',
  'Apply Zomato Tags',
  'Assign Addon Group(s)',
  'Update Open Item',
  'Update Item Timings',
  'Remove Variation(s)',
] as const

const QUICK_ACTION_OPTIONS: { label: string; badge?: string }[] = [
  { label: 'Generate Barcode' },
  { label: 'Update Base Menu' },
  { label: 'Update Item Rank/Order' },
  { label: 'Area-wise bulk sheet' },
  { label: 'Update Item Packing Charge' },
  { label: 'Update Nutrition Data' },
  { label: 'Recently Deleted' },
  { label: 'Update Kiosk Item Price/Status' },
  { label: 'Preparation Steps', badge: 'New' },
  { label: 'Increase/Reduce Price' },
  { label: 'Download Base Menu [Backup]' },
  { label: 'Replace Item Variation(s)' },
]

function ClipboardEyeIcon({ size = 15 }: { size?: number }) {
  return (
    <span className="relative inline-flex size-[15px] items-center justify-center">
      <Clipboard size={size} />
      <Eye
        size={9}
        className="absolute -bottom-0.5 -right-0.5 rounded-sm bg-card"
        strokeWidth={2.5}
      />
    </span>
  )
}

interface RowItem {
  id: string
  categoryId: string
  name: string
  shortCode: string
  onlineDisplayName: string
  price: number
  description: string
  available: boolean
  tags: string[]
  hasImage: boolean
  rank?: number
}

function adaptItem(item: Item, currentChannelId: string): RowItem {
  const area = item.area_prices?.find(
    (price) => price.outlet_channel_id === currentChannelId,
  )
  const channelPrice =
    currentChannelId && area ? (Number(area.price) || 0) : null
  return {
    id: item.id,
    categoryId: item.category_id ?? '',
    name: item.name,
    shortCode: item.short_code,
    onlineDisplayName: item.online_display_name,
    price:
      channelPrice ??
      (typeof item.base_price === 'string'
        ? Number(item.base_price) || 0
        : item.base_price),
    description: item.description,
    available: item.is_active,
    tags: item.tags ?? [],
    hasImage: item.has_image,
    rank: item.rank,
  }
}

function updateRow(rows: RowItem[], id: string, patch: Partial<RowItem>) {
  return rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
}

export default function BaseMenu({
  channelId = 'base-menu',
  mode = 'default',
}: {
  channelId?: MenuChannelId
  mode?: 'default' | 'schedule'
}) {
  const isSchedule = mode === 'schedule'
  const channel = MENU_CHANNELS[channelId]
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const { channels } = useMenuChannels()

  const currentChannelId =
    channels.find(
      (c) => c.channel_slug === MENU_CHANNEL_SLUG[channelId],
    )?.id ?? ''

  function resolveChannelPrice(item: Item): number {
    const area = item.area_prices?.find(
      (price) => price.outlet_channel_id === currentChannelId,
    )
    if (currentChannelId && area) return Number(area.price) || 0
    const base =
      typeof item.base_price === 'string'
        ? Number(item.base_price) || 0
        : item.base_price
    return base
  }

  const [categoriesApi, setCategoriesApi] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [query, setQuery] = useState('')
  const [rankWise, setRankWise] = useState(false)
  const [hideEmpty, setHideEmpty] = useState(false)
  const [items, setItems] = useState<RowItem[]>([])
  const [rawItemsMap, setRawItemsMap] = useState<Map<string, Item>>(
    new Map(),
  )
  const [categoryHasItems, setCategoryHasItems] = useState<Set<string>>(
    new Set(),
  )
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)
  const [addItemsOpen, setAddItemsOpen] = useState(false)
  const [addGridOpen, setAddGridOpen] = useState(false)
  const [detailsItem, setDetailsItem] = useState<Item | null>(null)
  const [areaPriceItem, setAreaPriceItem] = useState<Item | null>(null)
  const [nutritionItem, setNutritionItem] = useState<Item | null>(null)
  const [changesName, setChangesName] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RowItem | null>(null)
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<RowItem[]>([])
  const [pendingCancelPublish, setPendingCancelPublish] =
    useState<ScheduledPublish | null>(null)
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [publishes, setPublishes] = useState<ScheduledPublish[]>([])

  const loadPublishes = useCallback(() => {
    if (!encryptedOutletId) return
    listScheduledPublishesApi(encryptedOutletId)
      .then(setPublishes)
      .catch(() => {
        showToast('Failed to load scheduled publishes')
      })
  }, [encryptedOutletId])

  useEffect(() => {
    if (isSchedule) loadPublishes()
  }, [isSchedule, loadPublishes])

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listCategoriesApi(encryptedOutletId)
      .then((cats) => {
        if (!cancelled) setCategoriesApi(cats)
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load categories')
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  useEffect(() => {
    if (
      categoriesApi.length > 0 &&
      (categoryId === '' ||
        !categoriesApi.some((c) => c.id === categoryId))
    ) {
      setCategoryId(categoriesApi[0].id)
    }
  }, [categoriesApi, categoryId])

  useEffect(() => {
    if (!encryptedOutletId || !categoryId) return
    let cancelled = false
    const outletId = encryptedOutletId

    async function loadItems() {
      try {
        const allItems = await fetchCategoryItemsCached(
          outletId,
          categoryId,
          { force: refreshKey > 0 },
        )
        if (cancelled) return
        setItems(allItems.map((item) => adaptItem(item, currentChannelId)))
        setRawItemsMap(
          new Map(allItems.map((item) => [item.id, item])),
        )
        setCategoryHasItems((prev) => {
          const next = new Set(prev)
          if (allItems.length > 0) next.add(categoryId)
          else next.delete(categoryId)
          return next
        })
      } catch {
        if (!cancelled) showToast('Failed to load items')
      }
    }

    loadItems()
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, categoryId, refreshKey, currentChannelId])

  const invalidateAndRefresh = useCallback(() => {
    invalidateMenuItems(encryptedOutletId ?? '', categoryId)
    setRefreshKey((k) => k + 1)
  }, [encryptedOutletId, categoryId])

  const categories = useMemo(() => {
    if (!hideEmpty) return categoriesApi
    return categoriesApi.filter((category) =>
      categoryHasItems.has(category.id),
    )
  }, [hideEmpty, categoriesApi, categoryHasItems])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = items.filter((item) => {
      if (item.categoryId !== categoryId) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.onlineDisplayName.toLowerCase().includes(q) ||
        item.shortCode.includes(q)
      )
    })
    if (rankWise) {
      result.sort((a, b) => {
        const ra = a.rank ?? Number.MAX_SAFE_INTEGER
        const rb = b.rank ?? Number.MAX_SAFE_INTEGER
        return ra - rb
      })
    }
    return result
  }, [categoryId, items, query, rankWise])

  const totalRecords = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [categoryId, query])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const allSelected =
    pageRows.length > 0 && pageRows.every((row) => selected.has(row.id))

  const categoryAvailable =
    filtered.length > 0 && filtered.every((row) => row.available)

  function requireSelection(action: () => void) {
    if (selected.size === 0) {
      setSelectAlertOpen(true)
      return
    }
    action()
  }

  function setSelectedAvailable(available: boolean) {
    requireSelection(async () => {
      if (!encryptedOutletId) return
      try {
        await Promise.all(
          [...selected].map((id) =>
            updateItemApi(encryptedOutletId!, id, {
              is_active: available,
            }),
          ),
        )
        showToast(available ? 'Marked in stock' : 'Marked out of stock')
        setSelected(new Set())
        invalidateAndRefresh()
      } catch {
        showToast('Failed to update items')
      }
    })
  }

  async function toggleCategoryAvailable() {
    if (!encryptedOutletId) return
    const next = !categoryAvailable
    const ids = filtered.map((row) => row.id)
    try {
      await Promise.all(
        ids.map((id) =>
          updateItemApi(encryptedOutletId!, id, { is_active: next }),
        ),
      )
      showToast(
        next ? 'Category marked available' : 'Category marked unavailable',
      )
      invalidateAndRefresh()
    } catch {
      showToast('Failed to update category availability')
    }
  }

  async function handleSave() {
    if (!encryptedOutletId) return
    if (!currentChannelId) {
      showToast('Channels are still loading, try again')
      return
    }
    const changed = items.filter((row) => {
      const raw = rawItemsMap.get(row.id)
      if (!raw) return false
      const rawPrice = resolveChannelPrice(raw)
      return (
        raw.short_code !== row.shortCode ||
        raw.online_display_name !== row.onlineDisplayName ||
        rawPrice !== row.price ||
        raw.description !== row.description ||
        raw.rank !== row.rank ||
        raw.is_active !== row.available
      )
    })
    if (changed.length === 0) {
      showToast('No changes to save')
      return
    }
    try {
      await Promise.all(
        changed.map((row) => {
          const raw = rawItemsMap.get(row.id)!
          const area_prices = raw.area_prices?.map((area) => ({
            outlet_channel_id: area.outlet_channel_id,
            price: Number(area.price) || 0,
            is_active: area.is_active,
          })) ?? []
          const existing = area_prices.findIndex(
            (area) => area.outlet_channel_id === currentChannelId,
          )
          if (existing >= 0) {
            area_prices[existing] = {
              ...area_prices[existing],
              price: row.price,
            }
          } else {
            area_prices.push({
              outlet_channel_id: currentChannelId,
              price: row.price,
              is_active: true,
            })
          }
          const patch: Partial<ItemPayload> = {
            short_code: row.shortCode,
            online_display_name: row.onlineDisplayName,
            description: row.description,
            rank: row.rank,
            is_active: row.available,
            area_prices,
          }
          return updateItemApi(encryptedOutletId!, row.id, patch)
        }),
      )
      showToast('Saved')
      invalidateAndRefresh()
    } catch {
      showToast('Failed to save some items')
    }
  }

  function buildPublishLines(): ScheduledPublishLineInput[] {
    if (!currentChannelId) return []
    const lines: ScheduledPublishLineInput[] = []
    for (const row of items) {
      const raw = rawItemsMap.get(row.id)
      if (!raw) continue
      const rawPrice = resolveChannelPrice(raw)
      const priceChanged = rawPrice !== row.price
      const availabilityChanged = raw.is_active !== row.available
      if (!priceChanged && !availabilityChanged) continue
      lines.push({
        item_id: row.id,
        outlet_channel_id: currentChannelId,
        change_type: 'Amount',
        change_direction: row.price > rawPrice ? 'Increase' : 'Decrease',
        change_value: Math.abs(row.price - rawPrice),
        availability: availabilityChanged ? row.available : null,
      })
    }
    return lines
  }

  async function doSchedule(startsAt: Date, endsAt: Date) {
    if (!encryptedOutletId) return
    if (!currentChannelId) {
      showToast('Channels are still loading, try again')
      return
    }
    const lines = buildPublishLines()
    if (lines.length === 0) {
      showToast('No price or availability changes to schedule')
      return
    }
    try {
      await createScheduledPublishApi(encryptedOutletId, {
        name: `Publish ${formatDateTimeDisplay(startsAt)}`,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        is_draft: false,
        lines,
      })
      showToast(`Scheduled to publish on ${formatDateTimeDisplay(startsAt)}`)
      setPublishModalOpen(false)
      loadPublishes()
    } catch {
      showToast('Failed to schedule publish')
    }
  }

  async function doSaveLater() {
    if (!encryptedOutletId) return
    if (!currentChannelId) {
      showToast('Channels are still loading, try again')
      return
    }
    const lines = buildPublishLines()
    if (lines.length === 0) {
      showToast('No price or availability changes to save')
      return
    }
    try {
      await createScheduledPublishApi(encryptedOutletId, {
        name: 'Draft',
        is_draft: true,
        lines,
      })
      showToast('Draft saved')
      loadPublishes()
    } catch {
      showToast('Failed to save draft')
    }
  }

  async function handleCancelPublish(publish: ScheduledPublish) {
    if (!encryptedOutletId) return
    try {
      await cancelScheduledPublishApi(encryptedOutletId, publish.id)
      showToast('Publish cancelled')
      loadPublishes()
    } catch {
      showToast('Failed to cancel publish')
    }
  }

  async function confirmBulkDeleteItems() {
    if (!encryptedOutletId || bulkDeleteTargets.length === 0) return
    const targets = bulkDeleteTargets
    setBulkDeleteTargets([])
    try {
      setBusy(true)
      const results = await Promise.allSettled(
        targets.map((row) => deleteItemApi(encryptedOutletId!, row.id)),
      )
      const failed = results
        .map((result, index) => (result.status === 'rejected' ? targets[index] : null))
        .filter((row): row is RowItem => row !== null)
      if (failed.length === 0) {
        showToast(`${targets.length} item(s) removed`)
        setSelected(new Set())
        invalidateAndRefresh()
        return
      }
      // Partial failure: say exactly which ones survived, so the count in the
      // confirmation can be reconciled.
      setSelected(new Set(failed.map((row) => row.id)))
      showToast(
        `Removed ${targets.length - failed.length} of ${targets.length}. ` +
          `Failed: ${failed.map((row) => row.name).join(', ')}`,
      )
      invalidateAndRefresh()
    } finally {
      setBusy(false)
    }
  }

  async function confirmCancelPublish() {
    if (!pendingCancelPublish) return
    const publish = pendingCancelPublish
    setPendingCancelPublish(null)
    await handleCancelPublish(publish)
  }

  async function deleteRowItem(target: RowItem) {
    if (!encryptedOutletId) return
    try {
      await deleteItemApi(encryptedOutletId, target.id)
      showToast('Item deleted')
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(target.id)
        return next
      })
      invalidateAndRefresh()
    } catch {
      showToast('Failed to delete item')
    }
  }

  return (
    <MenuPageShell
      backTo={isSchedule ? '/menu/schedule-changes' : '/menu/all-in-one'}
      activeItem={isSchedule ? 'schedule-changes' : 'menu-discounts'}
      fillViewport
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          {isSchedule ? (
            <>
              <Link
                to="/menu/schedule-changes"
                className="text-primary hover:underline"
              >
                Schedule Menu
              </Link>
              <span className="font-normal text-muted">-</span>
              <span className="font-semibold text-ink">{channel.label}</span>
            </>
          ) : (
            <>
              <Link
                to="/menu/all-in-one"
                className="text-primary hover:underline"
              >
                All In One Menu
              </Link>
              <span className="font-normal text-muted">&gt;</span>
              <span className="font-semibold text-ink">{channel.label}</span>
            </>
          )}
        </span>
      }
    >
      <div className="shrink-0 [&>div]:mb-2 [&>div]:h-11">
        <MenuSectionNav activeTab="items" />
      </div>

      {isSchedule ? (
        <div className="mb-3 shrink-0 rounded-lg border border-secondary/50 bg-secondary/25 px-4 py-2.5 text-sm text-deep">
          You can make updates to your restaurant&apos;s menu anytime and have
          them go live on the exact date and time you desire.
        </div>
      ) : null}

      {isSchedule && publishes.length > 0 ? (
        <div className="mb-3 flex shrink-0 flex-col gap-2 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Scheduled publishes
          </p>
          <ul className="flex flex-col gap-2">
            {publishes.map((publish) => {
              const cancelable =
                publish.is_draft || publish.status === 'pending'
              return (
                <li
                  key={publish.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-line bg-page/60 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-ink">{publish.name}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      publish.is_draft
                        ? 'bg-muted/15 text-muted'
                        : publish.status === 'applied'
                          ? 'bg-success/15 text-success'
                          : publish.status === 'reverted'
                            ? 'bg-primary/10 text-primary'
                            : publish.status === 'cancelled'
                              ? 'bg-danger/10 text-danger'
                              : 'bg-secondary/40 text-deep'
                    }`}
                  >
                    {publish.is_draft
                      ? 'Draft'
                      : publish.status === 'applied'
                        ? 'Applied'
                        : publish.status === 'reverted'
                          ? 'Reverted'
                          : publish.status === 'cancelled'
                            ? 'Cancelled'
                            : 'Scheduled'}
                  </span>
                  <span className="text-xs text-muted">
                    {publish.starts_at && publish.ends_at
                      ? `${new Date(publish.starts_at).toLocaleString()} → ${new Date(publish.ends_at).toLocaleString()}`
                      : `${publish.lines.length} change(s)`}
                  </span>
                  <span className="text-xs text-muted">
                    {publish.lines.length} item(s)
                  </span>
                  {cancelable ? (
                    <button
                      type="button"
                      onClick={() => setPendingCancelPublish(publish)}
                      className="ml-auto inline-flex h-7 cursor-pointer items-center rounded-md border border-line bg-card px-2.5 text-xs font-medium text-danger hover:bg-danger/10"
                    >
                      Cancel
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-2">
        <label className="relative min-w-[180px] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="h-9 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <ActionDropdown
          searchable
          menuClassName="min-w-[280px]"
          options={ACTION_OPTIONS.map((label) => ({
            label,
            onClick: () => {
              if (label === 'Available' || label === 'Mark In Stock') {
                setSelectedAvailable(true)
                return
              }
              if (label === 'Mark Out of Stock') {
                setSelectedAvailable(false)
                return
              }
              if (label === 'Remove Items') {
                requireSelection(() => {
                  setBulkDeleteTargets(items.filter((i) => selected.has(i.id)))
                })
                return
              }
              requireSelection(() => {})
            },
          }))}
        />

        <ActionDropdown
          label="Quick Actions"
          searchable
          menuClassName="min-w-[280px]"
          options={QUICK_ACTION_OPTIONS}
        />

        {isSchedule ? (
          <>
            <button
              type="button"
              onClick={() => setPublishModalOpen(true)}
              className="inline-flex h-9 items-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              Publish Date
            </button>
            <PrimaryButton onClick={doSaveLater}>Save Later</PrimaryButton>
            <div className="inline-flex h-9 items-center gap-3 rounded-md border border-line bg-card px-3 text-sm text-ink">
              <label className="inline-flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="rank-mode"
                  checked={!rankWise}
                  onChange={() => setRankWise(false)}
                  className="size-3.5 accent-primary"
                />
                Normal
              </label>
              <label className="inline-flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="rank-mode"
                  checked={rankWise}
                  onChange={() => setRankWise(true)}
                  className="size-3.5 accent-primary"
                />
                Rank wise
              </label>
            </div>
          </>
        ) : (
          <>
            <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-line bg-card px-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={rankWise}
                onChange={(event) => setRankWise(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              Rank wise
            </label>
          </>
        )}

        <PrimaryButton onClick={() => setAddItemsOpen(true)}>
          <Plus size={15} />
          Add Items
        </PrimaryButton>

        <button
          type="button"
          role="switch"
          aria-checked={categoryAvailable}
          onClick={toggleCategoryAvailable}
          className={`relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-white transition-colors ${
            categoryAvailable ? 'bg-success' : 'bg-muted'
          }`}
        >
          <span className="inline-block size-4 rounded-full bg-card" />
          Available
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`menu-panel-viewport-fill is-channel-menu min-h-0 flex-1${isSchedule ? ' has-schedule-banner' : ''}`}
      >
        <div className="menu-panel-shell">
          <aside className="menu-panel-categories hidden md:flex">
            <label className="menu-panel-categories-header flex items-center justify-between gap-2 normal-case tracking-normal">
              <span className="text-xs text-ink">Hide empty categories</span>
              <button
                type="button"
                role="switch"
                aria-checked={hideEmpty}
                onClick={() => setHideEmpty((prev) => !prev)}
                className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
                  hideEmpty ? 'bg-primary' : 'bg-line'
                }`}
              >
                <span
                  className={`inline-block size-3.5 rounded-full bg-card transition-transform ${
                    hideEmpty ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
            <ul className="menu-panel-categories-list space-y-0.5">
              {categories.map((category) => {
                const active = category.id === categoryId
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId(category.id)
                        setSelected(new Set())
                      }}
                      className={`menu-panel-category-btn cursor-pointer ${active ? 'is-active' : ''}`}
                    >
                      {category.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          <div className="menu-panel-main">
            <div className="menu-panel-main-header border-b border-line bg-page/80 px-3 py-2 md:hidden">
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value)
                  setSelected(new Set())
                }}
                className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="menu-panel-items-scroll">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-sm font-semibold text-ink">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelected(
                          allSelected
                            ? new Set()
                            : new Set(pageRows.map((row) => row.id)),
                        )
                      }
                      className="cursor-pointer accent-primary"
                    />
                  </th>
                  {rankWise ? <th className="w-16 px-3 py-3">Rank *</th> : null}
                  <th className="min-w-[180px] px-3 py-3">Name *</th>
                  <th className="px-3 py-3">Short Code*</th>
                  <th className="min-w-[150px] px-3 py-3">Online Display Name</th>
                  <th className="px-3 py-3">Price *</th>
                  <th className="min-w-[200px] px-3 py-3">Description</th>
                  <th className="px-3 py-3">Image</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-10 text-center text-sm text-muted"
                    >
                      No items in this category.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-line last:border-b-0 hover:bg-page/50"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-8 w-1 rounded-full ${
                              row.available ? 'bg-success' : 'bg-line'
                            }`}
                          />
                          <input
                            type="checkbox"
                            checked={selected.has(row.id)}
                            onChange={() =>
                              setSelected((prev) => {
                                const next = new Set(prev)
                                if (next.has(row.id)) next.delete(row.id)
                                else next.add(row.id)
                                return next
                              })
                            }
                            className="cursor-pointer accent-primary"
                          />
                        </div>
                      </td>
                      {rankWise ? (
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={row.rank ?? ''}
                            onChange={(event) => {
                              const val = event.target.value.replace(/\D/g, '')
                              setItems((prev) =>
                                updateRow(prev, row.id, {
                                  rank: val ? Number(val) : undefined,
                                }),
                              )
                            }}
                            className="h-8 w-14 rounded border border-line px-2 text-center text-sm outline-none focus:border-primary"
                            placeholder="#"
                          />
                        </td>
                      ) : null}
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-ink">{row.name}</div>
                        {row.tags.length > 0 ? (
                          <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-muted">
                            {row.tags.map((tag, index) => (
                              <span
                                key={tag}
                                className="inline-flex items-center"
                              >
                                {index > 0 ? (
                                  <span className="mx-0.5 text-line">|</span>
                                ) : null}
                                <span
                                  className={
                                    tag === 'V+' ? 'text-success' : 'text-muted'
                                  }
                                >
                                  {tag}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={row.shortCode}
                          onChange={(event) =>
                            setItems((prev) =>
                              updateRow(prev, row.id, {
                                shortCode: event.target.value,
                              }),
                            )
                          }
                          className="h-8 w-16 rounded border border-line px-2 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={row.onlineDisplayName}
                          onChange={(event) =>
                            setItems((prev) =>
                              updateRow(prev, row.id, {
                                onlineDisplayName: event.target.value,
                              }),
                            )
                          }
                          className="h-8 w-full min-w-[120px] rounded border border-line px-2 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.price}
                          onChange={(event) =>
                            setItems((prev) =>
                              updateRow(prev, row.id, {
                                price: Number(event.target.value) || 0,
                              }),
                            )
                          }
                          className="h-8 w-20 rounded border border-line px-2 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={row.description}
                          onChange={(event) =>
                            setItems((prev) =>
                              updateRow(prev, row.id, {
                                description: event.target.value,
                              }),
                            )
                          }
                          className="h-8 w-full min-w-[160px] rounded border border-line px-2 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-success/40 bg-success/10 text-success hover:bg-success/20"
                          aria-label="Upload image"
                          data-tooltip={row.hasImage ? 'Manage image' : 'Upload image'}
                        >
                          <Upload size={15} />
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-0.5">
                          {isSchedule ? (
                            <>
                              <RowActionButton
                                label="Duplicate item"
                                onClick={() => {
                                  setItems((prev) => {
                                    const source = prev.find((i) => i.id === row.id)
                                    if (!source) return prev
                                    const copy: RowItem = {
                                      ...source,
                                      id: `${source.id}-copy-${Date.now()}`,
                                      name: `${source.name} (Copy)`,
                                    }
                                    const index = prev.findIndex(
                                      (i) => i.id === row.id,
                                    )
                                    const next = [...prev]
                                    next.splice(index + 1, 0, copy)
                                    return next
                                  })
                                }}
                              >
                                <Copy size={15} />
                              </RowActionButton>
                              <RowActionButton
                                label="Edit item"
                                onClick={() =>
                                  navigate(
                                    `/menu/channel/${channelId}/${row.id}/edit`,
                                  )
                                }
                              >
                                <Pencil size={15} />
                              </RowActionButton>
                              <RowActionButton
                                label="Delete item"
                                onClick={() =>
                                  setItems((prev) =>
                                    prev.filter((i) => i.id !== row.id),
                                  )
                                }
                              >
                                <Trash2 size={15} />
                              </RowActionButton>
                            </>
                          ) : (
                            <>
                              <RowActionButton
                                label="Item details"
                                onClick={() =>
                                  setDetailsItem(rawItemsMap.get(row.id) ?? null)
                                }
                              >
                                <ClipboardEyeIcon />
                              </RowActionButton>
                              <RowActionButton
                                label="Update area wise price & status"
                                onClick={() =>
                                  setAreaPriceItem(rawItemsMap.get(row.id) ?? null)
                                }
                              >
                                <ReceiptText size={15} />
                              </RowActionButton>
                              <RowActionButton
                                label="Edit item"
                                onClick={() =>
                                  navigate(
                                    `/menu/channel/${channelId}/${row.id}/edit`,
                                  )
                                }
                              >
                                <Pencil size={15} />
                              </RowActionButton>
                              <RowActionButton
                                label="Update item nutrition and info detail"
                                onClick={() =>
                                  setNutritionItem(rawItemsMap.get(row.id) ?? null)
                                }
                              >
                                <FileOutput size={15} />
                              </RowActionButton>
                              <RowActionButton
                                label="Delete item"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 size={15} />
                              </RowActionButton>
                              <RowActionButton
                                label="Show changes"
                                onClick={() => setChangesName(row.name)}
                              >
                                <ClipboardList size={15} />
                              </RowActionButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

          {totalRecords > 0 ? (
            <div className="menu-panel-main-footer flex flex-wrap items-center justify-between gap-3 border-t border-line bg-page/80 px-3 py-2.5">
              <p className="text-sm text-muted">
                Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(page * PAGE_SIZE, totalRecords)} of {totalRecords}{' '}
                records
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded border border-line bg-card text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                  data-tooltip="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const n = index + 1
                  const active = page === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`inline-flex size-8 cursor-pointer items-center justify-center rounded border text-sm font-medium ${
                        active
                          ? 'border-primary bg-primary text-white'
                          : 'border-line bg-card text-ink hover:bg-page'
                      }`}
                    >
                      {n}
                    </button>
                  )
                })}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded border border-line bg-card text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                  data-tooltip="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
          </div>
        </div>
      </div>
      </div>

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
      <AddNewItemsModal
        open={addItemsOpen}
        onClose={() => setAddItemsOpen(false)}
        onGrid={() => setAddGridOpen(true)}
        onSingleItem={() => navigate('/menu/add-item')}
        onAddCombo={() => navigate('/menu/add-combo')}
        onSheet={() => {
          const header =
            'Name,Short Code,Online Display Name,Price,Description\n'
          const blob = new Blob([header], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'menu-items-sheet.csv'
          link.click()
          URL.revokeObjectURL(url)
        }}
      />
      <AddItemsGridModal
        open={addGridOpen}
        categories={categoriesApi}
        initialCategoryId={categoryId}
        onClose={() => setAddGridOpen(false)}
        onSaved={() => {
          setPage(1)
          invalidateAndRefresh()
        }}
      />
      <MenuItemDetailsModal
        open={Boolean(detailsItem)}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
      />
      <UpdateAreaWisePriceModal
        open={Boolean(areaPriceItem)}
        item={areaPriceItem}
        onClose={() => setAreaPriceItem(null)}
        onSaved={() => {
          setAreaPriceItem(null)
          invalidateAndRefresh()
        }}
      />
      <UpdateNutritionModal
        open={Boolean(nutritionItem)}
        item={nutritionItem}
        onClose={() => {
          setNutritionItem(null)
          invalidateAndRefresh()
        }}
        onSaved={() => {
          setNutritionItem(null)
          invalidateAndRefresh()
        }}
      />
      <ShowChangesModal
        open={Boolean(changesName)}
        name={changesName}
        onClose={() => setChangesName(null)}
      />
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete Item"
        target={deleteTarget?.name}
        message="This item will be removed from every menu channel."
        consequences={[
          'It stops selling at the counter, online and on marketplaces.',
          'Existing orders keep their recorded lines and prices.',
        ]}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) deleteRowItem(deleteTarget)
        }}
        onClose={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={bulkDeleteTargets.length > 0}
        title={`Remove ${bulkDeleteTargets.length} item${bulkDeleteTargets.length === 1 ? '' : 's'}`}
        target={
          bulkDeleteTargets.length > 3
            ? `${bulkDeleteTargets.slice(0, 3).map((row) => row.name).join(', ')} and ${bulkDeleteTargets.length - 3} more`
            : bulkDeleteTargets.map((row) => row.name).join(', ')
        }
        message={`${bulkDeleteTargets.length} selected item${bulkDeleteTargets.length === 1 ? '' : 's'} will be removed from every menu channel.`}
        consequences={[
          'They stop appearing on your POS, online menus and marketplaces.',
          'Existing orders keep their recorded lines and prices.',
        ]}
        note="Items are archived, not erased, so they stop selling but the order history stays intact."
        confirmLabel={`Remove ${bulkDeleteTargets.length} item${bulkDeleteTargets.length === 1 ? '' : 's'}`}
        loading={busy}
        onConfirm={() => void confirmBulkDeleteItems()}
        onClose={() => setBulkDeleteTargets([])}
      />
      <ConfirmDialog
        open={Boolean(pendingCancelPublish)}
        title="Cancel scheduled publish"
        target={
          pendingCancelPublish?.name ||
          (pendingCancelPublish
            ? `${pendingCancelPublish.lines.length} change(s)`
            : undefined)
        }
        message="The pending menu changes will not be applied at the scheduled time."
        consequences={[
          'The menu stays as it is now until you schedule a new publish.',
          'Any changes already applied by an earlier publish are not rolled back.',
        ]}
        note="Only the pending schedule is cancelled. You can schedule the same changes again at any time."
        confirmLabel="Cancel publish"
        onConfirm={() => void confirmCancelPublish()}
        onClose={() => setPendingCancelPublish(null)}
      />
      <PublishDateModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onSchedule={doSchedule}
      />
    </MenuPageShell>
  )
}
