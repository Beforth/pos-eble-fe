export const MENU_CHANNELS = {
  'base-menu': { label: 'Base Menu', path: '/menu/base-menu' },
  'home-delivery': { label: 'Home Delivery', path: '/menu/home-delivery' },
  parcel: { label: 'Parcel', path: '/menu/parcel' },
  'dine-in': { label: 'Dine In', path: '/menu/dine-in' },
  zomato: { label: 'Zomato', path: '/menu/zomato' },
  swiggy: { label: 'Swiggy', path: '/menu/swiggy' },
} as const

export type MenuChannelId = keyof typeof MENU_CHANNELS

export function isMenuChannelId(value: string): value is MenuChannelId {
  return value in MENU_CHANNELS
}
