import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ClipboardList,
  Eye,
  FileOutput,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Upload,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  ActionDropdown,
  PrimaryButton,
  RowActionButton,
} from '../components/menu/MenuActionButtons'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'
import { AddNewItemsModal } from '../components/menu/AddNewItemsModal'
import { MenuItemDetailsModal } from '../components/menu/MenuItemDetailsModal'
import { UpdateAreaWisePriceModal } from '../components/menu/UpdateAreaWisePriceModal'
import { UpdateNutritionModal } from '../components/menu/UpdateNutritionModal'
import { SelectRecordAlert } from '../components/menu/SelectRecordAlert'
import { ShowChangesModal } from '../components/menu/ShowChangesModal'
import {
  baseMenuCategories,
  menuItems,
  type MenuItemRow,
} from '../mocks/menuItemsData'
import {
  MENU_CHANNELS,
  type MenuChannelId,
} from '../mocks/menuChannels'

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

function updateItem(
  items: MenuItemRow[],
  id: string,
  patch: Partial<MenuItemRow>,
) {
  return items.map((row) => (row.id === id ? { ...row, ...patch } : row))
}

export default function BaseMenu({
  channelId = 'base-menu',
}: {
  channelId?: MenuChannelId
}) {
  const channel = MENU_CHANNELS[channelId]
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState(baseMenuCategories[0].id)
  const [query, setQuery] = useState('')
  const [rankWise, setRankWise] = useState(false)
  const [hideEmpty, setHideEmpty] = useState(false)
  const [items, setItems] = useState(menuItems)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)
  const [addItemsOpen, setAddItemsOpen] = useState(false)
  const [detailsItem, setDetailsItem] = useState<MenuItemRow | null>(null)
  const [areaPriceItem, setAreaPriceItem] = useState<MenuItemRow | null>(null)
  const [nutritionItem, setNutritionItem] = useState<MenuItemRow | null>(null)
  const [changesName, setChangesName] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const categories = useMemo(() => {
    if (!hideEmpty) return baseMenuCategories
    return baseMenuCategories.filter((category) =>
      items.some((item) => item.categoryId === category.id),
    )
  }, [hideEmpty, items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (item.categoryId !== categoryId) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.onlineDisplayName.toLowerCase().includes(q) ||
        item.shortCode.includes(q)
      )
    })
  }, [categoryId, items, query])

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
    requireSelection(() => {
      setItems((prev) =>
        prev.map((row) =>
          selected.has(row.id) ? { ...row, available } : row,
        ),
      )
    })
  }

  function toggleCategoryAvailable() {
    const next = !categoryAvailable
    const ids = new Set(filtered.map((row) => row.id))
    setItems((prev) =>
      prev.map((row) => (ids.has(row.id) ? { ...row, available: next } : row)),
    )
  }

  return (
    <MenuPageShell
      backTo="/menu/all-in-one"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/all-in-one" className="text-primary hover:underline">
            All In One Menu
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">{channel.label}</span>
        </span>
      }
    >
      <MenuSectionNav activeTab="items" />

      <div className="mb-3 flex flex-wrap items-center gap-2">
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
                  setItems((prev) =>
                    prev.filter((row) => !selected.has(row.id)),
                  )
                  setSelected(new Set())
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

        <PrimaryButton>Save</PrimaryButton>

        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-line bg-card px-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={rankWise}
            onChange={(event) => setRankWise(event.target.checked)}
            className="size-4 cursor-pointer accent-primary"
          />
          Rank wise
        </label>

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

      <div className="flex overflow-hidden rounded-lg border border-line bg-card">
        <aside className="flex h-[calc(100vh-240px)] min-h-[360px] w-56 shrink-0 flex-col border-r border-line bg-page/40">
          <label className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-2.5 text-xs text-ink">
            Hide empty categories
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
          <ul className="min-h-0 flex-1 overflow-y-auto py-2">
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
                    className={`flex w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? 'bg-primary/10 font-semibold text-primary'
                        : 'text-ink hover:bg-page'
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-w-0">
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
                              updateItem(prev, row.id, {
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
                              updateItem(prev, row.id, {
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
                              updateItem(prev, row.id, {
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
                              updateItem(prev, row.id, {
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
                          title={row.hasImage ? 'Manage image' : 'Upload image'}
                        >
                          <Upload size={15} />
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-0.5">
                          <RowActionButton
                            label="Item details"
                            onClick={() => setDetailsItem(row)}
                          >
                            <ClipboardEyeIcon />
                          </RowActionButton>
                          <RowActionButton
                            label="Update area wise price & status"
                            onClick={() => setAreaPriceItem(row)}
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
                            onClick={() => setNutritionItem(row)}
                          >
                            <FileOutput size={15} />
                          </RowActionButton>
                          <RowActionButton
                            label="Show changes"
                            onClick={() => setChangesName(row.name)}
                          >
                            <ClipboardList size={15} />
                          </RowActionButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalRecords > 0 ? (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-page/80 px-3 py-2.5">
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
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
      <AddNewItemsModal
        open={addItemsOpen}
        onClose={() => setAddItemsOpen(false)}
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
        onSave={(itemId, price, active) => {
          setItems((prev) =>
            prev.map((row) =>
              row.id === itemId
                ? { ...row, price, available: active }
                : row,
            ),
          )
          setAreaPriceItem(null)
        }}
      />
      <UpdateNutritionModal
        open={Boolean(nutritionItem)}
        item={nutritionItem}
        onClose={() => setNutritionItem(null)}
      />
      <ShowChangesModal
        open={Boolean(changesName)}
        name={changesName}
        onClose={() => setChangesName(null)}
      />
    </MenuPageShell>
  )
}
