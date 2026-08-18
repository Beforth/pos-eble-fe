import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { List, Percent, SplitSquareHorizontal, Trash2, X } from 'lucide-react'
import type { CartLine } from './BillPanel'

type SplitTab = 'portion' | 'percentage' | 'item'

interface SplitBillModalProps {
  open: boolean
  total: number
  lines: CartLine[]
  onClose: () => void
  onSave: (result: {
    mode: SplitTab
    portions?: number
    percentages?: number[]
    itemGroups?: string[][]
    amounts: number[]
  }) => void
}

function TabButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted hover:text-ink'
      }`}
    >
      <span className={active ? 'text-primary' : 'text-muted'}>{children}</span>
      {label}
    </button>
  )
}

export function SplitBillModal({
  open,
  total,
  lines,
  onClose,
  onSave,
}: SplitBillModalProps) {
  const [tab, setTab] = useState<SplitTab>('portion')
  const [portionInput, setPortionInput] = useState('')
  const [percentFields, setPercentFields] = useState<string[]>(['', ''])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [parts, setParts] = useState<string[][]>([[], []])

  useEffect(() => {
    if (!open) return
    setTab('portion')
    setPortionInput('')
    setPercentFields(['', ''])
    setSelectedIds(new Set())
    setParts([[], []])
  }, [open, lines])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const portionCount = Math.max(0, Math.floor(Number(portionInput) || 0))

  const portionAmounts = useMemo(() => {
    if (portionCount < 2) return []
    const each = Number((total / portionCount).toFixed(2))
    const amounts = Array.from({ length: portionCount }, () => each)
    const sum = amounts.reduce((a, b) => a + b, 0)
    amounts[amounts.length - 1] = Number((total - (sum - each)).toFixed(2))
    return amounts
  }, [portionCount, total])

  const percentages = useMemo(
    () =>
      percentFields
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isFinite(n) && n > 0),
    [percentFields],
  )

  const percentSum = percentages.reduce((a, b) => a + b, 0)

  const percentageAmounts = useMemo(() => {
    if (percentSum <= 0) return []
    return percentages.map((p) => Number(((total * p) / 100).toFixed(2)))
  }, [percentages, percentSum, total])

  const assignedIds = useMemo(() => new Set(parts.flat()), [parts])

  const unassignedLines = useMemo(
    () => lines.filter((line) => !assignedIds.has(line.id)),
    [assignedIds, lines],
  )

  const allUnassignedSelected =
    unassignedLines.length > 0 &&
    unassignedLines.every((line) => selectedIds.has(line.id))

  const itemSplitAmounts = useMemo(() => {
    return parts.map((ids) =>
      Number(
        ids
          .reduce((sum, id) => {
            const line = lines.find((l) => l.id === id)
            return sum + (line ? line.price * line.qty : 0)
          }, 0)
          .toFixed(2),
      ),
    )
  }, [lines, parts])

  if (!open) return null

  function toggleSelectAll() {
    if (allUnassignedSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(unassignedLines.map((l) => l.id)))
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addSelectedToPart(partIndex: number) {
    if (selectedIds.size === 0) return
    const toAdd = [...selectedIds].filter((id) => !assignedIds.has(id))
    if (toAdd.length === 0) return
    setParts((prev) =>
      prev.map((ids, index) =>
        index === partIndex ? [...ids, ...toAdd] : ids,
      ),
    )
    setSelectedIds(new Set())
  }

  function removeFromPart(partIndex: number, lineId: string) {
    setParts((prev) =>
      prev.map((ids, index) =>
        index === partIndex ? ids.filter((id) => id !== lineId) : ids,
      ),
    )
  }

  function removePart(partIndex: number) {
    setParts((prev) => {
      if (prev.length <= 2) return prev
      return prev.filter((_, index) => index !== partIndex)
    })
  }

  function handleSave() {
    if (tab === 'portion') {
      if (portionCount < 2) return
      onSave({
        mode: 'portion',
        portions: portionCount,
        amounts: portionAmounts,
      })
      return
    }
    if (tab === 'percentage') {
      if (percentages.length < 2 || Math.abs(percentSum - 100) > 0.01) return
      onSave({
        mode: 'percentage',
        percentages,
        amounts: percentageAmounts,
      })
      return
    }
    const nonEmpty = parts.filter((p) => p.length > 0)
    if (nonEmpty.length < 2) return
    onSave({
      mode: 'item',
      itemGroups: nonEmpty,
      amounts: nonEmpty.map((ids) =>
        Number(
          ids
            .reduce((sum, id) => {
              const line = lines.find((l) => l.id === id)
              return sum + (line ? line.price * line.qty : 0)
            }, 0)
            .toFixed(2),
        ),
      ),
    })
  }

  const canSave =
    tab === 'portion'
      ? portionCount >= 2
      : tab === 'percentage'
        ? percentages.length >= 2 && Math.abs(percentSum - 100) <= 0.01
        : parts.filter((p) => p.length > 0).length >= 2

  const modalMaxWidth = tab === 'item' ? 'max-w-4xl' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close split bill"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Split Bill"
        className={`relative z-10 flex max-h-[min(92vh,640px)] w-full ${modalMaxWidth} flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Split Bill</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex shrink-0 border-b border-line">
          <TabButton
            active={tab === 'portion'}
            label="Portion Wise"
            onClick={() => setTab('portion')}
          >
            <SplitSquareHorizontal size={22} />
          </TabButton>
          <div className="w-px self-stretch bg-line" />
          <TabButton
            active={tab === 'percentage'}
            label="Percentage Wise"
            onClick={() => setTab('percentage')}
          >
            <Percent size={22} />
          </TabButton>
          <div className="w-px self-stretch bg-line" />
          <TabButton
            active={tab === 'item'}
            label="Item wise"
            onClick={() => setTab('item')}
          >
            <List size={22} />
          </TabButton>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === 'portion' ? (
            <div className="space-y-4">
              <p className="text-sm text-ink">
                Please enter number in which bill can be splited:
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">1 /</span>
                <input
                  type="number"
                  min={2}
                  value={portionInput}
                  onChange={(e) => setPortionInput(e.target.value)}
                  placeholder="Enter portion here."
                  className="h-10 min-w-0 flex-1 rounded-md border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
                />
              </div>
              {portionCount >= 2 ? (
                <ul className="space-y-1.5 rounded-lg border border-line bg-page/60 p-3 text-sm">
                  {portionAmounts.map((amount, index) => (
                    <li key={index} className="flex justify-between text-ink">
                      <span>Portion {index + 1}</span>
                      <span className="font-semibold tabular-nums">
                        ₹{amount.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {tab === 'percentage' ? (
            <div className="space-y-4">
              <p className="text-sm text-ink">Please provide only number</p>
              {percentFields.map((value, index) => (
                <label key={index} className="block text-sm text-ink">
                  Percentage Number:
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={value}
                    onChange={(e) =>
                      setPercentFields((prev) =>
                        prev.map((v, i) => (i === index ? e.target.value : v)),
                      )
                    }
                    placeholder={
                      index === 0
                        ? 'Enter percentage here like 80'
                        : index === 1
                          ? 'Enter percentage here like 20'
                          : 'Enter percentage here'
                    }
                    className="mt-1.5 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() => setPercentFields((prev) => [...prev, ''])}
                className="h-8 rounded bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Add More
              </button>
              {percentages.length > 0 ? (
                <ul className="space-y-1.5 rounded-lg border border-line bg-page/60 p-3 text-sm">
                  {percentageAmounts.map((amount, index) => (
                    <li key={index} className="flex justify-between text-ink">
                      <span>
                        Share {index + 1} ({percentages[index]}%)
                      </span>
                      <span className="font-semibold tabular-nums">
                        ₹{amount.toFixed(2)}
                      </span>
                    </li>
                  ))}
                  <li className="flex justify-between border-t border-line pt-1.5 text-xs text-muted">
                    <span>Total %</span>
                    <span
                      className={
                        Math.abs(percentSum - 100) <= 0.01
                          ? 'text-success'
                          : 'text-primary'
                      }
                    >
                      {percentSum.toFixed(0)}%
                    </span>
                  </li>
                </ul>
              ) : null}
            </div>
          ) : null}

          {tab === 'item' ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* All Items */}
              <div className="overflow-hidden rounded border border-line">
                <div className="flex items-center gap-2 bg-primary px-3 py-2.5 text-sm font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={allUnassignedSelected}
                    onChange={toggleSelectAll}
                    className="size-4 accent-white"
                    aria-label="Select all items"
                  />
                  All Items
                </div>
                <ul className="max-h-[320px] overflow-y-auto divide-y divide-line bg-white">
                  {unassignedLines.length === 0 ? (
                    <li className="px-3 py-6 text-center text-sm text-muted">
                      {lines.length === 0
                        ? 'No items on the bill'
                        : 'All items assigned to parts'}
                    </li>
                  ) : (
                    unassignedLines.map((line) => (
                      <li key={line.id}>
                        <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-ink hover:bg-page">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(line.id)}
                            onChange={() => toggleSelect(line.id)}
                            className="size-4 accent-primary"
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {line.name}
                          </span>
                          <span className="text-xs text-muted">
                            ₹{line.price * line.qty}
                          </span>
                        </label>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Parts */}
              <div className="space-y-3">
                {parts.map((partIds, partIndex) => (
                  <div
                    key={partIndex}
                    className="overflow-hidden rounded border border-line"
                  >
                    <div className="flex items-center gap-2 bg-primary px-3 py-2 text-sm font-semibold text-white">
                      <button
                        type="button"
                        onClick={() => addSelectedToPart(partIndex)}
                        className="rounded bg-white px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-page"
                      >
                        Add
                      </button>
                      <span>Part {partIndex + 1}</span>
                      <span className="ml-auto flex items-center gap-2">
                        {itemSplitAmounts[partIndex] > 0 ? (
                          <span className="text-xs font-medium">
                            ₹{itemSplitAmounts[partIndex].toFixed(2)}
                          </span>
                        ) : null}
                        {parts.length > 2 ? (
                          <button
                            type="button"
                            aria-label={`Delete Part ${partIndex + 1}`}
                            onClick={() => removePart(partIndex)}
                            className="rounded p-0.5 text-white/90 hover:bg-white/20 hover:text-white"
                          >
                            <Trash2 size={15} strokeWidth={2.25} />
                          </button>
                        ) : null}
                      </span>
                    </div>
                    <ul className="min-h-[72px] divide-y divide-line bg-white">
                      {partIds.length === 0 ? (
                        <li className="px-3 py-5 text-center text-xs text-muted">
                          Select items and click Add
                        </li>
                      ) : (
                        partIds.map((id) => {
                          const line = lines.find((l) => l.id === id)
                          if (!line) return null
                          return (
                            <li
                              key={id}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-ink"
                            >
                              <button
                                type="button"
                                aria-label={`Remove ${line.name}`}
                                onClick={() =>
                                  removeFromPart(partIndex, id)
                                }
                                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ink text-white hover:bg-primary"
                              >
                                <X size={11} strokeWidth={3} />
                              </button>
                              <span className="min-w-0 flex-1 truncate">
                                {line.name}
                              </span>
                            </li>
                          )
                        })
                      )}
                    </ul>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setParts((prev) => [...prev, []])}
                  className="h-8 w-full rounded border border-dashed border-primary text-xs font-semibold text-primary hover:bg-primary/5"
                >
                  + Add Part
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-primary bg-white px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  )
}
