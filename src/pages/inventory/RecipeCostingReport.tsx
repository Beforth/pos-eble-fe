import { useCallback, useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/exportCsv'
import { Calculator, ChevronDown, FileText } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { RecipeCostingCalculationDrawer } from '../../components/inventory/RecipeCostingCalculationDrawer'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_REPORT_PERMISSION,
  listRecipeCostingReportApi,
} from '../../services/inventoryService'

const CALCULATE_FROM_OPTIONS = [
  'Latest average purchase price',
  'Last purchase price',
  "Raw material master's purchasing price",
]

const PRICE_BASIS: Record<string, 'latest_avg' | 'last' | 'master'> = {
  'Latest average purchase price': 'latest_avg',
  'Last purchase price': 'last',
  "Raw material master's purchasing price": 'master',
}

interface RecipeRow {
  id: string
  menuName: string
  recipeCosting: string
  sellingPrice: string
  margin: string
  materials: { name: string; qty: string; unit: string; price: string }[]
}

const RECIPE_HEADERS = [
  'Menu Name',
  'Recipe Costing (₹)',
  'Selling Price (₹)',
  'Margin (%)',
  'Calculation',
]

function exportRows(rows: RecipeRow[], suffix: 'page' | 'all') {
  downloadCsv(
    `recipe-costing-report-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
    RECIPE_HEADERS,
    rows.map((row) => [
      row.menuName,
      row.recipeCosting,
      row.sellingPrice,
      row.margin,
      '',
    ]),
  )
  showToast(`Exported ${rows.length} rows`)
}

function ExportMenu({
  onExportPage,
  onExportAll,
}: {
  onExportPage?: () => void
  onExportAll?: () => void
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
        <FileText size={15} className="text-muted" />
        Export
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onExportPage?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export Current Page
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onExportAll?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export All
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export default function RecipeCostingReport() {
  const [menuName, setMenuName] = useState('All')
  const [calculateFrom, setCalculateFrom] = useState(
    'Latest average purchase price',
  )
  const [applied, setApplied] = useState({
    menuName: 'All',
    calculateFrom: 'Latest average purchase price',
  })
  const [selectedRow, setSelectedRow] = useState<RecipeRow | null>(null)

  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const [rows, setRows] = useState<RecipeRow[]>([])
  const [menuNames, setMenuNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId || !canRead) return
    setLoading(true)
    try {
      const data = await listRecipeCostingReportApi(encryptedOutletId, {
        search: applied.menuName === 'All' ? undefined : applied.menuName,
        priceBasis: PRICE_BASIS[applied.calculateFrom] ?? 'latest_avg',
      })
      setRows(
        data.map((row) => ({
          id: row.menu_item_id,
          menuName: row.menu_name,
          recipeCosting: row.recipe_costing,
          sellingPrice: row.selling_price,
          margin: row.margin,
          materials: row.materials,
        })),
      )
      if (applied.menuName === 'All') {
        setMenuNames(data.map((row) => row.menu_name))
      }
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to load recipe costing',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, canRead, applied])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <InventoryPageShell activeItem="other-reports">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Recipe Costing Report</h1>
        <ExportMenu
          onExportPage={() => exportRows(rows, 'page')}
          onExportAll={() => exportRows(rows, 'all')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <SearchableSelect
            label="Menu Name"
            value={menuName}
            options={['All', ...menuNames]}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setMenuName}
          />
        </div>
        <div className="min-w-[260px] flex-[1.4]">
          <SearchableSelect
            label="Calculate from"
            value={calculateFrom}
            options={CALCULATE_FROM_OPTIONS}
            placeholder="Latest average purchase price"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setCalculateFrom}
          />
        </div>
        <OutlineButton
          onClick={() => {
            setApplied({ menuName, calculateFrom })
          }}
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setMenuName('All')
            setCalculateFrom('Latest average purchase price')
            setApplied({
              menuName: 'All',
              calculateFrom: 'Latest average purchase price',
            })
          }}
        >
          Clear Filter
        </OutlineButton>
      </div>

      <p className="mb-3 text-xs text-muted">
        Applied: menu={applied.menuName} · calculateFrom={applied.calculateFrom}
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-line text-xs font-semibold text-ink">
              <tr>
                <th className="bg-page px-3 py-2.5">Menu Name</th>
                <th className="bg-secondary/40 px-3 py-2.5">
                  Recipe Costing (₹)
                </th>
                <th className="bg-emerald-100 px-3 py-2.5">Selling Price (₹)</th>
                <th className="bg-slate-200 px-3 py-2.5">Margin (%)</th>
                <th className="bg-sky-100 px-3 py-2.5">Calculation</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-sm text-muted">
                    {loading ? 'Loading recipes…' : 'No recipes found'}
                  </td>
                </tr>
              ) : null}
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-line last:border-b-0 ${
                    index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                  } ${
                    selectedRow?.id === row.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-3 py-2.5 text-ink">{row.menuName}</td>
                  <td className="px-3 py-2.5 text-ink">{row.recipeCosting}</td>
                  <td className="px-3 py-2.5 text-ink">{row.sellingPrice}</td>
                  <td className="px-3 py-2.5 text-ink">{row.margin}</td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      aria-label={`Calculate ${row.menuName}`}
                      data-tooltip={`Calculate ${row.menuName}`}
                      onClick={() => setSelectedRow(row)}
                      className={`inline-flex size-8 items-center justify-center rounded-md border bg-card hover:bg-primary/5 ${
                        selectedRow?.id === row.id
                          ? 'border-primary text-primary'
                          : 'border-line text-primary'
                      }`}
                    >
                      <Calculator size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3">
          <p className="text-sm text-muted">
            Showing 1 to {rows.length} of {rows.length} records
          </p>
        </div>
      </div>

      <RecipeCostingCalculationDrawer
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        menuName={selectedRow?.menuName ?? ''}
        sellingPrice={selectedRow?.sellingPrice ?? '0.000'}
        recipeCosting={selectedRow?.recipeCosting ?? '0.000'}
        margin={selectedRow?.margin ?? '0.000'}
        materials={selectedRow?.materials ?? []}
      />
    </InventoryPageShell>
  )
}
