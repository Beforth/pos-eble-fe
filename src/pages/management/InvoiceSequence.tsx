import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface InvoiceSequenceRow {
  id: string
  name: string
  prefix: string
  startNumber: string
  active: boolean
}

function ActionMenu({
  value,
  onChange,
}: {
  value: 'active' | 'inactive'
  onChange: (value: 'active' | 'inactive') => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        Action
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[140px] overflow-hidden rounded-lg border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onChange(value === 'inactive' ? 'active' : 'inactive')
                setOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-page ${
                value === 'inactive'
                  ? 'font-semibold text-primary'
                  : 'text-ink'
              }`}
            >
              {value === 'inactive' ? 'Active' : 'Inactive'}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export default function InvoiceSequence() {
  const navigate = useNavigate()
  const [nameQuery, setNameQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>(
    'active',
  )
  const [sequences] = useState<InvoiceSequenceRow[]>([])

  const filtered = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    return sequences.filter((row) => {
      const statusOk =
        statusFilter === 'active' ? row.active : !row.active
      const nameOk = !q || row.name.toLowerCase().includes(q)
      return statusOk && nameOk
    })
  }, [sequences, appliedQuery, statusFilter])

  function handleSearch() {
    setAppliedQuery(nameQuery.trim())
  }

  function handleShowAll() {
    setNameQuery('')
    setAppliedQuery('')
  }

  return (
    <ReportsPageShell
      title="Invoice Sequence"
      activeItem="config-outlet"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton
            onClick={() =>
              navigate('/management/configuration/outlet/invoice-sequence/add')
            }
          >
            Add Invoice Sequence
          </OutlineButton>
          <ActionMenu value={statusFilter} onChange={setStatusFilter} />
        </div>
      }
    >
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line p-4 sm:p-5">
          <label
            htmlFor="invoice-sequence-name"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Sequence Name
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="invoice-sequence-name"
              type="search"
              value={nameQuery}
              onChange={(event) => setNameQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              className="h-9 min-w-[200px] flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary sm:max-w-xs"
            />
            <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Show All
            </OutlineButton>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page">
              <Search
                size={48}
                strokeWidth={1.25}
                className="text-muted/45"
              />
            </span>
            <p className="text-base font-semibold text-ink">No Results Found.</p>
            <p className="mt-1 text-sm text-muted">
              We couldn&apos;t find a match for your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Sequence Name</th>
                  <th className="px-4 py-3">Prefix</th>
                  <th className="px-4 py-3">Start Number</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-ink">{row.name}</td>
                    <td className="px-4 py-3 text-ink">{row.prefix}</td>
                    <td className="px-4 py-3 text-ink">{row.startNumber}</td>
                    <td className="px-4 py-3 text-ink">
                      {row.active ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ReportsPageShell>
  )
}
