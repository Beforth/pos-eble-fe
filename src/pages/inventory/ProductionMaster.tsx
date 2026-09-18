import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Info, Plus, Search, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_PRODUCTION_WRITE_PERMISSION,
  categoryIdByName,
  deleteProductionProcessApi,
  listAllProductionProcessesApi,
  type ProductionProcess,
} from '../../services/inventoryService'

function DropdownMenu({
  label,
  icon,
  items,
  sections,
}: {
  label: string
  icon?: ReactNode
  items?: { label: string; onClick?: () => void }[]
  sections?: {
    title: string
    items: { label: string; onClick?: () => void }[]
  }[]
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

  function renderItem(item: { label: string; onClick?: () => void }) {
    return (
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
    )
  }

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
          {sections
            ? sections.map((section, index) => (
                <li key={section.title}>
                  {index > 0 ? (
                    <div className="my-1 border-t border-line" />
                  ) : null}
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    {section.title}
                  </p>
                  <ul>{section.items.map(renderItem)}</ul>
                </li>
              ))
            : items?.map(renderItem)}
        </ul>
      ) : null}
    </div>
  )
}

export default function ProductionMaster() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_PRODUCTION_WRITE_PERMISSION)
  const { categories, loadMasters } = useInventoryMasters()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedCategory, setAppliedCategory] = useState('All')
  const [rows, setRows] = useState<ProductionProcess[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  const categoryOptions = useMemo(
    () => ['All', ...categories.map((row) => row.name), 'No Category'],
    [categories],
  )

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    try {
      const categoryId =
        appliedCategory === 'All'
          ? undefined
          : appliedCategory === 'No Category'
            ? 'no-category'
            : categoryIdByName(categories, appliedCategory)
      const data = await listAllProductionProcessesApi(encryptedOutletId, {
        search: appliedSearch || undefined,
        categoryId,
      })
      setRows(data)
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Unable to load production processes',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, appliedSearch, appliedCategory, categories])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete() {
    if (!encryptedOutletId || !deleteId || !canWrite) return
    try {
      await deleteProductionProcessApi(encryptedOutletId, deleteId)
      showToast('Production process deleted')
      setDeleteId(null)
      void load()
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to delete process',
      )
    }
  }

  return (
    <InventoryPageShell activeItem="production-master">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Production List</h1>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <PrimaryButton
              onClick={() => navigate('/inventory/production-master/new')}
            >
              <Plus size={15} />
              Create New
            </PrimaryButton>
          ) : null}
          <DropdownMenu
            label="Files"
            icon={<FileText size={15} className="text-muted" />}
            sections={[
              {
                title: 'Export',
                items: [
                  {
                    label: 'Export Current Page',
                    onClick: () => {
                      downloadCsv(
                        [
                          'name',
                          'to_raw_material',
                          'category',
                          'output_qty',
                          'output_unit',
                          'inputs',
                        ],
                        rows.map((row) => [
                          row.name,
                          row.output_raw_material_name,
                          row.output_category_name || '',
                          row.output_qty,
                          row.output_unit_name,
                          row.lines.length,
                        ]),
                        'production-master-page.csv',
                      )
                      showToast('Exported current page')
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Search Production
          </label>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Production"
            className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[200px]">
          <SearchableSelect
            label={
              <>
                Category
                <span title="Filter production records by category">
                  <Info size={13} className="text-muted" />
                </span>
              </>
            }
            value={category}
            options={categoryOptions}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setCategory}
          />
        </div>
        <OutlineButton
          onClick={() => {
            setAppliedSearch(search.trim())
            setAppliedCategory(category)
          }}
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setSearch('')
            setCategory('All')
            setAppliedSearch('')
            setAppliedCategory('All')
          }}
        >
          Clear
        </OutlineButton>
      </div>

      {loading ? (
        <div className="rounded-xl border border-line bg-card px-6 py-16 text-center text-sm text-muted">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
          <span className="relative mb-4 text-muted">
            <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
            <Search
              size={24}
              className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
            />
          </span>
          <p className="text-base font-semibold text-ink">
            Convert Raw Material Management Record Not Found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
              <tr>
                <th className="px-3 py-2.5">Production Name</th>
                <th className="px-3 py-2.5">To Raw Material</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Output Qty</th>
                <th className="px-3 py-2.5">Inputs</th>
                {canWrite ? <th className="px-3 py-2.5">Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2.5 text-ink">{row.name}</td>
                  <td className="px-3 py-2.5 text-ink">
                    {row.output_raw_material_name}
                  </td>
                  <td className="px-3 py-2.5 text-ink">
                    {row.output_category_name || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-ink">
                    {row.output_qty} {row.output_unit_name}
                  </td>
                  <td className="px-3 py-2.5 text-ink">{row.lines.length}</td>
                  {canWrite ? (
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => setDeleteId(row.id)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteId)}
        title="Delete production process?"
        message="This cannot be undone if the process has no runs."
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </InventoryPageShell>
  )
}
