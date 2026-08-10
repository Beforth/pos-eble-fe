import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ClipboardList,
  FileSpreadsheet,
  ListOrdered,
  Pencil,
  Plus,
  TicketPercent,
  Trash2,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../components/menu/MenuActionButtons'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'
import { SelectRecordAlert } from '../components/menu/SelectRecordAlert'
import { ShowChangesModal } from '../components/menu/ShowChangesModal'
import { AddTableDiscountModal } from '../components/menu/AddTableDiscountModal'
import { EditTableModal } from '../components/menu/EditTableModal'
import { menuAreas, menuTables, type MenuTable } from '../mocks/menuSectionData'

type TablesSubTab = 'tables' | 'areas'

export default function TablesAreasManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialTab =
    (location.state as { tab?: TablesSubTab } | null)?.tab === 'areas'
      ? 'areas'
      : 'tables'
  const [subTab, setSubTab] = useState<TablesSubTab>(initialTab)
  const [tableNo, setTableNo] = useState('')
  const [area, setArea] = useState('all')
  const [appliedTableNo, setAppliedTableNo] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rows, setRows] = useState(menuTables)
  const [areas, setAreas] = useState(menuAreas)
  const [areaNameQuery, setAreaNameQuery] = useState('')
  const [appliedAreaName, setAppliedAreaName] = useState('')
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)
  const [changesName, setChangesName] = useState<string | null>(null)
  const [discountTargetIds, setDiscountTargetIds] = useState<string[]>([])
  const [discountLabel, setDiscountLabel] = useState<string | null>(null)
  const [discountInitial, setDiscountInitial] = useState<number | string>('')
  const [editingTable, setEditingTable] = useState<MenuTable | null>(null)

  const filtered = useMemo(() => {
    const q = appliedTableNo.trim().toLowerCase()
    return rows.filter((row) => {
      const matchNo = !q || row.tableNo.toLowerCase().includes(q)
      const matchArea =
        area === 'all' || row.areaName.toLowerCase() === area.toLowerCase()
      return matchNo && matchArea
    })
  }, [appliedTableNo, area, rows])

  const filteredAreas = useMemo(() => {
    const q = appliedAreaName.trim().toLowerCase()
    if (!q) return areas
    return areas.filter((row) => row.name.toLowerCase().includes(q))
  }, [appliedAreaName, areas])

  const allSelected =
    filtered.length > 0 && filtered.every((row) => selected.has(row.id))

  function requireSelection(action: () => void) {
    if (selected.size === 0) {
      setSelectAlertOpen(true)
      return
    }
    action()
  }

  function setSelectedActive(statusOn: boolean) {
    requireSelection(() => {
      setRows((prev) =>
        prev.map((row) =>
          selected.has(row.id) ? { ...row, statusOn } : row,
        ),
      )
    })
  }

  function removeSelectedTables() {
    requireSelection(() => {
      setRows((prev) => prev.filter((row) => !selected.has(row.id)))
      setSelected(new Set())
    })
  }

  function handleExportImportTables() {
    const header = 'Table No,No. Of Persons,Extra Information,Area Name,Status,Discount (%)\n'
    const body = rows
      .map(
        (row) =>
          `${row.tableNo},${row.persons},"${row.extraInfo}",${row.areaName},${
            row.statusOn ? 'Active' : 'Inactive'
          },${row.discountPercent}`,
      )
      .join('\n')
    const blob = new Blob([header + body], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tables-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleAddDiscount() {
    if (selected.size === 0) {
      setSelectAlertOpen(true)
      return
    }
    const ids = Array.from(selected)
    const selectedRows = rows.filter((row) => selected.has(row.id))
    const label =
      selectedRows.length === 1
        ? selectedRows[0].tableNo
        : `${selectedRows.length} Tables`
    setDiscountTargetIds(ids)
    setDiscountLabel(label)
    setDiscountInitial(
      selectedRows.length === 1 ? selectedRows[0].discountPercent : '',
    )
  }

  function openRowDiscount(rowId: string, tableNo: string, percent: number) {
    setDiscountTargetIds([rowId])
    setDiscountLabel(tableNo)
    setDiscountInitial(percent)
  }

  function saveDiscount(percent: number) {
    setRows((prev) =>
      prev.map((row) =>
        discountTargetIds.includes(row.id)
          ? { ...row, discountPercent: percent }
          : row,
      ),
    )
    setDiscountTargetIds([])
    setDiscountLabel(null)
  }

  return (
    <MenuPageShell
      backTo="/menu"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Tables Management</span>
        </span>
      }
    >
      <MenuSectionNav activeTab="tables" />

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        {subTab === 'tables' ? (
          <>
            <PrimaryButton onClick={() => navigate('/menu/tables/new')}>
              <Plus size={15} />
              Add New Table
            </PrimaryButton>
            <PrimaryButton onClick={handleAddDiscount}>
              <Plus size={15} />
              Add Discount
            </PrimaryButton>
            <ActionDropdown
              options={[
                {
                  label: 'Active',
                  onClick: () => setSelectedActive(true),
                },
                {
                  label: 'Inactive',
                  onClick: () => setSelectedActive(false),
                },
                {
                  label: 'Remove',
                  onClick: removeSelectedTables,
                },
              ]}
            />
            <ActionDropdown
              label="Export/Import"
              icon={<FileSpreadsheet size={15} className="text-muted" />}
              options={[
                {
                  label: 'Export/Import Tables',
                  onClick: handleExportImportTables,
                },
              ]}
            />
          </>
        ) : (
          <>
            <PrimaryButton onClick={() => navigate('/menu/tables/areas/new')}>
              <Plus size={15} />
              Add Area
            </PrimaryButton>
            <OutlineButton variant="gray">
              <ListOrdered size={15} />
              Update Rank
            </OutlineButton>
          </>
        )}
      </div>

      <div className="mb-4 rounded-lg border border-line bg-card p-4">
        <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-line">
          {(
            [
              { id: 'tables', label: 'Tables' },
              { id: 'areas', label: 'Areas' },
            ] as const
          ).map((tab) => {
            const active = subTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`cursor-pointer border-b-2 pb-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-ink hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {subTab === 'tables' ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[160px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Table No
              </label>
              <input
                type="text"
                value={tableNo}
                onChange={(event) => setTableNo(event.target.value)}
                className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="min-w-[180px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Select Area
              </label>
              <div className="relative">
                <select
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  className="h-9 w-full appearance-none rounded-md border border-line bg-card px-3 pr-8 text-sm outline-none focus:border-primary"
                >
                  <option value="all">All</option>
                  <option value="Ground Floor">Ground Floor</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>
            <PrimaryButton onClick={() => setAppliedTableNo(tableNo)}>
              Search
            </PrimaryButton>
            <OutlineButton
              variant="gray"
              onClick={() => {
                setTableNo('')
                setAppliedTableNo('')
                setArea('all')
              }}
            >
              Show All
            </OutlineButton>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Area Name
              </label>
              <input
                type="text"
                value={areaNameQuery}
                onChange={(event) => setAreaNameQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setAppliedAreaName(areaNameQuery)
                }}
                className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <OutlineButton onClick={() => setAppliedAreaName(areaNameQuery)}>
              Search
            </OutlineButton>
            <OutlineButton
              variant="gray"
              onClick={() => {
                setAreaNameQuery('')
                setAppliedAreaName('')
              }}
            >
              Show All
            </OutlineButton>
          </div>
        )}
      </div>

      {subTab === 'tables' ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-line bg-card">
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
                            : new Set(filtered.map((r) => r.id)),
                        )
                      }
                      className="cursor-pointer accent-primary"
                    />
                  </th>
                  <th className="px-3 py-3">Table No</th>
                  <th className="px-3 py-3">No. Of Persons</th>
                  <th className="px-3 py-3">Extra Information</th>
                  <th className="px-3 py-3">Area Name</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Discount (%)</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0 hover:bg-page/80"
                  >
                    <td className="px-3 py-3.5">
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
                    </td>
                    <td className="px-3 py-3.5 font-medium text-ink">
                      {row.tableNo}
                    </td>
                    <td className="px-3 py-3.5 tabular-nums text-ink">
                      {row.persons}
                    </td>
                    <td className="px-3 py-3.5 text-muted">
                      {row.extraInfo || '—'}
                    </td>
                    <td className="px-3 py-3.5 text-ink">{row.areaName}</td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.statusOn}
                        onClick={() =>
                          setRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id
                                ? { ...item, statusOn: !item.statusOn }
                                : item,
                            ),
                          )
                        }
                        className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                          row.statusOn ? 'bg-primary' : 'bg-line'
                        }`}
                      >
                        <span
                          className={`inline-block size-4 rounded-full bg-card transition-transform ${
                            row.statusOn ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-3 py-3.5 tabular-nums text-ink">
                      {row.discountPercent}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1">
                        <RowActionButton
                          label="Show Changes"
                          onClick={() => setChangesName(`Table ${row.tableNo}`)}
                        >
                          <ClipboardList size={16} />
                        </RowActionButton>
                        <RowActionButton
                          label="Edit"
                          onClick={() => setEditingTable(row)}
                        >
                          <Pencil size={16} />
                        </RowActionButton>
                        <RowActionButton
                          label="Add Discount"
                          onClick={() =>
                            openRowDiscount(
                              row.id,
                              row.tableNo,
                              row.discountPercent,
                            )
                          }
                        >
                          <TicketPercent size={16} />
                        </RowActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Showing 1 to {filtered.length} of {filtered.length} records
          </p>
        </>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-line bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-sm font-semibold text-ink">
                <tr>
                  <th className="px-3 py-3">Area Name</th>
                  <th className="px-3 py-3">Tables</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Created Date</th>
                  <th className="px-3 py-3">Discount (%)</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAreas.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0 hover:bg-page/80"
                  >
                    <td className="px-3 py-3.5 font-medium text-ink">
                      {row.name}
                    </td>
                    <td className="px-3 py-3.5 text-muted">
                      {row.tables || ''}
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          setAreas((prev) =>
                            prev.map((item) =>
                              item.id === row.id
                                ? {
                                    ...item,
                                    status:
                                      item.status === 'Active'
                                        ? 'Inactive'
                                        : 'Active',
                                  }
                                : item,
                            ),
                          )
                        }
                        className={`cursor-pointer text-sm font-medium ${
                          row.status === 'Active'
                            ? 'text-success hover:underline'
                            : 'text-muted hover:underline'
                        }`}
                      >
                        {row.status}
                      </button>
                    </td>
                    <td className="px-3 py-3.5 text-muted">{row.created}</td>
                    <td className="px-3 py-3.5 text-muted">
                      {row.discountPercent}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1">
                        <RowActionButton label="Edit">
                          <Pencil size={16} />
                        </RowActionButton>
                        <RowActionButton
                          label="Show Changes"
                          onClick={() => setChangesName(row.name)}
                        >
                          <ClipboardList size={16} />
                        </RowActionButton>
                        {row.name === 'Home Delivery' ||
                        row.name === 'Parcel' ? (
                          <RowActionButton label="Add Discount">
                            <TicketPercent size={16} />
                          </RowActionButton>
                        ) : (
                          <RowActionButton
                            label="Delete"
                            onClick={() =>
                              setAreas((prev) =>
                                prev.filter((item) => item.id !== row.id),
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </RowActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Showing 1 to {filteredAreas.length} of {filteredAreas.length}{' '}
            records
          </p>
        </>
      )}

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
      <AddTableDiscountModal
        open={discountTargetIds.length > 0}
        tableLabel={discountLabel}
        initialPercent={discountInitial}
        onClose={() => {
          setDiscountTargetIds([])
          setDiscountLabel(null)
        }}
        onSave={saveDiscount}
      />
      <EditTableModal
        open={Boolean(editingTable)}
        table={editingTable}
        onClose={() => setEditingTable(null)}
        onUpdate={(updated) => {
          setRows((prev) =>
            prev.map((row) => (row.id === updated.id ? updated : row)),
          )
          setEditingTable(null)
        }}
      />
      <ShowChangesModal
        open={Boolean(changesName)}
        name={changesName}
        onClose={() => setChangesName(null)}
      />
    </MenuPageShell>
  )
}
