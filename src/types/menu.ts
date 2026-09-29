/**
 * Menu domain types mirroring the backend serializers (menus/serializers.py).
 *
 * All `id` / `*_id` values are OPAQUE ENCRYPTED STRINGS — never parse them
 * with Number(). Decimal fields arrive as strings.
 */

export type EncId = string

export interface Channel {
  id: EncId
  channel_slug: string
  channel_label: string
  is_active: boolean
  position: number
}

// ── parent categories / categories ─────────────────────────────────────────

export interface ParentCategoryChild {
  id: EncId
  name: string
}

export interface ParentCategory {
  id: EncId
  name: string
  online_display_name: string
  is_active: boolean
  position: number
  created_at?: string
  categories?: ParentCategoryChild[]
}

export interface Category {
  id: EncId
  parent_id: EncId | null
  parent_name: string
  name: string
  online_display_name: string
  rank: number
  is_active: boolean
  position: number
}

export interface ParentCategoryPayload {
  name: string
  online_display_name?: string
  is_active?: boolean
  position?: number
}

export interface CategoryPayload {
  name: string
  parent_category_id?: EncId | null
  online_display_name?: string
  rank?: number
  is_active?: boolean
}

// ── menu groups (Category Management → Grouping) ───────────────────────────

export interface MenuGroupCategory {
  id: EncId
  name: string
}

export interface MenuGroup {
  id: EncId
  name: string
  sac_code: string
  parent_id: EncId | null
  parent_name: string
  restaurant_name: string
  logo: string | null
  header_text: string
  footer_text: string
  is_active: boolean
  created_at?: string
  categories: MenuGroupCategory[]
}

export interface MenuGroupPayload {
  name: string
  sac_code?: string
  parent_category_id?: EncId | null
  restaurant_name?: string
  header_text?: string
  footer_text?: string
  is_active?: boolean
  category_ids: EncId[]
}

// ── per-channel price / availability inputs ─────────────────────────────────

export interface ChannelPriceInput {
  outlet_channel_id: EncId
  price: number | string
  is_active?: boolean
}

export interface ItemAreaPrice extends ChannelPriceInput {
  id: EncId
  channel_slug: string
  channel_label: string
  price: number | string
  online_display_name: string
  container_charge: number | string
}

export interface ItemAvailabilityInput {
  outlet_channel_id: EncId
  is_available: boolean
}

export interface ItemAvailability extends ItemAvailabilityInput {
  channel_slug: string
}

export interface ItemImage {
  id: EncId
  image: string
  outlet_channel_id: EncId | null
  channel_slug: string | null
  position: number
}

export interface ItemFlags {
  ignore_tax: boolean
  ignore_discount: boolean
  set_as_favorite: boolean
  open_item: boolean
  open_quantity_popup: boolean
  create_self_recipe: boolean
}

export interface TaxSummary {
  id: EncId
  title: string
  online_display_name: string
  tax_type: string
  type: string
  amount: number | string
  /** GST bucket for the printed-bill bifurcation (CGST / SGST / IGST / ''). */
  tax_category: string
  /** True = tax-inclusive price; the tax is extracted, not added. */
  backward_printing: boolean
  /** True = applied once to the order base instead of per line. */
  item_order_wise: boolean
  position: number
  is_active: boolean
}

// ── items ──────────────────────────────────────────────────────────────────

export interface Item {
  id: EncId
  category_id: EncId | null
  category_name: string
  name: string
  short_code: string
  short_code_2: string
  online_display_name: string
  base_price: number | string
  description: string
  long_description: string
  tags: string[]
  choice: string
  order_types: string[]
  days: string[]
  item_unit: string
  stock_status: string
  has_image: boolean
  rank: number
  is_active: boolean
  sap_code: string
  hsn_code: string
  fsn_code: string
  profit_margin: number | string | null
  weight: number | string | null
  flags: ItemFlags
  area_prices: ItemAreaPrice[]
  availability: ItemAvailability[]
  images: ItemImage[]
  taxes: TaxSummary[]
}

