import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { showToast } from '../utils/toast'
import { useAuth } from '../auth/AuthContext'
import { createDiningAreaApi } from '../services/menuService'

export default function AddArea() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [areaName, setAreaName] = useState('')
  const [active, setActive] = useState(true)
  const [discountPercent, setDiscountPercent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function goBack() {
    navigate('/menu/tables', { state: { tab: 'areas' } })
  }

  async function handleSave() {
    if (!areaName.trim()) {
      setError('Area name is required')
      return
    }
    if (!encryptedOutletId) {
      setError('Outlet not selected')
      return
    }
    setError('')
    setSaving(true)
    try {
      await createDiningAreaApi(encryptedOutletId, {
        name: areaName.trim(),
        is_active: active,
        discount_percent: discountPercent === '' ? '0' : discountPercent,
      })
      showToast('Area created successfully')
      window.setTimeout(() => goBack(), 800)
    } catch (err) {
      setSaving(false)
      showToast(
        err instanceof Error ? err.message : 'Failed to create area',
      )
    }
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
          <span className="font-semibold text-ink">Add Area</span>
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

      <div className="overflow-hidden rounded-lg border border-line bg-card">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-ink">Area Details</h2>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Area Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={areaName}
              onChange={(event) => setAreaName(event.target.value)}
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="max-w-xl">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Discount (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={discountPercent}
              onChange={(event) => setDiscountPercent(event.target.value)}
              placeholder="0"
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            Active
          </label>

          {error ? <p className="text-sm text-primary">{error}</p> : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-page/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}