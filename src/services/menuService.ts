import { apiRequest, multipartApiRequest, paginatedApiRequest } from './apiClient'
import type { Paginated } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'
import type {
  AddonCommission,
  Category,
  CategoryCommission,
  CategoryPayload,
  Channel,
  Combo,
  ComboPayload,
  CommissionPayload,
  DiningArea,
  DiningAreaPayload,
  DiningTable,
  DiningTablePayload,
  Discount,
  DiscountPayload,
  EncId,
  Item,
  ItemCommission,
  ItemImageInput,
  ItemPayload,
  MenuGroup,
  MenuGroupPayload,
  MenuSchedule,
  MenuSchedulePayload,
  MenuTriggerLog,
  ParentCategory,
  ParentCategoryPayload,
  PhysicalMenu,
  PriceTemplate,
  PriceTemplatePayload,
  ScheduledPublish,
  ScheduledPublishPayload,
  SpecialNote,
  SpecialNotePayload,
  Tax,
  TaxPayload,
  VariationGroup,
  VariationGroupPayload,
  AddonGroup,
  AddonGroupPayload,
} from '../types/menu'

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function menusPath(outletId: string, suffix = ''): string {
  return `/api/v1/menus/${outletId}${suffix}`
}

function jsonRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    token: authToken(),
  })
}

// ── channels ───────────────────────────────────────────────────────────────

export async function getChannelsApi(outletId: string): Promise<Channel[]> {
  return jsonRequest<Channel[]>(menusPath(outletId, '/channels/'), 'GET')
}

// ── parent categories ──────────────────────────────────────────────────────

export async function listParentCategoriesApi(
  outletId: string,
  options?: { search?: string },
): Promise<ParentCategory[]> {
  const search = options?.search?.trim()
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return jsonRequest<ParentCategory[]>(
    menusPath(outletId, `/parent-categories/${query}`),
    'GET',
  )
}

export async function createParentCategoryApi(outletId: string, payload: ParentCategoryPayload): Promise<ParentCategory> {
  return jsonRequest<ParentCategory>(menusPath(outletId, '/parent-categories/'), 'POST', payload)
}

export async function getParentCategoryApi(outletId: string, id: EncId): Promise<ParentCategory> {
  return jsonRequest<ParentCategory>(menusPath(outletId, `/parent-categories/${id}/`), 'GET')
}

export async function updateParentCategoryApi(outletId: string, id: EncId, payload: Partial<ParentCategoryPayload>): Promise<ParentCategory> {
  return jsonRequest<ParentCategory>(menusPath(outletId, `/parent-categories/${id}/`), 'PATCH', payload)
}

export async function deleteParentCategoryApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/parent-categories/${id}/`), 'DELETE')
}

// ── menu groups (Category Management → Grouping) ───────────────────────────

export async function listMenuGroupsApi(
  outletId: string,
  options?: { search?: string },
): Promise<MenuGroup[]> {
  const search = options?.search?.trim()
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return jsonRequest<MenuGroup[]>(menusPath(outletId, `/groups/${query}`), 'GET')
}

export async function createMenuGroupApi(
  outletId: string,
  payload: MenuGroupPayload,
  logo?: File | null,
): Promise<MenuGroup> {
  if (logo) {
    const form = new FormData()
    form.append('name', payload.name)
    form.append('sac_code', payload.sac_code ?? '')
    form.append('parent_category_id', payload.parent_category_id ?? '')
    form.append('restaurant_name', payload.restaurant_name ?? '')
    form.append('header_text', payload.header_text ?? '')
    form.append('footer_text', payload.footer_text ?? '')
    form.append('is_active', String(payload.is_active ?? true))
    form.append('category_ids', JSON.stringify(payload.category_ids))
    form.append('logo', logo)
    return multipartApiRequest<MenuGroup>(menusPath(outletId, '/groups/'), form, {
      method: 'POST',
      token: authToken(),
    })
  }
  return jsonRequest<MenuGroup>(menusPath(outletId, '/groups/'), 'POST', payload)
}

export async function getMenuGroupApi(outletId: string, id: EncId): Promise<MenuGroup> {
  return jsonRequest<MenuGroup>(menusPath(outletId, `/groups/${id}/`), 'GET')
}

export async function updateMenuGroupApi(
  outletId: string,
  id: EncId,
  payload: Partial<MenuGroupPayload>,
  logo?: File | null,
): Promise<MenuGroup> {
  if (logo) {
    const form = new FormData()
    if (payload.name !== undefined) form.append('name', payload.name)
    if (payload.sac_code !== undefined) form.append('sac_code', payload.sac_code)
    if (payload.parent_category_id !== undefined) {
      form.append('parent_category_id', payload.parent_category_id ?? '')
    }
    if (payload.restaurant_name !== undefined) {
      form.append('restaurant_name', payload.restaurant_name)
    }
    if (payload.header_text !== undefined) form.append('header_text', payload.header_text)
    if (payload.footer_text !== undefined) form.append('footer_text', payload.footer_text)
    if (payload.is_active !== undefined) form.append('is_active', String(payload.is_active))
    if (payload.category_ids !== undefined) {
      form.append('category_ids', JSON.stringify(payload.category_ids))
    }
    form.append('logo', logo)
    return multipartApiRequest<MenuGroup>(menusPath(outletId, `/groups/${id}/`), form, {
      method: 'PATCH',
      token: authToken(),
    })
  }
  return jsonRequest<MenuGroup>(menusPath(outletId, `/groups/${id}/`), 'PATCH', payload)
}

export async function deleteMenuGroupApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/groups/${id}/`), 'DELETE')
}