export interface ItemPayload {
  category_id: EncId
  name: string
  short_code?: string
  short_code_2?: string
  online_display_name?: string
  base_price: number | string
  description?: string
  long_description?: string
  tags?: string[]
  choice?: 'veg' | 'egg' | 'non-veg'
  order_types?: string[]
  days?: string[]
  item_unit?: string
  stock_status?: string
  has_image?: boolean
  rank?: number
  is_active?: boolean
  flags?: Partial<ItemFlags>
  sap_code?: string
  hsn_code?: string
  fsn_code?: string
  profit_margin?: number | string | null
  weight?: number | string | null
  area_prices?: ChannelPriceInput[]
  availability?: ItemAvailabilityInput[]
  tax_ids?: EncId[]
  variation_ids?: EncId[]
  addon_group_ids?: EncId[]
}

export interface ItemImageInput {
  outlet_channel_id?: EncId | ''
  position?: number
  image: File | Blob
}

// ── variation groups ───────────────────────────────────────────────────────

export interface VariationAreaPrice extends ChannelPriceInput {
  channel_slug: string
}

export interface Variation {
  id: EncId
  name: string
  online_display_name: string
  is_active: boolean
  area_prices: VariationAreaPrice[]
}

export interface VariationInput {
  id?: EncId
  name: string
  online_display_name?: string
  is_active?: boolean
  area_prices?: ChannelPriceInput[]
}

export interface VariationGroup {
  id: EncId
  department_name: string
  online_display_name: string
  is_active: boolean
  position: number
  variations: Variation[]
}

export interface VariationGroupPayload {
  department_name: string
  online_display_name?: string
  is_active?: boolean
  position?: number
  variations?: VariationInput[]
}

// ── addon groups ───────────────────────────────────────────────────────────

export interface AddonAreaPrice extends ChannelPriceInput {
  channel_slug: string
}

export interface Addon {
  id: EncId
  name: string
  base_price: number | string
  is_active: boolean
  position: number
  area_prices: AddonAreaPrice[]
}

export interface AddonInput {
  name: string
  base_price?: number | string
  is_active?: boolean
  area_prices?: ChannelPriceInput[]
}

export interface AddonGroup {
  id: EncId
  department_name: string
  online_display_name: string
  is_active: boolean
  position: number
  addons: Addon[]
}

export interface AddonGroupPayload {
  department_name: string
  online_display_name?: string
  is_active?: boolean
  position?: number
  addons?: AddonInput[]
}

// ── combos ─────────────────────────────────────────────────────────────────

export interface ComboItem {
  id: EncId
  item_id: EncId
  item_name: string
  quantity: number
  position: number
}

export interface ComboItemInput {
  item_id: EncId
  quantity?: number
}

export interface ComboAreaPrice extends ChannelPriceInput {
  channel_slug: string
}

export interface Combo {
  id: EncId
  name: string
  online_display_name: string
  price: number | string
  is_active: boolean
  rank: number
  items: ComboItem[]
  area_prices: ComboAreaPrice[]
}

export interface ComboPayload {
  name: string
  online_display_name?: string
  price: number | string
  is_active?: boolean
  rank?: number
  items?: ComboItemInput[]
  area_prices?: ChannelPriceInput[]
}

// ── dining ─────────────────────────────────────────────────────────────────

export interface DiningTable {
  id: EncId
  table_no: string
  persons: number
  extra_info: string
  is_on: boolean
  discount_percent: number | string
  area_id: EncId | null
  area_name: string
}

export interface DiningTableInput {
  table_no: string
  persons?: number
  extra_info?: string
  is_on?: boolean
  discount_percent?: number | string
}

export interface DiningArea {
  id: EncId
  name: string
  is_active: boolean
  discount_percent: number | string
  position: number
  tables: DiningTable[]
}

export interface DiningAreaPayload {
  name: string
  is_active?: boolean
  discount_percent?: number | string
  position?: number
  tables?: DiningTableInput[]
}

export interface DiningTablePayload extends DiningTableInput {
  area_id?: EncId | null | ''
}

// ── taxes / discounts / special notes ──────────────────────────────────────

export interface Tax {
  id: EncId
  title: string
  online_display_name: string
  tax_type: string
  type: string
  amount: number | string
  tax_category: string
  backward_printing: boolean
  item_order_wise: boolean
  position: number
  is_active: boolean
}

