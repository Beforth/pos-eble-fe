const STORAGE_KEY = 'outlets_store'

export interface OutletData {
  id: string
  outletName: string
  outletAlias: string
  outletType: string
  phone: string
  email: string
  timezone: string
  seatingCapacity: string
  onlineChannels: string[]
  cuisines: string[]
  addressLine1: string
  addressLine2: string
  landmark: string
  area: string
  city: string
  state: string
  country: string
  zipCode: string
  latitude: string
  longitude: string
  open24x7: boolean
  daySlots: Record<string, { from: string; to: string }[]>
  holidays: string[]
  currency: string
  paymentTypes: string[]
  gstin: string
  fssai: string
  panNumber: string
  taxAuthority: string
  invoicePrefix: string
  startingNumber: string
  termsConditions: string
  createdAt: string
}

function readStore(): OutletData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeStore(outlets: OutletData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(outlets))
}

export function getOutlets(): OutletData[] {
  return readStore()
}

export function addOutlet(
  data: Omit<OutletData, 'id' | 'createdAt'>,
): OutletData {
  const outlet: OutletData = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const outlets = readStore()
  outlets.push(outlet)
  writeStore(outlets)
  return outlet
}

export function deleteOutlet(id: string) {
  const outlets = readStore().filter((o) => o.id !== id)
  writeStore(outlets)
}
