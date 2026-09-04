export interface SubOrderTypeRow {
  id: string
  name: string
  type: 'Default Order Type' | 'Third Party Integration' | 'Manual'
  orderTypes: string
  active: boolean
  created: string
  editable: boolean
}

const STORAGE_KEY = 'sub-order-type-rows'

const INITIAL_ROWS: SubOrderTypeRow[] = [
  {
    id: 'sot-1',
    name: 'PARCEL',
    type: 'Default Order Type',
    orderTypes: 'PARCEL',
    active: true,
    created: '28 Jul 2023',
    editable: false,
  },
  {
    id: 'sot-2',
    name: 'DINE IN',
    type: 'Default Order Type',
    orderTypes: 'DINE IN',
    active: true,
    created: '28 Jul 2023',
    editable: false,
  },
  {
    id: 'sot-3',
    name: 'Zomato',
    type: 'Third Party Integration',
    orderTypes: 'PARCEL, DINE IN',
    active: true,
    created: '9 Oct 2023',
    editable: false,
  },
  {
    id: 'sot-4',
    name: 'Swiggy',
    type: 'Third Party Integration',
    orderTypes: 'PARCEL, DINE IN',
    active: true,
    created: '9 Oct 2023',
    editable: false,
  },
  {
    id: 'sot-5',
    name: 'Home Website',
    type: 'Third Party Integration',
    orderTypes: 'PARCEL, DINE IN',
    active: true,
    created: '21 Mar 2024',
    editable: false,
  },
  {
    id: 'sot-6',
    name: 'Parcel',
    type: 'Manual',
    orderTypes: 'Dine In',
    active: true,
    created: '16 Jan 2025',
    editable: true,
  },
]

let cache: SubOrderTypeRow[] | null = null

function read(): SubOrderTypeRow[] {
  if (cache) return cache
  if (typeof window === 'undefined') return INITIAL_ROWS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        cache = parsed
        return parsed
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  cache = INITIAL_ROWS
  return INITIAL_ROWS
}

function write(rows: SubOrderTypeRow[]) {
  cache = rows
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  }
  listeners.forEach((listener) => listener())
}

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getRows(): SubOrderTypeRow[] {
  return read()
}

export function addRow(row: SubOrderTypeRow) {
  write([...read(), row])
}

export function updateRow(id: string, patch: Partial<SubOrderTypeRow>) {
  write(read().map((row) => (row.id === id ? { ...row, ...patch } : row)))
}

export function setRowsActive(ids: string[], active: boolean) {
  const idSet = new Set(ids)
  write(
    read().map((row) => (idSet.has(row.id) ? { ...row, active } : row)),
  )
}

export function deleteRows(ids: string[]) {
  const idSet = new Set(ids)
  write(read().filter((row) => !idSet.has(row.id)))
}

export function findRow(id: string): SubOrderTypeRow | undefined {
  return read().find((row) => row.id === id)
}