export interface TaxPayload {
  title: string
  online_display_name?: string
  tax_type?: string
  type?: 'Percentage' | 'Fixed'
  amount?: number | string
  tax_category?: string
  backward_printing?: boolean
  item_order_wise?: boolean
  position?: number
  is_active?: boolean
}

export interface Discount {
  id: EncId
  name: string
  discount_type: string
  value: number | string
  max_amount: number | string | null
  applicability: string[]
  is_active: boolean
}

export interface DiscountPayload {
  name: string
  discount_type?: 'Percentage' | 'Fixed'
  value?: number | string
  max_amount?: number | string | null
  applicability?: string[]
  is_active?: boolean
}

export interface SpecialNote {
  id: EncId
  title: string
  note_text: string
  is_active: boolean
}

export interface SpecialNotePayload {
  title: string
  note_text?: string
  is_active?: boolean
}

// ── commissions ────────────────────────────────────────────────────────────

export interface ItemCommission {
  id: EncId
  item_id: EncId
  item_name: string
  category_name: string
  commission_type: string
  commission_value: number | string | null
}

export interface CategoryCommission {
  id: EncId
  category_id: EncId
  category_name: string
  commission_type: string
  commission_value: number | string | null
}

export interface AddonCommission {
  id: EncId
  addon_id: EncId
  addon_name: string
  group_name: string
  commission_type: string
  commission_value: number | string | null
}

export interface CommissionPayload {
  commission_type?: 'Not Configured' | 'Percentage' | 'Fixed'
  commission_value?: number | string | null
}

// ── templates / schedules / trigger logs ───────────────────────────────────

export interface PriceOverrideLine {
  item_id: EncId
  outlet_channel_id?: EncId | null
  change_type?: 'Percentage' | 'Fixed'
  change_direction?: 'Increase' | 'Decrease'
  change_value?: number | string
}

export interface PriceTemplateLine extends PriceOverrideLine {
  id: EncId
  item_name: string
  channel_slug: string | null
}

export interface PriceTemplate {
  id: EncId
  name: string
  is_enabled: boolean
  auto_revert: boolean
  revert_after_minutes: number | null
  lines: PriceTemplateLine[]
}

export interface PriceTemplatePayload {
  name: string
  is_enabled?: boolean
  auto_revert?: boolean
  revert_after_minutes?: number | null
  lines?: PriceOverrideLine[]
}

export interface MenuScheduleLine extends PriceOverrideLine {
  id: EncId
  item_name: string
  channel_slug: string | null
}

export interface MenuSchedule {
  id: EncId
  name: string
  days: string[]
  start_time: string
  end_time: string
  is_enabled: boolean
  note: string
  lines: MenuScheduleLine[]
}

export interface MenuSchedulePayload {
  name: string
  days?: string[]
  start_time: string
  end_time: string
  is_enabled?: boolean
  note?: string
  lines?: PriceOverrideLine[]
}

// ── one-off scheduled publishes ─────────────────────────────────────────────

export interface ScheduledPublishLineInput {
  item_id: EncId
  outlet_channel_id?: EncId | null
  change_type?: 'Amount' | 'Percentage'
  change_direction?: 'Increase' | 'Decrease'
  change_value?: number | string
  /** Item-level availability toggle (mirrors the BaseMenu availability switch). */
  availability?: boolean | null
}

export interface ScheduledPublishLine extends ScheduledPublishLineInput {
  id: EncId
  item_name: string
  channel_slug: string | null
}

export interface ScheduledPublish {
  id: EncId
  name: string
  starts_at: string | null
  ends_at: string | null
  is_draft: boolean
  status: 'pending' | 'applied' | 'reverted' | 'cancelled'
  applied_at: string | null
  reverted_at: string | null
  lines: ScheduledPublishLine[]
}

export interface ScheduledPublishPayload {
  name?: string
  starts_at?: string | null
  ends_at?: string | null
  is_draft?: boolean
  lines?: ScheduledPublishLineInput[]
}

export interface MenuTriggerLog {
  id: EncId
  action: string
  details: Record<string, unknown>
  created_at: string
  template_id: EncId | null
  schedule_id: EncId | null
  template_name: string
  schedule_name: string
}

// ── physical menu ──────────────────────────────────────────────────────────

export interface PhysicalMenu {
  id: EncId
  url: string | null
  uploaded_at: string
}