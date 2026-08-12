import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, FilePenLine, Plus, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface LineItem {
  id: string
  selected: boolean
  rawMaterial: string
  qty: string
  unit: string
  avgPurchasePrice: string
  amount: string
  note: string
}

const RAW_MATERIALS = [
  { name: 'Tomatoes', unit: 'Kg', avgPrice: '40.000' },
  { name: 'Onion', unit: 'Kg', avgPrice: '28.000' },
  { name: 'Paneer', unit: 'Kg', avgPrice: '320.000' },
  { name: 'Milk', unit: 'Ltr', avgPrice: '56.000' },
  { name: 'Butter', unit: 'Kg', avgPrice: '480.000' },
  { name: 'Flour', unit: 'Kg', avgPrice: '42.000' },
]
const MENU_ITEMS = [
  { name: 'Dabeli', unit: 'Pcs', avgPrice: '35.000' },
  { name: 'Vada Pav', unit: 'Pcs', avgPrice: '25.000' },
  { name: 'Misal Pav', unit: 'Pcs', avgPrice: '60.000' },
  { name: 'Tea', unit: 'Cup', avgPrice: '15.000' },
]
const UNITS = ['Kg', 'Ltr', 'Pcs', 'Box', 'Packet', 'Cup']
const WASTAGE_BY_AREA = [
  'Standard recipe',
  'Standard & Home Delivery',
  'Standard & Zomato',
  'Standard & Swiggy',
  'Standard & Parcel',
  'Standard & Home Website',
]

function emptyLine(): LineItem {
  return {
    id: `line-${Date.now()}-${Math.random()}`,
    selected: false,
    rawMaterial: '',
    qty: '',
    unit: '',
    avgPurchasePrice: '',
    amount: '',
    note: '',
  }
}

