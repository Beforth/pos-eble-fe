import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GripVertical, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'

type AlignOption = 'Left' | 'Center' | 'Right'
type PositionOption = 'Top' | 'Bottom'
type FontWeightOption = 'Normal' | 'Bold'
type FieldType =
  | 'Custom Label'
  | 'Raw Material Name'
  | 'Barcode'
  | 'Barcode Number'

interface ConfigField {
  id: string
  field: FieldType
  label: string
  align: AlignOption
  position: PositionOption
  fontSize: string
  fontWeight: FontWeightOption
  lockedField?: boolean
}

const FIELD_OPTIONS: FieldType[] = [
  'Custom Label',
  'Raw Material Name',
  'Barcode',
  'Barcode Number',
]
const ALIGN_OPTIONS: AlignOption[] = ['Left', 'Center', 'Right']
const POSITION_OPTIONS: PositionOption[] = ['Top', 'Bottom']
const FONT_WEIGHT_OPTIONS: FontWeightOption[] = ['Normal', 'Bold']

const DEFAULT_FIELDS: ConfigField[] = [
  {
    id: 'field-raw-material',
    field: 'Raw Material Name',
    label: 'Raw Material',
    align: 'Center',
    position: 'Top',
    fontSize: '5',
    fontWeight: 'Bold',
    lockedField: true,
  },
]

function emptyDraft(): Omit<ConfigField, 'id'> {
  return {
    field: 'Custom Label',
    label: 'Custom Label',
    align: 'Center',
    position: 'Top',
    fontSize: '5',
    fontWeight: 'Normal',
  }
}