// ── categories ─────────────────────────────────────────────────────────────

export async function listCategoriesApi(outletId: string): Promise<Category[]> {
  return jsonRequest<Category[]>(menusPath(outletId, '/categories/'), 'GET')
}

export async function createCategoryApi(outletId: string, payload: CategoryPayload): Promise<Category> {
  return jsonRequest<Category>(menusPath(outletId, '/categories/'), 'POST', payload)
}

export async function getCategoryApi(outletId: string, id: EncId): Promise<Category> {
  return jsonRequest<Category>(menusPath(outletId, `/categories/${id}/`), 'GET')
}

export async function updateCategoryApi(outletId: string, id: EncId, payload: Partial<CategoryPayload>): Promise<Category> {
  return jsonRequest<Category>(menusPath(outletId, `/categories/${id}/`), 'PATCH', payload)
}

export async function deleteCategoryApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/categories/${id}/`), 'DELETE')
}

// ── items ──────────────────────────────────────────────────────────────────

export interface ListItemsParams {
  category_id?: EncId
  search?: string
  page?: number
  page_size?: number
}

export async function listItemsApi(outletId: string, params: ListItemsParams = {}): Promise<Paginated<Item>> {
  const query = new URLSearchParams()
  if (params.category_id) query.set('category_id', params.category_id)
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', String(params.page))
  if (params.page_size) query.set('page_size', String(params.page_size))
  const qs = query.toString()
  return paginatedApiRequest<Item>(menusPath(outletId, `/items/${qs ? `?${qs}` : ''}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function createItemApi(outletId: string, payload: ItemPayload): Promise<Item> {
  return jsonRequest<Item>(menusPath(outletId, '/items/'), 'POST', payload)
}

export async function getItemApi(outletId: string, id: EncId): Promise<Item> {
  return jsonRequest<Item>(menusPath(outletId, `/items/${id}/`), 'GET')
}

export async function updateItemApi(outletId: string, id: EncId, payload: Partial<ItemPayload>): Promise<Item> {
  return jsonRequest<Item>(menusPath(outletId, `/items/${id}/`), 'PATCH', payload)
}

export async function deleteItemApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/items/${id}/`), 'DELETE')
}

/** Upload a single item image (multipart: image file + optional channel + position). */
export async function addItemImageApi(
  outletId: string,
  itemId: EncId,
  input: ItemImageInput,
): Promise<unknown> {
  const form = new FormData()
  form.append('image', input.image)
  if (input.outlet_channel_id != null && input.outlet_channel_id !== '') {
    form.append('outlet_channel_id', input.outlet_channel_id)
  }
  if (input.position != null) form.append('position', String(input.position))
  return multipartApiRequest<unknown>(menusPath(outletId, `/items/${itemId}/images/`), form, {
    method: 'POST',
    token: authToken(),
  })
}

export async function deleteItemImageApi(outletId: string, imageId: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/item-images/${imageId}/`), 'DELETE')
}

// ── variation groups ───────────────────────────────────────────────────────

export async function listVariationGroupsApi(outletId: string): Promise<VariationGroup[]> {
  return jsonRequest<VariationGroup[]>(menusPath(outletId, '/variation-groups/'), 'GET')
}

export async function createVariationGroupApi(outletId: string, payload: VariationGroupPayload): Promise<VariationGroup> {
  return jsonRequest<VariationGroup>(menusPath(outletId, '/variation-groups/'), 'POST', payload)
}

