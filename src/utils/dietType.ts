export type FoodType = 'veg' | 'non-veg' | 'egg'

export function getDietType(tags: string[], name: string): FoodType {
  const tagSet = tags.map((t) => t.toLowerCase())
  const lowerName = name.toLowerCase()

  const isEgg =
    tagSet.some((t) => t === 'e' || t === 'egg' || t.includes('egg')) ||
    /\begg\b/.test(lowerName)

  const isNonVeg =
    tagSet.some(
      (t) =>
        t === 'n' ||
        t === 'nv' ||
        t === 'non-veg' ||
        t === 'nonveg' ||
        t.includes('non-veg'),
    ) ||
    /\b(chicken|mutton|fish|prawn|meat|keema|non[\s-]?veg)\b/.test(lowerName)

  if (isEgg) return 'egg'
  if (isNonVeg) return 'non-veg'
  return 'veg'
}

export const FOOD_TYPE_META: Record<
  FoodType,
  { label: string; shortLabel: string; badgeClass: string; dotClass: string; ringClass: string }
> = {
  veg: {
    label: 'Veg',
    shortLabel: 'V',
    badgeClass: 'bg-success/10 text-success',
    dotClass: 'bg-success',
    ringClass: 'border-success',
  },
  'non-veg': {
    label: 'Non-Veg',
    shortLabel: 'N',
    badgeClass: 'bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    ringClass: 'border-primary',
  },
  egg: {
    label: 'Egg',
    shortLabel: 'E',
    badgeClass: 'bg-secondary/20 text-accent',
    dotClass: 'bg-secondary',
    ringClass: 'border-secondary',
  },
}
