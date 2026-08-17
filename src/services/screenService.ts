import {
  allCategories,
  autoScreenName,
  categoryName,
  type KotScreen,
  type ScreenCategory,
} from '../mocks/screensData'
import {
  deleteScreen,
  getScreen,
  loadScreens,
  upsertScreen,
} from '../utils/screenStore'

/**
 * Screen catalog API (mocked).
 *
 * Swap `mockDelay().then(...)` bodies for real `fetch('/api/screens')` calls
 * when the backend is ready — keep the exported function signatures intact so
 * the UI does not change.
 */

function mockDelay(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 350))
}

export function fetchCategories(): Promise<ScreenCategory[]> {
  return mockDelay().then(() => allCategories())
}

export function fetchScreens(): Promise<KotScreen[]> {
  return mockDelay().then(() => loadScreens())
}

export function fetchScreen(id: string): Promise<KotScreen | null> {
  return mockDelay().then(() => getScreen(id))
}

export function createScreen(config: {
  categoryIds: string[]
  itemIds?: string[]
  name?: string
}): Promise<KotScreen> {
  const name =
    config.name ?? autoScreenName(config.categoryIds.map(categoryName))
  return mockDelay().then(() =>
    upsertScreen({ ...config, itemIds: config.itemIds ?? [], name }),
  )
}

export function removeScreen(id: string): Promise<void> {
  return mockDelay().then(() => deleteScreen(id))
}
