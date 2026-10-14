import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GripVertical, Trash2 } from 'lucide-react'
import { showToast } from '../../utils/toast'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import {
  ALIGN_OPTIONS,
  FIELD_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  POSITION_OPTIONS,
  loadBarcodeConfig,
  saveBarcodeConfig,
  type AlignOption,
  type ConfigField,
  type FieldType,
  type FontWeightOption,
  type PositionOption,
} from '../../utils/barcodeConfig'
import { generateBarcodeSvgString } from '../../utils/barcodeSvg'
import {
  PX_PER_MM,
  barcodeHeightPx,
  fieldFontPx,
  getLabelGeometry,
  loadPrinterSettings,
} from '../../utils/barcodeLabels'

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
  const initialConfig = useMemo(() => loadBarcodeConfig(), [])
  const [backgroundColor, setBackgroundColor] = useState(
    initialConfig.backgroundColor,
  )
  const [textColor, setTextColor] = useState(initialConfig.textColor)
  const [alignment, setAlignment] = useState(initialConfig.alignment)
  const [fields, setFields] = useState<ConfigField[]>(initialConfig.fields)
  const [draft, setDraft] = useState(emptyDraft)
  const [dragId, setDragId] = useState<string | null>(null)

  const previewTop = useMemo(
    () => fields.filter((f) => f.position === 'Top'),
    [fields],
  )
  const previewBottom = useMemo(
    () => fields.filter((f) => f.position === 'Bottom'),
    [fields],
  )
  // Preview uses the real label size and the same px rules as the print output,
  // scaled down to fit the panel, so what you see matches what prints.
  const labelGeometry = useMemo(
    () => getLabelGeometry(loadPrinterSettings().paperSize),
    [],
  )
  const labelWidthPx = labelGeometry.widthMm * PX_PER_MM
  const labelHeightPx = labelGeometry.heightMm * PX_PER_MM
  const previewScale = 240 / labelWidthPx


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
          <div
            key={field.id}
            className="flex w-full justify-center"
            dangerouslySetInnerHTML={{
              __html: generateBarcodeSvgString(
                '1000001',
                textColor,
                barcodeHeightPx(labelGeometry.heightMm),
              ),
            }}
          />
        )
      }
      const content =
        field.field === 'Barcode Number'
          ? '1000001'
          : field.field === 'Raw Material Name'
            ? 'Raw Material Name'
            : field.label || 'Custom Label'
      return (
        <div
          key={field.id}
          className={`field-item w-full ${previewTextAlign(field.align)} ${
            field.fontWeight === 'Bold' ? 'font-bold' : 'font-normal'
          }`}
          style={{
            color: textColor,
            fontSize: `${fieldFontPx(field.fontSize)}px`,
            fontFamily:
              field.field === 'Barcode Number' ? 'monospace' : undefined,
          }}
        >
          {content}
        </div>
      )
    })
  }

  return (
    <InventoryPageShell activeItem="barcode-generation">

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
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleAdd()
                        }
                      }}
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
                        data-tooltip="Remove field"
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
                saveBarcodeConfig({
                  backgroundColor,
                  textColor,
                  alignment,
                  fields,
                })
                showToast('Barcode configuration saved')
                navigate('/inventory/barcode-generation')
              }}
            >
              Save Changes
            </PrimaryButton>
          </div>
        </div>

        <aside className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-1 text-base font-semibold text-ink">
            Barcode Preview
          </h2>
          <p className="mb-3 text-xs text-muted">
            {labelGeometry.widthMm} × {labelGeometry.heightMm} mm (from Printer Settings)
          </p>
          <div
            className="overflow-hidden rounded-lg border border-line"
            style={{
              width: 240,
              height: labelHeightPx * previewScale,
            }}
          >
            <div
              className="flex flex-col justify-between overflow-hidden"
              style={{
                width: labelWidthPx,
                height: labelHeightPx,
                padding: '1.5mm',
                backgroundColor,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              <div
                className={`flex w-full gap-[2px] ${
                  alignment === 'Column'
                    ? 'flex-col items-stretch'
                    : 'flex-row flex-wrap items-center'
                }`}
              >
                {renderPreviewLines(previewTop)}
              </div>
              {previewBottom.length > 0 ? (
                <div
                  className={`flex w-full gap-[2px] ${
                    alignment === 'Column'
                      ? 'flex-col items-stretch'
                      : 'flex-row flex-wrap items-center'
                  }`}
                >
                  {renderPreviewLines(previewBottom)}
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </InventoryPageShell>
  )
}
