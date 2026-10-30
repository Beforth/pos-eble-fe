export type AlignOption = 'Left' | 'Center' | 'Right'
export type PositionOption = 'Top' | 'Bottom'
export type FontWeightOption = 'Normal' | 'Bold'
export type FieldType =
  | 'Custom Label'
  | 'Raw Material Name'
  | 'Barcode'
  | 'Barcode Number'

export interface ConfigField {
  id: string
  field: FieldType
  label: string
  align: AlignOption
  position: PositionOption
  fontSize: string
  fontWeight: FontWeightOption
  lockedField?: boolean
}

export interface BarcodeLabelConfig {
  backgroundColor: string
  textColor: string
  alignment: 'Column' | 'Row'
  fields: ConfigField[]
}

export const BARCODE_CONFIG_KEY = 'rajubhai.barcode.configuration'

export const FIELD_OPTIONS: FieldType[] = [
  'Custom Label',
  'Raw Material Name',
  'Barcode',
  'Barcode Number',
]
export const ALIGN_OPTIONS: AlignOption[] = ['Left', 'Center', 'Right']
export const POSITION_OPTIONS: PositionOption[] = ['Top', 'Bottom']
export const FONT_WEIGHT_OPTIONS: FontWeightOption[] = ['Normal', 'Bold']

export const DEFAULT_CONFIG_FIELDS: ConfigField[] = [
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
  {
    id: 'field-barcode',
    field: 'Barcode',
    label: 'Barcode',
    align: 'Center',
    position: 'Top',
    fontSize: '5',
    fontWeight: 'Normal',
  },
  {
    id: 'field-barcode-num',
    field: 'Barcode Number',
    label: 'Barcode Number',
    align: 'Center',
    position: 'Bottom',
    fontSize: '4',
    fontWeight: 'Normal',
  },
]

export const DEFAULT_BARCODE_CONFIG: BarcodeLabelConfig = {
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  alignment: 'Column',
  fields: DEFAULT_CONFIG_FIELDS,
}

export function loadBarcodeConfig(): BarcodeLabelConfig {
  try {
    const raw = localStorage.getItem(BARCODE_CONFIG_KEY)
    if (!raw) return { ...DEFAULT_BARCODE_CONFIG }
    const parsed = JSON.parse(raw) as Partial<BarcodeLabelConfig>
    const fields =
      Array.isArray(parsed.fields) && parsed.fields.length > 0
        ? parsed.fields
        : DEFAULT_CONFIG_FIELDS
    return {
      backgroundColor:
        parsed.backgroundColor ?? DEFAULT_BARCODE_CONFIG.backgroundColor,
      textColor: parsed.textColor ?? DEFAULT_BARCODE_CONFIG.textColor,
      alignment: parsed.alignment ?? DEFAULT_BARCODE_CONFIG.alignment,
      fields,
    }
  } catch {
    return { ...DEFAULT_BARCODE_CONFIG }
  }
}

export function saveBarcodeConfig(config: BarcodeLabelConfig): void {
  try {
    localStorage.setItem(BARCODE_CONFIG_KEY, JSON.stringify(config))
  } catch {
    // quota exceeded or storage blocked
  }
}
