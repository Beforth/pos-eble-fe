import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader, Pencil, X } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { listUsersApi, type UserSummary } from '../../services/userService'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

const STORAGE_KEY = 'rajubhai.billerLanguages'
const DEFAULT_LANGUAGE = 'Default Language'
const LANGUAGES = [DEFAULT_LANGUAGE, 'English', 'Hindi', 'Marathi', 'Gujarati']

function loadLanguages(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function isBiller(user: UserSummary): boolean {
  return user.role?.name.trim().toLowerCase() === 'biller'
}

interface EditDrawerProps {
  biller: UserSummary | null
  language: string
  onClose: () => void
  onSave: (language: string) => void
}

function EditBillerDrawer({ biller, language, onClose, onSave }: EditDrawerProps) {
  const open = biller !== null
  const [value, setValue] = useState(language)

  useEffect(() => {
    if (open) setValue(language)
  }, [open, language])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-biller-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col rounded-l-2xl bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 id="edit-biller-title" className="text-base font-medium text-ink">
            Edit Biller Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-md p-1.5 text-ink hover:bg-page"
          >
            <X size={20} />
          </button>
        </header>

        <div className="border-b border-line px-4 py-4">
          <div className="grid items-start gap-2 sm:grid-cols-[1fr_2fr]">
            <label htmlFor="biller-language" className="pt-2 text-sm text-ink">
              Language <span className="text-primary">*</span>
            </label>
            <div>
              <select
                id="biller-language"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
              >
                {LANGUAGES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-primary">
                Please choose the language which you want to see in system.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-line bg-card px-5 text-sm font-medium text-ink hover:border-primary hover:text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(value)}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  )
}

export default function BillerProfiles() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const [billers, setBillers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [languages, setLanguages] = useState<Record<string, string>>(loadLanguages)
  const [editing, setEditing] = useState<UserSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    listUsersApi()
      .then((users) => {
        if (!cancelled) setBillers(users.filter(isBiller))
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : 'Failed to load billers')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const closeDrawer = useCallback(() => setEditing(null), [])

  function handleSave(language: string) {
    if (!editing) return
    const next = { ...languages, [editing.id]: language }
    setLanguages(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      showToast('Biller profile saved')
    } catch {
      showToast('Could not save biller profile')
    }
    setEditing(null)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-bold text-ink">Biller Profile Listing</h1>
        <button
          type="button"
          onClick={() => navigate('/billing/operations')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-page text-left text-sm font-semibold text-ink">
                <th className="px-4 py-4">Biller Name</th>
                <th className="px-4 py-4">Biller Original Name</th>
                <th className="px-4 py-4">Type</th>
                <th className="w-20 px-4 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      Loading billers…
                    </span>
                  </td>
                </tr>
              ) : billers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted">
                    No billers found.
                  </td>
                </tr>
              ) : (
                billers.map((biller) => (
                  <tr key={biller.id} className="border-t border-line">
                    <td className="px-4 py-5 text-ink">
                      {biller.first_name || biller.name}
                    </td>
                    <td className="px-4 py-5 text-ink">{biller.name}</td>
                    <td className="px-4 py-5 text-ink">{biller.role?.name}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setEditing(biller)}
                        data-tooltip="Edit biller profile"
                        aria-label={`Edit ${biller.name}`}
                        className="inline-flex size-9 items-center justify-center rounded-md bg-page text-muted hover:text-primary"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <EditBillerDrawer
        biller={editing}
        language={(editing && languages[editing.id]) || DEFAULT_LANGUAGE}
        onClose={closeDrawer}
        onSave={handleSave}
      />
    </div>
  )
}
