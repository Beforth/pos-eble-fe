import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ClipboardList,
  Pencil,
  Plus,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  ActionDropdown,
  ImportExcelDropdown,
  OutlineButton,
  PrimaryButton,
  RowActionButton,
  SearchByFilterDropdown,
  type SearchByFilterValue,
} from '../components/menu/MenuActionButtons'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'
import { ShowChangesModal } from '../components/menu/ShowChangesModal'
import { menuAddonGroups } from '../mocks/menuSectionData'

export default function AddonsManagement() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState(menuAddonGroups)
  const [departmentQuery, setDepartmentQuery] = useState('')
  const [itemQuery, setItemQuery] = useState('')
  const [searchBy, setSearchBy] = useState<SearchByFilterValue>('all')
  const [appliedDept, setAppliedDept] = useState('')
  const [appliedItem, setAppliedItem] = useState('')
  const [appliedSearchBy, setAppliedSearchBy] =
    useState<SearchByFilterValue>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [changesName, setChangesName] = useState<string | null>(null)

  const rows = useMemo(() => {
    const dept = appliedDept.trim().toLowerCase()
    const item = appliedItem.trim().toLowerCase()

    return groups.filter((row) => {
      const matchesDept =
        !dept || row.departmentName.toLowerCase().includes(dept)
      const matchesItem =
        !item ||
        row.onlineDisplayName.toLowerCase().includes(item) ||
        row.departmentName.toLowerCase().includes(item)

      const matchesFilter =
        appliedSearchBy === 'all'
          ? true
          : appliedSearchBy === 'active'
            ? row.status === 'Active'
            : appliedSearchBy === 'inactive'
              ? row.status === 'Inactive'
              : appliedSearchBy === 'assigned'
                ? Boolean(row.onlineDisplayName.trim())
                : !row.onlineDisplayName.trim()

      return matchesDept && matchesItem && matchesFilter
    })
  }, [appliedDept, appliedItem, appliedSearchBy, groups])

  const allSelected =
    rows.length > 0 && rows.every((row) => selected.has(row.id))

  function setSelectedStatus(status: 'Active' | 'Inactive') {
    if (selected.size === 0) return
    setGroups((prev) =>
      prev.map((row) =>
        selected.has(row.id) ? { ...row, status } : row,
      ),
    )
  }

  function removeSelected() {
    if (selected.size === 0) return
    setGroups((prev) => prev.filter((row) => !selected.has(row.id)))
    setSelected(new Set())
  }

  function handleSearch() {
    setAppliedDept(departmentQuery)
    setAppliedItem(itemQuery)
    setAppliedSearchBy(searchBy)
  }

  function handleShowAll() {
    setDepartmentQuery('')
    setItemQuery('')
    setAppliedDept('')
    setAppliedItem('')
    setSearchBy('all')
    setAppliedSearchBy('all')
  }

  function handleDownloadSample() {
    const csv =
      'Department Name,Online Display Name,Rank,Status\nCheese,Cheese,1,Active\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'addon-groups-sample.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleUpload() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.xlsx,.xls'
    input.click()
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
          <span className="font-semibold text-ink">Addon Management</span>
        </span>
      }
    >
      <MenuSectionNav activeTab="addons" />

      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <PrimaryButton onClick={() => navigate('/menu/addons/new')}>
          <Plus size={15} />
          Add New Addon Group
        </PrimaryButton>
        <ActionDropdown
          options={[
            {
              label: 'Active',
              onClick: () => setSelectedStatus('Active'),
            },
            {
              label: 'Inactive',
              onClick: () => setSelectedStatus('Inactive'),
            },
            { label: 'Update in Online' },
            { label: 'Update in POS' },
            { label: 'Update in Captain' },
            { label: 'Remove', onClick: removeSelected },
          ]}
        />
        <OutlineButton variant="gray">Export Excel</OutlineButton>
        <ImportExcelDropdown
          onUpload={handleUpload}
          onDownloadSample={handleDownloadSample}
        />
      </div>

      <div className="mb-4 rounded-lg border border-line bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Department Name
            </label>
            <input
              type="text"
              value={departmentQuery}
              onChange={(event) => setDepartmentQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Addon Item Name
            </label>
            <input
              type="text"
              value={itemQuery}
              onChange={(event) => setItemQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <SearchByFilterDropdown
            label="Search By Department"
            value={searchBy}
            onChange={setSearchBy}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <OutlineButton onClick={handleSearch}>Search</OutlineButton>
          <OutlineButton variant="gray" onClick={handleShowAll}>
            Show All
          </OutlineButton>
          <OutlineButton>Update Rank</OutlineButton>
          <OutlineButton>Assign Addons</OutlineButton>
        </div>
      </div>

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
                      allSelected ? new Set() : new Set(rows.map((r) => r.id)),
                    )
                  }
                  className="cursor-pointer accent-primary"
                />
              </th>
              <th className="px-3 py-3">Department Name</th>
              <th className="px-3 py-3">Online Display Name</th>
              <th className="px-3 py-3">Rank</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3">Modified</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-line last:border-b-0 hover:bg-page/80 ${
                  index % 2 === 1 ? 'bg-primary/[0.02]' : ''
                }`}
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
                <td className="px-3 py-3.5">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-ink hover:text-primary"
                  >
                    <ChevronDown size={14} className="text-muted" />
                    {row.departmentName}
                  </button>
                </td>
                <td className="px-3 py-3.5 text-ink">{row.onlineDisplayName}</td>
                <td className="px-3 py-3.5 tabular-nums text-ink">{row.rank}</td>
                <td className="px-3 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      row.status === 'Active'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted/15 text-muted'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-muted">{row.created}</td>
                <td className="px-3 py-3.5 text-muted">{row.modified}</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1">
                    <RowActionButton
                      label="Edit"
                      onClick={() => navigate(`/menu/addons/${row.id}/edit`)}
                    >
                      <Pencil size={16} />
                    </RowActionButton>
                    <RowActionButton
                      label="Show Changes"
                      onClick={() => setChangesName(row.departmentName)}
                    >
                      <ClipboardList size={16} />
                    </RowActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">
        Note : <span className="font-medium text-primary">Drag row</span> to
        change order/rank.
      </p>

      <ShowChangesModal
        open={Boolean(changesName)}
        name={changesName}
        onClose={() => setChangesName(null)}
      />
    </MenuPageShell>
  )
}
