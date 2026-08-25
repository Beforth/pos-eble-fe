import {
  baseMenuCategories,
  menuItems,
} from './menuItemsData'

export type CommissionType = 'Not Configured' | 'Percentage' | 'Fixed'

export interface ItemCommissionRow {
  id: string
  itemName: string
  categoryId: string
  categoryName: string
  itemPrice: number
  commissionType: CommissionType
  commissionValue: number | null
}

const EXTRA_ITEMS: { name: string; categoryId: string; price: number }[] = [
  { name: 'Royal Choco Delight', categoryId: 'c25', price: 250 },
  { name: 'Samosa', categoryId: 'c4', price: 20 },
  { name: 'Butter Samosa', categoryId: 'c4', price: 25 },
  { name: 'Paneer Samosa', categoryId: 'c4', price: 40 },
  { name: 'Cheese Samosa', categoryId: 'c4', price: 45 },
  { name: 'Mix Veg Sandwich', categoryId: 'c7', price: 80 },
  { name: 'Cheese Grill Sandwich', categoryId: 'c8', price: 120 },
  { name: 'Bombay Sandwich', categoryId: 'c7', price: 70 },
  { name: 'Veg Burger', categoryId: 'c12', price: 90 },
  { name: 'Cheese Burger', categoryId: 'c12', price: 110 },
  { name: 'Masala Dabeli', categoryId: 'c3', price: 35 },
  { name: 'Cheese Dabeli', categoryId: 'c3', price: 45 },
  { name: 'Butter Dabeli', categoryId: 'c3', price: 40 },
  { name: 'Pav Bhaji Regular', categoryId: 'c6', price: 100 },
  { name: 'Cheese Pav Bhaji', categoryId: 'c6', price: 130 },
  { name: 'Butter Pav Bhaji', categoryId: 'c6', price: 120 },
  { name: 'Veg Pizza', categoryId: 'c15', price: 180 },
  { name: 'Paneer Pizza', categoryId: 'c27', price: 220 },
  { name: 'Margherita Pizza', categoryId: 'c16', price: 160 },
  { name: 'Veg Frankie', categoryId: 'c19', price: 80 },
  { name: 'Paneer Frankie', categoryId: 'c19', price: 100 },
  { name: 'Manchurian Dry', categoryId: 'c20', price: 120 },
  { name: 'Veg Noodles', categoryId: 'c20', price: 110 },
  { name: 'Hakka Noodles', categoryId: 'c20', price: 115 },
  { name: 'Cold Coffee', categoryId: 'c22', price: 80 },
  { name: 'Masala Chaas', categoryId: 'c22', price: 40 },
  { name: 'Fresh Lime Soda', categoryId: 'c22', price: 50 },
  { name: 'Fafda', categoryId: 'c23', price: 60 },
  { name: 'Jalebi', categoryId: 'c23', price: 50 },
  { name: 'Extra Cheese', categoryId: 'c24', price: 30 },
  { name: 'Extra Butter', categoryId: 'c24', price: 20 },
  { name: 'Black Forest Pastry', categoryId: 'c25', price: 80 },
  { name: 'Bisleri (BIG)', categoryId: 'c22', price: 30 },
  { name: 'Kathiyawadi Fafda', categoryId: 'c23', price: 70 },
  { name: 'Cheese Garlic Sandwich', categoryId: 'c8', price: 100 },
  { name: 'Tandoor Paneer Sandwich', categoryId: 'c26', price: 130 },
  { name: 'Schezwan Paneer Sandwich', categoryId: 'c26', price: 130 },
  { name: 'Cheese Mayonnaise Kutchi Kadak', categoryId: 'c5', price: 95 },
  { name: 'Butter Paav', categoryId: 'c4', price: 20 },
  { name: 'Jain Dabeli', categoryId: 'c3', price: 40 },
]

function categoryName(id: string) {
  return baseMenuCategories.find((c) => c.id === id)?.name ?? 'Other'
}

function buildRows(): ItemCommissionRow[] {
  const fromMenu = menuItems.map((item, index) => {
    const configured = index % 5 !== 0
    return {
      id: `ic-${item.id}`,
      itemName: item.name,
      categoryId: item.categoryId,
      categoryName: categoryName(item.categoryId),
      itemPrice: item.price,
      commissionType: (configured ? 'Percentage' : 'Not Configured') as CommissionType,
      commissionValue: configured ? 44 : null,
    }
  })

  const extras = EXTRA_ITEMS.map((item, index) => {
    const configured = index % 4 !== 0
    return {
      id: `ic-extra-${index}`,
      itemName: item.name,
      categoryId: item.categoryId,
      categoryName: categoryName(item.categoryId),
      itemPrice: item.price,
      commissionType: (configured ? 'Percentage' : 'Not Configured') as CommissionType,
      commissionValue: configured ? 44 : null,
    }
  })

  // Pad to a larger list for pagination (like the reference ~200+)
  const padded: ItemCommissionRow[] = []
  const seed = [...fromMenu, ...extras]
  for (let page = 0; page < 4; page += 1) {
    for (const row of seed) {
      padded.push({
        ...row,
        id: `${row.id}-p${page}`,
        itemName: page === 0 ? row.itemName : `${row.itemName}`,
        commissionValue:
          row.commissionType === 'Percentage'
            ? 40 + ((padded.length + page) % 20)
            : null,
      })
    }
  }
  return padded
}

export const itemCommissionRows: ItemCommissionRow[] = buildRows()

export function addCommissionRow(row: ItemCommissionRow) {
  itemCommissionRows.push(row)
}

export interface AddonCommissionRow {
  id: string
  addonName: string
  groupName: string
  price: number
  commissionType: CommissionType
  commissionValue: number | null
}

export const addonCommissionRows: AddonCommissionRow[] = [
  {
    id: 'ac1',
    addonName: 'Extra Cheese',
    groupName: 'Toppings',
    price: 30,
    commissionType: 'Percentage',
    commissionValue: 20,
  },
  {
    id: 'ac2',
    addonName: 'Extra Butter',
    groupName: 'Toppings',
    price: 20,
    commissionType: 'Not Configured',
    commissionValue: null,
  },
  {
    id: 'ac3',
    addonName: 'Mayonnaise',
    groupName: 'Sauces',
    price: 15,
    commissionType: 'Percentage',
    commissionValue: 15,
  },
]
