import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Circle,
  Diamond,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  RotateCw,
  Square,
  Trash2,
} from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

type ShapeKind =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'semi'
  | 'rect'
  | 'oval'
  | 'barrier-v'
  | 'barrier-h'
  | 'table'

interface FloorItem {
  id: string
  kind: ShapeKind
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fontSize: number
}

const LIBRARY_TABLES = [
  { id: 'lib-1', label: '1' },
  { id: 'lib-2', label: '2' },
]

const SHAPE_TOOLS: {
  kind: ShapeKind
  label: string
  icon: 'circle' | 'square' | 'diamond' | 'semi' | 'rect' | 'oval'
}[] = [
  { kind: 'circle', label: 'Circle', icon: 'circle' },
  { kind: 'square', label: 'Square', icon: 'square' },
  { kind: 'diamond', label: 'Diamond', icon: 'diamond' },
  { kind: 'semi', label: 'Semi', icon: 'semi' },
  { kind: 'rect', label: 'Rectangle', icon: 'rect' },
  { kind: 'oval', label: 'Oval', icon: 'oval' },
]

function newId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function defaultSize(kind: ShapeKind): { width: number; height: number } {
  if (kind === 'barrier-v') return { width: 12, height: 120 }
  if (kind === 'barrier-h') return { width: 120, height: 12 }
  if (kind === 'rect' || kind === 'oval') return { width: 96, height: 56 }
  if (kind === 'semi') return { width: 72, height: 48 }
  return { width: 64, height: 64 }
}

function FloorPlanEmptyIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      className="text-muted/45"
    >
      <path
        d="M18 18h28v22h-10v14H18V18Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 18h4M18 14v4M46 18h4M46 14v4M18 54h4M14 54v-4M36 54h4M36 50v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 26h12M22 34h8M26 42v8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

function ShapeGlyph({
  kind,
  className = '',
}: {
  kind: ShapeKind | 'circle' | 'square' | 'diamond' | 'semi' | 'rect' | 'oval'
  className?: string
}) {
  const base = `border-2 border-muted/70 bg-page ${className}`
  switch (kind) {
    case 'circle':
      return <span className={`${base} size-7 rounded-full`} />
    case 'square':
      return <span className={`${base} size-7 rounded-sm`} />
    case 'diamond':
      return (
        <span className="flex size-7 items-center justify-center">
          <span className={`${base} size-5 rotate-45 rounded-sm`} />
        </span>
      )
    case 'semi':
      return (
        <span
          className={`${base} h-4 w-7 rounded-t-full border-b-0`}
          style={{ borderBottom: 'none' }}
        />
      )
    case 'rect':
      return <span className={`${base} h-5 w-8 rounded-sm`} />
    case 'oval':
      return <span className={`${base} h-5 w-8 rounded-full`} />
    case 'barrier-v':
      return <span className="h-8 w-1.5 rounded-sm bg-muted/70" />
    case 'barrier-h':
      return <span className="h-1.5 w-8 rounded-sm bg-muted/70" />
    default:
      return <span className={`${base} size-7 rounded-sm`} />
  }
}

function itemSurfaceClass(kind: ShapeKind) {
  switch (kind) {
    case 'circle':
      return 'rounded-full'
    case 'oval':
      return 'rounded-full'
    case 'diamond':
      return 'rounded-sm'
    case 'semi':
      return 'rounded-t-full'
    case 'barrier-v':
    case 'barrier-h':
      return 'rounded-sm bg-muted/80'
    default:
      return 'rounded-md'
  }
}

function NumberStepper({
  label,
  value,
  onChange,
  min = 1,
  max = 400,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-ink">
      <span className="whitespace-nowrap">{label}</span>
      <span className="inline-flex h-8 overflow-hidden rounded-md border border-line bg-card">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isFinite(next)) {
              onChange(Math.min(max, Math.max(min, next)))
            }
          }}
          className="w-14 border-0 bg-transparent px-2 text-sm outline-none"
        />
        <span className="flex flex-col border-l border-line">
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => onChange(Math.min(max, value + 1))}
            className="flex h-4 w-6 items-center justify-center text-[10px] text-muted hover:bg-page"
          >
            ▲
          </button>
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => onChange(Math.max(min, value - 1))}
            className="flex h-4 w-6 items-center justify-center border-t border-line text-[10px] text-muted hover:bg-page"
          >
            ▼
          </button>
        </span>
      </span>
    </label>
  )
}

