import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Percent, ShoppingCart } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { PrimaryButton } from '../components/menu/MenuActionButtons'
import { CategoryMultiSelect } from '../components/menu/CategoryMultiSelect'
import { CommissionTypeSelect } from '../components/menu/CommissionTypeSelect'
import { SearchableSelect } from '../components/inventory/SearchableSelect'
import { baseMenuCategories, menuItems } from '../mocks/menuItemsData'
import { addCommissionRow, type CommissionType } from '../mocks/itemCommissionData'

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required ? <span className="text-primary"> *</span> : null}
    </label>
  )
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:z-30">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {children ? (
        <div className="border-t border-line px-4 py-4">{children}</div>
      ) : null}
    </section>
  )
}

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

export default function AddCommission() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [selectedItemName, setSelectedItemName] = useState('')
  const [commissionType, setCommissionType] = useState<string>('Percentage')
  const [commissionValue, setCommissionValue] = useState('')

  const availableItemNames = useMemo(() => {
    return menuItems
      .filter((item) => {
        if (categoryIds.length > 0 && !categoryIds.includes(item.categoryId))
          return false
        return true
      })
      .map((item) => item.name)
  }, [categoryIds])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSave() {
    if (!commissionValue || Number(commissionValue) <= 0) {
      setError('Enter a valid commission value')
      return
    }

    const type = commissionType as CommissionType
    const value = Number(commissionValue)

    const targetItems = selectedItemName
      ? menuItems.filter((i) => i.name === selectedItemName)
      : availableItemNames.length > 0
        ? menuItems.filter((i) => availableItemNames.includes(i.name))
        : []

    targetItems.forEach((item) => {
      addCommissionRow({
        id: `ic-new-${Date.now()}-${item.id}`,
        itemName: item.name,
        categoryId: item.categoryId,
        categoryName:
          baseMenuCategories.find((c) => c.id === item.categoryId)?.name ??
          'Other',
        itemPrice: item.price,
        commissionType: type,
        commissionValue: value,
      })
    })

    setError('')
    showToast('Commission applied successfully')
    window.setTimeout(() => navigate('/menu/item-commission'), 800)
  }

  return (
    <MenuPageShell
      backTo="/menu/item-commission"
      activeItem="item-commission"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/menu')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/menu')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Menu
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/menu/item-commission')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/menu/item-commission')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Set Menu Commission
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Commission</span>
        </span>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <SectionCard icon={<ShoppingCart size={16} />} title="Commission Scope">
        <div className="space-y-4">
          <div>
            <FieldLabel>Category</FieldLabel>
            <CategoryMultiSelect
              options={baseMenuCategories}
              selectedIds={categoryIds}
              onChange={setCategoryIds}
            />
            <p className="mt-1 text-xs text-muted">
              Leave empty to search across all categories.
            </p>
          </div>

          <div>
            <SearchableSelect
              label="Item"
              value={selectedItemName}
              options={availableItemNames}
              placeholder="Select an item"
              searchPlaceholder="Search items..."
              includePlaceholderOption
              onChange={setSelectedItemName}
            />
            <p className="mt-1 text-xs text-muted">
              Leave empty to apply to all items in selected categories.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Percent size={16} />}
        title="Commission Settings"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel required>Commission Type</FieldLabel>
            <CommissionTypeSelect
              value={commissionType}
              onChange={setCommissionType}
              exclude={['all', 'Not Configured']}
            />
          </div>
          <div>
            <FieldLabel required>Commission Value</FieldLabel>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={commissionValue}
                onChange={(event) => setCommissionValue(event.target.value)}
                placeholder={
                  commissionType === 'Fixed'
                    ? 'Enter amount'
                    : 'Enter percentage'
                }
                className={`${inputClass} pr-10`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                {commissionType === 'Fixed'
                  ? '₹'
                  : commissionType === 'Percentage'
                    ? '%'
                    : ''}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {error ? <p className="mb-3 text-sm text-primary">{error}</p> : null}

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/menu/item-commission')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Apply Commission</PrimaryButton>
      </div>
    </MenuPageShell>
  )
}
