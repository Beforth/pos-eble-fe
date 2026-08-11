import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'

type TaxCalcMode = 'item' | 'order'

export default function ItemOrderWiseTaxSettings() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<TaxCalcMode>('order')

  function goBack() {
    navigate('/menu/taxes')
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
            Item / Order wise Tax Settings
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
            Item / Order Wise Tax Settings
          </h2>
        </div>

        <div className="px-5 py-6 sm:px-6">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="radio"
                name="tax-calc-mode"
                checked={mode === 'item'}
                onChange={() => setMode('item')}
                className="size-4 cursor-pointer accent-primary"
              />
              Calculate Tax on Item Wise
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="radio"
                name="tax-calc-mode"
                checked={mode === 'order'}
                onChange={() => setMode('order')}
                className="size-4 cursor-pointer accent-primary"
              />
              Calculate Tax on Order Wise
            </label>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-page/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-primary bg-card px-4 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              navigate('/menu/taxes', {
                state: { taxType: mode },
              })
            }
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </MenuPageShell>
  )
}
