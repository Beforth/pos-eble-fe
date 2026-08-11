import { useState } from 'react'
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

export default function DiscountsManagement() {
  const navigate = useNavigate()
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)

  function requireSelection() {
    setSelectAlertOpen(true)
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

      <NoRecordFound />

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
    </MenuPageShell>
  )
}