export async function getVariationGroupApi(outletId: string, id: EncId): Promise<VariationGroup> {
  return jsonRequest<VariationGroup>(menusPath(outletId, `/variation-groups/${id}/`), 'GET')
}

export async function updateVariationGroupApi(outletId: string, id: EncId, payload: Partial<VariationGroupPayload>): Promise<VariationGroup> {
  return jsonRequest<VariationGroup>(menusPath(outletId, `/variation-groups/${id}/`), 'PATCH', payload)
}

export async function deleteVariationGroupApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/variation-groups/${id}/`), 'DELETE')
}

// ── addon groups ───────────────────────────────────────────────────────────

export async function listAddonGroupsApi(outletId: string): Promise<AddonGroup[]> {
  return jsonRequest<AddonGroup[]>(menusPath(outletId, '/addon-groups/'), 'GET')
}

export async function createAddonGroupApi(outletId: string, payload: AddonGroupPayload): Promise<AddonGroup> {
  return jsonRequest<AddonGroup>(menusPath(outletId, '/addon-groups/'), 'POST', payload)
}

export async function getAddonGroupApi(outletId: string, id: EncId): Promise<AddonGroup> {
  return jsonRequest<AddonGroup>(menusPath(outletId, `/addon-groups/${id}/`), 'GET')
}

export async function updateAddonGroupApi(outletId: string, id: EncId, payload: Partial<AddonGroupPayload>): Promise<AddonGroup> {
  return jsonRequest<AddonGroup>(menusPath(outletId, `/addon-groups/${id}/`), 'PATCH', payload)
}

export async function deleteAddonGroupApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/addon-groups/${id}/`), 'DELETE')
}

// ── combos ─────────────────────────────────────────────────────────────────

export async function listCombosApi(outletId: string): Promise<Combo[]> {
  return jsonRequest<Combo[]>(menusPath(outletId, '/combos/'), 'GET')
}

export async function createComboApi(outletId: string, payload: ComboPayload): Promise<Combo> {
  return jsonRequest<Combo>(menusPath(outletId, '/combos/'), 'POST', payload)
}

export async function getComboApi(outletId: string, id: EncId): Promise<Combo> {
  return jsonRequest<Combo>(menusPath(outletId, `/combos/${id}/`), 'GET')
}

export async function updateComboApi(outletId: string, id: EncId, payload: Partial<ComboPayload>): Promise<Combo> {
  return jsonRequest<Combo>(menusPath(outletId, `/combos/${id}/`), 'PATCH', payload)
}

export async function deleteComboApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/combos/${id}/`), 'DELETE')
}

// ── dining areas / tables ──────────────────────────────────────────────────

export async function listDiningAreasApi(outletId: string): Promise<DiningArea[]> {
  return jsonRequest<DiningArea[]>(menusPath(outletId, '/dining-areas/'), 'GET')
}

export async function createDiningAreaApi(outletId: string, payload: DiningAreaPayload): Promise<DiningArea> {
  return jsonRequest<DiningArea>(menusPath(outletId, '/dining-areas/'), 'POST', payload)
}

export async function getDiningAreaApi(outletId: string, id: EncId): Promise<DiningArea> {
  return jsonRequest<DiningArea>(menusPath(outletId, `/dining-areas/${id}/`), 'GET')
}

export async function updateDiningAreaApi(outletId: string, id: EncId, payload: Partial<DiningAreaPayload>): Promise<DiningArea> {
  return jsonRequest<DiningArea>(menusPath(outletId, `/dining-areas/${id}/`), 'PATCH', payload)
}

export async function deleteDiningAreaApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/dining-areas/${id}/`), 'DELETE')
}

export async function listDiningTablesApi(outletId: string): Promise<DiningTable[]> {
  return jsonRequest<DiningTable[]>(menusPath(outletId, '/dining-tables/'), 'GET')
}

export async function createDiningTableApi(outletId: string, payload: DiningTablePayload): Promise<DiningTable[]> {
  return jsonRequest<DiningTable[]>(menusPath(outletId, '/dining-tables/'), 'POST', payload)
}

export async function getDiningTableApi(outletId: string, id: EncId): Promise<DiningTable> {
  return jsonRequest<DiningTable>(menusPath(outletId, `/dining-tables/${id}/`), 'GET')
}

export async function updateDiningTableApi(outletId: string, id: EncId, payload: Partial<DiningTablePayload>): Promise<DiningTable> {
  return jsonRequest<DiningTable>(menusPath(outletId, `/dining-tables/${id}/`), 'PATCH', payload)
}

