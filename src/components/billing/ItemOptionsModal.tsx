import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { MenuItemRow } from '../../utils/menuAdapter'
import {
  priceSelection,
  selectionProblem,
  visibleAddonGroups,
  type OptionAddonGroup,
  type OptionSelection,
  type PricedSelection,
} from '../../utils/itemOptions'
import { formatINR } from '../../utils/format'

interface ItemOptionsModalProps {
  item: MenuItemRow
  onClose: () => void
  /** The picked options, already priced and named for the cart line. */
  onConfirm: (priced: PricedSelection) => void
  /** Enforce each add-on group's min and max (Addon Min-Max Validation). */
  checkAddonLimits?: boolean
  /** Add the item as soon as the choices are complete, without "Add to bill". */
  autoAdd?: boolean
}

function hint(group: OptionAddonGroup): string {
  if (group.max === 1 && group.min === 1) return 'Choose 1'
  if (group.max === 1) return 'Choose up to 1'
  if (group.min > 0 && group.max > 0) {
    return group.min === group.max
      ? `Choose ${group.min}`
      : `Choose ${group.min} to ${group.max}`
  }
  if (group.min > 0) return `Choose at least ${group.min}`
  if (group.max > 0) return `Choose up to ${group.max}`
  return 'Optional'
}

/**
 * Asked when an item with variations or add-ons is added to a bill. Variations
 * (Regular / Large) are required, one per group; add-ons follow each group's
 * own rules. The line goes in only when the choices are complete.
 */
/** A square option tile; `has-[:focus-visible]` keeps keyboard focus visible on the hidden input. */
function tileClass(active: boolean): string {
  return `relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-2 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40 ${
    active
      ? 'border-primary bg-primary/10 text-primary'
      : 'border-line bg-card text-ink hover:border-primary/40 hover:bg-page'
  }`
}

/** The tick in a tile's corner. */
function TileMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full border text-white ${
        active ? 'border-primary bg-primary' : 'border-line bg-card'
      }`}
    >
      {active ? <Check size={12} strokeWidth={3} /> : null}
    </span>
  )
}

export function ItemOptionsModal({
  item,
  onClose,
  onConfirm,
  checkAddonLimits = true,
  autoAdd = false,
}: ItemOptionsModalProps) {
  const options = item.options
  const [selection, setSelection] = useState<OptionSelection>(() => {
    const variations: Record<string, string> = {}
    // Start with a variation already chosen - "Regular" when the group has
    // one, else the first - so the cashier only changes it when asked to.
    for (const group of options?.variationGroups ?? []) {
      const regular = group.variations.find((v) => /^regular$/i.test(v.name.trim()))
      const first = regular ?? group.variations[0]
      if (first) variations[group.id] = first.id
    }
    return { variations, addons: {} }
  })

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const problem = useMemo(
    () => (options ? selectionProblem(options, selection, checkAddonLimits) : null),
    [options, selection, checkAddonLimits],
  )
  // Auto add: only after the cashier changes a choice, never on opening (the
  // preselected "Regular" must not skip the popup).
  const [touched, setTouched] = useState(false)
  const priced = useMemo(
    () =>
      options ? priceSelection(item.name, item.price, options, selection) : null,
    [item.name, item.price, options, selection],
  )

  const addonGroups = useMemo(
    () => (options ? visibleAddonGroups(options, selection) : []),
    [options, selection],
  )

  const confirmRef = useRef(onConfirm)
  useEffect(() => {
    confirmRef.current = onConfirm
  })
  // Auto add: once every add-on group the cashier sees has a pick (no groups
  // at all counts), the item goes in without pressing "Add to bill".
  const complete = addonGroups.every((group) => (selection.addons[group.id] ?? []).length > 0)
  useEffect(() => {
    if (autoAdd && touched && priced && problem === null && complete) {
      confirmRef.current(priced)
    }
  }, [autoAdd, touched, priced, problem, complete])

  if (!options || !priced) return null

  function toggleAddon(group: OptionAddonGroup, addonId: string) {
    setTouched(true)
    setSelection((prev) => {
      const current = prev.addons[group.id] ?? []
      let next: string[]
      if (current.includes(addonId)) {
        next = current.filter((id) => id !== addonId)
      } else if (group.max === 1) {
        next = [addonId] // single choice: picking another swaps it
      } else if (checkAddonLimits && group.max > 0 && current.length >= group.max) {
        return prev // at the limit; untick one first
      } else {
        next = [...current, addonId]
      }
      return { ...prev, addons: { ...prev.addons, [group.id]: next } }
    })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Choose options for ${item.name}`}
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-ink">
              {item.name}
            </h2>
            <p className="text-xs text-muted">Choose how it is served</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {options.variationGroups.map((group) => (
            <fieldset key={group.id}>
              <legend className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-ink">
                {group.name}
                <span className="text-xs font-medium text-primary">
                  Required
                </span>
              </legend>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {group.variations.map((variation) => {
                  const active = selection.variations[group.id] === variation.id
                  return (
                    <label key={variation.id} className={tileClass(active)}>
                      <input
                        type="radio"
                        name={`variation-${group.id}`}
                        checked={active}
                        onChange={() => {
                          setTouched(true)
                          setSelection((prev) => ({
                            ...prev,
                            variations: {
                              ...prev.variations,
                              [group.id]: variation.id,
                            },
                          }))
                        }}
                        className="sr-only"
                      />
                      <TileMark active={active} />
                      <span className="line-clamp-3 break-words text-sm font-semibold leading-tight">
                        {variation.name}
                      </span>
                      <span className="text-sm font-bold tabular-nums">
                        {formatINR(variation.price, 2)}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}

          {addonGroups.map((group) => {
            const picked = selection.addons[group.id] ?? []
            return (
              <fieldset key={group.id}>
                <legend className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-ink">
                  {group.name}
                  <span className="text-xs font-medium text-muted">
                    {hint(group)}
                  </span>
                </legend>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {group.addons.map((addon) => {
                    const active = picked.includes(addon.id)
                    return (
                      <label key={addon.id} className={tileClass(active)}>
                        <input
                          type={group.max === 1 ? 'radio' : 'checkbox'}
                          name={`addon-${group.id}`}
                          checked={active}
                          onChange={() => toggleAddon(group, addon.id)}
                          onClick={() => {
                            // A radio cannot be un-ticked by its own change
                            // event; clicking the chosen add-on clears it.
                            if (group.max === 1 && active && group.min === 0) {
                              toggleAddon(group, addon.id)
                            }
                          }}
                          className="sr-only"
                        />
                        <TileMark active={active} />
                        <span className="line-clamp-3 break-words text-sm font-semibold leading-tight">
                          {addon.name}
                        </span>
                        <span className="text-sm font-bold tabular-nums">
                          {addon.price > 0 ? `+ ${formatINR(addon.price, 2)}` : 'Free'}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            )
          })}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-xs text-muted">Price for one</p>
            <p className="text-lg font-bold tabular-nums text-ink">
              {formatINR(priced.price, 2)}
            </p>
            {problem ? (
              <p className="text-xs text-danger">{problem}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-page"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={problem !== null}
              onClick={() => onConfirm(priced)}
              className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to bill
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
