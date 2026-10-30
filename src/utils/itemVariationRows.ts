/** One variation line of the item form: the item's own terms for that variation. */
export interface VariationRowState {
  key: string
  variationId: string
  price: string
  containerCharge: string
  sapCode: string
  profitMargin: string
  allowAddon: boolean
  addonGroupIds: string[]
}

export function newVariationRow(): VariationRowState {
  return {
    key: Math.random().toString(36).slice(2),
    variationId: '',
    price: '',
    containerCharge: '0',
    sapCode: '',
    profitMargin: '',
    allowAddon: false,
    addonGroupIds: [],
  }
}
