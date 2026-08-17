export const RAW_MATERIAL_CATEGORIES = [
  'Bread/dairy',
  'Sauces/dressings/marinades',
  'Oils/masala/salt/sugar',
  'Fruits/vegetables',
  'Rice/pulses/flours',
  'Snacks',
  'Ready To Cook/ready To Eat',
  'Packaging/storage',
] as const

export type RawMaterialCategory = (typeof RAW_MATERIAL_CATEGORIES)[number]

export interface RawMaterialRow {
  id: string
  name: string
  category: RawMaterialCategory
  favourite: boolean
  active: boolean
}

const SEED: Array<{ name: string; category: RawMaterialCategory }> = [
  { name: 'Chilli Whole', category: 'Oils/masala/salt/sugar' },
  { name: 'Onion', category: 'Fruits/vegetables' },
  { name: 'Green Peas', category: 'Fruits/vegetables' },
  { name: 'Tomato', category: 'Fruits/vegetables' },
  { name: 'Potato', category: 'Fruits/vegetables' },
  { name: 'Coriander Leaves', category: 'Fruits/vegetables' },
  { name: 'Lemon', category: 'Fruits/vegetables' },
  { name: 'Capsicum', category: 'Fruits/vegetables' },
  { name: 'Cabbage', category: 'Fruits/vegetables' },
  { name: 'Carrot', category: 'Fruits/vegetables' },
  { name: 'Milk', category: 'Bread/dairy' },
  { name: 'Butter', category: 'Bread/dairy' },
  { name: 'Cheese Slice', category: 'Bread/dairy' },
  { name: 'Curd', category: 'Bread/dairy' },
  { name: 'Cream', category: 'Bread/dairy' },
  { name: 'Paneer', category: 'Bread/dairy' },
  { name: 'Bread Bun', category: 'Bread/dairy' },
  { name: 'Pav', category: 'Bread/dairy' },
  { name: 'Khari', category: 'Bread/dairy' },
  { name: 'Mayonnaise', category: 'Sauces/dressings/marinades' },
  { name: 'Tomato Ketchup', category: 'Sauces/dressings/marinades' },
  { name: 'Green Chutney', category: 'Sauces/dressings/marinades' },
  { name: 'Tamarind Chutney', category: 'Sauces/dressings/marinades' },
  { name: 'Garlic Chutney', category: 'Sauces/dressings/marinades' },
  { name: 'Schezwan Sauce', category: 'Sauces/dressings/marinades' },
  { name: 'Mustard Sauce', category: 'Sauces/dressings/marinades' },
  { name: 'Vinegar', category: 'Sauces/dressings/marinades' },
  { name: 'Refined Oil', category: 'Oils/masala/salt/sugar' },
  { name: 'Salt', category: 'Oils/masala/salt/sugar' },
  { name: 'Sugar', category: 'Oils/masala/salt/sugar' },
  { name: 'Red Chilli Powder', category: 'Oils/masala/salt/sugar' },
  { name: 'Turmeric', category: 'Oils/masala/salt/sugar' },
  { name: 'Cumin Seeds', category: 'Oils/masala/salt/sugar' },
  { name: 'Garam Masala', category: 'Oils/masala/salt/sugar' },
  { name: 'Black Salt', category: 'Oils/masala/salt/sugar' },
  { name: 'Chat Masala', category: 'Oils/masala/salt/sugar' },
  { name: 'Rice Flour', category: 'Rice/pulses/flours' },
  { name: 'Besan', category: 'Rice/pulses/flours' },
  { name: 'Maida', category: 'Rice/pulses/flours' },
  { name: 'Wheat Flour', category: 'Rice/pulses/flours' },
  { name: 'Poha', category: 'Rice/pulses/flours' },
  { name: 'Moong Dal', category: 'Rice/pulses/flours' },
  { name: 'Chana Dal', category: 'Rice/pulses/flours' },
  { name: 'Sooji', category: 'Rice/pulses/flours' },
  { name: 'Bhel Mixture', category: 'Snacks' },
  { name: 'Bhujia Namkeen', category: 'Snacks' },
  { name: 'Sev', category: 'Snacks' },
  { name: 'Papdi', category: 'Snacks' },
  { name: 'Nylon Sev', category: 'Snacks' },
  { name: 'Boondi', category: 'Snacks' },
  { name: 'Frozen Samosa', category: 'Ready To Cook/ready To Eat' },
  { name: 'Frozen Patty', category: 'Ready To Cook/ready To Eat' },
  { name: 'Ready Mix Masala', category: 'Ready To Cook/ready To Eat' },
  { name: 'Carry Bag', category: 'Packaging/storage' },
]

function padCategory(
  category: RawMaterialCategory,
  target: number,
  startId: number,
): RawMaterialRow[] {
  const existing = SEED.filter((item) => item.category === category)
  const rows: RawMaterialRow[] = existing.map((item, index) => ({
    id: String(startId + index),
    name: item.name,
    category: item.category,
    favourite: index % 7 === 0,
    active: true,
  }))

  let next = startId + rows.length
  let n = 1
  while (rows.length < target) {
    rows.push({
      id: String(next++),
      name: `${category.split('/')[0].trim()} Item ${n++}`,
      category,
      favourite: rows.length % 11 === 0,
      active: rows.length % 17 !== 0,
    })
  }
  return rows
}

/** Category ingredient counts matching the reference UI totals (~104). */
const CATEGORY_TARGETS: Record<RawMaterialCategory, number> = {
  'Bread/dairy': 27,
  'Sauces/dressings/marinades': 22,
  'Oils/masala/salt/sugar': 17,
  'Fruits/vegetables': 13,
  'Rice/pulses/flours': 15,
  Snacks: 6,
  'Ready To Cook/ready To Eat': 3,
  'Packaging/storage': 1,
}

export const RAW_MATERIALS: RawMaterialRow[] = (() => {
  const rows: RawMaterialRow[] = []
  let id = 1
  for (const category of RAW_MATERIAL_CATEGORIES) {
    const batch = padCategory(category, CATEGORY_TARGETS[category], id)
    rows.push(...batch)
    id += batch.length
  }
  return rows
})()

export function getRawMaterialById(id: string): RawMaterialRow | undefined {
  return RAW_MATERIALS.find((row) => row.id === id)
}

export function defaultPurchaseUnitsForCategory(
  category: string,
): string[] {
  const map: Record<string, string[]> = {
    'Oils/masala/salt/sugar': ['Kg', 'GM', 'TIN', 'BOX', 'pkt'],
    'Fruits/vegetables': ['Kg', 'GM', 'BOX'],
    'Bread/dairy': ['Ltr', 'Kg', 'Pcs', 'BOX'],
    'Rice/pulses/flours': ['Kg', 'GM', 'pkt', 'BOX'],
    Snacks: ['pkt', 'BOX', 'Kg'],
    'Sauces/dressings/marinades': ['jar', 'bottle', 'Ltr', 'GM'],
    'Ready To Cook/ready To Eat': ['pkt', 'BOX', 'Pcs'],
    'Packaging/storage': ['Pcs', 'BOX', 'pkt'],
  }
  return map[category] ?? ['Kg', 'GM']
}