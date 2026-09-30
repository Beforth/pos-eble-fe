import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { useOutletSettings } from '../services/useOutletSettings'
import { useAuth } from '../auth/AuthContext'
import { showToast } from '../utils/toast'

type PriceDisplay = 'without' | 'including'

export default function BackwardTaxPrintingSettings() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const [priceDisplay, setPriceDisplay] = useState<PriceDisplay>('without')
  const [showOnBill, setShowOnBill] = useState(false)

  const { loading, data, save } = useOutletSettings('print')

  const loadedRef = { current: false }
  useEffect(() => {
    if (!data || loadedRef.current) return
    loadedRef.current = true
    if (data.backward_tax_in_item_price != null) {
      setPriceDisplay(
        data.backward_tax_in_item_price ? 'including' : 'without',
      )
    }
    if (data.print_backward_tax != null) {
      setShowOnBill(Boolean(data.print_backward_tax))
    }
  }, [data])

  function goBack() {
    navigate('/menu/taxes')
  }

  async function handleSave() {
    if (!encryptedOutletId) return
    try {
      await save({
        backward_tax_in_item_price: priceDisplay === 'including',
        print_backward_tax: showOnBill,
      })
      showToast('Backward tax printing settings saved')
      goBack()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save settings',
      )
    }
  }

  if (loading && !data) {
    return (
      <MenuPageShell
        backTo="/menu/taxes"
        title={
          <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
            <Link to="/menu" className="text-primary hover-underline">
              Menu Management
            </Link>
            <span className="font-normal text-muted">&gt;</span>
            <Link to="/menu/taxes" className="text-primary hover:underline">
              Tax Configuration
            </Link>
            <span className="font-normal text-muted">&gt;</span>
            <span className="font-semibold text-ink">
              Backward Tax Printing Settings
            </span>
          </span>
        }
      >
        <div className="py-10 text-center text-sm text-muted">Loading…</div>
      </MenuPageShell>
    )
  }

  return (
    <MenuPageShell
      backTo="/menu/taxes"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link to="/menu" className="text-primary hover:underline">
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link to="/menu/taxes" className="text-primary hover:underline">
            Tax Configuration
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">
            Backward Tax Printing Settings
          </span>
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
          <h2 className="text-base font-semibold text-ink">
            Backward Tax Printing Settings
          </h2>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
              <input
                type="radio"
                name="backward-price-display"
                checked={priceDisplay === 'without'}
                onChange={() => setPriceDisplay('without')}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
              />
              <span>
                Individual Item price will be shown (without backward tax) on
                printed bill.
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
              <input
                type="radio"
                name="backward-price-display"
                checked={priceDisplay === 'including'}
                onChange={() => setPriceDisplay('including')}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
              />
              <span>
                Individual Item price will be shown (including backward tax) on
                printed bill.
              </span>
            </label>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={showOnBill}
              onChange={(event) => setShowOnBill(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            Show backward tax on printed bill.
          </label>
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
            onClick={() => void handleSave()}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
