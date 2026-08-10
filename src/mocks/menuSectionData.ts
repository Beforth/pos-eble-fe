export interface MenuVariation {
  id: string
  name: string
  onlineDisplayName: string
  departmentName: string
  status: 'Active' | 'Inactive'
  created: string
  modified: string
}

export interface MenuAddonGroup {
  id: string
  departmentName: string
  onlineDisplayName: string
  rank: number
  status: 'Active' | 'Inactive'
  created: string
  modified: string
}

export interface MenuTable {
  id: string
  tableNo: string
  persons: number
  extraInfo: string
  areaName: string
  statusOn: boolean
  discountPercent: number
}

export interface MenuArea {
  id: string
  name: string
  tables: string
  status: 'Active' | 'Inactive'
  created: string
  discountPercent: string
}

export interface MenuTax {
  id: string
  title: string
  onlineDisplayName: string
  taxType: string
  type: string
  amount: string
  status: 'Active' | 'Inactive'
  created: string
}

export const menuVariations: MenuVariation[] = [
  {
    id: 'v1',
    name: '1 Plate',
    onlineDisplayName: '',
    departmentName: 'Quantity',
    status: 'Active',
    created: '27 Jul 2023',
    modified: '8 Nov 2024',
  },
  {
    id: 'v2',
    name: '250 Gm',
    onlineDisplayName: '',
    departmentName: 'Quantity',
    status: 'Active',
    created: '27 Jul 2023',
    modified: '8 Nov 2024',
  },
  {
    id: 'v3',
    name: 'HALF',
    onlineDisplayName: '',
    departmentName: 'Quantity',
    status: 'Active',
    created: '27 Jul 2023',
    modified: '8 Nov 2024',
  },
  {
    id: 'v4',
    name: 'FULL',
    onlineDisplayName: '',
    departmentName: 'Quantity',
    status: 'Active',
    created: '27 Jul 2023',
    modified: '8 Nov 2024',
  },
  {
    id: 'v5',
    name: 'SMALL',
    onlineDisplayName: '',
    departmentName: 'Size',
    status: 'Active',
    created: '27 Jul 2023',
    modified: '8 Nov 2024',
  },
  {
    id: 'v6',
    name: 'Regular',
    onlineDisplayName: '',
    departmentName: 'Size',
    status: 'Active',
    created: '27 Jul 2023',
    modified: '8 Nov 2024',
  },
  {
    id: 'v7',
    name: 'Large',
    onlineDisplayName: '',
    departmentName: 'Size',
    status: 'Active',
    created: '27 Jul 2023',
    modified: '8 Nov 2024',
  },
  {
    id: 'v8',
    name: 'Extra Large',
    onlineDisplayName: '',
    departmentName: 'Size',
    status: 'Active',
    created: '27 Jul 2023',
    modified: '8 Nov 2024',
  },
]

export const menuAddonGroups: MenuAddonGroup[] = [
  {
    id: 'a1',
    departmentName: 'Cheese',
    onlineDisplayName: 'Cheese',
    rank: 1,
    status: 'Active',
    created: '9 Oct 2023',
    modified: '8 May 2026',
  },
  {
    id: 'a2',
    departmentName: 'Pizza Toppings',
    onlineDisplayName: 'Pizza Toppings',
    rank: 2,
    status: 'Active',
    created: '9 Oct 2023',
    modified: '8 May 2026',
  },
  {
    id: 'a3',
    departmentName: 'Chutney',
    onlineDisplayName: 'Chutney',
    rank: 3,
    status: 'Active',
    created: '9 Oct 2023',
    modified: '8 May 2026',
  },
  {
    id: 'a4',
    departmentName: 'Chaat',
    onlineDisplayName: 'Extra Aaloo Pattice',
    rank: 4,
    status: 'Active',
    created: '9 Oct 2023',
    modified: '8 May 2026',
  },
  {
    id: 'a5',
    departmentName: 'Dabeli Addons',
    onlineDisplayName: 'Dabeli Addons',
    rank: 5,
    status: 'Active',
    created: '9 Oct 2023',
    modified: '8 May 2026',
  },
  {
    id: 'a6',
    departmentName: 'Sandwich Addons',
    onlineDisplayName: 'Sandwich Addons',
    rank: 6,
    status: 'Active',
    created: '9 Oct 2023',
    modified: '8 May 2026',
  },
]

export function getAddonGroupById(id: string) {
  return menuAddonGroups.find((row) => row.id === id)
}

export const menuAreas: MenuArea[] = [
  {
    id: 'ar1',
    name: 'Home Delivery',
    tables: '',
    status: 'Active',
    created: '26 Jul 2023',
    discountPercent: '',
  },
  {
    id: 'ar2',
    name: 'Zomato',
    tables: '',
    status: 'Active',
    created: '9 Oct 2023',
    discountPercent: '',
  },
  {
    id: 'ar3',
    name: 'Swiggy',
    tables: '',
    status: 'Active',
    created: '9 Oct 2023',
    discountPercent: '',
  },
  {
    id: 'ar4',
    name: 'Parcel',
    tables: '',
    status: 'Active',
    created: '9 Oct 2023',
    discountPercent: '',
  },
  {
    id: 'ar5',
    name: 'Home Website',
    tables: '',
    status: 'Active',
    created: '24 Mar 2024',
    discountPercent: '',
  },
]

export const menuTables: MenuTable[] = [
  {
    id: 't1',
    tableNo: '2',
    persons: 4,
    extraInfo: '',
    areaName: 'Ground Floor',
    statusOn: true,
    discountPercent: 0,
  },
  {
    id: 't2',
    tableNo: '1',
    persons: 2,
    extraInfo: 'Near window',
    areaName: 'Ground Floor',
    statusOn: true,
    discountPercent: 0,
  },
]

export const menuTaxes: MenuTax[] = [
  {
    id: 'tx1',
    title: 'CGST',
    onlineDisplayName: 'CGST',
    taxType: 'Backward Tax',
    type: 'Percentage',
    amount: '2.5',
    status: 'Active',
    created: '22 Jun 2024',
  },
  {
    id: 'tx2',
    title: 'SGST',
    onlineDisplayName: 'SGST',
    taxType: 'Backward Tax',
    type: 'Percentage',
    amount: '2.5',
    status: 'Active',
    created: '22 Jun 2024',
  },
]

export function getTaxById(id: string) {
  return menuTaxes.find((row) => row.id === id)
}
