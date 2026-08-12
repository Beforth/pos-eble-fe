import type { CartLine, CustomerDetails, OrderType, PaymentMethod } from '../components/billing/BillPanel'

export interface DraftBill {
  id: string
  createdAt: number
  updatedAt: number
  tableId: string
  tableNo: string
  guests: number
  orderType: OrderType
  payment: PaymentMethod
  lines: CartLine[]
  orderNote: string
  customer: CustomerDetails
}

const STORAGE_KEY = 'pos-eble-draft-bills'

export function loadDraftBills(): DraftBill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DraftBill[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveDraftBills(drafts: DraftBill[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

export function upsertDraftBill(
  draft: Omit<DraftBill, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string
  },
): DraftBill {
  const drafts = loadDraftBills()
  const now = Date.now()
  if (draft.id) {
    const index = drafts.findIndex((row) => row.id === draft.id)
    if (index >= 0) {
      const next: DraftBill = {
        ...drafts[index],
        ...draft,
        id: draft.id,
        updatedAt: now,
      }
      drafts[index] = next
      saveDraftBills(drafts)
      return next
    }
  }
  const created: DraftBill = {
    ...draft,
    id: `draft-${now}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  }
  drafts.unshift(created)
  saveDraftBills(drafts)
  return created
}

export function getDraftBill(id: string): DraftBill | null {
  return loadDraftBills().find((row) => row.id === id) ?? null
}

export function deleteDraftBill(id: string): void {
  saveDraftBills(loadDraftBills().filter((row) => row.id !== id))
}

export function draftItemCount(draft: DraftBill): number {
  return draft.lines.reduce((sum, line) => sum + line.qty, 0)
}

export function draftAmount(draft: DraftBill): number {
  return draft.lines.reduce((sum, line) => sum + line.price * line.qty, 0)
}
