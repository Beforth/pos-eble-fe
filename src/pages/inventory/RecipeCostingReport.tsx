import { useEffect, useMemo, useRef, useState } from 'react'
import { Calculator, ChevronDown, FileText } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { RecipeCostingCalculationDrawer } from '../../components/inventory/RecipeCostingCalculationDrawer'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const MENU_NAME_OPTIONS = [
  'All',
  'Aaloo Cheese Plate',
  'Aaloo Papdi Chaat',
  'Aloo Cheese Paav',
  'Amul Butter Dabeli',
  'Amul Cheese Dabeli',
  'Amul Mayonnaise Dabeli',
  'Schezwan Paneer Sandwich',
  'Schezwan Cheese Sandwich',
  'Samosa',
  'Veg Junglee Sandwich',
  'Tandoor Paneer Sandwich',
  'Sukha Bhel',
  'Dabeli',
  'Vada Pav',
  'Misal Pav',
  'Masala Chai',
  'Sev Puri',
  'Pani Puri',
  'Cheese Dabeli',
]

const CALCULATE_FROM_OPTIONS = [
  'Latest average purchase price',
  'Last purchase price',
  "Raw material master's purchasing price",
]

interface RecipeRow {
  id: string
  menuName: string
  recipeCosting: string
  sellingPrice: string
  margin: string
}

const RECIPE_ROWS: RecipeRow[] = [
  {
    id: '1',
    menuName: 'Aaloo Cheese Plate',
    recipeCosting: '0.000',
    sellingPrice: '120.000',
    margin: '100.000',
  },
  {
    id: '2',
    menuName: 'Aaloo Papdi Chaat',
    recipeCosting: '0.000',
    sellingPrice: '80.000',
    margin: '100.000',
  },
  {
    id: '3',
    menuName: 'Aloo Cheese Paav',
    recipeCosting: '0.000',
    sellingPrice: '60.000',
    margin: '100.000',
  },
  {
    id: '4',
    menuName: 'Amul Butter Dabeli',
    recipeCosting: '0.000',
    sellingPrice: '45.000',
    margin: '100.000',
  },
  {
    id: '5',
    menuName: 'Amul Cheese Dabeli',
    recipeCosting: '0.000',
    sellingPrice: '50.000',
    margin: '100.000',
  },
  {
    id: '6',
    menuName: 'Amul Mayonnaise Dabeli',
    recipeCosting: '0.000',
    sellingPrice: '55.000',
    margin: '100.000',
  },
  {
    id: '7',
    menuName: 'Schezwan Paneer Sandwich',
    recipeCosting: '0.000',
    sellingPrice: '150.000',
    margin: '100.000',
  },
  {
    id: '8',
    menuName: 'Schezwan Cheese Sandwich',
    recipeCosting: '0.000',
    sellingPrice: '130.000',
    margin: '100.000',
  },
  {
    id: '9',
    menuName: 'Samosa',
    recipeCosting: '0.000',
    sellingPrice: '20.000',
    margin: '100.000',
  },
  {
    id: '10',
    menuName: 'Veg Junglee Sandwich',
    recipeCosting: '0.000',
    sellingPrice: '150.000',
    margin: '100.000',
  },
  {
    id: '11',
    menuName: 'Tandoor Paneer Sandwich',
    recipeCosting: '0.000',
    sellingPrice: '100.000',
    margin: '100.000',
  },
  {
    id: '12',
    menuName: 'Sukha Bhel',
    recipeCosting: '0.000',
    sellingPrice: '70.000',
    margin: '100.000',
  },
  {
    id: '13',
    menuName: 'Dabeli',
    recipeCosting: '0.000',
    sellingPrice: '35.000',
    margin: '100.000',
  },
  {
    id: '14',
    menuName: 'Vada Pav',
    recipeCosting: '0.000',
    sellingPrice: '25.000',
    margin: '100.000',
  },
  {
    id: '15',
    menuName: 'Misal Pav',
    recipeCosting: '0.000',
    sellingPrice: '60.000',
    margin: '100.000',
  },
  {
    id: '16',
    menuName: 'Masala Chai',
    recipeCosting: '0.000',
    sellingPrice: '15.000',
    margin: '100.000',
  },
  {
    id: '17',
    menuName: 'Sev Puri',
    recipeCosting: '0.000',
    sellingPrice: '45.000',
    margin: '100.000',
  },
  {
    id: '18',
    menuName: 'Pani Puri',
    recipeCosting: '0.000',
    sellingPrice: '40.000',
    margin: '100.000',
  },
  {
    id: '19',
    menuName: 'Cheese Dabeli',
    recipeCosting: '0.000',
    sellingPrice: '50.000',
    margin: '100.000',
  },
]

function buildAllRows(): RecipeRow[] {
  const named = RECIPE_ROWS
  const extras = Array.from({ length: 10 }, (_, index) => ({
    id: `extra-${index + 1}`,
    menuName: `Special Item ${index + 1}`,
    recipeCosting: '0.000',
    sellingPrice: `${(30 + index * 5).toFixed(3)}`,
    margin: '100.000',
  }))
  return [...named, ...extras]
}

const ALL_ROWS = buildAllRows()

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
  const [appliedMenu, setAppliedMenu] = useState('All')
  const [toast, setToast] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<RecipeRow | null>(null)

  const rows = useMemo(() => {
    if (appliedMenu === 'All') return ALL_ROWS
    return ALL_ROWS.filter((row) => row.menuName === appliedMenu)
  }, [appliedMenu])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Recipe Costing Report</h1>
        <ExportMenu
          onExportPage={() => showToast('Exported current page')}
          onExportAll={() => showToast('Exported all')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <SearchableSelect
            label="Menu Name"
            value={menuName}
            options={MENU_NAME_OPTIONS}
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
            setAppliedMenu(menuName)
            showToast('Search applied')
          }}
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setMenuName('All')
            setCalculateFrom('Latest average purchase price')
            setAppliedMenu('All')
          }}
        >
          Show All
        </OutlineButton>
      </div>

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
      />
    </InventoryPageShell>
  )
}
