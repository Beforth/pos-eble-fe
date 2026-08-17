import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const CATEGORY_OPTIONS = [
  'Electricity',
  'Water',
  'Gas',
  'Internet',
  'Telephone',
  'Other',
]

const OPERATORS_BY_CATEGORY: Record<string, string[]> = {
  Electricity: [
    'MSEB / MSEDCL',
    'Adani Electricity',
    'Tata Power',
    'BESCOM',
    'Other',
  ],
  Water: ['Municipal Water', 'Private Water Supply', 'Other'],
  Gas: ['Indane', 'HP Gas', 'Bharat Gas', 'Other'],
  Internet: ['Airtel', 'Jio Fiber', 'BSNL', 'ACT Fibernet', 'Other'],
  Telephone: ['Airtel', 'Jio', 'BSNL', 'Vi', 'Other'],
  Other: ['Other'],
}

const selectClass =
  'h-10 w-full max-w-md rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function FormRow({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-4">
      <label className="text-sm font-medium text-ink">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default function AddUtilityBillOperator() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [operator, setOperator] = useState('')

  const operatorOptions = useMemo(
    () => (category ? OPERATORS_BY_CATEGORY[category] ?? ['Other'] : []),
    [category],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/accounting/utility-bills')
  }

  function handleSave() {
    if (!category || !operator) {
      showToast('Please select Category and Operator')
      return
    }
    showToast('Utility bill operator saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title="Add Utility Bill Operator"
      activeItem="acct-utility-bills"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-5 p-5 sm:p-6">
          <FormRow label="Category" required>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setOperator('')
              }}
              className={selectClass}
            >
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Operator" required>
            <select
              value={operator}
              onChange={(event) => setOperator(event.target.value)}
              disabled={!category}
              className={`${selectClass} disabled:cursor-not-allowed disabled:bg-page disabled:text-muted`}
            >
              <option value="">Select Operator</option>
              {operatorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormRow>
        </div>

        <div className="flex justify-end gap-2 border-t border-line bg-card px-5 py-3 sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
