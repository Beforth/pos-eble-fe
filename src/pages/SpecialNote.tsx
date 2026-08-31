import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileUp, Plus, Search } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { AddSpecialNoteModal } from '../components/menu/AddSpecialNoteModal'
import { ImportSpecialNotesModal } from '../components/menu/ImportSpecialNotesModal'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
} from '../components/menu/MenuActionButtons'
import { SelectRecordAlert } from '../components/menu/SelectRecordAlert'

interface SpecialNoteRow {
  id: string
  name: string
  available: boolean
}

export default function SpecialNote() {
  const [nameQuery, setNameQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [notes, setNotes] = useState<SpecialNoteRow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

function showToast(message: string) {
  setToast(message)
  window.setTimeout(() => setToast(null), 2200)
}

  const filteredNotes = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((note) => note.name.toLowerCase().includes(q))
  }, [notes, appliedQuery])

  function requireSelection() {
    if (selectedIds.size === 0) {
      setSelectAlertOpen(true)
      return false
    }
    return true
  }

  function handleSearch() {
    setAppliedQuery(nameQuery.trim())
  }

  function handleShowAll() {
    setNameQuery('')
    setAppliedQuery('')
    showToast('Filters cleared')
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredNotes.length) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(filteredNotes.map((note) => note.id)))
  }

  function setAvailability(available: boolean) {
    if (!requireSelection()) return
    setNotes((prev) =>
      prev.map((note) =>
        selectedIds.has(note.id) ? { ...note, available } : note,
      ),
    )
    setSelectedIds(new Set())
  }

  function deleteSelected() {
    if (!requireSelection()) return
    setNotes((prev) => prev.filter((note) => !selectedIds.has(note.id)))
    setSelectedIds(new Set())
  }

  return (
    <MenuPageShell
      backTo="/menu"
      activeItem="special-note"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Special Note</span>
        </span>
      }
    >
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <PrimaryButton onClick={() => setAddOpen(true)}>
          <Plus size={15} />
          Add Special Note
        </PrimaryButton>
        <OutlineButton onClick={() => setImportOpen(true)}>
          <FileUp size={15} />
          Import
        </OutlineButton>
        <ActionDropdown
          options={[
            { label: 'Available', onClick: () => setAvailability(true) },
            { label: 'Not Available', onClick: () => setAvailability(false) },
            { label: 'Remove', onClick: deleteSelected, danger: true },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="border-b border-line p-4 sm:p-5">
          <label
            htmlFor="special-note-name"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Special Note Name
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="special-note-name"
              type="search"
              value={nameQuery}
              onChange={(event) => setNameQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
              className="h-9 min-w-[200px] flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary sm:max-w-xs"
            />
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Clear Filter
            </OutlineButton>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-14 text-center">
            <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search size={28} strokeWidth={1.75} />
            </span>
            <p className="text-base font-semibold text-ink">No Record Found</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              We could not find what you searched for Try searching again
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        filteredNotes.length > 0 &&
                        selectedIds.size === filteredNotes.length
                      }
                      onChange={toggleSelectAll}
                      className="size-4 accent-primary"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <tr
                    key={note.id}
                    className="border-b border-line last:border-b-0 hover:bg-page/60"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(note.id)}
                        onChange={() => toggleSelect(note.id)}
                        className="size-4 accent-primary"
                        aria-label={`Select ${note.name}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {note.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                          note.available
                            ? 'bg-success/10 text-success'
                            : 'bg-muted/15 text-muted'
                        }`}
                      >
                        {note.available ? 'Available' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddSpecialNoteModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={({ name, available }) => {
          setNotes((prev) => [
            {
              id: `sn-${Date.now()}`,
              name,
              available,
            },
            ...prev,
          ])
        }}
      />

      <ImportSpecialNotesModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onUpload={(file) => {
          void file.text().then((text) => {
            const lines = text
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean)
            const rows = lines.slice(1)
            const imported: SpecialNoteRow[] = []
            for (const row of rows) {
              const [rawName, rawAvailable] = row.split(',')
              const name = rawName?.replace(/^"|"$/g, '').trim()
              if (!name || name.toLowerCase() === 'name') continue
              const available = !/^(no|false|0|inactive)$/i.test(
                (rawAvailable ?? 'yes').trim(),
              )
              imported.push({
                id: `sn-${Date.now()}-${imported.length}`,
                name,
                available,
              })
            }
            if (imported.length) {
              setNotes((prev) => [...imported, ...prev])
            }
          })
        }}
      />

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}
    </MenuPageShell>
  )
}
