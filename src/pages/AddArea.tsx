import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { menuTables } from '../mocks/menuSectionData'

const AREA_TYPES = [
  'Select Type',
  'Dine In',
  'Delivery',
  'Takeaway',
  'Online',
] as const

export default function AddArea() {
  const navigate = useNavigate()
  const tableOptions = useMemo(
    () =>
      [...menuTables]
        .map((row) => row.tableNo)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [],
  )

  const [areaType, setAreaType] = useState<(typeof AREA_TYPES)[number]>(
    'Select Type',
  )
  const [areaName, setAreaName] = useState('')
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set())
  const [active, setActive] = useState(true)

  const allChecked =
    tableOptions.length > 0 &&
    tableOptions.every((table) => selectedTables.has(table))

  function goBack() {
    navigate('/menu/tables', { state: { tab: 'areas' } })
  }

  function toggleAll() {
    setSelectedTables(allChecked ? new Set() : new Set(tableOptions))
  }

  function toggleTable(tableNo: string) {
    setSelectedTables((prev) => {
      const next = new Set(prev)
      if (next.has(tableNo)) next.delete(tableNo)
      else next.add(tableNo)
      return next
    })
  }

  return (
    <MenuPageShell
      backTo="/menu/tables"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/tables" className="text-primary hover:underline">
            Tables Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Area</span>
        </span>
      }
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-card">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-ink">Area Details</h2>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Area Type <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <select
                value={areaType}
                onChange={(event) =>
                  setAreaType(
                    event.target.value as (typeof AREA_TYPES)[number],
                  )
                }
                className="h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
              >
                {AREA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          </div>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Area Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={areaName}
              onChange={(event) => setAreaName(event.target.value)}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Tables <span className="text-primary">*</span>
            </label>
            <label className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="size-4 cursor-pointer accent-primary"
              />
              Check All
            </label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {tableOptions.map((tableNo) => (
                <label
                  key={tableNo}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={selectedTables.has(tableNo)}
                    onChange={() => toggleTable(tableNo)}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {tableNo}
                </label>
              ))}
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            Active
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-page/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
