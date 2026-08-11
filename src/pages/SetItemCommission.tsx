import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileUp, Pencil, Plus } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../components/menu/MenuActionButtons'
import { UpdateItemCommissionModal } from '../components/menu/UpdateItemCommissionModal'
import { CategoryMultiSelect } from '../components/menu/CategoryMultiSelect'
import { CommissionTypeSelect } from '../components/menu/CommissionTypeSelect'
import {
  addonCommissionRows,
  itemCommissionRows,
  type CommissionType,
  type ItemCommissionRow,
} from '../mocks/itemCommissionData'
import { baseMenuCategories } from '../mocks/menuItemsData'

type TabId = 'item' | 'addon'

const PAGE_SIZE = 50

export default function SetItemCommission() {
  const [tab, setTab] = useState<TabId>('item')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [itemQuery, setItemQuery] = useState('')
  const [commissionType, setCommissionType] = useState('all')
  const [applied, setApplied] = useState({
    categoryIds: [] as string[],
    itemQuery: '',
    commissionType: 'all',
  })
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rows, setRows] = useState<ItemCommissionRow[]>(itemCommissionRows)
  const [importOpen, setImportOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (tab === 'addon') return []
    return rows.filter((row) => {
      if (
        applied.categoryIds.length > 0 &&
        !applied.categoryIds.includes(row.categoryId)
      ) {
        return false
      }
      if (applied.itemQuery.trim()) {
        const q = applied.itemQuery.trim().toLowerCase()
        if (!row.itemName.toLowerCase().includes(q)) return false
      }
      if (
        applied.commissionType !== 'all' &&
        row.commissionType !== applied.commissionType
      ) {
        return false
      }
      return true
    })
  }, [rows, applied, tab])

  const addonFiltered = useMemo(() => {
    if (tab !== 'addon') return []
    return addonCommissionRows.filter((row) => {
      if (applied.itemQuery.trim()) {
        const q = applied.itemQuery.trim().toLowerCase()
        if (!row.addonName.toLowerCase().includes(q)) return false
      }
      if (
        applied.commissionType !== 'all' &&
        row.commissionType !== applied.commissionType
      ) {
        return false
      }
      return true
    })
  }, [applied, tab])

  const activeRows = tab === 'item' ? filtered : addonFiltered
  const total = activeRows.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(currentPage * PAGE_SIZE, total)
  const pageRows = activeRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const pageNumbers = useMemo(() => {
    const maxButtons = 5
    const start = Math.max(
      1,
      Math.min(currentPage - 2, totalPages - maxButtons + 1),
    )
    const end = Math.min(totalPages, start + maxButtons - 1)
    const nums: number[] = []
    for (let n = start; n <= end; n += 1) nums.push(n)
    return nums
  }, [currentPage, totalPages])

  function handleSearch() {
    setApplied({
      categoryIds,
      itemQuery,
      commissionType,
    })
    setPage(1)
    setSelectedIds(new Set())
  }

  function handleShowAll() {
    setCategoryIds([])
    setItemQuery('')
    setCommissionType('all')
    setApplied({ categoryIds: [], itemQuery: '', commissionType: 'all' })
    setPage(1)
    setSelectedIds(new Set())
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const ids = pageRows.map((row) => row.id)
    if (ids.every((id) => selectedIds.has(id))) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      return
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
  }

  function formatType(type: CommissionType) {
    return type
  }

  return (
    <MenuPageShell
      backTo="/menu"
      activeItem="item-commission"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Set Menu Commission</span>
        </span>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <PrimaryButton>
          <Plus size={15} />
          Add Menu Commission
        </PrimaryButton>
        <OutlineButton variant="gray" onClick={() => setImportOpen(true)}>
          <FileUp size={15} />
          Import
        </OutlineButton>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-6 border-b border-line">
        {(
          [
            { id: 'item' as const, label: 'Item Commission' },
            { id: 'addon' as const, label: 'Addon Item Commission' },
          ] as const
        ).map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id)
                setPage(1)
                setSelectedIds(new Set())
              }}
              className={`relative pb-2.5 text-sm font-semibold transition-colors ${
                active ? 'text-primary' : 'text-muted hover:text-ink'
              }`}
            >
              {t.label}
              {active ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-card p-4">
        {tab === 'item' ? (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Category
            </label>
            <CategoryMultiSelect
              options={baseMenuCategories}
              selectedIds={categoryIds}
              onChange={setCategoryIds}
            />
          </div>
        ) : null}
        <div className="min-w-[160px] flex-1 sm:max-w-xs">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            {tab === 'item' ? 'Item' : 'Addon Item'}
          </label>
          <input
            type="search"
            value={itemQuery}
            onChange={(event) => setItemQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearch()
            }}
            className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Commission Type
          </label>
          <CommissionTypeSelect
            value={commissionType}
            onChange={setCommissionType}
          />
        </div>
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={handleShowAll}>
          Show All
        </OutlineButton>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      pageRows.length > 0 &&
                      pageRows.every((row) => selectedIds.has(row.id))
                    }
                    onChange={toggleSelectAll}
                    className="size-4 accent-primary"
                    aria-label="Select all on page"
                  />
                </th>
                <th className="px-4 py-3">
                  {tab === 'item' ? 'Item' : 'Addon Item'}
                </th>
                <th className="px-4 py-3">
                  {tab === 'item' ? 'Category' : 'Group'}
                </th>
                <th className="px-4 py-3">Item Price</th>
                <th className="px-4 py-3">Commission Type</th>
                <th className="px-4 py-3">Commission Value</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-sm text-muted"
                  >
                    No Record Found
                  </td>
                </tr>
              ) : tab === 'item' ? (
                filtered
                  .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                  .map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-line last:border-b-0 hover:bg-page/50"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="size-4 accent-primary"
                          aria-label={`Select ${row.itemName}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {row.itemName}
                      </td>
                      <td className="px-4 py-3 text-muted">{row.categoryName}</td>
                      <td className="px-4 py-3 text-ink">{row.itemPrice}</td>
                      <td className="px-4 py-3 text-ink">
                        {formatType(row.commissionType)}
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {row.commissionValue ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <RowActionButton
                            label="Edit"
                            onClick={() => {
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        commissionType: 'Percentage',
                                        commissionValue: r.commissionValue ?? 44,
                                      }
                                    : r,
                                ),
                              )
                            }}
                          >
                            <Pencil size={15} />
                          </RowActionButton>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                addonFiltered
                  .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                  .map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-line last:border-b-0 hover:bg-page/50"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="size-4 accent-primary"
                          aria-label={`Select ${row.addonName}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {row.addonName}
                      </td>
                      <td className="px-4 py-3 text-muted">{row.groupName}</td>
                      <td className="px-4 py-3 text-ink">{row.price}</td>
                      <td className="px-4 py-3 text-ink">
                        {formatType(row.commissionType)}
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {row.commissionValue ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <RowActionButton label="Edit">
                            <Pencil size={15} />
                          </RowActionButton>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-sm text-muted">
            {total === 0
              ? 'Showing 0 records'
              : `Showing ${pageStart} to ${pageEnd} of ${total} records`}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-medium ${
                  n === currentPage
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-line bg-card text-ink hover:bg-page'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-8 items-center justify-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              className="inline-flex h-8 items-center justify-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      <UpdateItemCommissionModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onUpload={(file) => {
          setToast(`Uploaded ${file.name}`)
          window.setTimeout(() => setToast(null), 2400)
        }}
      />
    </MenuPageShell>
  )
}