function toNumber(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatAmount(value: number) {
  return value.toFixed(3)
}

export default function AddWastage() {
  const navigate = useNavigate()
  const [wastageFor, setWastageFor] = useState<'raw-material' | 'item'>(
    'raw-material',
  )
  const [wastageDate, setWastageDate] = useState('2026-08-11')
  const [wastageByArea, setWastageByArea] = useState('Standard recipe')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const isItemMode = wastageFor === 'item'
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [noteLineId, setNoteLineId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const catalog = isItemMode ? MENU_ITEMS : RAW_MATERIALS
  const materialLabel = isItemMode ? 'Item' : 'Raw Material'

  const allSelected = lines.length > 0 && lines.every((line) => line.selected)
  const noteLine = lines.find((line) => line.id === noteLineId)
  const hasSelection = lines.some((line) => line.selected)

  const totalAmount = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const amount =
          toNumber(line.amount) ||
          toNumber(line.qty) * toNumber(line.avgPurchasePrice)
        return sum + amount
      }, 0),
    [lines],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function updateLine(id: string, patch: Partial<LineItem>) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line
        const next = { ...line, ...patch }
        if ('qty' in patch || 'avgPurchasePrice' in patch) {
          const qty = toNumber(next.qty)
          const price = toNumber(next.avgPurchasePrice)
          if (qty > 0 && price > 0) {
            next.amount = formatAmount(qty * price)
          }
        }
        return next
      }),
    )
  }

  function toggleAll(checked: boolean) {
    setLines((prev) => prev.map((line) => ({ ...line, selected: checked })))
  }

  function removeSelectedLines() {
    if (!hasSelection) {
      showToast('Select at least one row to remove')
      return
    }
    const remaining = lines.filter((line) => !line.selected)
    setLines(remaining.length > 0 ? remaining : [emptyLine()])
  }

  function handleWastageForChange(next: 'raw-material' | 'item') {
    setWastageFor(next)
    setLines([emptyLine()])
    setNoteLineId(null)
  }

  function handleSave() {
    if (!wastageDate) {
      setError('Date is required')
      return
    }
    const validLine = lines.some((line) => {
      if (!line.rawMaterial || toNumber(line.qty) <= 0) return false
      if (isItemMode) return true
      return Boolean(line.unit)
    })
    if (!validLine) {
      setError(
        isItemMode
          ? 'Add at least one item with quantity'
          : 'Add at least one raw material with quantity and unit',
      )
      return
    }
    setError('')
    setToast('Wastage saved')
    window.setTimeout(() => {
      setToast(null)
      navigate('/inventory/wastage')
    }, 900)
  }

  return (
    <InventoryPageShell activeItem="wastage">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink">Add Wastage Details</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-6 rounded-xl border border-line bg-card p-4">
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Wastage for</p>
          <div className="flex flex-wrap gap-4">
            {(
              [
                { value: 'raw-material', label: 'Raw Material' },
                { value: 'item', label: 'Item' },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
              >
                <input
                  type="radio"
                  name="wastage-for"
                  checked={wastageFor === option.value}
                  onChange={() => handleWastageForChange(option.value)}
                  className="size-4 accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <div className="min-w-[200px]">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Date <span className="text-primary">*</span>
          </label>
          <input
            type="date"
            value={wastageDate}
            onChange={(event) => setWastageDate(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        {isItemMode ? (
          <div className="min-w-[240px]">
            <SearchableSelect
              label="Wastage by area"
              value={wastageByArea}
              options={WASTAGE_BY_AREA}
              placeholder="Select area"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setWastageByArea}
            />
          </div>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <OutlineButton onClick={() => setLines((prev) => [...prev, emptyLine()])}>
          <Plus size={15} />
          Add New
        </OutlineButton>
        <OutlineButton variant="gray" onClick={removeSelectedLines}>
          Remove
        </OutlineButton>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleAll(event.target.checked)}
                  className="size-4 accent-primary"
                  aria-label="Select all rows"
                />
              </th>
              <th className="px-3 py-3">
                {materialLabel} <span className="text-primary">*</span>
              </th>
              <th className="px-3 py-3">
                Quantity <span className="text-primary">*</span>
              </th>
              {!isItemMode ? (
                <>
                  <th className="px-3 py-3">
                    Unit <span className="text-primary">*</span>
                  </th>
                  <th className="px-3 py-3">Average Purchase Price</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Action</th>
                </>
              ) : (
                <th className="px-3 py-3">Description</th>
              )}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-line last:border-b-0">
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={line.selected}
                    onChange={(event) =>
                      updateLine(line.id, { selected: event.target.checked })
                    }
                    className="size-4 accent-primary"
                    aria-label="Select row"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={line.rawMaterial}
                    onChange={(event) => {
                      const material = catalog.find(
                        (m) => m.name === event.target.value,
                      )
                      updateLine(line.id, {
                        rawMaterial: event.target.value,
                        unit: material?.unit ?? line.unit,
                        avgPurchasePrice:
                          material?.avgPrice ?? line.avgPurchasePrice,
                        amount:
                          material && toNumber(line.qty) > 0
                            ? formatAmount(
                                toNumber(line.qty) *
                                  toNumber(material.avgPrice),
                              )
                            : line.amount,
                      })
                    }}
                    className="h-9 w-full min-w-[180px] rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Select {materialLabel}</option>
                    {catalog.map((material) => (
                      <option key={material.name} value={material.name}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={line.qty}
                    onChange={(event) =>
                      updateLine(line.id, { qty: event.target.value })
                    }
                    placeholder="Quantity"
                    className="h-9 w-28 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                  />
                </td>
                {!isItemMode ? (
                  <>
                    <td className="px-3 py-2.5">
                      <select
                        value={line.unit}
                        onChange={(event) =>
                          updateLine(line.id, { unit: event.target.value })
                        }
                        className="h-9 min-w-[120px] rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                      >
                        <option value="">Select Unit</option>
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={line.avgPurchasePrice}
                        onChange={(event) =>
                          updateLine(line.id, {
                            avgPurchasePrice: event.target.value,
                          })
                        }
                        placeholder="Avg. Purchase Price"
                        className="h-9 w-36 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={line.amount}
                        onChange={(event) =>
                          updateLine(line.id, { amount: event.target.value })
                        }
                        placeholder="Amount"
                        className="h-9 w-28 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="Select batch"
                          onClick={() => {
                            if (!line.rawMaterial.trim()) {
                              setAlertMessage(
                                'Kindly ensure that Raw Material selected before selecting a batch.',
                              )
                              return
                            }
                            showToast(`Select batch for ${line.rawMaterial}`)
                          }}
                          className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-page text-ink hover:bg-line/40"
                        >
                          <Box size={15} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          aria-label="Add description"
                          onClick={() => {
                            setNoteDraft(line.note)
                            setNoteLineId(line.id)
                          }}
                          className={`inline-flex size-8 items-center justify-center rounded-md border border-line bg-page ${
                            line.note
                              ? 'text-primary'
                              : 'text-ink hover:bg-line/40'
                          }`}
                        >
                          <FilePenLine size={15} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          aria-label="Remove row"
                          onClick={() =>
                            setLines((prev) => {
                              const next = prev.filter(
                                (row) => row.id !== line.id,
                              )
                              return next.length > 0 ? next : [emptyLine()]
                            })
                          }
                          className="rounded p-1.5 text-primary hover:bg-primary/10"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Add description"
                        onClick={() => {
                          setNoteDraft(line.note)
                          setNoteLineId(line.id)
                        }}
                        className={`inline-flex size-8 items-center justify-center rounded-md border border-line bg-page ${
                          line.note
                            ? 'text-primary'
                            : 'text-ink hover:bg-line/40'
                        }`}
                      >
                        <FilePenLine size={15} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove row"
                        onClick={() =>
                          setLines((prev) => {
                            const next = prev.filter(
                              (row) => row.id !== line.id,
                            )
                            return next.length > 0 ? next : [emptyLine()]
                          })
                        }
                        className="rounded p-1.5 text-primary hover:bg-primary/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isItemMode ? (
        <div className="mt-4 flex justify-end text-sm text-ink">
          <span>
            Total Amount: <strong>{formatAmount(totalAmount)}</strong>
          </span>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-xs text-primary">{error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => navigate('/inventory/wastage')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
      </div>

      {noteLine ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close description"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setNoteLineId(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-description-title"
            className="relative z-10 w-full max-w-lg rounded-lg border border-line bg-card p-5 shadow-xl"
          >
            <h3
              id="add-description-title"
              className="sr-only"
            >
              Add Description
            </h3>
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={8}
              placeholder="Add Description"
              className="w-full resize-y rounded-md border border-line px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteLineId(null)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
              >
                Cancel
              </button>
              <PrimaryButton
                onClick={() => {
                  updateLine(noteLine.id, { note: noteDraft })
                  setNoteLineId(null)
                }}
              >
                Done
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}

      <SelectRecordAlert
        open={Boolean(alertMessage)}
        message={alertMessage ?? undefined}
        onClose={() => setAlertMessage(null)}
      />
    </InventoryPageShell>
  )
}
