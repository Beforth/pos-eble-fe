import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader, RefreshCw, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import {
  getStoreStatusApi,
  setStoreStatusApi,
  type StorePlatform,
  type StoreStatusRow,
} from '../../services/onlineOrderApi'
import { showToast } from '../../utils/toast'

const LOGOS: Record<StorePlatform, string> = {
  swiggy: '/swiggy.png',
  zomato: '/zomato.png',
}

const DEFAULT_ROWS: StoreStatusRow[] = [
  { platform: 'swiggy', name: 'Swiggy', open: null },
  { platform: 'zomato', name: 'Zomato', open: null },
]

interface StoreStatusDrawerProps {
  open: boolean
  onClose: () => void
}

function StoreSwitch({
  value,
  disabled,
  onChange,
  label,
}: {
  value: boolean | null
  disabled: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  const on = value === true
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-tooltip={on ? 'Turn off' : 'Turn on'}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        on ? 'bg-success' : 'bg-line'
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

/** Opens from the header's Store icon: switch the store on or off at Swiggy and Zomato. */
export function StoreStatusDrawer({ open, onClose }: StoreStatusDrawerProps) {
  const { encryptedOutletId } = useAuth()
  const [rows, setRows] = useState<StoreStatusRow[]>(DEFAULT_ROWS)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    try {
      const result = await getStoreStatusApi(encryptedOutletId)
      setRows(result.stores)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not read the store status')
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  async function update(platform: StorePlatform, next: boolean) {
    if (!encryptedOutletId) return
    const before = rows
    setBusy(platform)
    setRows((prev) =>
      prev.map((row) => (row.platform === platform ? { ...row, open: next } : row)),
    )
    try {
      await setStoreStatusApi(encryptedOutletId, { platform, open: next })
      showToast(`${platform === 'swiggy' ? 'Swiggy' : 'Zomato'} store turned ${next ? 'on' : 'off'}`)
    } catch (err) {
      setRows(before)
      showToast(err instanceof Error ? err.message : 'Could not update the store status')
    } finally {
      setBusy(null)
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close store status"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-status-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col rounded-l-2xl bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 id="store-status-title" className="text-base font-medium text-ink">
            Store on/off Status
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-line p-4">
            <div>
              <p className="text-sm font-medium text-ink">Update All Store Status</p>
              <p className="mt-1 text-xs text-muted">
                Update all stores makes it easy &amp; fast to keep all outlet&apos;s information
                up-to-date in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:border-primary hover:text-primary disabled:opacity-60"
            >
              {loading ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Update All Stores
            </button>
          </div>

          <ul className="divide-y divide-line rounded-lg border border-line">
            {rows.map((row) => (
              <li key={row.platform} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="flex items-center gap-3 text-sm text-ink">
                  <img src={LOGOS[row.platform]} alt="" className="size-8 rounded-lg object-contain" />
                  {row.name}
                </span>
                <span className="flex items-center gap-3">
                  {row.open === null && !loading && (
                    <span className="text-xs text-muted">Status unknown</span>
                  )}
                  <StoreSwitch
                    value={row.open}
                    disabled={busy === row.platform}
                    onChange={(next) => void update(row.platform, next)}
                    label={`${row.name} store on or off`}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
