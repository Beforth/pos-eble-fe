import { apiRequest, multipartApiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export interface OutletMembershipSummary {
  outlet_id: number
  encrypted_id: string
  outlet_name: string
  outlet_code: string | null
  groups: string[]
  is_default: boolean
}

export interface OutletSummary {
  id: string
  created_at: string
  updated_at: string
  name: string
  code: string | null
  alias: string
  email: string
  phone: string
  outlet_type: string
  timezone: string
  currency: string
  serving_type: string
  seating_capacity: string
  restaurant_types: string[]
  cuisines: string[]
  online_channels: string[]
  additional_info: string
  address_line1: string
  address_line2: string
  landmark: string
  area: string
  city: string
  state: string
  country: string
  zip_code: string
  latitude: string
  longitude: string
  fax: string
  tin_no: string
  gstin: string
  fssai_no: string
  pan_number: string
  tax_authority: string
  hsn_mandatory_item_level: boolean
  validate_unique_sapcode: boolean
  variation_wise_online_menu: boolean
  enable_kot_for_online_order: boolean
  show_subpayment_details: boolean
  open_24x7: boolean
  closing_hour: string
  closing_minute: string
  extend_closing_notification: boolean
  delivery_slot1_from: string
  delivery_slot1_to: string
  delivery_slot2_from: string
  delivery_slot2_to: string
  online_order_all_days: boolean
  invoice_prefix: string
  starting_invoice_number: string
  invoice_terms_conditions: string
  owner_mobile: string
  manager_phone: string
  decision_maker: string
  direct_number: string
  biller_name: string
  biller_phone: string
  logo: string | null
  images: { id: string; image: string; position: number }[]
}

export interface OutletImageSummary {
  id: string
  image: string
  position: number
}

export type OutletPayload = Partial<
  Omit<
    OutletSummary,
    'id' | 'created_at' | 'updated_at' | 'name' | 'images' | 'logo'
  >
> & { name?: string }

export interface OutletCreatePayload {
  name: string
  code?: string | null
  alias?: string
  outlet_type?: string
  phone: string
  email?: string
  timezone?: string
  seating_capacity?: string
  online_channels?: string[]
  cuisines?: string[]
  address_line1: string
  address_line2?: string
  landmark?: string
  area?: string
  city: string
  state: string
  country?: string
  zip_code: string
  latitude?: string
  longitude?: string
  open_24x7?: boolean
  day_slots?: Record<string, { from: string; to: string }[]>
  holidays?: string[]
  currency?: string
  payment_types?: string[]
  gstin?: string
  fssai_no?: string
  pan_number?: string
  tax_authority?: string
  invoice_prefix?: string
  starting_invoice_number?: string
  invoice_terms_conditions?: string
}

/** FormData payload for the multipart master PATCH. */
export interface OutletUploadPayload {
  logo?: File | null
  images?: File[]
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

/** List the current user's outlets (memberships). */
export async function listOutletsApi(): Promise<OutletMembershipSummary[]> {
  return apiRequest<OutletMembershipSummary[]>('/api/v1/outlets/', {
    method: 'GET',
    token: authToken(),
  })
}

/** Create an outlet. Requires the outlets.add_outlet permission. */
export async function createOutletApi(
  payload: OutletCreatePayload,
): Promise<OutletSummary> {
  return apiRequest<OutletSummary>('/api/v1/outlets/', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

/** Resolve the active outlet to an encrypted id. */
export async function switchOutletApi(
  outletId: number,
): Promise<OutletMembershipSummary> {
  return apiRequest<OutletMembershipSummary>('/api/v1/outlets/switch/', {
    method: 'POST',
    body: JSON.stringify({ outlet_id: outletId }),
    token: authToken(),
  })
}

/** Get an outlet's master record. */
export async function getOutletApi(
  encryptedId: string,
): Promise<OutletSummary> {
  return apiRequest<OutletSummary>(`/api/v1/outlets/${encryptedId}/`, {
    method: 'GET',
    token: authToken(),
  })
}

/**
 * Single-value fields are appended flat (booleans as "true"/"false", list
 * fields as JSON strings); files are appended under their own key.
 */
function appendMultipartField(
  form: FormData,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return
  if (typeof value === 'boolean') {
    form.append(key, value ? 'true' : 'false')
  } else if (Array.isArray(value)) {
    form.append(key, JSON.stringify(value))
  } else if (value instanceof File || value instanceof Blob) {
    form.append(key, value)
  } else {
    form.append(key, String(value))
  }
}

/** Build a multipart form from a flat payload and optional files. */
export function buildOutletFormData(
  payload: OutletPayload,
  files?: OutletUploadPayload,
): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    appendMultipartField(form, key, value)
  }
  if (files?.logo) form.append('logo', files.logo)
  for (const image of files?.images ?? []) {
    form.append('images', image)
  }
  return form
}

/** Update an outlet (multipart). Requires change_outlet. */
export async function updateOutletApi(
  encryptedId: string,
  payload: OutletPayload,
  files?: OutletUploadPayload,
): Promise<OutletSummary> {
  const form = buildOutletFormData(payload, files)
  return multipartApiRequest<OutletSummary>(
    `/api/v1/outlets/${encryptedId}/`,
    form,
    { method: 'PATCH', token: authToken() },
  )
}

const SETTINGS_GROUPS = [
  'display',
  'calculations',
  'print',
  'customer',
  'connected-services',
  'online-advance',
  'billing-system',
  'sms',
  'payment',
  'time-slots',
  'reasons-otp',
] as const

export type OutletSettingsGroup = (typeof SETTINGS_GROUPS)[number]

export type OutletSettingsRecord = Record<string, unknown>

export function isSettingsGroup(value: string): value is OutletSettingsGroup {
  return (SETTINGS_GROUPS as readonly string[]).includes(value)
}

/** Get one settings group for an outlet. */
export async function getOutletSettingsApi(
  encryptedId: string,
  group: OutletSettingsGroup,
): Promise<OutletSettingsRecord> {
  return apiRequest<OutletSettingsRecord>(
    `/api/v1/outlets/${encryptedId}/settings/${group}/`,
    { method: 'GET', token: authToken() },
  )
}

/** Update one settings group for an outlet (JSON body). */
export async function updateOutletSettingsApi(
  encryptedId: string,
  group: OutletSettingsGroup,
  payload: OutletSettingsRecord,
): Promise<OutletSettingsRecord> {
  return apiRequest<OutletSettingsRecord>(
    `/api/v1/outlets/${encryptedId}/settings/${group}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
      token: authToken(),
    },
  )
}

/**
 * Update one settings group with multipart encoding (file upload, e.g. the
 * print logo). Lists are JSON-encoded; booleans sent as "true"/"false".
 */
export async function updateOutletSettingsMultipartApi(
  encryptedId: string,
  group: OutletSettingsGroup,
  payload: OutletSettingsRecord,
  files?: Record<string, File | undefined>,
): Promise<OutletSettingsRecord> {
  const form = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    appendMultipartField(form, key, value)
  }
  for (const [key, file] of Object.entries(files ?? {})) {
    if (file) form.append(key, file)
  }
  return multipartApiRequest<OutletSettingsRecord>(
    `/api/v1/outlets/${encryptedId}/settings/${group}/`,
    form,
    { method: 'PATCH', token: authToken() },
  )
}

export interface OutletDocumentRecord {
  id: number
  name: string
  is_custom: boolean
  file: string | null
}

export interface OutletDocumentInput {
  name: string
  is_custom: boolean
}

/** Get an outlet's uploaded documents. */
export async function getOutletDocumentsApi(
  encryptedId: string,
): Promise<{ documents: OutletDocumentRecord[] }> {
  return apiRequest<{ documents: OutletDocumentRecord[] }>(
    `/api/v1/outlets/${encryptedId}/documents/`,
    { method: 'GET', token: authToken() },
  )
}

export interface OutletDocumentsUploadPayload {
  documents: OutletDocumentInput[]
  files: (File | null)[]
}

/**
 * Update outlet documents (multipart, full-replace). The `files` list is
 * index-aligned with `documents`; rows without a new upload are padded with an
 * empty Blob so positions stay aligned (the server treats zero-size parts as
 * "keep the previous file").
 */
export async function updateOutletDocumentsApi(
  encryptedId: string,
  payload: OutletDocumentsUploadPayload,
): Promise<{ documents: OutletDocumentRecord[] }> {
  const form = new FormData()
  form.append('documents', JSON.stringify(payload.documents))
  for (const file of payload.files) {
    form.append('files', file ?? new Blob([]))
  }
  return multipartApiRequest<{ documents: OutletDocumentRecord[] }>(
    `/api/v1/outlets/${encryptedId}/documents/`,
    form,
    { method: 'PATCH', token: authToken() },
  )
}

export type InvoiceSequenceType = 'group' | 'order_type' | 'virtual_brand'

export interface InvoiceSequenceRecord {
  id: string
  invoice_id: string
  name: string
  prefix: string
  number_length: number
  suffix: string
  sequence_type: InvoiceSequenceType
  groups: string[]
  order_types: string[]
  brands: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type InvoiceSequencePayload = Omit<
  InvoiceSequenceRecord,
  'id' | 'created_at' | 'updated_at'
>

/** List an outlet's invoice sequences; optional status=active|inactive. */
export async function listInvoiceSequencesApi(
  encryptedId: string,
  status?: 'active' | 'inactive',
): Promise<InvoiceSequenceRecord[]> {
  const query = status ? `?status=${status}` : ''
  return apiRequest<InvoiceSequenceRecord[]>(
    `/api/v1/outlets/${encryptedId}/invoice-sequences/${query}`,
    { method: 'GET', token: authToken() },
  )
}

/** Create an invoice sequence. */
export async function createInvoiceSequenceApi(
  encryptedId: string,
  payload: InvoiceSequencePayload,
): Promise<InvoiceSequenceRecord> {
  return apiRequest<InvoiceSequenceRecord>(
    `/api/v1/outlets/${encryptedId}/invoice-sequences/`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      token: authToken(),
    },
  )
}

/** Partially update an invoice sequence (e.g. toggle is_active). */
export async function updateInvoiceSequenceApi(
  encryptedId: string,
  sequenceId: string,
  payload: Partial<InvoiceSequencePayload>,
): Promise<InvoiceSequenceRecord> {
  return apiRequest<InvoiceSequenceRecord>(
    `/api/v1/outlets/${encryptedId}/invoice-sequences/${sequenceId}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
      token: authToken(),
    },
  )
}

export interface FloorItemRecord {
  kind: string
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  font_size: number
}

export interface FloorPlanRecord {
  id: string
  name: string
  is_active: boolean
  items: FloorItemRecord[]
  created_at: string
  updated_at: string
}

export type FloorPlanPayload = Omit<
  FloorPlanRecord,
  'id' | 'created_at' | 'updated_at'
>

/** List an outlet's floor plans. */
export async function listFloorPlansApi(
  encryptedId: string,
): Promise<FloorPlanRecord[]> {
  return apiRequest<FloorPlanRecord[]>(
    `/api/v1/outlets/${encryptedId}/floor-plans/`,
    { method: 'GET', token: authToken() },
  )
}

/** Create a floor plan (items full-replaced from array order). */
export async function createFloorPlanApi(
  encryptedId: string,
  payload: FloorPlanPayload,
): Promise<FloorPlanRecord> {
  return apiRequest<FloorPlanRecord>(
    `/api/v1/outlets/${encryptedId}/floor-plans/`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      token: authToken(),
    },
  )
}

/** Partially update a floor plan; `items` full-replaces when present. */
export async function updateFloorPlanApi(
  encryptedId: string,
  planId: string,
  payload: Partial<FloorPlanPayload>,
): Promise<FloorPlanRecord> {
  return apiRequest<FloorPlanRecord>(
    `/api/v1/outlets/${encryptedId}/floor-plans/${planId}/`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
      token: authToken(),
    },
  )
}

/** Delete a floor plan. */
export async function deleteFloorPlanApi(
  encryptedId: string,
  planId: string,
): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/v1/outlets/${encryptedId}/floor-plans/${planId}/`,
    { method: 'DELETE', token: authToken() },
  )
}