function SelectCell({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-page disabled:text-muted"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default function BarcodeConfiguration() {
  const navigate = useNavigate()
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [textColor, setTextColor] = useState('#000000')
  const [alignment, setAlignment] = useState<'Column' | 'Row'>('Column')
  const [fields, setFields] = useState<ConfigField[]>(DEFAULT_FIELDS)
  const [draft, setDraft] = useState(emptyDraft)
  const [toast, setToast] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const previewTop = useMemo(
    () => fields.filter((f) => f.position === 'Top'),
    [fields],
  )
  const previewBottom = useMemo(
    () => fields.filter((f) => f.position === 'Bottom'),
    [fields],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleAdd() {
    if (!draft.label.trim()) return
    setFields((prev) => [
      ...prev,
      {
        id: `field-${Date.now()}-${Math.random()}`,
        ...draft,
        label: draft.label.trim(),
      },
    ])
    setDraft(emptyDraft())
  }

  function updateField(id: string, patch: Partial<ConfigField>) {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    )
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((field) => field.id !== id))
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      return
    }
    setFields((prev) => {
      const from = prev.findIndex((f) => f.id === dragId)
      const to = prev.findIndex((f) => f.id === targetId)
      if (from < 0 || to < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setDragId(null)
  }

  function previewTextAlign(align: AlignOption) {
    if (align === 'Left') return 'text-left'
    if (align === 'Right') return 'text-right'
    return 'text-center'
  }

  function renderPreviewLines(list: ConfigField[]) {
    return list.map((field) => {
      if (field.field === 'Barcode') {
        return (
          <div key={field.id} className="flex w-full justify-center py-1">
            <svg
              viewBox="0 0 120 40"
              className="h-10 w-full max-w-[140px]"
              aria-hidden="true"
            >
              {Array.from({ length: 28 }).map((_, index) => {
                const x = 4 + index * 4
                const wide = index % 3 === 0
                return (
                  <rect
                    key={index}
                    x={x}
                    y={2}
                    width={wide ? 2.5 : 1.2}
                    height={36}
                    fill={textColor}
                  />
                )
              })}
            </svg>
          </div>
        )
      }
      const content =
        field.field === 'Barcode Number'
          ? '1000001'
          : field.field === 'Raw Material Name'
            ? 'Raw Material Name'
            : field.label || 'Custom Label'
      return (
        <p
          key={field.id}
          className={`w-full px-1 ${previewTextAlign(field.align)} ${
            field.fontWeight === 'Bold' ? 'font-bold' : 'font-normal'
          }`}
          style={{
            color: textColor,
            fontSize: `${Math.max(10, Number(field.fontSize) * 2.2)}px`,
          }}
        >
          {content}
        </p>
      )
    })
  }

  return (
    <InventoryPageShell activeItem="barcode-generation">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <h1 className="mb-4 text-lg font-bold text-ink">
            Barcode Configuration
          </h1>

          <div className="mb-5 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Background Color
              </label>
              <div className="flex h-10 items-center gap-2 rounded-md border border-line bg-card px-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  className="size-7 cursor-pointer rounded border border-line bg-transparent p-0"
                  aria-label="Background color picker"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  className="w-28 bg-transparent text-sm uppercase outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Text Color
              </label>
              <div className="flex h-10 items-center gap-2 rounded-md border border-line bg-card px-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(event) => setTextColor(event.target.value)}
                  className="size-7 cursor-pointer rounded border border-line bg-transparent p-0"
                  aria-label="Text color picker"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(event) => setTextColor(event.target.value)}
                  className="w-28 bg-transparent text-sm uppercase outline-none"
                />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">
                Alignment of fields
              </p>
              <div className="flex h-10 items-center gap-4">
                {(['Column', 'Row'] as const).map((option) => (
                  <label
                    key={option}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="radio"
                      name="field-alignment"
                      checked={alignment === option}
                      onChange={() => setAlignment(option)}
                      className="size-4 accent-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-line bg-primary/10 text-xs font-semibold text-ink">
                <tr>
                  <th className="w-8 px-2 py-2.5" />
                  <th className="px-2 py-2.5">Field</th>
                  <th className="px-2 py-2.5">Label</th>
                  <th className="px-2 py-2.5">Align</th>
                  <th className="px-2 py-2.5">Position</th>
                  <th className="px-2 py-2.5">Font Size</th>
                  <th className="px-2 py-2.5">Font Weight</th>
                  <th className="px-2 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="px-2 py-2" />
                  <td className="px-2 py-2">
                    <SelectCell
                      value={draft.field}
                      options={FIELD_OPTIONS}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          field: value as FieldType,
                          label:
                            value === 'Custom Label'
                              ? prev.label || 'Custom Label'
                              : value,
                        }))
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={draft.label}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          label: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectCell
                      value={draft.align}
                      options={ALIGN_OPTIONS}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          align: value as AlignOption,
                        }))
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectCell
                      value={draft.position}
                      options={POSITION_OPTIONS}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          position: value as PositionOption,
                        }))
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={1}
                      value={draft.fontSize}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          fontSize: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <SelectCell
                      value={draft.fontWeight}
                      options={FONT_WEIGHT_OPTIONS}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          fontWeight: value as FontWeightOption,
                        }))
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-primary bg-card px-3 text-sm font-medium text-primary hover:bg-primary/5"
                    >
                      Add
                    </button>
                  </td>
                </tr>

                {fields.map((field) => (
                  <tr
                    key={field.id}
                    draggable
                    onDragStart={() => setDragId(field.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => onDrop(field.id)}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-2 py-2">
                      <span className="inline-flex cursor-grab text-muted active:cursor-grabbing">
                        <GripVertical size={16} />
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      {field.lockedField ? (
                        <span className="text-sm text-ink">{field.field}</span>
                      ) : (
                        <SelectCell
                          value={field.field}
                          options={FIELD_OPTIONS}
                          onChange={(value) =>
                            updateField(field.id, {
                              field: value as FieldType,
                            })
                          }
                        />
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(event) =>
                          updateField(field.id, { label: event.target.value })
                        }
                        className="h-9 w-full rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <SelectCell
                        value={field.align}
                        options={ALIGN_OPTIONS}
                        onChange={(value) =>
                          updateField(field.id, {
                            align: value as AlignOption,
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <SelectCell
                        value={field.position}
                        options={POSITION_OPTIONS}
                        onChange={(value) =>
                          updateField(field.id, {
                            position: value as PositionOption,
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={1}
                        value={field.fontSize}
                        onChange={(event) =>
                          updateField(field.id, {
                            fontSize: event.target.value,
                          })
                        }
                        className="h-9 w-full rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <SelectCell
                        value={field.fontWeight}
                        options={FONT_WEIGHT_OPTIONS}
                        onChange={(value) =>
                          updateField(field.id, {
                            fontWeight: value as FontWeightOption,
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        aria-label="Remove field"
                        onClick={() => removeField(field.id)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => navigate('/inventory/barcode-generation')}
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Cancel
            </button>
            <PrimaryButton
              onClick={() => {
                showToast('Barcode configuration saved')
                window.setTimeout(
                  () => navigate('/inventory/barcode-generation'),
                  700,
                )
              }}
            >
              Save Changes
            </PrimaryButton>
          </div>
        </div>

        <aside className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-3 text-base font-semibold text-ink">
            Barcode Preview
          </h2>
          <div
            className={`flex min-h-[220px] rounded-lg border border-line p-3 ${
              alignment === 'Column'
                ? 'flex-col items-stretch justify-between gap-2'
                : 'flex-row items-center justify-between gap-2'
            }`}
            style={{ backgroundColor }}
          >
            <div
              className={`flex min-w-0 flex-1 ${
                alignment === 'Column'
                  ? 'flex-col items-stretch gap-1'
                  : 'flex-row flex-wrap items-center gap-2'
              }`}
            >
              {renderPreviewLines(previewTop)}
            </div>
            <div className="flex w-full justify-center py-1">
              <svg
                viewBox="0 0 120 40"
                className="h-12 w-full max-w-[160px]"
                aria-label="Barcode preview"
              >
                {Array.from({ length: 30 }).map((_, index) => {
                  const x = 2 + index * 4
                  const wide = index % 4 === 0
                  return (
                    <rect
                      key={index}
                      x={x}
                      y={2}
                      width={wide ? 2.8 : 1.3}
                      height={36}
                      fill={textColor}
                    />
                  )
                })}
              </svg>
            </div>
            <div
              className={`flex min-w-0 flex-1 ${
                alignment === 'Column'
                  ? 'flex-col items-stretch gap-1'
                  : 'flex-row flex-wrap items-center gap-2'
              }`}
            >
              {previewBottom.length > 0 ? (
                renderPreviewLines(previewBottom)
              ) : (
                <p
                  className="w-full text-center text-xs font-medium"
                  style={{ color: textColor }}
                >
                  1000001
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </InventoryPageShell>
  )
}
