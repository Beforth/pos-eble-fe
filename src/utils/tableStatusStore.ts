import type { TableFloorStatus } from '../mocks/billingTables'

const STORAGE_KEY = 'pos-eble-table-floor-statuses'

export function loadTableStatuses(): Record<string, TableFloorStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, TableFloorStatus>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveTableStatuses(statuses: Record<string, TableFloorStatus>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
}

export function getTableStatus(tableId: string): TableFloorStatus {
  if (!tableId || tableId === 'no-table') return 'blank'
  return loadTableStatuses()[tableId] ?? 'blank'
}

/** Set status from a real order action — never from mere table selection. */
export function setTableStatus(
  tableId: string,
  status: TableFloorStatus,
): void {
  if (!tableId || tableId === 'no-table') return
  const statuses = loadTableStatuses()
  if (status === 'blank') {
    delete statuses[tableId]
  } else {
    statuses[tableId] = status
  }
  saveTableStatuses(statuses)
}

export function clearTableStatus(tableId: string): void {
  setTableStatus(tableId, 'blank')
}
