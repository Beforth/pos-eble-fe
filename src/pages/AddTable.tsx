import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, TableProperties } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { PrimaryButton } from '../components/menu/MenuActionButtons'

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children?: ReactNode
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

export default function AddTable() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [tableNo, setTableNo] = useState('')
  const [persons, setPersons] = useState('')
  const [extraInfo, setExtraInfo] = useState('')
  const [availableForReservation, setAvailableForReservation] = useState(true)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSave() {
    if (!tableNo.trim()) {
      setError('Table number is required')
      return
    }

    setError('')
    showToast('Table created successfully')
    window.setTimeout(() => navigate('/menu/tables'), 800)
  }

  return (
    <MenuPageShell
      backTo="/menu/tables"
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
            Menu Management
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/menu/tables')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/menu/tables')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Tables Management
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Table</span>
        </span>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <SectionCard
        icon={<TableProperties size={16} />}
        title="Table Details"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Table No <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={tableNo}
              onChange={(event) => setTableNo(event.target.value)}
              placeholder="e.g. A10:A20 or 1,2,3"
              className={inputClass}
            />
            <div className="mt-3 rounded-lg border border-line bg-page/60 px-3.5 py-3">
              <div className="mb-2 flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0 text-muted" />
                <p className="text-xs leading-relaxed text-muted">
                  Enter multiple table numbers or ranges. Use{' '}
                  <span className="font-semibold text-ink">comma (,)</span> for
                  multiple values and{' '}
                  <span className="font-semibold text-ink">colon (:)</span> for
                  ranges.
                </p>
              </div>
              <ul className="space-y-1 pl-5 text-xs leading-relaxed text-muted">
                <li>
                  <span className="font-medium text-ink">Range:</span>{' '}
                  A10:A20
                </li>
                <li>
                  <span className="font-medium text-ink">
                    Mixed range + single:
                  </span>{' '}
                  AA10:AA20,BB1
                </li>
                <li>
                  <span className="font-medium text-ink">
                    Multiple ranges:
                  </span>{' '}
                  A10:A100,B1:B20
                </li>
                <li>
                  <span className="font-medium text-ink">
                    Multiple tables:
                  </span>{' '}
                  1,2,3
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              No. of Persons
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={persons}
              onChange={(event) => setPersons(event.target.value)}
              placeholder="Max persons per table"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Extra Information
            </label>
            <textarea
              value={extraInfo}
              onChange={(event) => setExtraInfo(event.target.value)}
              rows={4}
              placeholder="Optional notes about this table..."
              className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              role="switch"
              aria-checked={availableForReservation}
              onClick={() => setAvailableForReservation((prev) => !prev)}
              className={`relative inline-flex h-8 w-14 cursor-pointer items-center rounded-full transition-colors ${
                availableForReservation ? 'bg-success' : 'bg-line'
              }`}
            >
              <span
                className={`inline-block size-6 rounded-full bg-white shadow-sm transition-transform ${
                  availableForReservation ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm font-medium text-ink">
              Available for Reservation
            </span>
          </div>
        </div>
      </SectionCard>

      {error ? <p className="mb-3 text-sm text-primary">{error}</p> : null}

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/menu/tables')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Table</PrimaryButton>
      </div>
    </MenuPageShell>
  )
}