export default function FloorPlan() {
  const [toast, setToast] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [planName, setPlanName] = useState('Floor Plan')
  const [renaming, setRenaming] = useState(false)
  const [items, setItems] = useState<FloorItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    id: string
    offsetX: number
    offsetY: number
  } | null>(null)

  const selected = items.find((item) => item.id === selectedId) ?? null

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const addItem = useCallback(
    (kind: ShapeKind, label?: string, at?: { x: number; y: number }) => {
      const size = defaultSize(kind)
      const canvas = canvasRef.current
      const baseX = at?.x ?? (canvas ? canvas.clientWidth / 2 - size.width / 2 : 120)
      const baseY = at?.y ?? (canvas ? canvas.clientHeight / 2 - size.height / 2 : 120)
      const count = items.filter((item) => item.kind === kind || item.kind === 'table').length
      const next: FloorItem = {
        id: newId(),
        kind,
        label: label ?? (kind.startsWith('barrier') ? '' : String(count + 1)),
        x: Math.max(8, baseX),
        y: Math.max(8, baseY),
        width: size.width,
        height: size.height,
        rotation: 0,
        fontSize: 14,
      }
      setItems((prev) => [...prev, next])
      setSelectedId(next.id)
    },
    [items],
  )

  function updateSelected(patch: Partial<FloorItem>) {
    if (!selectedId) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, ...patch } : item,
      ),
    )
  }

  function deleteSelected() {
    if (!selectedId) return
    setItems((prev) => prev.filter((item) => item.id !== selectedId))
    setSelectedId(null)
  }

  function handleDiscard() {
    setItems([])
    setSelectedId(null)
    setPreview(false)
    showToast('Changes discarded')
  }

  function handleSave() {
    showToast('Floor plan saved')
  }

  function handleBack() {
    setEditing(false)
    setPreview(false)
    setSelectedId(null)
  }

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      const drag = dragRef.current
      const canvas = canvasRef.current
      if (!drag || !canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = Math.round((event.clientX - rect.left - drag.offsetX) / 20) * 20
      const y = Math.round((event.clientY - rect.top - drag.offsetY) / 20) * 20
      setItems((prev) =>
        prev.map((item) =>
          item.id === drag.id
            ? {
                ...item,
                x: Math.max(0, Math.min(x, rect.width - item.width)),
                y: Math.max(0, Math.min(y, rect.height - item.height)),
              }
            : item,
        ),
      )
    }

    function onPointerUp() {
      dragRef.current = null
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  if (!editing) {
    return (
      <ReportsPageShell
        title="Floor Plan"
        activeItem="config-floor-plan"
        actions={
          <PrimaryButton
            onClick={() => {
              setEditing(true)
              showToast('Floor plan editor opened')
            }}
          >
            <Plus size={15} />
            Create Floor Plan
          </PrimaryButton>
        }
      >
        {toast ? (
          <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
            {toast}
          </div>
        ) : null}
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
          <span className="mb-5 flex size-28 items-center justify-center rounded-full bg-page">
            <FloorPlanEmptyIcon />
          </span>
          <p className="text-base font-semibold text-ink">
            No Floor Plan Available
          </p>
        </div>
      </ReportsPageShell>
    )
  }

  return (
    <ReportsPageShell
      title="Floor Plan"
      activeItem="config-floor-plan"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OutlineButton
            variant="gray"
            onClick={() => {
              setPreview((prev) => !prev)
              showToast(preview ? 'Edit mode' : 'Preview mode')
            }}
          >
            {preview ? 'Edit' : 'Preview'}
          </OutlineButton>
          <OutlineButton variant="gray" onClick={handleDiscard}>
            Discard
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Floor Plan</PrimaryButton>
          <OutlineButton variant="gray" onClick={handleBack}>
            &lt; Back
          </OutlineButton>
        </div>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex min-h-[580px] flex-col lg:flex-row">
          {!preview ? (
            <aside className="w-full shrink-0 border-b border-line bg-card p-4 lg:w-48 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center gap-2">
                {renaming ? (
                  <input
                    autoFocus
                    value={planName}
                    onChange={(event) => setPlanName(event.target.value)}
                    onBlur={() => setRenaming(false)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') setRenaming(false)
                    }}
                    className="h-8 w-full rounded-md border border-line bg-card px-2 text-sm font-semibold outline-none focus:border-primary"
                  />
                ) : (
                  <h2 className="text-sm font-bold text-ink">{planName}</h2>
                )}
                <button
                  type="button"
                  aria-label="Rename floor plan"
                  onClick={() => setRenaming(true)}
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <p className="mb-2 text-xs font-medium text-muted">Other</p>
              <div className="flex flex-wrap gap-2">
                {LIBRARY_TABLES.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    title={`Add table ${table.label}`}
                    onClick={() => addItem('table', table.label)}
                    className="flex size-11 items-center justify-center rounded-sm bg-muted/35 text-sm font-semibold text-ink hover:bg-muted/55"
                  >
                    {table.label}
                  </button>
                ))}
              </div>
            </aside>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col">
            <div
              ref={canvasRef}
              className="relative min-h-[480px] flex-1 cursor-default bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)] bg-size-[20px_20px] bg-white"
              onClick={() => {
                if (!preview) setSelectedId(null)
              }}
            >
              {items.map((item) => {
                const isSelected = item.id === selectedId && !preview
                const isBarrier = item.kind.startsWith('barrier')
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!preview) setSelectedId(item.id)
                    }}
                    onPointerDown={(event) => {
                      if (preview) return
                      event.stopPropagation()
                      setSelectedId(item.id)
                      const canvas = canvasRef.current
                      if (!canvas) return
                      const rect = canvas.getBoundingClientRect()
                      dragRef.current = {
                        id: item.id,
                        offsetX: event.clientX - rect.left - item.x,
                        offsetY: event.clientY - rect.top - item.y,
                      }
                    }}
                    className={`absolute flex items-center justify-center border-2 select-none ${
                      isBarrier
                        ? 'border-transparent'
                        : 'border-muted/60 bg-page/90'
                    } ${itemSurfaceClass(item.kind)} ${
                      isSelected
                        ? 'z-10 ring-2 ring-primary ring-offset-1'
                        : 'z-[1]'
                    } ${preview ? 'cursor-default' : 'cursor-move'}`}
                    style={{
                      left: item.x,
                      top: item.y,
                      width: item.width,
                      height: item.height,
                      transform:
                        item.kind === 'diamond'
                          ? `rotate(${45 + item.rotation}deg)`
                          : `rotate(${item.rotation}deg)`,
                      fontSize: item.fontSize,
                    }}
                  >
                    {!isBarrier ? (
                      <span
                        className={`font-semibold text-ink ${
                          item.kind === 'diamond' ? '-rotate-45' : ''
                        }`}
                      >
                        {item.label}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            {!preview ? (
              <div className="flex flex-wrap items-center gap-3 border-t border-line bg-page/50 px-3 py-3">
                <NumberStepper
                  label="Height"
                  value={selected?.height ?? 64}
                  onChange={(height) => updateSelected({ height })}
                />
                <NumberStepper
                  label="Width"
                  value={selected?.width ?? 64}
                  onChange={(width) => updateSelected({ width })}
                />

                <div className="mx-1 hidden h-8 w-px bg-line sm:block" />

                <button
                  type="button"
                  aria-label="Rotate left"
                  disabled={!selected}
                  onClick={() =>
                    updateSelected({
                      rotation: ((selected?.rotation ?? 0) - 15 + 360) % 360,
                    })
                  }
                  className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page disabled:opacity-40"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Rotate right"
                  disabled={!selected}
                  onClick={() =>
                    updateSelected({
                      rotation: ((selected?.rotation ?? 0) + 15) % 360,
                    })
                  }
                  className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page disabled:opacity-40"
                >
                  <RotateCw size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Delete selected"
                  disabled={!selected}
                  onClick={deleteSelected}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>

                <div className="mx-1 hidden h-8 w-px bg-line sm:block" />

                <NumberStepper
                  label="Text Size"
                  value={selected?.fontSize ?? 14}
                  min={8}
                  max={48}
                  onChange={(fontSize) => updateSelected({ fontSize })}
                />

                <div className="mx-1 hidden h-8 w-px bg-line sm:block" />

                <div className="flex flex-wrap items-center gap-1.5">
                  {SHAPE_TOOLS.map((tool) => (
                    <button
                      key={tool.kind}
                      type="button"
                      title={tool.label}
                      aria-label={`Add ${tool.label}`}
                      onClick={() => addItem(tool.kind)}
                      className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card hover:border-primary/40 hover:bg-primary/5"
                    >
                      {tool.icon === 'circle' ? (
                        <Circle size={16} className="text-muted" />
                      ) : tool.icon === 'square' ? (
                        <Square size={16} className="text-muted" />
                      ) : tool.icon === 'diamond' ? (
                        <Diamond size={16} className="text-muted" />
                      ) : (
                        <ShapeGlyph kind={tool.icon} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mx-1 hidden h-8 w-px bg-line sm:block" />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-ink">Barriers</span>
                  <button
                    type="button"
                    title="Vertical barrier"
                    aria-label="Add vertical barrier"
                    onClick={() => addItem('barrier-v')}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="h-5 w-1 rounded-sm bg-muted" />
                  </button>
                  <button
                    type="button"
                    title="Horizontal barrier"
                    aria-label="Add horizontal barrier"
                    onClick={() => addItem('barrier-h')}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Minus size={16} className="text-muted" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
