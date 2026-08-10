import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'

export default function AddTable() {
  const navigate = useNavigate()
  const [tableNo, setTableNo] = useState('')
  const [persons, setPersons] = useState('')
  const [extraInfo, setExtraInfo] = useState('')
  const [availableForReservation, setAvailableForReservation] = useState(true)

  function goBack() {
    navigate('/menu/tables')
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
          <span className="font-semibold text-ink">Add Table</span>
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

      <div className="rounded-lg border border-line bg-card p-5 sm:p-6">
        <div className="max-w-xl space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Table No <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={tableNo}
              onChange={(event) => setTableNo(event.target.value)}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
            <p className="mt-2 text-sm leading-relaxed text-primary">
              Note:- You can entered multiple table no or range using comma(,)
              and range using colon(:).
              <br />
              Examples:
              <br />
              1) Table Range - A10:A20.
              <br />
              2) Single Table and Table Range - AA10:AA20,BB1.
              <br />
              3) Multiple Table Range - A10:A100,B1:B20.
              <br />
              4) Multiple Table - 1,2,3
            </p>
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
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Extra Information
            </label>
            <textarea
              value={extraInfo}
              onChange={(event) => setExtraInfo(event.target.value)}
              rows={5}
              className="w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={availableForReservation}
              onChange={(event) =>
                setAvailableForReservation(event.target.checked)
              }
              className="size-4 cursor-pointer accent-primary"
            />
            Available for reservation
          </label>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-line pt-5">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-primary bg-card px-4 text-sm font-medium text-primary hover:bg-primary/5"
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
