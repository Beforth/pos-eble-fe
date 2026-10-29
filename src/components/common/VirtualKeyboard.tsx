import { useEffect, useRef, useState } from 'react'
import { ArrowBigUp, Delete, Keyboard, X } from 'lucide-react'
import { useDisplaySettings } from '../../services/useDisplaySettings'

type Field = HTMLInputElement | HTMLTextAreaElement

const LETTER_ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const NUMBER_ROWS = ['123', '456', '789']
const TEXT_TYPES = new Set(['text', 'search', 'tel', 'number', 'email', 'url', ''])

/** A text field the keyboard can type into, or null. */
function typableField(target: EventTarget | null): Field | null {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return null
  if (target.readOnly || target.disabled) return null
  if (target instanceof HTMLInputElement && !TEXT_TYPES.has(target.type)) return null
  return target
}

/** Sets a field's value the way React notices (native setter + an `input` event). */
function setFieldValue(field: Field, value: string) {
  const proto = field instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(field, value)
  field.dispatchEvent(new Event('input', { bubbles: true }))
}

/**
 * An on-screen keyboard for the touch layout (Display Settings > "Enable
 * virtual keyboard in touch"). It slides up when a text field is tapped and
 * types into that field. A field can opt out or follow a sub-setting with
 * `data-vk="off" | "shortcode" | "order-number"`.
 */
export function VirtualKeyboard() {
  const settings = useDisplaySettings()
  const [field, setField] = useState<Field | null>(null)
  const [shift, setShift] = useState(false)
  const [hidden, setHidden] = useState(false)
  const fieldRef = useRef<Field | null>(null)
  const active = settings.touchLayout && settings.virtualKeyboard

  useEffect(() => {
    if (!active) return
    const onFocusIn = (event: FocusEvent) => {
      const next = typableField(event.target)
      if (!next) return
      const kind = next.dataset.vk
      const allowed =
        kind === 'off'
          ? false
          : kind === 'shortcode'
            ? settings.vkShortCode
            : kind === 'order-number'
              ? settings.vkOrderNumber
              : true
      fieldRef.current = allowed ? next : null
      setField(allowed ? next : null)
      setHidden(false)
    }
    const onFocusOut = () => {
      // Tapping a key keeps focus (see below), so a real focus loss means the
      // cashier moved on to something that is not a text field.
      window.setTimeout(() => {
        if (!typableField(document.activeElement)) {
          fieldRef.current = null
          setField(null)
        }
      }, 0)
    }
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [active, settings.vkShortCode, settings.vkOrderNumber])

  if (!active || !field || hidden) return null

  const numeric =
    field.getAttribute('inputmode') === 'numeric' ||
    (field instanceof HTMLInputElement && (field.type === 'tel' || field.type === 'number'))

  function press(key: string) {
    const target = fieldRef.current
    if (!target) return
    if (key === 'back') setFieldValue(target, target.value.slice(0, -1))
    else if (key === 'clear') setFieldValue(target, '')
    else if (key === 'enter') {
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }),
      )
    } else {
      setFieldValue(target, target.value + (shift ? key.toUpperCase() : key))
      if (shift) setShift(false)
    }
    target.focus()
  }

  const keyClass =
    'flex h-12 min-w-0 flex-1 cursor-pointer select-none items-center justify-center rounded-lg border border-line bg-card text-base font-semibold text-ink active:bg-primary/10 sm:h-14'

  return (
    <div
      role="group"
      aria-label="On-screen keyboard"
      // Keys must not take focus from the field being typed into.
      onPointerDown={(event) => event.preventDefault()}
      onMouseDown={(event) => event.preventDefault()}
      className="fixed inset-x-0 bottom-0 z-[95] border-t border-line bg-page p-2 shadow-[0_-6px_18px_rgba(0,0,0,0.12)]"
    >
      <div className="mx-auto max-w-3xl space-y-1.5">
        <div className="flex items-center justify-between px-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Keyboard size={14} />
            Typing in {field.getAttribute('placeholder') || field.getAttribute('aria-label') || 'field'}
          </span>
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label="Hide keyboard"
            data-tooltip="Hide keyboard"
            className="rounded-md p-1 text-muted hover:bg-card hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {(numeric ? NUMBER_ROWS : LETTER_ROWS).map((row) => (
          <div key={row} className="flex gap-1.5">
            {row.split('').map((key) => (
              <button key={key} type="button" onClick={() => press(key)} className={keyClass}>
                {shift && !numeric ? key.toUpperCase() : key}
              </button>
            ))}
          </div>
        ))}

        <div className="flex gap-1.5">
          {!numeric ? (
            <button
              type="button"
              onClick={() => setShift((value) => !value)}
              aria-pressed={shift}
              aria-label="Shift"
              data-tooltip="Shift"
              className={`${keyClass} ${shift ? 'border-primary bg-primary/10 text-primary' : ''}`}
            >
              <ArrowBigUp size={18} />
            </button>
          ) : (
            <button type="button" onClick={() => press('0')} className={keyClass}>
              0
            </button>
          )}
          {!numeric ? (
            <button type="button" onClick={() => press(' ')} className={`${keyClass} flex-[4]`}>
              space
            </button>
          ) : (
            <button type="button" onClick={() => press('clear')} className={keyClass}>
              C
            </button>
          )}
          <button type="button" onClick={() => press('back')} aria-label="Backspace" data-tooltip="Backspace" className={keyClass}>
            <Delete size={18} />
          </button>
          <button
            type="button"
            onClick={() => press('enter')}
            className={`${keyClass} flex-[2] border-primary bg-primary text-white active:bg-primary-hover`}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  )
}
