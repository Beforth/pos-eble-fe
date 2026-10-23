import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { showToast } from '../../utils/toast'

const STORAGE_KEY = 'rajubhai.dualScreen'

interface DualScreenSettings {
  active: boolean
  showTip: boolean
  showCustomerInfo: boolean
}

const DEFAULTS: DualScreenSettings = {
  active: false,
  showTip: false,
  showCustomerInfo: false,
}

function loadSettings(): DualScreenSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

interface DualScreenDrawerProps {
  open: boolean
  onClose: () => void
}

interface OptionRowProps {
  label: string
  checked: boolean
  disabled?: boolean
  note?: string
  onChange?: (checked: boolean) => void
}

function OptionRow({ label, checked, disabled, note, onChange }: OptionRowProps) {
  return (
    <div className="border-b border-dashed border-line py-4">
      <label
        className={`flex items-center gap-2 text-sm ${
          disabled ? 'text-muted' : 'text-ink'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          className="size-4 accent-primary"
        />
        {label}
      </label>
      {note && <p className="mt-2 text-xs text-primary">{note}</p>}
    </div>
  )
}

export function DualScreenDrawer({ open, onClose }: DualScreenDrawerProps) {
  const [form, setForm] = useState<DualScreenSettings>(loadSettings)

  useEffect(() => {
    if (!open) return
    setForm(loadSettings())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      showToast('Dual screen settings saved')
      onClose()
    } catch {
      showToast('Could not save dual screen settings')
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="dual-screen-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col rounded-l-2xl bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 id="dual-screen-title" className="text-base font-medium text-ink">
            Dual Screen Configuration
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          <OptionRow
            label="Activate second screen"
            checked={form.active}
            onChange={(active) => setForm((prev) => ({ ...prev, active }))}
          />
          <OptionRow
            label="Display dynamic QR code on bill completion"
            checked={false}
            disabled
            note="Note: Once the QR code payment is activated, it will appear on the dual screen."
          />
          <OptionRow
            label="Display tip option at bottom of screen"
            checked={form.showTip}
            onChange={(showTip) => setForm((prev) => ({ ...prev, showTip }))}
          />
          <OptionRow
            label="Show customer information and order instructions"
            checked={form.showCustomerInfo}
            onChange={(showCustomerInfo) =>
              setForm((prev) => ({ ...prev, showCustomerInfo }))
            }
          />

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Save Changes
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
