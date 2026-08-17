import type { KotScreen } from '../mocks/screensData'

const STORAGE_KEY = 'pos-eble-kot-screens'

export function loadScreens(): KotScreen[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as KotScreen[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveScreens(screens: KotScreen[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(screens))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pos-eble-kot-screens', { detail: screens }))
    try {
      const channel = new BroadcastChannel('pos-eble-kot-sync')
      channel.postMessage({ type: 'screens_updated', screens })
      channel.close()
    } catch {
      // BroadcastChannel optional fallback
    }
  }
}

export function upsertScreen(
  screen: Omit<KotScreen, 'id' | 'createdAt'> & { id?: string },
): KotScreen {
  const screens = loadScreens()
  if (screen.id) {
    const index = screens.findIndex((row) => row.id === screen.id)
    if (index >= 0) {
      const next: KotScreen = { ...screens[index], ...screen, id: screen.id }
      screens[index] = next
      saveScreens(screens)
      return next
    }
  }
  const created: KotScreen = {
    ...screen,
    id: screen.id ?? `screen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  }
  screens.unshift(created)
  saveScreens(screens)
  return created
}

export function getScreen(id: string): KotScreen | null {
  if (!id) return null
  const screens = loadScreens()
  const existing = screens.find((row) => row.id === id)
  if (existing) return existing

  // If a specific screen ID is requested (e.g. from URL), auto-initialize it so it displays all KOTs
  if (id.startsWith('screen-')) {
    const autoScreen: KotScreen = {
      id,
      name: 'Kitchen Display Screen',
      categoryIds: [],
      itemIds: [],
      createdAt: Date.now(),
    }
    screens.unshift(autoScreen)
    saveScreens(screens)
    return autoScreen
  }

  return null
}

export function deleteScreen(id: string): void {
  saveScreens(loadScreens().filter((row) => row.id !== id))
}
