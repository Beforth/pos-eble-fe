export interface ParentCategory {
  id: string
  name: string
  onlineDisplayName: string
  categories: string
  categoryIds: string[]
  status: 'Active' | 'Inactive'
  created: string
}

export const ASSIGNABLE_CATEGORIES = [
  'Dabeli',
  'Kutchi Kadak',
  'Jain Dabeli',
  'Jain Kutchi Kadak',
  'Snacks',
  'Kathiyawadi Fafda',
  'Chaat',
  'Beverages',
] as const

export const parentCategories: ParentCategory[] = [
  {
    id: 'p1',
    name: 'Chaat',
    onlineDisplayName: 'Chaat',
    categories: 'Chaat',
    categoryIds: ['Chaat'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p2',
    name: 'Party Box',
    onlineDisplayName: 'Party Box',
    categories: 'Party Box',
    categoryIds: ['Party Box'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p3',
    name: 'Dabeli, Snacks & Kutchi Kadak',
    onlineDisplayName: 'Dabeli, Snacks & Kutchi Kadak',
    categories: 'Dabeli, Snacks, Kutchi Kadak',
    categoryIds: [
      'Dabeli',
      'Kutchi Kadak',
      'Jain Dabeli',
      'Jain Kutchi Kadak',
      'Snacks',
    ],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p4',
    name: 'Pav Bhaji',
    onlineDisplayName: 'Pav Bhaji',
    categories: 'Pav Bhaji',
    categoryIds: ['Pav Bhaji'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p5',
    name: 'Sandwiches',
    onlineDisplayName: 'Sandwiches',
    categories:
      'Cheese Sandwiches, Vegetable Grill Sandwich, Cheese Burst Sandwich, Vegetable Sandwich',
    categoryIds: [
      'Cheese Sandwiches',
      'Vegetable Grill Sandwich',
      'Cheese Burst Sandwich',
      'Vegetable Sandwich',
    ],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p6',
    name: 'Burgers',
    onlineDisplayName: 'Burgers',
    categories: 'Masala Burger, Veg Tikki Burger',
    categoryIds: ['Masala Burger', 'Veg Tikki Burger'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p7',
    name: 'Pizzas',
    onlineDisplayName: 'Pizzas',
    categories: 'Basic Pizza, Pizza Mania, Vegetable Pizza',
    categoryIds: ['Basic Pizza', 'Pizza Mania', 'Vegetable Pizza'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p8',
    name: 'Frankie',
    onlineDisplayName: 'Frankie',
    categories: 'Frankie',
    categoryIds: ['Frankie'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p9',
    name: 'Chinese',
    onlineDisplayName: 'Chinese',
    categories: 'Chinese',
    categoryIds: ['Chinese'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p10',
    name: 'Combos',
    onlineDisplayName: 'Combos',
    categories: 'Combos',
    categoryIds: ['Combos'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p11',
    name: 'Beverages',
    onlineDisplayName: 'Beverages',
    categories: 'Beverages',
    categoryIds: ['Beverages'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p12',
    name: 'Fafda & Jalebi',
    onlineDisplayName: 'Fafda & Jalebi',
    categories: 'Fafda & Jalebi',
    categoryIds: ['Fafda & Jalebi'],
    status: 'Active',
    created: '24 Mar 2024',
  },
  {
    id: 'p13',
    name: 'Extras',
    onlineDisplayName: 'Extras',
    categories: 'Extras',
    categoryIds: ['Extras'],
    status: 'Active',
    created: '24 Mar 2024',
  },
]

export function getParentCategoryById(id: string) {
  return parentCategories.find((row) => row.id === id)
}
