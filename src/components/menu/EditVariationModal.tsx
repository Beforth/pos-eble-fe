import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import type { MenuVariation } from '../../mocks/menuSectionData'

const DEPARTMENT_OPTIONS = [
  'Select',
  'Size',
  'Portion',
  'Quantity',
  'Portion Size',
  'Customisation',
  'Preparation',
] as const

interface VariationModalProps {
  open: boolean
  mode: 'add' | 'edit'
  variation: MenuVariation | null
  onClose: () => void
  onSave: (variation: MenuVariation) => void
}

export function VariationModal({
  open,
  mode,
  variation,
  onClose,
  onSave,
}: VariationModalProps) {
  const [name, setName] = useState('')
  const [onlineDisplayName, setOnlineDisplayName] = useState('')
  const [department, setDepartment] = useState('Select')
  const [status, setStatus] = useState(true)
  const [deptOpen, setDeptOpen] = useState(false)
  const [deptQuery, setDeptQuery] = useState('')
  const deptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && variation) {
      setName(variation.name)
      setOnlineDisplayName(variation.onlineDisplayName)
      setDepartment(variation.departmentName || 'Select')
      setStatus(variation.status === 'Active')
    } else {
      setName('')
      setOnlineDisplayName('')
      setDepartment('Select')
      setStatus(true)
    }
    setDeptOpen(false)
    setDeptQuery('')
  }, [open, mode, variation])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (deptOpen) setDeptOpen(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose, deptOpen])

  useEffect(() => {
    if (!deptOpen) {
      setDeptQuery('')
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setDeptOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [deptOpen])

  const filteredDepartments = useMemo(() => {
    const q = deptQuery.trim().toLowerCase()
    if (!q) return DEPARTMENT_OPTIONS
    return DEPARTMENT_OPTIONS.filter((option) =>
      option.toLowerCase().includes(q),
    )
  }, [deptQuery])

  if (!open) return null
  if (mode === 'edit' && !variation) return null

  function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) return

    const next: MenuVariation = {
      id: mode === 'edit' && variation ? variation.id : `v-${Date.now()}`,
      name: trimmedName,
      onlineDisplayName: onlineDisplayName.trim(),
      departmentName: department === 'Select' ? '' : department,
      status: status ? 'Active' : 'Inactive',
      created:
        mode === 'edit' && variation
          ? variation.created
          : new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
      modified: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }

    onSave(next)
    onClose()
  }

  const title = mode === 'add' ? 'Add Variation' : 'Edit Variation'

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variation-modal-title"
        className="relative z-10 w-full max-w-3xl rounded-xl border border-line bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2
            id="variation-modal-title"
            className="text-base font-bold text-ink"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="variation-name"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Name <span className="text-primary">*</span>
              </label>
              <input
                id="variation-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm text-ink outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="variation-online-name"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Online Display Name
              </label>
              <input
                id="variation-online-name"
                type="text"
                value={onlineDisplayName}
                onChange={(event) => setOnlineDisplayName(event.target.value)}
                className="h-10 w-full rounded-md border border-line px-3 text-sm text-ink outline-none focus:border-primary"
              />
            </div>

            <div ref={deptRef} className="relative">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Department Name <span className="text-primary">*</span>
              </label>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={deptOpen}
                onClick={() => setDeptOpen((prev) => !prev)}
                className="flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-left text-sm text-ink hover:bg-page"
              >
                <span>{department}</span>
                <ChevronDown
                  size={14}
                  className={`text-muted transition-transform ${deptOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {deptOpen ? (
                <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
                  <div className="border-b border-line p-2">
                    <label className="flex h-9 items-center gap-2 rounded-md border border-line px-2.5">
                      <Search size={14} className="shrink-0 text-muted" />
                      <input
                        type="text"
                        value={deptQuery}
                        onChange={(event) => setDeptQuery(event.target.value)}
                        placeholder="Search"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                      />
                    </label>
                  </div>
                  <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
                    {filteredDepartments.map((option) => {
                      const active = option === department
                      return (
                        <li key={option}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setDepartment(option)
                              setDeptOpen(false)
                            }}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-page ${
                              active
                                ? 'bg-page font-medium text-ink'
                                : 'text-ink'
                            }`}
                          >
                            {option}
                            {active ? (
                              <Check size={14} className="text-success" />
                            ) : (
                              <span className="size-3.5" />
                            )}
                          </button>
                        </li>
                      )
                    })}
                    {filteredDepartments.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-muted">
                        No matches
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={status}
              onChange={(event) => setStatus(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            Status
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-10 cursor-pointer items-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

/** @deprecated Use VariationModal */
export function EditVariationModal(
  props: Omit<VariationModalProps, 'mode'> & { variation: MenuVariation | null },
) {
  return <VariationModal {...props} mode="edit" />
}
