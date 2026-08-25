import type { MenuItemRow } from './menuItemsData'

const STORAGE_KEY = 'combo_items_store'

function readStore(): MenuItemRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeStore(items: MenuItemRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function getComboItems(): MenuItemRow[] {
  return readStore()
}

export function addComboItem(item: MenuItemRow) {
  const items = readStore()
  items.push(item)
  writeStore(items)
}

export function deleteComboItem(id: string) {
  const items = readStore().filter((i) => i.id !== id)
  writeStore(items)
}
