import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../utils/toast'
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
import { SortableTh } from '../components/common/SortableTh'
import { useListQuery } from '../hooks/useListQuery'
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
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { useAuth } from '../auth/AuthContext'
import {
  listDiningAreasApi,
  deleteDiningAreaApi,
  deleteDiningTableApi,
  updateDiningAreaApi,
  updateDiningTableApi,
} from '../services/menuService'
import type { DiningArea, DiningTable } from '../types/menu'

type TablesSubTab = 'tables' | 'areas'

export default function TablesAreasManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const { encryptedOutletId } = useAuth()
  const initialTab =
    (location.state as { tab?: TablesSubTab } | null)?.tab === 'areas'
      ? 'areas'
      : 'tables'
  const [subTab, setSubTab] = useState<TablesSubTab>(initialTab)
  const [tableNo, setTableNo] = useState('')
  const [area, setArea] = useState('all')
  const [appliedTableNo, setAppliedTableNo] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [tables, setTables] = useState<DiningTable[]>([])
  const [areas, setAreas] = useState<DiningArea[]>([])
  const [loading, setLoading] = useState(true)
  const [areaNameQuery, setAreaNameQuery] = useState('')
  const [appliedAreaName, setAppliedAreaName] = useState('')
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)
  const [changesName, setChangesName] = useState<string | null>(null)
  const [discountTargetIds, setDiscountTargetIds] = useState<string[]>([])
  const [discountLabel, setDiscountLabel] = useState<string | null>(null)
  const [discountInitial, setDiscountInitial] = useState<number | string>('')
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null)
  const [pendingDeleteTable, setPendingDeleteTable] = useState<DiningTable | null>(null)
  const [pendingDeleteArea, setPendingDeleteArea] = useState<DiningArea | null>(null)
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false)

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    setLoading(true)
    listDiningAreasApi(encryptedOutletId)
      .then((data) => {
        if (cancelled) return
        setAreas(data)
        const flat: DiningTable[] = []
        for (const a of data) {
          for (const t of a.tables) {
            flat.push(t)
          }
        }
        setTables(flat)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          showToast(
            err instanceof Error ? err.message : 'Failed to load dining areas',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  const filtered = useMemo(() => {
    const q = appliedTableNo.trim().toLowerCase()
    return tables.filter((row) => {
      const matchNo = !q || row.table_no.toLowerCase().includes(q)
      const matchArea =
        area === 'all' || row.area_name.toLowerCase() === area.toLowerCase()
      return matchNo && matchArea
    })
  }, [appliedTableNo, area, tables])

  const filteredAreas = useMemo(() => {
    const q = appliedAreaName.trim().toLowerCase()
    if (!q) return areas
    return areas.filter((row) => row.name.toLowerCase().includes(q))
  }, [appliedAreaName, areas])

  const {
    sortKey: tableSortKey,
    sortDir: tableSortDir,
    toggleSort: toggleTableSort,
    visible: visibleTables,
  } = useListQuery(
    filtered,
    (row) => [
      row.tableNo,
      row.persons,
      row.extraInfo,
      row.areaName,
      row.statusOn ? 'Active' : 'Inactive',
      row.discountPercent,
    ],
    (row, key) => {
      if (key === 'persons') return row.persons
      if (key === 'extraInfo') return row.extraInfo
      if (key === 'areaName') return row.areaName
      if (key === 'status') return row.statusOn ? 'Active' : 'Inactive'
      if (key === 'discountPercent') return row.discountPercent
      return row.tableNo
    },
  )

  const {
    sortKey: areaSortKey,
    sortDir: areaSortDir,
    toggleSort: toggleAreaSort,
    visible: visibleAreas,
  } = useListQuery(
    filteredAreas,
    (row) => [row.name, row.tables, row.status, row.created, row.discountPercent],
    (row, key) => {
      if (key === 'tables') return row.tables
      if (key === 'status') return row.status
      if (key === 'created') return row.created
      if (key === 'discountPercent') return row.discountPercent
      return row.name
    },
  )

  const allSelected =
    visibleTables.length > 0 && visibleTables.every((row) => selected.has(row.id))

  function requireSelection(action: () => void) {
    if (selected.size === 0) {
      setSelectAlertOpen(true)
      return
    }
    action()
  }

  function setSelectedActive(statusOn: boolean) {
    requireSelection(async () => {
      if (!encryptedOutletId) return
      for (const id of selected) {
        try {
          await updateDiningTableApi(encryptedOutletId, id, { is_on: statusOn })
        } catch {
          showToast('Failed to update table status')
        }
      }
      setTables((prev) =>
        prev.map((row) =>
          selected.has(row.id) ? { ...row, is_on: statusOn } : row,
        ),
      )
      setSelected(new Set())
    })
  }

  function onRemoveSelectedTables() {
    requireSelection(() => setPendingBulkDelete(true))
  }

  async function removeSelectedTables() {
    if (!encryptedOutletId) return
    setPendingBulkDelete(false)
    const ids = Array.from(selected)
    const failed = new Set<string>()
    let deleted = 0
    for (const id of ids) {
      try {
        await deleteDiningTableApi(encryptedOutletId, id)
        deleted += 1
      } catch {
        failed.add(id)
      }
    }
    setTables((prev) => prev.filter((row) => !failed.has(row.id)))
    setSelected(failed)
    if (deleted > 0) {
      showToast(deleted === 1 ? '1 table deleted' : `${deleted} tables deleted`)
    }
    if (failed.size > 0) {
      showToast(
        failed.size === 1
          ? 'Failed to delete 1 table'
          : `Failed to delete ${failed.size} tables`,
      )
    }
  }

  function handleExportImportTables() {
    const header =
      'Table No,No. Of Persons,Extra Information,Area Name,Status,Discount (%)\n'
    const body = tables
      .map(
        (row) =>
          `${row.table_no},${row.persons},"${row.extra_info}",${row.area_name},${
            row.is_on ? 'Active' : 'Inactive'
          },${row.discount_percent}`,
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
    const selectedRows = tables.filter((row) => selected.has(row.id))
    const label =
      selectedRows.length === 1
        ? selectedRows[0].table_no
        : `${selectedRows.length} Tables`
    setDiscountTargetIds(ids)
    setDiscountLabel(label)
    setDiscountInitial(
      selectedRows.length === 1 ? selectedRows[0].discount_percent : '',
    )
  }

  function openRowDiscount(
    rowId: string,
    tableNo: string,
    percent: number | string,
  ) {
    setDiscountTargetIds([rowId])
    setDiscountLabel(tableNo)
    setDiscountInitial(percent)
  }

  async function saveDiscount(percent: number) {
    if (!encryptedOutletId) return
    for (const id of discountTargetIds) {
      try {
        await updateDiningTableApi(encryptedOutletId, id, {
          discount_percent: percent,
        })
      } catch {
        showToast('Failed to update discount')
      }
    }
    setTables((prev) =>
      prev.map((row) =>
        discountTargetIds.includes(row.id)
          ? { ...row, discount_percent: percent }
          : row,
      ),
    )
    setDiscountTargetIds([])
    setDiscountLabel(null)
  }

  async function toggleAreaStatus(row: DiningArea) {
    if (!encryptedOutletId) return
    const next = !row.is_active
    try {
      await updateDiningAreaApi(encryptedOutletId, row.id, { is_active: next })
      setAreas((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, is_active: next } : item,
        ),
      )
    } catch {
      showToast('Failed to update area status')
    }
  }

  async function deleteArea(row: DiningArea) {
    if (!encryptedOutletId) return
    try {
      await deleteDiningAreaApi(encryptedOutletId, row.id)
      setAreas((prev) => prev.filter((item) => item.id !== row.id))
      setTables((prev) => prev.filter((t) => t.area_id !== row.id))
      showToast('Area deleted')
    } catch {
      showToast('Failed to delete area')
    }
  }

  async function confirmDeleteArea() {
    if (!pendingDeleteArea) return
    const row = pendingDeleteArea
    setPendingDeleteArea(null)
    await deleteArea(row)
  }

  async function confirmDeleteTable() {
    if (!encryptedOutletId || !pendingDeleteTable) return
    const row = pendingDeleteTable
    setPendingDeleteTable(null)
    try {
      await deleteDiningTableApi(encryptedOutletId, row.id)
      setTables((prev) => prev.filter((t) => t.id !== row.id))
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(row.id)
        return next
      })
      showToast(`Table ${row.table_no} deleted`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete table')
    }
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
                  onClick: onRemoveSelectedTables,
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
                  {areas.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
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
                showToast('Filters cleared')
              }}
            >
              Clear Filter
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
                showToast('Filters cleared')
              }}
            >
              Clear Filter
            </OutlineButton>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-muted">
          Loading…
        </div>
      ) : subTab === 'tables' ? (
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
                            : new Set(visibleTables.map((r) => r.id)),
                        )
                      }
                      className="cursor-pointer accent-primary"
                    />
                  </th>
                  <SortableTh
                    columnKey="tableNo"
                    sortKey={tableSortKey}
                    sortDir={tableSortDir}
                    onSort={toggleTableSort}
                    className="px-3 py-3"
                  >
                    Table No
                  </SortableTh>
                  <SortableTh
                    columnKey="persons"
                    sortKey={tableSortKey}
                    sortDir={tableSortDir}
                    onSort={toggleTableSort}
                    className="px-3 py-3"
                  >
                    No. Of Persons
                  </SortableTh>
                  <SortableTh
                    columnKey="extraInfo"
                    sortKey={tableSortKey}
                    sortDir={tableSortDir}
                    onSort={toggleTableSort}
                    className="px-3 py-3"
                  >
                    Extra Information
                  </SortableTh>
                  <SortableTh
                    columnKey="areaName"
                    sortKey={tableSortKey}
                    sortDir={tableSortDir}
                    onSort={toggleTableSort}
                    className="px-3 py-3"
                  >
                    Area Name
                  </SortableTh>
                  <SortableTh
                    columnKey="status"
                    sortKey={tableSortKey}
                    sortDir={tableSortDir}
                    onSort={toggleTableSort}
                    className="px-3 py-3"
                  >
                    Status
                  </SortableTh>
                  <SortableTh
                    columnKey="discountPercent"
                    sortKey={tableSortKey}
                    sortDir={tableSortDir}
                    onSort={toggleTableSort}
                    className="px-3 py-3"
                  >
                    Discount (%)
                  </SortableTh>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleTables.map((row) => (
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
                      {row.table_no}
                    </td>
                    <td className="px-3 py-3.5 tabular-nums text-ink">
                      {row.persons}
                    </td>
                    <td className="px-3 py-3.5 text-muted">
                      {row.extra_info || '—'}
                    </td>
                    <td className="px-3 py-3.5 text-ink">{row.area_name}</td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.is_on}
                        onClick={async () => {
                          if (!encryptedOutletId) return
                          const next = !row.is_on
                          try {
                            await updateDiningTableApi(
                              encryptedOutletId,
                              row.id,
                              { is_on: next },
                            )
                            setTables((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? { ...item, is_on: next }
                                  : item,
                              ),
                            )
                          } catch {
                            showToast('Failed to update status')
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                          row.is_on ? 'bg-primary' : 'bg-line'
                        }`}
                      >
                        <span
                          className={`inline-block size-4 rounded-full bg-card transition-transform ${
                            row.is_on ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-3 py-3.5 tabular-nums text-ink">
                      {row.discount_percent}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1">
                        <RowActionButton
                          label="Show Changes"
                          onClick={() =>
                            setChangesName(`Table ${row.table_no}`)
                          }
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
                              row.table_no,
                              row.discount_percent,
                            )
                          }
                        >
                          <TicketPercent size={16} />
                        </RowActionButton>
                        <RowActionButton
                          label="Delete"
                          onClick={() => setPendingDeleteTable(row)}
                        >
                          <Trash2 size={16} />
                        </RowActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Showing 1 to {visibleTables.length} of {visibleTables.length} records
          </p>
        </>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-line bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-sm font-semibold text-ink">
                <tr>
<<<<<<< HEAD
                  <SortableTh
                    columnKey="name"
                    sortKey={areaSortKey}
                    sortDir={areaSortDir}
                    onSort={toggleAreaSort}
                    className="px-3 py-3"
                  >
                    Area Name
                  </SortableTh>
                  <SortableTh
                    columnKey="tables"
                    sortKey={areaSortKey}
                    sortDir={areaSortDir}
                    onSort={toggleAreaSort}
                    className="px-3 py-3"
                  >
                    Tables
                  </SortableTh>
                  <SortableTh
                    columnKey="status"
                    sortKey={areaSortKey}
                    sortDir={areaSortDir}
                    onSort={toggleAreaSort}
                    className="px-3 py-3"
                  >
                    Status
                  </SortableTh>
                  <SortableTh
                    columnKey="created"
                    sortKey={areaSortKey}
                    sortDir={areaSortDir}
                    onSort={toggleAreaSort}
                    className="px-3 py-3"
                  >
                    Created Date
                  </SortableTh>
                  <SortableTh
                    columnKey="discountPercent"
                    sortKey={areaSortKey}
                    sortDir={areaSortDir}
                    onSort={toggleAreaSort}
                    className="px-3 py-3"
                  >
                    Discount (%)
                  </SortableTh>
=======
                  <th className="px-3 py-3">Area Name</th>
                  <th className="px-3 py-3">Tables</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Discount (%)</th>
>>>>>>> origin/main
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleAreas.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0 hover:bg-page/80"
                  >
                    <td className="px-3 py-3.5 font-medium text-ink">
                      {row.name}
                    </td>
                    <td className="px-3 py-3.5 text-muted">
                      {row.tables.length > 0
                        ? `${row.tables.length} table${row.tables.length === 1 ? '' : 's'}`
                        : '—'}
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleAreaStatus(row)}
                        className={`cursor-pointer text-sm font-medium ${
                          row.is_active
                            ? 'text-success hover:underline'
                            : 'text-muted hover:underline'
                        }`}
                      >
                        {row.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-3 py-3.5 text-muted">
                      {row.discount_percent}
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
                            onClick={() => setPendingDeleteArea(row)}
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
            Showing 1 to {visibleAreas.length} of {visibleAreas.length}{' '}
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
        outletId={encryptedOutletId ?? ''}
        onClose={() => setEditingTable(null)}
        onUpdate={(updated) => {
          setTables((prev) =>
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
      <ConfirmDeleteModal
        open={Boolean(pendingDeleteTable)}
        title="Delete Table"
        target={pendingDeleteTable?.table_no}
        message="This table will be removed from the floor plan."
        consequences={[
          'It can no longer be assigned to a new order.',
          'Existing bills keep the table name on their records.',
        ]}
        confirmLabel="Delete"
        onConfirm={confirmDeleteTable}
        onClose={() => setPendingDeleteTable(null)}
      />
      <ConfirmDeleteModal
        open={pendingBulkDelete}
        title="Delete Tables"
        target={`${selected.size} selected`}
        message={`${selected.size} table${selected.size === 1 ? '' : 's'} will be removed from the floor plan at once.`}
        consequences={[
          'None of them can be assigned to a new order.',
          'Existing bills keep their table names on the records.',
        ]}
        confirmLabel="Delete"
        onConfirm={removeSelectedTables}
        onClose={() => setPendingBulkDelete(false)}
      />
      <ConfirmDialog
        open={Boolean(pendingDeleteArea)}
        title="Delete dining area"
        target={pendingDeleteArea?.name}
        message={`${pendingDeleteArea?.name ?? 'This area'} will be removed from the floor plan.`}
        consequences={[
          pendingDeleteArea
            ? `${tables.filter((t) => t.area_id === pendingDeleteArea.id).length} table(s) in this area are removed from the floor map with it.`
            : 'Tables in this area are removed from the floor map with it.',
          'Running orders on these tables are not cancelled.',
        ]}
        note="The area is archived, not erased. Its tables stop appearing on the floor plan."
        confirmLabel="Delete area"
        onConfirm={() => void confirmDeleteArea()}
        onClose={() => setPendingDeleteArea(null)}
      />
    </MenuPageShell>
  )
}
