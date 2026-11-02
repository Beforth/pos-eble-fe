import type {
  SubOrderTypeKind,
  SubOrderTypeOrderType,
} from '../../services/outletService'

export const KIND_LABEL: Record<SubOrderTypeKind, string> = {
  default: 'Default Order Type',
  third_party: 'Third Party Integration',
  manual: 'Manual',
}

export const ORDER_TYPE_LABEL: Record<SubOrderTypeOrderType, string> = {
  'dine-in': 'Dine In',
  delivery: 'Delivery',
  'pick-up': 'Pick Up',
}

export const ORDER_TYPE_OPTIONS = Object.keys(ORDER_TYPE_LABEL) as SubOrderTypeOrderType[]

export function orderTypesText(types: SubOrderTypeOrderType[]): string {
  return types.map((type) => ORDER_TYPE_LABEL[type] ?? type).join(', ') || '—'
}

export function createdText(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
