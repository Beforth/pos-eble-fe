import type { Variation, VariationGroup, VariationInput } from '../types/menu'

/** A variation as the group API wants it back: prices included, or saving would wipe them. */
export function variationToInput(variation: Variation): VariationInput {
  return {
    id: variation.id,
    name: variation.name,
    online_display_name: variation.online_display_name,
    is_active: variation.is_active,
    area_prices: (variation.area_prices ?? []).map((price) => ({
      outlet_channel_id: price.outlet_channel_id,
      price: Number(price.price),
      is_active: price.is_active ?? true,
    })),
  }
}

/**
 * The group API replaces a group's whole variation list, so a change to one
 * variation sends the others back unchanged. `change` returns the fields to
 * overwrite for a variation (or nothing to leave it).
 */
export function groupVariationsPayload(
  group: VariationGroup,
  change?: (variation: Variation) => Partial<VariationInput> | undefined,
): VariationInput[] {
  return group.variations.map((variation) => ({
    ...variationToInput(variation),
    ...(change?.(variation) ?? {}),
  }))
}
