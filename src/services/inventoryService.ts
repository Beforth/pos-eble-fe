import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export const INV_READ_PERMISSION = 'accounts.inv_raw_material_master_read'
export const INV_WRITE_PERMISSION = 'accounts.inv_raw_material_master_write'
export const INV_SUPPLIER_READ_PERMISSION = 'accounts.inv_supplier_inventory_read'
export const INV_SUPPLIER_WRITE_PERMISSION = 'accounts.inv_supplier_inventory_write'
export const INV_PURCHASE_READ_PERMISSION = 'accounts.inv_purchase_inventory_read'
export const INV_PURCHASE_WRITE_PERMISSION = 'accounts.inv_purchase_inventory_write'
export const INV_SALES_READ_PERMISSION =
  'accounts.inv_internal_transfer_sales_read'
export const INV_SALES_WRITE_PERMISSION =
  'accounts.inv_internal_transfer_sales_write'
export const INV_WASTAGE_READ_PERMISSION = 'accounts.inv_wastage_inventory_read'
export const INV_WASTAGE_WRITE_PERMISSION =
  'accounts.inv_wastage_inventory_write'

export type InventoryUnit = {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type InventoryCategory = {
  id: string
  name: string
  parent_id: string | null
  parent_name: string | null
  is_active: boolean
  position: number
  created_at: string
  updated_at: string
}

export type UnitRef = {
  id: string
  name: string
}

export type CategoryRef = {
  id: string
  name: string
}

export type MaxStockRow = {
  qty: string
  unit_id: string
  unit_name: string
}

export type RawMaterial = {
  id: string
  name: string
  purchase_units: UnitRef[]
  consumption_unit: UnitRef
  conversion_purchase_unit: UnitRef | null
  conversion_qty: string
  category: CategoryRef | null
  sub_category: CategoryRef | null
  purchase_price: string
  transfer_price: string
  reconciliation_price: string
  tax_type: string
  tax_percent: string
  min_stock_unit: UnitRef | null
  min_stock_level: string
  at_par_unit: UnitRef | null
  at_par_level: string
  closing_cycles: string[]
  allow_restock: boolean
  barcode: string
  hsn_code: string
  exclusive_to_outlet: boolean
  is_expiry: boolean
  allow_decimal: boolean
  description: string
  normal_loss_percent: string
  excise_qty: string
  gtin: string
  brand: string
  is_favourite: boolean
  is_active: boolean
  max_stock_rows: MaxStockRow[]
  created_at: string
  updated_at: string
}

export type RawMaterialPayload = {
  name: string
  purchase_unit_ids: string[]
  consumption_unit_id: string
  conversion_purchase_unit_id?: string | null
  conversion_qty?: string
  category_id?: string | null
  sub_category_id?: string | null
  purchase_price?: string
  transfer_price?: string
  reconciliation_price?: string
  tax_type?: string
  tax_percent?: string
  min_stock_unit_id?: string | null
  min_stock_level?: string
  at_par_unit_id?: string | null
  at_par_level?: string
  closing_cycles?: string[]
  allow_restock?: boolean
  barcode?: string
  hsn_code?: string
  exclusive_to_outlet?: boolean
  is_expiry?: boolean
  allow_decimal?: boolean
  description?: string
  normal_loss_percent?: string
  excise_qty?: string
  gtin?: string
  brand?: string
  is_favourite?: boolean
  is_active?: boolean
  max_stock_rows?: { qty: string; unit_id: string }[]
}

export type RawMaterialListData = {
  count: number
  results: RawMaterial[]
  next: string | null
  previous: string | null
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

export function formatInventoryStamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export async function listUnitsApi(): Promise<InventoryUnit[]> {
  return apiRequest<InventoryUnit[]>('/api/v1/inventory/units/', {
    method: 'GET',
    token: authToken(),
  })
}

export async function createUnitApi(name: string): Promise<InventoryUnit> {
  return apiRequest<InventoryUnit>('/api/v1/inventory/units/', {
    method: 'POST',
    body: JSON.stringify({ name }),
    token: authToken(),
  })
}

export async function updateUnitApi(
  id: string,
  payload: { name?: string; is_active?: boolean },
): Promise<InventoryUnit> {
  return apiRequest<InventoryUnit>(`/api/v1/inventory/units/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteUnitApi(id: string): Promise<void> {
  await apiRequest(`/api/v1/inventory/units/${id}/`, {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listCategoriesApi(): Promise<InventoryCategory[]> {
  return apiRequest<InventoryCategory[]>('/api/v1/inventory/categories/', {
    method: 'GET',
    token: authToken(),
  })
}

export async function createCategoryApi(payload: {
  name: string
  parent_id?: string | null
  is_active?: boolean
}): Promise<InventoryCategory> {
  return apiRequest<InventoryCategory>('/api/v1/inventory/categories/', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateCategoryApi(
  id: string,
  payload: {
    name?: string
    parent_id?: string | null
    is_active?: boolean
  },
): Promise<InventoryCategory> {
  return apiRequest<InventoryCategory>(`/api/v1/inventory/categories/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiRequest(`/api/v1/inventory/categories/${id}/`, {
    method: 'DELETE',
    token: authToken(),
  })
}

function rawPath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/raw-materials/${suffix}`
}

export async function listRawMaterialsApi(
  outletId: string,
  params?: { search?: string; categoryId?: string; page?: number },
): Promise<RawMaterialListData> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.categoryId) query.set('category_id', params.categoryId)
  if (params?.page) query.set('page', String(params.page))
  query.set('page_size', '100')
  const qs = query.toString()
  return apiRequest<RawMaterialListData>(`${rawPath(outletId)}${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    token: authToken(),
  })
}

export async function getRawMaterialApi(
  outletId: string,
  id: string,
): Promise<RawMaterial> {
  return apiRequest<RawMaterial>(rawPath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createRawMaterialApi(
  outletId: string,
  payload: RawMaterialPayload,
): Promise<RawMaterial> {
  return apiRequest<RawMaterial>(rawPath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateRawMaterialApi(
  outletId: string,
  id: string,
  payload: Partial<RawMaterialPayload>,
): Promise<RawMaterial> {
  return apiRequest<RawMaterial>(rawPath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteRawMaterialApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(rawPath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listAllRawMaterialsApi(
  outletId: string,
): Promise<RawMaterial[]> {
  const first = await listRawMaterialsApi(outletId, { page: 1 })
  const rows = [...first.results]
  let page = 2
  while (rows.length < first.count) {
    const next = await listRawMaterialsApi(outletId, { page })
    if (next.results.length === 0) break
    rows.push(...next.results)
    page += 1
  }
  return rows
}

export function unitIdByName(
  units: InventoryUnit[],
  name: string,
): string | undefined {
  const needle = name.trim().toLowerCase()
  return units.find((row) => row.name.toLowerCase() === needle)?.id
}

export function categoryIdByName(
  categories: InventoryCategory[],
  name: string,
): string | undefined {
  const needle = name.trim().toLowerCase()
  if (!needle || needle === 'no category' || needle === 'no sub category') {
    return undefined
  }
  return categories.find((row) => row.name.toLowerCase() === needle)?.id
}

export type PaginatedList<T> = {
  count: number
  results: T[]
  next: string | null
  previous: string | null
}

export type Supplier = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  registered_under_gst: boolean
  gst_no: string
  register_address: string
  state: string
  city: string
  pin_code: string
  shipping_address: string
  shipping_state: string
  shipping_city: string
  shipping_pin_code: string
  fssai_lic_no: string
  pan: string
  msme_number: string
  tan: string
  cin: string
  tcs_percent: string
  type: string
  payment_terms: string
  delivery_terms: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SupplierPayload = {
  name: string
  company: string
  email?: string
  phone?: string
  registered_under_gst?: boolean
  gst_no?: string
  register_address?: string
  state?: string
  city?: string
  pin_code?: string
  shipping_address?: string
  shipping_state?: string
  shipping_city?: string
  shipping_pin_code?: string
  fssai_lic_no?: string
  pan?: string
  msme_number?: string
  tan?: string
  cin?: string
  tcs_percent?: string
  type?: string
  payment_terms?: string
  delivery_terms?: string
  is_active?: boolean
}

export type PurchaseLine = {
  raw_material_id: string
  raw_material_name: string
  qty: string
  unit_id: string
  unit_name: string
  price: string
  amount: string
  cgst: string
  sgst: string
  igst: string
  note: string
}

export type Purchase = {
  id: string
  source_type: string
  supplier_id: string | null
  supplier_name: string | null
  restaurant_id: string | null
  restaurant_name: string | null
  invoice_date: string
  invoice_number: string
  subtotal: string
  discount: string
  other_charges: string
  other_taxes: string
  grand_total: string
  payment_status: string
  update_inventory_stock: boolean
  lines: PurchaseLine[]
  created_at: string
  updated_at: string
}

export type PurchasePayload = {
  source_type: string
  supplier_id?: string | null
  restaurant_id?: string | null
  invoice_date: string
  invoice_number?: string
  subtotal?: string
  discount?: string
  other_charges?: string
  other_taxes?: string
  grand_total?: string
  payment_status?: string
  update_inventory_stock?: boolean
  lines: {
    raw_material_id: string
    qty: string
    unit_id: string
    price?: string
    amount?: string
    cgst?: string
    sgst?: string
    igst?: string
    note?: string
  }[]
}

export type SimpleDocLine = {
  raw_material_id: string
  raw_material_name: string
  qty: string
  unit_id: string
  unit_name: string
  price: string
  amount: string
  note: string
}

export type PurchaseOrder = {
  id: string
  source_type: string
  supplier_id: string | null
  supplier_name: string | null
  restaurant_id: string | null
  restaurant_name: string | null
  delivery_date: string
  delivery_time: string | null
  po_number: string
  recipient_can_edit: boolean
  subtotal: string
  delivery_charges: string
  grand_total: string
  lines: SimpleDocLine[]
  created_at: string
  updated_at: string
}

export type PurchaseOrderPayload = {
  source_type: string
  supplier_id?: string | null
  restaurant_id?: string | null
  delivery_date: string
  delivery_time?: string | null
  po_number?: string
  recipient_can_edit?: boolean
  subtotal?: string
  delivery_charges?: string
  grand_total?: string
  lines: {
    raw_material_id: string
    qty: string
    unit_id: string
    price?: string
    amount?: string
    note?: string
  }[]
}

export type RecipeLine = {
  raw_material_id: string
  raw_material_name: string
  qty: string
  unit_id: string
  unit_name: string
  area: string
}

export type ItemRecipe = {
  id: string
  item_id: string
  item_name: string
  item_category_name: string
  lines: RecipeLine[]
  created_at: string
  updated_at: string
}

export type RecipePayload = {
  item_id: string
  lines?: {
    raw_material_id: string
    qty: string
    unit_id: string
    area?: string
  }[]
}

export type MenuItemRef = {
  id: string
  name: string
  category_name: string
}

export type DocListParams = {
  search?: string
  dateFrom?: string
  dateTo?: string
  sourceType?: string
  page?: number
}

async function loadAllPages<T>(
  fetchPage: (page: number) => Promise<PaginatedList<T>>,
): Promise<T[]> {
  const first = await fetchPage(1)
  const rows = [...first.results]
  let page = 2
  while (rows.length < first.count) {
    const next = await fetchPage(page)
    if (next.results.length === 0) break
    rows.push(...next.results)
    page += 1
  }
  return rows
}

function docQuery(params?: DocListParams): string {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.dateFrom) query.set('date_from', params.dateFrom)
  if (params?.dateTo) query.set('date_to', params.dateTo)
  if (params?.sourceType && params.sourceType !== 'all') {
    query.set('source_type', params.sourceType)
  }
  if (params?.page) query.set('page', String(params.page))
  query.set('page_size', '100')
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export async function listSuppliersApi(search?: string): Promise<Supplier[]> {
  const query = new URLSearchParams()
  if (search) query.set('search', search)
  const qs = query.toString()
  return apiRequest<Supplier[]>(
    `/api/v1/inventory/suppliers/${qs ? `?${qs}` : ''}`,
    { method: 'GET', token: authToken() },
  )
}

export async function getSupplierApi(id: string): Promise<Supplier> {
  return apiRequest<Supplier>(`/api/v1/inventory/suppliers/${id}/`, {
    method: 'GET',
    token: authToken(),
  })
}

export async function createSupplierApi(
  payload: SupplierPayload,
): Promise<Supplier> {
  return apiRequest<Supplier>('/api/v1/inventory/suppliers/', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateSupplierApi(
  id: string,
  payload: Partial<SupplierPayload>,
): Promise<Supplier> {
  return apiRequest<Supplier>(`/api/v1/inventory/suppliers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteSupplierApi(id: string): Promise<void> {
  await apiRequest(`/api/v1/inventory/suppliers/${id}/`, {
    method: 'DELETE',
    token: authToken(),
  })
}

function purchasePath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/purchases/${suffix}`
}

function poPath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/purchase-orders/${suffix}`
}

function returnPath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/purchase-returns/${suffix}`
}

function recipePath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/recipes/${suffix}`
}

export async function listPurchasesApi(
  outletId: string,
  params?: DocListParams,
): Promise<PaginatedList<Purchase>> {
  return apiRequest<PaginatedList<Purchase>>(
    `${purchasePath(outletId)}${docQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllPurchasesApi(
  outletId: string,
  params?: DocListParams,
): Promise<Purchase[]> {
  return loadAllPages((page) =>
    listPurchasesApi(outletId, { ...params, page }),
  )
}

export async function getPurchaseApi(
  outletId: string,
  id: string,
): Promise<Purchase> {
  return apiRequest<Purchase>(purchasePath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createPurchaseApi(
  outletId: string,
  payload: PurchasePayload,
): Promise<Purchase> {
  return apiRequest<Purchase>(purchasePath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updatePurchaseApi(
  outletId: string,
  id: string,
  payload: Partial<PurchasePayload>,
): Promise<Purchase> {
  return apiRequest<Purchase>(purchasePath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deletePurchaseApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(purchasePath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listPurchaseOrdersApi(
  outletId: string,
  params?: DocListParams,
): Promise<PaginatedList<PurchaseOrder>> {
  return apiRequest<PaginatedList<PurchaseOrder>>(
    `${poPath(outletId)}${docQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllPurchaseOrdersApi(
  outletId: string,
  params?: DocListParams,
): Promise<PurchaseOrder[]> {
  return loadAllPages((page) =>
    listPurchaseOrdersApi(outletId, { ...params, page }),
  )
}

export async function getPurchaseOrderApi(
  outletId: string,
  id: string,
): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(poPath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createPurchaseOrderApi(
  outletId: string,
  payload: PurchaseOrderPayload,
): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(poPath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updatePurchaseOrderApi(
  outletId: string,
  id: string,
  payload: Partial<PurchaseOrderPayload>,
): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(poPath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deletePurchaseOrderApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(poPath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listPurchaseReturnsApi(
  outletId: string,
  params?: DocListParams,
): Promise<PaginatedList<PurchaseOrder>> {
  return apiRequest<PaginatedList<PurchaseOrder>>(
    `${returnPath(outletId)}${docQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllPurchaseReturnsApi(
  outletId: string,
  params?: DocListParams,
): Promise<PurchaseOrder[]> {
  return loadAllPages((page) =>
    listPurchaseReturnsApi(outletId, { ...params, page }),
  )
}

export async function getPurchaseReturnApi(
  outletId: string,
  id: string,
): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(returnPath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createPurchaseReturnApi(
  outletId: string,
  payload: PurchaseOrderPayload,
): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(returnPath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updatePurchaseReturnApi(
  outletId: string,
  id: string,
  payload: Partial<PurchaseOrderPayload>,
): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(returnPath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deletePurchaseReturnApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(returnPath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listRecipesApi(
  outletId: string,
  params?: { search?: string; page?: number },
): Promise<PaginatedList<ItemRecipe>> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.page) query.set('page', String(params.page))
  query.set('page_size', '100')
  const qs = query.toString()
  return apiRequest<PaginatedList<ItemRecipe>>(
    `${recipePath(outletId)}${qs ? `?${qs}` : ''}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllRecipesApi(outletId: string): Promise<ItemRecipe[]> {
  return loadAllPages((page) => listRecipesApi(outletId, { page }))
}

export async function getRecipeApi(
  outletId: string,
  id: string,
): Promise<ItemRecipe> {
  return apiRequest<ItemRecipe>(recipePath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createRecipeApi(
  outletId: string,
  payload: RecipePayload,
): Promise<ItemRecipe> {
  return apiRequest<ItemRecipe>(recipePath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateRecipeApi(
  outletId: string,
  id: string,
  payload: Partial<RecipePayload>,
): Promise<ItemRecipe> {
  return apiRequest<ItemRecipe>(recipePath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteRecipeApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(recipePath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listRecipeMenuItemsApi(
  outletId: string,
): Promise<MenuItemRef[]> {
  return apiRequest<MenuItemRef[]>(
    `${recipePath(outletId)}?menu_items=1&page_size=100`,
    { method: 'GET', token: authToken() },
  )
}

export type TaxedDocLine = {
  raw_material_id: string
  raw_material_name: string
  qty: string
  unit_id: string
  unit_name: string
  price: string
  amount: string
  cgst: string
  sgst: string
  igst: string
  note: string
}

export type Sale = {
  id: string
  source_type: string
  supplier_id: string | null
  supplier_name: string | null
  restaurant_id: string | null
  restaurant_name: string | null
  invoice_date: string
  invoice_number: string
  subtotal: string
  discount: string
  other_charges: string
  other_taxes: string
  grand_total: string
  payment_status: string
  payment_date: string | null
  paid_amount: string
  payment_method: string
  update_inventory_stock: boolean
  recipient_can_edit: boolean
  lines: TaxedDocLine[]
  created_at: string
  updated_at: string
}

export type SalePayload = {
  source_type: string
  supplier_id?: string | null
  restaurant_id?: string | null
  invoice_date: string
  invoice_number?: string
  subtotal?: string
  discount?: string
  other_charges?: string
  other_taxes?: string
  grand_total?: string
  payment_status?: string
  payment_date?: string | null
  paid_amount?: string
  payment_method?: string
  update_inventory_stock?: boolean
  recipient_can_edit?: boolean
  lines: {
    raw_material_id: string
    qty: string
    unit_id: string
    price?: string
    amount?: string
    cgst?: string
    sgst?: string
    igst?: string
    note?: string
  }[]
}

export type StockTransfer = {
  id: string
  source_type: string
  supplier_id: string | null
  supplier_name: string | null
  restaurant_id: string | null
  restaurant_name: string | null
  invoice_date: string
  challan_number: string
  grand_total: string
  payment_status: string
  payment_date: string | null
  paid_amount: string
  payment_method: string
  update_inventory_stock: boolean
  recipient_can_edit: boolean
  lines: SimpleDocLine[]
  created_at: string
  updated_at: string
}

export type StockTransferPayload = {
  source_type: string
  supplier_id?: string | null
  restaurant_id?: string | null
  invoice_date: string
  challan_number?: string
  grand_total?: string
  payment_status?: string
  payment_date?: string | null
  paid_amount?: string
  payment_method?: string
  update_inventory_stock?: boolean
  recipient_can_edit?: boolean
  lines: {
    raw_material_id: string
    qty: string
    unit_id: string
    price?: string
    amount?: string
    note?: string
  }[]
}

export type WastageLine = {
  raw_material_id: string | null
  raw_material_name: string | null
  item_id: string | null
  item_name: string | null
  qty: string
  unit_id: string | null
  unit_name: string | null
  avg_purchase_price: string
  amount: string
  note: string
}

export type Wastage = {
  id: string
  wastage_for: string
  wastage_date: string
  wastage_by_area: string
  status: string
  total_amount: string
  lines: WastageLine[]
  created_at: string
  updated_at: string
}

export type WastagePayload = {
  wastage_for?: string
  wastage_date: string
  wastage_by_area?: string
  status?: string
  total_amount?: string
  lines: {
    raw_material_id?: string | null
    item_id?: string | null
    qty: string
    unit_id?: string | null
    avg_purchase_price?: string
    amount?: string
    note?: string
  }[]
}

export type SalesReturnDoc = {
  id: string
  source_type: string
  supplier_id: string | null
  supplier_name: string | null
  restaurant_id: string | null
  restaurant_name: string | null
  invoice_date: string
  credit_note_number: string
  sale_invoice_number: string
  subtotal: string
  discount: string
  other_charges: string
  other_taxes: string
  grand_total: string
  payment_status: string
  payment_date: string | null
  paid_amount: string
  payment_method: string
  update_inventory_stock: boolean
  lines: TaxedDocLine[]
  created_at: string
  updated_at: string
}

export type SalesReturnPayload = {
  source_type: string
  supplier_id?: string | null
  restaurant_id?: string | null
  invoice_date: string
  credit_note_number?: string
  sale_invoice_number?: string
  subtotal?: string
  discount?: string
  other_charges?: string
  other_taxes?: string
  grand_total?: string
  payment_status?: string
  payment_date?: string | null
  paid_amount?: string
  payment_method?: string
  update_inventory_stock?: boolean
  lines: {
    raw_material_id: string
    qty: string
    unit_id: string
    price?: string
    amount?: string
    cgst?: string
    sgst?: string
    igst?: string
    note?: string
  }[]
}

export type WastageListParams = DocListParams & {
  status?: string
  categoryId?: string
}

function salePath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/sales/${suffix}`
}

function transferPath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/transfers/${suffix}`
}

function wastagePath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/wastage/${suffix}`
}

function salesReturnPath(outletId: string, suffix = ''): string {
  return `/api/v1/inventory/${outletId}/sales-returns/${suffix}`
}

function wastageQuery(params?: WastageListParams): string {
  const query = new URLSearchParams()
  if (params?.dateFrom) query.set('date_from', params.dateFrom)
  if (params?.dateTo) query.set('date_to', params.dateTo)
  if (params?.status && params.status !== 'all' && params.status !== 'All') {
    query.set('status', params.status)
  }
  if (params?.categoryId) query.set('category_id', params.categoryId)
  if (params?.page) query.set('page', String(params.page))
  query.set('page_size', '100')
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export async function listSalesApi(
  outletId: string,
  params?: DocListParams,
): Promise<PaginatedList<Sale>> {
  return apiRequest<PaginatedList<Sale>>(
    `${salePath(outletId)}${docQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllSalesApi(
  outletId: string,
  params?: DocListParams,
): Promise<Sale[]> {
  return loadAllPages((page) => listSalesApi(outletId, { ...params, page }))
}

export async function getSaleApi(outletId: string, id: string): Promise<Sale> {
  return apiRequest<Sale>(salePath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createSaleApi(
  outletId: string,
  payload: SalePayload,
): Promise<Sale> {
  return apiRequest<Sale>(salePath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateSaleApi(
  outletId: string,
  id: string,
  payload: Partial<SalePayload>,
): Promise<Sale> {
  return apiRequest<Sale>(salePath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteSaleApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(salePath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listTransfersApi(
  outletId: string,
  params?: DocListParams,
): Promise<PaginatedList<StockTransfer>> {
  return apiRequest<PaginatedList<StockTransfer>>(
    `${transferPath(outletId)}${docQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllTransfersApi(
  outletId: string,
  params?: DocListParams,
): Promise<StockTransfer[]> {
  return loadAllPages((page) => listTransfersApi(outletId, { ...params, page }))
}

export async function getTransferApi(
  outletId: string,
  id: string,
): Promise<StockTransfer> {
  return apiRequest<StockTransfer>(transferPath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createTransferApi(
  outletId: string,
  payload: StockTransferPayload,
): Promise<StockTransfer> {
  return apiRequest<StockTransfer>(transferPath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateTransferApi(
  outletId: string,
  id: string,
  payload: Partial<StockTransferPayload>,
): Promise<StockTransfer> {
  return apiRequest<StockTransfer>(transferPath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteTransferApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(transferPath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listWastageApi(
  outletId: string,
  params?: WastageListParams,
): Promise<PaginatedList<Wastage>> {
  return apiRequest<PaginatedList<Wastage>>(
    `${wastagePath(outletId)}${wastageQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllWastageApi(
  outletId: string,
  params?: WastageListParams,
): Promise<Wastage[]> {
  return loadAllPages((page) => listWastageApi(outletId, { ...params, page }))
}

export async function getWastageApi(
  outletId: string,
  id: string,
): Promise<Wastage> {
  return apiRequest<Wastage>(wastagePath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createWastageApi(
  outletId: string,
  payload: WastagePayload,
): Promise<Wastage> {
  return apiRequest<Wastage>(wastagePath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateWastageApi(
  outletId: string,
  id: string,
  payload: Partial<WastagePayload>,
): Promise<Wastage> {
  return apiRequest<Wastage>(wastagePath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteWastageApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(wastagePath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listSalesReturnsApi(
  outletId: string,
  params?: DocListParams,
): Promise<PaginatedList<SalesReturnDoc>> {
  return apiRequest<PaginatedList<SalesReturnDoc>>(
    `${salesReturnPath(outletId)}${docQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllSalesReturnsApi(
  outletId: string,
  params?: DocListParams,
): Promise<SalesReturnDoc[]> {
  return loadAllPages((page) =>
    listSalesReturnsApi(outletId, { ...params, page }),
  )
}

export async function getSalesReturnApi(
  outletId: string,
  id: string,
): Promise<SalesReturnDoc> {
  return apiRequest<SalesReturnDoc>(salesReturnPath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createSalesReturnApi(
  outletId: string,
  payload: SalesReturnPayload,
): Promise<SalesReturnDoc> {
  return apiRequest<SalesReturnDoc>(salesReturnPath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateSalesReturnApi(
  outletId: string,
  id: string,
  payload: Partial<SalesReturnPayload>,
): Promise<SalesReturnDoc> {
  return apiRequest<SalesReturnDoc>(salesReturnPath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteSalesReturnApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(salesReturnPath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export const INV_PRODUCTION_READ_PERMISSION =
  'accounts.inv_production_master_module_read'
export const INV_PRODUCTION_WRITE_PERMISSION =
  'accounts.inv_production_master_module_write'
export const INV_REPORT_PERMISSION = 'accounts.inv_inventory_report'

export type ProductionProcessLine = {
  raw_material_id: string
  raw_material_name: string
  qty: string
  unit_id: string
  unit_name: string
}

export type ProductionProcess = {
  id: string
  name: string
  output_raw_material_id: string
  output_raw_material_name: string
  output_category_name: string
  output_qty: string
  output_unit_id: string
  output_unit_name: string
  default_quantity: string | null
  description: string
  auto_production: boolean
  is_active: boolean
  lines: ProductionProcessLine[]
  created_at: string
  updated_at: string
}

export type ProductionProcessPayload = {
  name: string
  output_raw_material_id: string
  output_qty: string
  output_unit_id: string
  default_quantity?: string | null
  description?: string
  auto_production?: boolean
  is_active?: boolean
  lines: {
    raw_material_id: string
    qty: string
    unit_id: string
  }[]
}

export type ProductionRunLine = {
  raw_material_id: string
  raw_material_name: string
  qty: string
  unit_id: string
  unit_name: string
  price: string
}

export type ProductionRun = {
  id: string
  process_id: string
  process_name: string
  output_raw_material_id: string
  output_raw_material_name: string
  output_unit_id: string
  output_unit_name: string
  production_type: string
  output_qty: string
  with_price: boolean
  purchase_order_id: string | null
  lines: ProductionRunLine[]
  created_at: string
  updated_at: string
}

export type ProductionRunPayload = {
  process_id: string
  production_type?: string
  output_qty: string
  with_price?: boolean
  purchase_order_id?: string | null
}

export type CurrentStockRow = {
  raw_material_id: string
  raw_material_name: string
  category_name: string
  consumption_unit_name: string
  stock_qty: string
  min_stock: string | null
  at_par_stock: string | null
}

export type MaterialPurchaseReportRow = {
  raw_material_id: string
  raw_material_name: string
  category_name: string
  qty: string
  unit_name: string
  price: string
  amount: string
  invoice_date: string
  invoice_number: string
  supplier_name: string
}

export type MaterialTransferReportRow = {
  raw_material_id: string
  raw_material_name: string
  category_name: string
  qty: string
  unit_name: string
  price: string
  amount: string
  invoice_date: string
  challan_number: string
  destination: string
}

export type PurchaseSalesReturnReportRow = {
  return_type: string
  date: string
  document_number: string
  party_name: string
  raw_material_id: string
  raw_material_name: string
  category_name: string
  qty: string
  unit_name: string
  amount: string
}

export type ReportListParams = {
  search?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
}

function processPath(outletId: string, suffix = '') {
  return `/api/v1/inventory/${outletId}/production-processes/${suffix}`
}

function runPath(outletId: string, suffix = '') {
  return `/api/v1/inventory/${outletId}/production-runs/${suffix}`
}

function reportPath(outletId: string, slug: string) {
  return `/api/v1/inventory/${outletId}/reports/${slug}/`
}

function reportQuery(params?: ReportListParams): string {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.categoryId && params.categoryId !== 'all') {
    query.set('category_id', params.categoryId)
  }
  if (params?.dateFrom) query.set('date_from', params.dateFrom)
  if (params?.dateTo) query.set('date_to', params.dateTo)
  if (params?.page) query.set('page', String(params.page))
  query.set('page_size', '100')
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export async function listProductionProcessesApi(
  outletId: string,
  params?: { search?: string; categoryId?: string; page?: number },
): Promise<PaginatedList<ProductionProcess>> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.categoryId && params.categoryId !== 'all') {
    query.set('category_id', params.categoryId)
  }
  if (params?.page) query.set('page', String(params.page))
  query.set('page_size', '100')
  const qs = query.toString()
  return apiRequest<PaginatedList<ProductionProcess>>(
    `${processPath(outletId)}${qs ? `?${qs}` : ''}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllProductionProcessesApi(
  outletId: string,
  params?: { search?: string; categoryId?: string },
): Promise<ProductionProcess[]> {
  return loadAllPages((page) =>
    listProductionProcessesApi(outletId, { ...params, page }),
  )
}

export async function getProductionProcessApi(
  outletId: string,
  id: string,
): Promise<ProductionProcess> {
  return apiRequest<ProductionProcess>(processPath(outletId, `${id}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createProductionProcessApi(
  outletId: string,
  payload: ProductionProcessPayload,
): Promise<ProductionProcess> {
  return apiRequest<ProductionProcess>(processPath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function updateProductionProcessApi(
  outletId: string,
  id: string,
  payload: Partial<ProductionProcessPayload>,
): Promise<ProductionProcess> {
  return apiRequest<ProductionProcess>(processPath(outletId, `${id}/`), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteProductionProcessApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(processPath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listProductionRunsApi(
  outletId: string,
  params?: {
    search?: string
    productionType?: string
    dateFrom?: string
    dateTo?: string
    page?: number
  },
): Promise<PaginatedList<ProductionRun>> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.productionType) query.set('production_type', params.productionType)
  if (params?.dateFrom) query.set('date_from', params.dateFrom)
  if (params?.dateTo) query.set('date_to', params.dateTo)
  if (params?.page) query.set('page', String(params.page))
  query.set('page_size', '100')
  const qs = query.toString()
  return apiRequest<PaginatedList<ProductionRun>>(
    `${runPath(outletId)}${qs ? `?${qs}` : ''}`,
    { method: 'GET', token: authToken() },
  )
}

export async function createProductionRunApi(
  outletId: string,
  payload: ProductionRunPayload,
): Promise<ProductionRun> {
  return apiRequest<ProductionRun>(runPath(outletId), {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function deleteProductionRunApi(
  outletId: string,
  id: string,
): Promise<void> {
  await apiRequest(runPath(outletId, `${id}/`), {
    method: 'DELETE',
    token: authToken(),
  })
}

export async function listCurrentStockReportApi(
  outletId: string,
  params?: ReportListParams,
): Promise<CurrentStockRow[]> {
  return apiRequest<CurrentStockRow[]>(
    `${reportPath(outletId, 'current-stock')}${reportQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listMaterialPurchaseReportApi(
  outletId: string,
  params?: ReportListParams,
): Promise<PaginatedList<MaterialPurchaseReportRow>> {
  return apiRequest<PaginatedList<MaterialPurchaseReportRow>>(
    `${reportPath(outletId, 'material-purchase')}${reportQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllMaterialPurchaseReportApi(
  outletId: string,
  params?: ReportListParams,
): Promise<MaterialPurchaseReportRow[]> {
  return loadAllPages((page) =>
    listMaterialPurchaseReportApi(outletId, { ...params, page }),
  )
}

export async function listMaterialTransferReportApi(
  outletId: string,
  params?: ReportListParams,
): Promise<PaginatedList<MaterialTransferReportRow>> {
  return apiRequest<PaginatedList<MaterialTransferReportRow>>(
    `${reportPath(outletId, 'material-transfer')}${reportQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export async function listAllMaterialTransferReportApi(
  outletId: string,
  params?: ReportListParams,
): Promise<MaterialTransferReportRow[]> {
  return loadAllPages((page) =>
    listMaterialTransferReportApi(outletId, { ...params, page }),
  )
}

export async function listPurchaseSalesReturnReportApi(
  outletId: string,
  params?: ReportListParams,
): Promise<PurchaseSalesReturnReportRow[]> {
  return apiRequest<PurchaseSalesReturnReportRow[]>(
    `${reportPath(outletId, 'purchase-sales-return')}${reportQuery(params)}`,
    { method: 'GET', token: authToken() },
  )
}

export type InventorySettings = {
  stock_update_cycle: string
  default_update_inventory_stock: boolean
  allow_negative_stock: boolean
  sales_invoice_label: string
  sales_rounding: string
  show_cess_tax: boolean
  use_avg_purchase_price: boolean
  sales_terms: string
  updated_at: string
}

export type InventorySettingsPayload = Partial<{
  stock_update_cycle: string
  default_update_inventory_stock: boolean
  allow_negative_stock: boolean
  sales_invoice_label: string
  sales_rounding: string
  show_cess_tax: boolean
  use_avg_purchase_price: boolean
  sales_terms: string
}>

export type DashboardSummary = {
  date: string
  stock_worth: string
  below_par_count: number
  below_min_count: number
  low_stock: {
    raw_material_id: string
    name: string
    stock_qty: string
    min_stock: string | null
    at_par_stock: string | null
    unit_name: string
    pct: number
  }[]
  top_materials: {
    raw_material_id: string
    name: string
    stock_qty: string
    worth: string
    share_pct: number
  }[]
  purchase_total: string
  pending_payment: string
  purchase_by_supplier: {
    supplier_id: string
    name: string
    current: string
    pending: string
  }[]
  wastage_total: string
  wastage_count: number
  pending_tasks: {
    id: string
    po_number: string
    supplier: string
    items: string
    amount: string
    delivery_date: string
    stage: string
  }[]
  accuracy_pct: number
  cogs_available: boolean
}

function settingsPath(outletId: string) {
  return `/api/v1/inventory/${outletId}/settings/`
}

function dashboardPath(outletId: string) {
  return `/api/v1/inventory/${outletId}/dashboard/`
}

export async function getInventorySettingsApi(
  outletId: string,
): Promise<InventorySettings> {
  return apiRequest<InventorySettings>(settingsPath(outletId), {
    method: 'GET',
    token: authToken(),
  })
}

export async function updateInventorySettingsApi(
  outletId: string,
  payload: InventorySettingsPayload,
): Promise<InventorySettings> {
  return apiRequest<InventorySettings>(settingsPath(outletId), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

export async function getDashboardSummaryApi(
  outletId: string,
  date?: string,
): Promise<DashboardSummary> {
  const query = new URLSearchParams()
  if (date) query.set('date', date)
  const qs = query.toString()
  return apiRequest<DashboardSummary>(
    `${dashboardPath(outletId)}${qs ? `?${qs}` : ''}`,
    { method: 'GET', token: authToken() },
  )
}
