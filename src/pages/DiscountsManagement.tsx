import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  ActionDropdown,
  PrimaryButton,
} from '../components/menu/MenuActionButtons'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'
import { NoRecordFound } from '../components/menu/NoRecordFound'
import { SelectRecordAlert } from '../components/menu/SelectRecordAlert'
import { useAuth } from '../auth/AuthContext'
import { showToast } from '../utils/toast'
import { listDiscountsApi } from '../services/menuService'
import type { Discount } from '../types/menu'

interface DiscountRow {
  id: string
  name: string
  type: string
  value: number | string
  maxAmount: number | string | null
  active: boolean
}

export default function DiscountsManagement() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [discounts, setDiscounts] = useState<DiscountRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) return
    listDiscountsApi(encryptedOutletId)
      .then((rows: Discount[]) => {
        if (cancelled) return
        setDiscounts(
          rows.map((row) => ({
            id: row.id,
            name: row.name,
            type: row.discount_type,
            value: row.value,
            maxAmount: row.max_amount,
            active: row.is_active,
          })),
        )
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load discounts',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  function requireSelection() {
    setSelectAlertOpen(true)
  }

  const allSelected =
    discounts.length > 0 && discounts.every((row) => selected.has(row.id))

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(discounts.map((r) => r.id)))
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
          <span className="font-semibold text-ink">Discount Configuration</span>
        </span>
      }
    >
      <MenuSectionNav activeTab="discounts" />

      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <PrimaryButton>Copy Discount To Outlet</PrimaryButton>
        <PrimaryButton onClick={() => navigate('/menu/discounts/new')}>
          <Plus size={15} />
          Add Discount
        </PrimaryButton>
        <ActionDropdown
          options={[
            { label: 'Active', onClick: requireSelection },
            { label: 'Inactive', onClick: requireSelection },
            { label: 'Delete', onClick: requireSelection },
          ]}
        />
      </div>

      {discounts.length === 0 ? (
        <NoRecordFound />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-sm font-semibold text-ink">
              <tr>
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="cursor-pointer accent-primary"
                  />
                </th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Value</th>
                <th className="px-3 py-3">Max Amount</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-b-0 hover:bg-page/80"
                >
                  <td className="px-3 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="cursor-pointer accent-primary"
                    />
                  </td>
                  <td className="px-3 py-3.5 font-medium text-ink">
                    {row.name}
                  </td>
                  <td className="px-3 py-3.5 text-ink">{row.type}</td>
                  <td className="px-3 py-3.5 tabular-nums text-ink">
                    {row.type === 'Percentage' ? `${row.value}%` : row.value}
                  </td>
                  <td className="px-3 py-3.5 tabular-nums text-ink">
                    {row.maxAmount === null ? '—' : row.maxAmount}
                  </td>
                  <td
                    className={`px-3 py-3.5 font-medium ${
                      row.active ? 'text-success' : 'text-muted'
                    }`}
                  >
                    {row.active ? 'Active' : 'Inactive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
    </MenuPageShell>
  )
}