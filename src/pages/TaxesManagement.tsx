import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, ClipboardList, Pencil, Plus } from 'lucide-react'
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
import { menuTaxes } from '../mocks/menuSectionData'

export default function TaxesManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const savedTaxType =
    (location.state as { taxType?: 'item' | 'order' } | null)?.taxType ?? 'order'
  const [taxes, setTaxes] = useState(menuTaxes)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [taxType] = useState<'item' | 'order'>(savedTaxType)
  const [changesName, setChangesName] = useState<string | null>(null)
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)

  const allSelected =
    taxes.length > 0 && taxes.every((row) => selected.has(row.id))

  function setSelectedStatus(status: 'Active' | 'Inactive') {
    if (selected.size === 0) {
      setSelectAlertOpen(true)
      return
    }
    setTaxes((prev) =>
      prev.map((row) => (selected.has(row.id) ? { ...row, status } : row)),
    )
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
          <span className="font-semibold text-ink">Tax Configuration</span>
        </span>
      }
    >
      <MenuSectionNav activeTab="taxes" />

      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <PrimaryButton onClick={() => navigate('/menu/taxes/new')}>
          <Plus size={15} />
          Add Tax
        </PrimaryButton>
        <OutlineButton
          variant="gray"
          onClick={() => navigate('/menu/taxes/backward-printing')}
        >
          Backward Tax Printing Settings
        </OutlineButton>
        <OutlineButton variant="gray">Reset Bill No.</OutlineButton>
        <button
          type="button"
          onClick={() => navigate('/menu/taxes/item-order-wise')}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          Tax Type: {taxType === 'order' ? 'Order Wise' : 'Item Wise'}
          <ChevronDown size={14} className="text-muted" />
        </button>
        <ActionDropdown
          options={[
            {
              label: 'Active',
              onClick: () => setSelectedStatus('Active'),
            },
            {
              label: 'InActive',
              onClick: () => setSelectedStatus('Inactive'),
            },
          ]}
        />
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
                      allSelected
                        ? new Set()
                        : new Set(taxes.map((r) => r.id)),
                    )
                  }
                  className="cursor-pointer accent-primary"
                />
              </th>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3">Online Display Name</th>
              <th className="px-3 py-3">Tax Type</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxes.map((row) => (
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
                <td className="px-3 py-3.5 font-medium text-ink">{row.title}</td>
                <td className="px-3 py-3.5 text-ink">{row.onlineDisplayName}</td>
                <td className="px-3 py-3.5 text-ink">{row.taxType}</td>
                <td className="px-3 py-3.5 text-ink">{row.type}</td>
                <td className="px-3 py-3.5 tabular-nums text-ink">{row.amount}</td>
                <td
                  className={`px-3 py-3.5 font-medium ${
                    row.status === 'Active' ? 'text-success' : 'text-muted'
                  }`}
                >
                  {row.status}
                </td>
                <td className="px-3 py-3.5 text-muted">{row.created}</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1">
                    <RowActionButton
                      label="Edit"
                      onClick={() => navigate(`/menu/taxes/${row.id}/edit`)}
                    >
                      <Pencil size={16} />
                    </RowActionButton>
                    <RowActionButton
                      label="Show Changes"
                      onClick={() => setChangesName(row.title)}
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

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
      <ShowChangesModal
        open={Boolean(changesName)}
        name={changesName}
        onClose={() => setChangesName(null)}
      />
    </MenuPageShell>
  )
}