export async function deleteDiningTableApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/dining-tables/${id}/`), 'DELETE')
}

// ── taxes ──────────────────────────────────────────────────────────────────

export async function listTaxesApi(outletId: string): Promise<Tax[]> {
  return jsonRequest<Tax[]>(menusPath(outletId, '/taxes/'), 'GET')
}

export async function createTaxApi(outletId: string, payload: TaxPayload): Promise<Tax> {
  return jsonRequest<Tax>(menusPath(outletId, '/taxes/'), 'POST', payload)
}

export async function getTaxApi(outletId: string, id: EncId): Promise<Tax> {
  return jsonRequest<Tax>(menusPath(outletId, `/taxes/${id}/`), 'GET')
}

export async function updateTaxApi(outletId: string, id: EncId, payload: Partial<TaxPayload>): Promise<Tax> {
  return jsonRequest<Tax>(menusPath(outletId, `/taxes/${id}/`), 'PATCH', payload)
}

export async function deleteTaxApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/taxes/${id}/`), 'DELETE')
}

// ── discounts ──────────────────────────────────────────────────────────────

export async function listDiscountsApi(outletId: string): Promise<Discount[]> {
  return jsonRequest<Discount[]>(menusPath(outletId, '/discounts/'), 'GET')
}

export async function createDiscountApi(outletId: string, payload: DiscountPayload): Promise<Discount> {
  return jsonRequest<Discount>(menusPath(outletId, '/discounts/'), 'POST', payload)
}

export async function getDiscountApi(outletId: string, id: EncId): Promise<Discount> {
  return jsonRequest<Discount>(menusPath(outletId, `/discounts/${id}/`), 'GET')
}

export async function updateDiscountApi(outletId: string, id: EncId, payload: Partial<DiscountPayload>): Promise<Discount> {
  return jsonRequest<Discount>(menusPath(outletId, `/discounts/${id}/`), 'PATCH', payload)
}

