import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Barcode, Trash2, X } from 'lucide-react'

interface LineItem {
  id: string
  rawMaterial: string
  qty: string
  unit: string
  price: string
  amount: string
  cgst: string
  sgst: string
  igst: string
}

interface ScanPurchaseModalProps {
  open: boolean
  onClose: () => void
  onSave?: () => void
}

const SUPPLIERS = ['The Bandhan', 'Fresh Mart', 'Daily Dairy', 'Veggie Hub']
const RAW_MATERIALS = [
  { name: 'Tomatoes', unit: 'Kg' },
  { name: 'Onion', unit: 'Kg' },
  { name: 'Paneer', unit: 'Kg' },
  { name: 'Milk', unit: 'Ltr' },
  { name: 'Butter', unit: 'Kg' },
  { name: 'Flour', unit: 'Kg' },
]

function emptyLine(): LineItem {
  return {
    id: `line-${Date.now()}-${Math.random()}`,
    rawMaterial: '',
    qty: '',
    unit: '',
    price: '',
    amount: '',
    cgst: '',
    sgst: '',
    igst: '',
  }
}

function toNumber(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function ScanPurchaseModal({
  open,
  onClose,
  onSave,
}: ScanPurchaseModalProps) {
  const [purchaseFrom, setPurchaseFrom] = useState<'supplier' | 'restaurant'>(
    'supplier',
  )
  const [supplier, setSupplier] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('2026-08-10')
  const [scanQuery, setScanQuery] = useState('')
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setPurchaseFrom('supplier')
    setSupplier('')
    setInvoiceDate('2026-08-10')
    setScanQuery('')
    setLines([emptyLine()])
    setError('')
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

  const totals = useMemo(() => {
    let tax = 0
    let grand = 0
    for (const line of lines) {
      const amount = toNumber(line.amount) || toNumber(line.qty) * toNumber(line.price)
      const lineTax =
        (amount * (toNumber(line.cgst) + toNumber(line.sgst) + toNumber(line.igst))) /
        100
      tax += lineTax
      grand += amount + lineTax
    }
    const roundOff = Math.round(grand) - grand
    return {
      tax,
      roundOff,
      grand: Math.round(grand * 1000) / 1000,
    }
  }, [lines])

  function updateLine(id: string, patch: Partial<LineItem>) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line
        const next = { ...line, ...patch }
        if ('qty' in patch || 'price' in patch) {
          const amount = toNumber(next.qty) * toNumber(next.price)
          next.amount = amount ? String(amount) : ''
        }
        return next
      }),
    )
  }

  function applyScan() {
    const q = scanQuery.trim().toLowerCase()
    if (!q) return
    const match = RAW_MATERIALS.find((m) => m.name.toLowerCase().includes(q))
    if (!match) {
      setError('No raw material matched that scan')
      return
    }
    setError('')
    setLines((prev) => {
      const firstEmpty = prev.find((line) => !line.rawMaterial)
      if (firstEmpty) {
        return prev.map((line) =>
          line.id === firstEmpty.id
            ? { ...line, rawMaterial: match.name, unit: match.unit, qty: '1' }
            : line,
        )
      }
      return [
        ...prev,
        {
          ...emptyLine(),
          rawMaterial: match.name,
          unit: match.unit,
          qty: '1',
        },
      ]
    })
    setScanQuery('')
  }

  function handleSave() {
    if (purchaseFrom === 'supplier' && !supplier) {
      setError('Please select a supplier')
      return
    }
    if (!invoiceDate) {
      setError('Invoice date is required')
      return
    }
    const validLine = lines.some(
      (line) => line.rawMaterial && toNumber(line.qty) > 0,
    )
    if (!validLine) {
      setError('Add at least one raw material with quantity')
      return
    }
    onSave?.()
    onClose()
  }

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
        aria-labelledby="scan-purchase-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2
            id="scan-purchase-title"
            className="text-base font-semibold text-ink"
          >
            Scan &amp; Purchase
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-md p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-ink">Purchase From</span>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="purchase-from"
                checked={purchaseFrom === 'supplier'}
                onChange={() => setPurchaseFrom('supplier')}
                className="size-4 accent-primary"
              />
              Supplier
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="purchase-from"
                checked={purchaseFrom === 'restaurant'}
                onChange={() => setPurchaseFrom('restaurant')}
                className="size-4 accent-primary"
              />
              Restaurant
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {purchaseFrom === 'supplier' ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Supplier <span className="text-primary">*</span>
                </label>
                <select
                  value={supplier}
                  onChange={(event) => setSupplier(event.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select Supplier</option>
                  {SUPPLIERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Restaurant <span className="text-primary">*</span>
                </label>
                <select className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary">
                  <option>Annapurna&apos;s Rajubhai Dabeliwale — Dadar</option>
                </select>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Invoice Date <span className="text-primary">*</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(event) => setInvoiceDate(event.target.value)}
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="relative block">
            <Barcode
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={scanQuery}
              onChange={(event) => setScanQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyScan()
                }
              }}
              placeholder="Scan Raw Materials"
              className="h-11 w-full rounded-md border border-line bg-card pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
                <tr>
                  <th className="px-3 py-2.5">Raw Material Name *</th>
                  <th className="px-3 py-2.5">Qty *</th>
                  <th className="px-3 py-2.5">Unit *</th>
                  <th className="px-3 py-2.5">Price</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">Tax (%)</th>
                  <th className="w-10 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr
                    key={line.id}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-3 py-2">
                      <select
                        value={line.rawMaterial}
                        onChange={(event) => {
                          const material = RAW_MATERIALS.find(
                            (m) => m.name === event.target.value,
                          )
                          updateLine(line.id, {
                            rawMaterial: event.target.value,
                            unit: material?.unit ?? '',
                          })
                        }}
                        className="h-9 w-full min-w-[160px] rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                      >
                        <option value="">Select Raw Material</option>
                        {RAW_MATERIALS.map((material) => (
                          <option key={material.name} value={material.name}>
                            {material.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={line.qty}
                        onChange={(event) =>
                          updateLine(line.id, { qty: event.target.value })
                        }
                        className="h-9 w-20 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={line.unit}
                        onChange={(event) =>
                          updateLine(line.id, { unit: event.target.value })
                        }
                        className="h-9 w-24 rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                      >
                        <option value="">Unit</option>
                        <option value="Kg">Kg</option>
                        <option value="Ltr">Ltr</option>
                        <option value="Pcs">Pcs</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={line.price}
                        onChange={(event) =>
                          updateLine(line.id, { price: event.target.value })
                        }
                        className="h-9 w-24 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={line.amount}
                        onChange={(event) =>
                          updateLine(line.id, { amount: event.target.value })
                        }
                        className="h-9 w-24 rounded-md border border-line px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="CGST%"
                          value={line.cgst}
                          onChange={(event) =>
                            updateLine(line.id, { cgst: event.target.value })
                          }
                          className="h-9 w-16 rounded-md border border-line px-1.5 text-xs outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="SGST%"
                          value={line.sgst}
                          onChange={(event) =>
                            updateLine(line.id, { sgst: event.target.value })
                          }
                          className="h-9 w-16 rounded-md border border-line px-1.5 text-xs outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="IGST%"
                          value={line.igst}
                          onChange={(event) =>
                            updateLine(line.id, { igst: event.target.value })
                          }
                          className="h-9 w-16 rounded-md border border-line px-1.5 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        aria-label="Remove row"
                        disabled={lines.length <= 1}
                        onClick={() =>
                          setLines((prev) =>
                            prev.filter((row) => row.id !== line.id),
                          )
                        }
                        className="rounded p-1.5 text-muted hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, emptyLine()])}
            className="text-sm font-semibold text-primary hover:underline"
          >
            + Add row
          </button>

          {error ? <p className="text-xs text-primary">{error}</p> : null}
        </div>

        <div className="shrink-0 border-t border-line bg-page/70 px-5 py-3">
          <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-ink">
            <span>
              Total Tax: <strong>{totals.tax.toFixed(3)}</strong>
            </span>
            <span>
              Round off: <strong>{totals.roundOff.toFixed(3)}</strong>
            </span>
            <span>
              Grand total: <strong>{totals.grand.toFixed(3)}</strong>
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Add Purchase
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
