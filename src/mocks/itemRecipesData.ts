export const RECIPE_CATEGORIES = [
  'Pizza & Sandwich Combo',
  'Vegetable Sandwich',
  'Chaat',
  'Cheese Burst Sandwich',
  'Chocolate Sandwiches',
  'Sandwich & Burger Combo',
  'Party Box',
  'Snacks',
  'Paneer Pizza',
  'Cheese Sandwiches',
  'Dabeli',
  'Dil Se Desi Sandwiches',
  'Jain Dabeli',
  'Vegetable Pizza',
  'Special Sandwich',
  'Overload Pizza',
  'Jain Kutchi Kadak',
  'Pizza Mania',
  'Kutchi Kadak',
  'Kathiyawadi Fafda',
  'Beverages',
  'Veg Tikki Burger',
  'Basic Pizza',
  'Sides',
] as const

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]

export interface RecipeRow {
  id: string
  name: string
  category: RecipeCategory
}

/** Approximate item counts per category from the reference UI. */
const CATEGORY_TARGETS: Record<RecipeCategory, number> = {
  'Pizza & Sandwich Combo': 12,
  'Vegetable Sandwich': 11,
  Chaat: 11,
  'Cheese Burst Sandwich': 6,
  'Chocolate Sandwiches': 4,
  'Sandwich & Burger Combo': 8,
  'Party Box': 8,
  Snacks: 7,
  'Paneer Pizza': 6,
  'Cheese Sandwiches': 6,
  Dabeli: 6,
  'Dil Se Desi Sandwiches': 6,
  'Jain Dabeli': 6,
  'Vegetable Pizza': 5,
  'Special Sandwich': 4,
  'Overload Pizza': 3,
  'Jain Kutchi Kadak': 3,
  'Pizza Mania': 3,
  'Kutchi Kadak': 3,
  'Kathiyawadi Fafda': 2,
  Beverages: 4,
  'Veg Tikki Burger': 4,
  'Basic Pizza': 1,
  Sides: 4,
}

const SEED: RecipeRow[] = [
  { id: '1', name: 'Chocolate Sandwich', category: 'Chocolate Sandwiches' },
  { id: '2', name: 'Veg Junglee Sandwich', category: 'Special Sandwich' },
  {
    id: '3',
    name: 'Schezwan Paneer Sandwich',
    category: 'Dil Se Desi Sandwiches',
  },
  { id: '4', name: 'Veg Grilled Sandwich', category: 'Vegetable Sandwich' },
  { id: '5', name: 'Paneer Cheese Burst', category: 'Cheese Burst Sandwich' },
  { id: '6', name: 'Sev Puri', category: 'Chaat' },
  { id: '7', name: 'Dabeli Classic', category: 'Dabeli' },
  { id: '8', name: 'Pizza Sandwich Combo', category: 'Pizza & Sandwich Combo' },
  { id: '9', name: 'Masala Cheese Sandwich', category: 'Cheese Sandwiches' },
  { id: '10', name: 'Bhel Puri', category: 'Chaat' },
  { id: '11', name: 'Butter Toast Sandwich', category: 'Vegetable Sandwich' },
  { id: '12', name: 'Cold Coffee', category: 'Beverages' },
  { id: '13', name: 'French Fries', category: 'Sides' },
  { id: '14', name: 'Spicy Dabeli', category: 'Dabeli' },
  { id: '15', name: 'Corn Cheese Sandwich', category: 'Cheese Burst Sandwich' },
  { id: '16', name: 'Dahi Puri', category: 'Chaat' },
  { id: '17', name: 'Club Sandwich Combo', category: 'Sandwich & Burger Combo' },
  { id: '18', name: 'Choco Hazelnut Sandwich', category: 'Chocolate Sandwiches' },
  { id: '19', name: 'Mint Lemonade', category: 'Beverages' },
  { id: '20', name: 'Onion Rings', category: 'Sides' },
  { id: '21', name: 'Aloo Tikki Sandwich', category: 'Vegetable Sandwich' },
  { id: '22', name: 'Cheese Burst Veg', category: 'Cheese Burst Sandwich' },
  { id: '23', name: 'Pani Puri', category: 'Chaat' },
  { id: '24', name: 'Cheese Dabeli', category: 'Dabeli' },
  { id: '25', name: 'Loaded Fries', category: 'Sides' },
  { id: '26', name: 'Chocolate Toast', category: 'Chocolate Sandwiches' },
  { id: '27', name: 'Veg Pizza Sandwich', category: 'Pizza & Sandwich Combo' },
  { id: '28', name: 'Sweet Lassi', category: 'Beverages' },
  { id: '29', name: 'Capsicum Sandwich', category: 'Vegetable Sandwich' },
  { id: '30', name: 'Basic Margherita', category: 'Basic Pizza' },
  { id: '31', name: 'Paneer Tikka Pizza', category: 'Paneer Pizza' },
  { id: '32', name: 'Veg Tikki Burger Classic', category: 'Veg Tikki Burger' },
  { id: '33', name: 'Party Box Mix', category: 'Party Box' },
  { id: '34', name: 'Overload Supreme', category: 'Overload Pizza' },
  { id: '35', name: 'Pizza Mania Veg', category: 'Pizza Mania' },
  { id: '36', name: 'Kutchi Kadak Classic', category: 'Kutchi Kadak' },
  { id: '37', name: 'Jain Kutchi Kadak', category: 'Jain Kutchi Kadak' },
  { id: '38', name: 'Kathiyawadi Fafda Plate', category: 'Kathiyawadi Fafda' },
  { id: '39', name: 'Jain Dabeli Classic', category: 'Jain Dabeli' },
  { id: '40', name: 'Farmhouse Veg Pizza', category: 'Vegetable Pizza' },
  { id: '41', name: 'Samosa', category: 'Snacks' },
]

function buildRecipes(): RecipeRow[] {
  const rows = [...SEED]
  let nextId = rows.length + 1

  for (const category of RECIPE_CATEGORIES) {
    const target = CATEGORY_TARGETS[category]
    let n = 1
    while (rows.filter((row) => row.category === category).length < target) {
      rows.push({
        id: String(nextId++),
        name: `${category} Item ${n++}`,
        category,
      })
    }
  }

  return rows
}

export const ITEM_RECIPES: RecipeRow[] = buildRecipes()

export const RECIPE_ITEM_OPTIONS = [
  'All',
  ...Array.from(new Set(ITEM_RECIPES.map((row) => row.name))).slice(0, 60),
]

export const RECIPE_CREATED_OPTIONS = [
  'All',
  'Created',
  'Not Created',
] as const