export async function deleteDiscountApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/discounts/${id}/`), 'DELETE')
}

// ── special notes ──────────────────────────────────────────────────────────

export async function listSpecialNotesApi(outletId: string): Promise<SpecialNote[]> {
  return jsonRequest<SpecialNote[]>(menusPath(outletId, '/special-notes/'), 'GET')
}

export async function createSpecialNoteApi(outletId: string, payload: SpecialNotePayload): Promise<SpecialNote> {
  return jsonRequest<SpecialNote>(menusPath(outletId, '/special-notes/'), 'POST', payload)
}

export async function getSpecialNoteApi(outletId: string, id: EncId): Promise<SpecialNote> {
  return jsonRequest<SpecialNote>(menusPath(outletId, `/special-notes/${id}/`), 'GET')
}

export async function updateSpecialNoteApi(outletId: string, id: EncId, payload: Partial<SpecialNotePayload>): Promise<SpecialNote> {
  return jsonRequest<SpecialNote>(menusPath(outletId, `/special-notes/${id}/`), 'PATCH', payload)
}

export async function deleteSpecialNoteApi(outletId: string, id: EncId): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, `/special-notes/${id}/`), 'DELETE')
}

/** Bulk import special notes (created from "{ title, note_text, is_active }" records). */
export async function importSpecialNotesApi(
  outletId: string,
  notes: SpecialNotePayload[],
): Promise<{ imported: number }> {
  return jsonRequest<{ imported: number }>(menusPath(outletId, '/special-notes/import/'), 'POST', { notes })
}

// ── commissions ────────────────────────────────────────────────────────────

/** Item commissions are paginated; category/addon commissions return plain arrays. */
export async function listItemCommissionsApi(outletId: string, params: { page?: number; page_size?: number } = {}): Promise<Paginated<ItemCommission>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.page_size) query.set('page_size', String(params.page_size))
  const qs = query.toString()
  return paginatedApiRequest<ItemCommission>(menusPath(outletId, `/item-commissions/${qs ? `?${qs}` : ''}/`), {
    method: 'GET',
    token: authToken(),
  })
}

export async function updateItemCommissionApi(outletId: string, id: EncId, payload: CommissionPayload): Promise<ItemCommission> {
  return jsonRequest<ItemCommission>(menusPath(outletId, `/item-commissions/${id}/`), 'PATCH', payload)
}

export async function listCategoryCommissionsApi(outletId: string): Promise<CategoryCommission[]> {
  return jsonRequest<CategoryCommission[]>(menusPath(outletId, '/category-commissions/'), 'GET')
}

export async function updateCategoryCommissionApi(outletId: string, id: EncId, payload: CommissionPayload): Promise<CategoryCommission> {
  return jsonRequest<CategoryCommission>(menusPath(outletId, `/category-commissions/${id}/`), 'PATCH', payload)
}

export async function listAddonCommissionsApi(outletId: string): Promise<AddonCommission[]> {
  return jsonRequest<AddonCommission[]>(menusPath(outletId, '/addon-commissions/'), 'GET')
}

export async function updateAddonCommissionApi(outletId: string, id: EncId, payload: CommissionPayload): Promise<AddonCommission> {
  return jsonRequest<AddonCommission>(menusPath(outletId, `/addon-commissions/${id}/`), 'PATCH', payload)
}

// ── price templates / schedules / trigger logs ─────────────────────────────

export async function listPriceTemplatesApi(outletId: string): Promise<PriceTemplate[]> {
  return jsonRequest<PriceTemplate[]>(menusPath(outletId, '/price-templates/'), 'GET')
}

export async function createPriceTemplateApi(outletId: string, payload: PriceTemplatePayload): Promise<PriceTemplate> {
  return jsonRequest<PriceTemplate>(menusPath(outletId, '/price-templates/'), 'POST', payload)
}

export async function getPriceTemplateApi(outletId: string, id: EncId): Promise<PriceTemplate> {
  return jsonRequest<PriceTemplate>(menusPath(outletId, `/price-templates/${id}/`), 'GET')
}

export async function updatePriceTemplateApi(outletId: string, id: EncId, payload: Partial<PriceTemplatePayload>): Promise<PriceTemplate> {
  return jsonRequest<PriceTemplate>(menusPath(outletId, `/price-templates/${id}/`), 'PATCH', payload)
}

export async function listMenuSchedulesApi(outletId: string): Promise<MenuSchedule[]> {
  return jsonRequest<MenuSchedule[]>(menusPath(outletId, '/menu-schedules/'), 'GET')
}

export async function createMenuScheduleApi(outletId: string, payload: MenuSchedulePayload): Promise<MenuSchedule> {
  return jsonRequest<MenuSchedule>(menusPath(outletId, '/menu-schedules/'), 'POST', payload)
}

export async function getMenuScheduleApi(outletId: string, id: EncId): Promise<MenuSchedule> {
  return jsonRequest<MenuSchedule>(menusPath(outletId, `/menu-schedules/${id}/`), 'GET')
}

export async function updateMenuScheduleApi(outletId: string, id: EncId, payload: Partial<MenuSchedulePayload>): Promise<MenuSchedule> {
  return jsonRequest<MenuSchedule>(menusPath(outletId, `/menu-schedules/${id}/`), 'PATCH', payload)
}

// ── one-off scheduled publishes ───────────────────────────────────────

export async function listScheduledPublishesApi(outletId: string): Promise<ScheduledPublish[]> {
  return jsonRequest<ScheduledPublish[]>(menusPath(outletId, '/scheduled-publishes/'), 'GET')
}

export async function createScheduledPublishApi(outletId: string, payload: ScheduledPublishPayload): Promise<ScheduledPublish> {
  return jsonRequest<ScheduledPublish>(menusPath(outletId, '/scheduled-publishes/'), 'POST', payload)
}

export async function cancelScheduledPublishApi(outletId: string, id: EncId): Promise<ScheduledPublish> {
  return jsonRequest<ScheduledPublish>(menusPath(outletId, `/scheduled-publishes/${id}/`), 'DELETE')
}

export async function listTriggerLogsApi(outletId: string, params: { page?: number; page_size?: number } = {}): Promise<Paginated<MenuTriggerLog>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.page_size) query.set('page_size', String(params.page_size))
  const qs = query.toString()
  return paginatedApiRequest<MenuTriggerLog>(menusPath(outletId, `/trigger-logs/${qs ? `?${qs}` : ''}/`), {
    method: 'GET',
    token: authToken(),
  })
}

// ── physical menu ──────────────────────────────────────────────────────────

export async function getPhysicalMenuApi(outletId: string): Promise<PhysicalMenu | null> {
  return jsonRequest<PhysicalMenu>(menusPath(outletId, '/physical-menu/'), 'GET')
}

export async function uploadPhysicalMenuApi(outletId: string, file: File): Promise<PhysicalMenu> {
  const form = new FormData()
  form.append('file', file)
  return multipartApiRequest<PhysicalMenu>(menusPath(outletId, '/physical-menu/'), form, {
    method: 'POST',
    token: authToken(),
  })
}

export async function deletePhysicalMenuApi(outletId: string): Promise<unknown> {
  return jsonRequest<unknown>(menusPath(outletId, '/physical-menu/'), 'DELETE')
}