import { useMemo, useState } from 'react'
import { Info, Search } from 'lucide-react'
import { SearchableSelect } from '../inventory/SearchableSelect'

export type PermissionCategoryId =
  | 'all'
  | 'pos'
  | 'order-kot'
  | 'bill-mods'
  | 'inventory'
  | 'config'
  | 'reports'
  | 'tables'

export interface PermissionCategory {
  id: PermissionCategoryId
  label: string
  required?: boolean
}

type YesPermission = {
  id: string
  label: string
  category: Exclude<PermissionCategoryId, 'all'>
  type: 'yes'
  defaultChecked: boolean
  info?: string
}

type MultiPermission = {
  id: string
  label: string
  category: Exclude<PermissionCategoryId, 'all'>
  type: 'multi'
  options: string[]
  defaultSelected: string[]
  info?: string
}

type RadioPermission = {
  id: string
  label: string
  category: Exclude<PermissionCategoryId, 'all'>
  type: 'radio'
  options: string[]
  defaultValue: string
  info?: string
}

type ReportPermission = {
  id: string
  label: string
  category: 'reports'
  type: 'report'
  hasDisplayValues: boolean
  defaultShow: boolean
  defaultDisplayValues: boolean
  defaultDays: string
  info?: string
}

export type PermissionDef =
  | YesPermission
  | MultiPermission
  | RadioPermission
  | ReportPermission

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  { id: 'all', label: 'All Permissions' },
  { id: 'pos', label: 'POS & Billing Operations' },
  { id: 'order-kot', label: 'Order & KOT Management' },
  { id: 'bill-mods', label: 'Bill Modifications, Discounts & Security' },
  { id: 'inventory', label: 'Inventory & Stock Management' },
  { id: 'config', label: 'Configuration, Reports & System' },
  { id: 'reports', label: 'Reports' },
  { id: 'tables', label: 'Tables', required: true },
]

const GROUP_OPTIONS = [
  'No Group Selected',
  'Manager',
  'Cashier',
  'Captain',
  'Delivery',
]

function yes(
  id: string,
  label: string,
  category: YesPermission['category'],
  defaultChecked = true,
  info?: string,
): YesPermission {
  return { id, label, category, type: 'yes', defaultChecked, info }
}

function multi(
  id: string,
  label: string,
  category: MultiPermission['category'],
  options: string[],
  defaultSelected = options,
  info?: string,
): MultiPermission {
  return { id, label, category, type: 'multi', options, defaultSelected, info }
}

const REPORT_DAYS_OPTIONS = [
  'No Restriction',
  'Today',
  '7 Days',
  '15 Days',
  '30 Days',
]

function report(
  id: string,
  label: string,
  options?: {
    hasDisplayValues?: boolean
    defaultShow?: boolean
    defaultDisplayValues?: boolean
    defaultDays?: string
  },
): ReportPermission {
  return {
    id,
    label,
    category: 'reports',
    type: 'report',
    hasDisplayValues: options?.hasDisplayValues ?? true,
    defaultShow: options?.defaultShow ?? true,
    defaultDisplayValues: options?.defaultDisplayValues ?? false,
    defaultDays: options?.defaultDays ?? 'No Restriction',
  }
}

export const BILLER_PERMISSIONS: PermissionDef[] = [
  // POS & Billing Operations
  yes('allow-billing-rights', 'Allow Billing Rights', 'pos'),
  yes('settle-save', 'Settle & Save', 'pos'),
  yes('print-bill-settle-save', 'Print bill on Settle & Save', 'pos', false),
  yes('btn-save', 'Show Button : Save', 'pos'),
  yes('btn-save-print', 'Show Button : Save & Print', 'pos'),
  yes('btn-print-ebill', 'Show Button : Print & eBill', 'pos'),
  yes('btn-save-ebill', 'Show Button : Save & eBill', 'pos'),
  yes('btn-split', 'Show Button : Split', 'pos'),
  yes('btn-hold', 'Show Button : Hold', 'pos'),
  yes('btn-kot', 'Show Button : KOT', 'pos'),
  yes('btn-kot-print', 'Show Button : KOT & Print', 'pos'),
  yes('btn-save-kot-print', 'Show Button : Save & KOT Print', 'pos', false),
  yes('show-due-payment-box', 'Show Due payment box', 'pos'),
  yes('manual-finalize-order', 'Manual Finalize Order', 'pos', false),
  yes('remove-tax-from-bill', 'Remove Tax From Bill', 'pos', false),
  yes('special-note', 'Special Note', 'pos'),
  yes('show-sap-box', 'Show Sap Box', 'pos', false),
  yes('language-profile', 'Language Profile', 'pos'),
  yes('cash-drawer', 'Cash Drawer', 'pos', false),
  yes('manual-open-cash-drawer', 'Manual Open Cash Drawer', 'pos'),
  yes('day-end', 'Day End', 'pos'),
  yes('blind-day-end', 'Blind Day End', 'pos', false),
  multi(
    'allow-payment-type',
    'Allow payment type',
    'pos',
    ['Cash', 'Card', 'Due', 'Other', 'Part', 'Not Paid', 'UPI'],
  ),
  multi(
    'update-payment-type',
    'Update Payment Type',
    'pos',
    ['After Save', 'After Print', 'After Settle & Save'],
  ),
  yes('show-current-order-details', 'Show Current Order Details', 'pos'),
  yes('order-live-view', 'Order Live View', 'pos'),
  yes('kot-live-view', 'KOT Live View', 'pos'),
  yes(
    'show-close-live-view',
    'Show Close button on live view card',
    'pos',
  ),
  multi('item-master', 'Item Master', 'pos', ['Read', 'Write']),
  multi(
    'item-variation-management',
    'Item Variation Management',
    'pos',
    ['Read', 'Write'],
  ),
  yes('store-on-off', 'Store On Off', 'pos'),
  yes('item-on-off', 'Item On Off', 'pos'),
  multi(
    'expense-withdrawal-mgmt',
    'Expense & Withdrawal Management',
    'pos',
    ['Read', 'Write'],
  ),
  yes('manual-sync', 'Manual Sync', 'pos'),
  yes(
    'multi-billing-screen-config',
    'Show multiple billing screen configuration settings (Only for multiple screens)',
    'pos',
    false,
  ),
  yes('show-virtual-wallet-config', 'Show Virtual Wallet Configuration', 'pos'),

  // Order & KOT Management
  multi('kot-management', 'KOT Management', 'order-kot', ['Read', 'Write']),
  yes('move-kot-items', 'Move KOT/Items', 'order-kot'),
  multi('allow-kot-to-cancel', 'Allow KOT To Cancel', 'order-kot', [
    'Reason',
    'Reason With Password',
  ]),
  multi('allow-kot-reprint', 'Allow KOT Reprint', 'order-kot', [
    'Yes',
    'With Password',
  ]),
  yes('logout-after-kot-print', 'Logout after KOT print', 'order-kot', false),
  multi('after-print-modification', 'After Print Modification', 'order-kot', [
    'Add item',
    'Modify quantity & delete item',
  ]),
  multi(
    'after-save-kot-modification',
    'After Save Kot Modification',
    'order-kot',
    ['Add item', 'Modify quantity & delete item'],
  ),
  multi('check-items', 'Check Items', 'order-kot', ['Yes', 'Modify', 'Print']),
  yes('allow-item-delete-first-time', 'Allow item delete first time', 'order-kot'),
  yes('advanced-order-management', 'Advanced Order Management', 'order-kot'),
  yes('pending-order-management', 'Pending Order Management', 'order-kot'),
  yes('edit-advanced-order', 'Edit Advanced Order', 'order-kot'),
  yes(
    'allow-edit-fully-settled-advance',
    'Allow edit fully settled advance order',
    'order-kot',
    true,
    'Allow editing of advance orders that are already fully settled.',
  ),
  yes(
    'allow-auto-acceptance-config',
    'Allow Auto acceptance configuration change',
    'order-kot',
  ),
  yes('do-not-show-autoaccept', 'Do not show autoaccept order', 'order-kot', false),
  yes(
    'show-custom-order-status-config',
    'Show Custom Order Status Configuration',
    'order-kot',
  ),
  yes('allow-pending-order-edit', 'Allow Pending Order Edit Rights', 'order-kot'),
  yes(
    'hide-print-live-view-auto',
    'Hide print button on live view card (Applicable to auto-accepted online orders only)',
    'order-kot',
    false,
  ),

  // Bill Modifications, Discounts & Security
  multi('allow-bill-to-cancel', 'Allow Bill To Cancel', 'bill-mods', [
    'Reason',
    'Reason With Password',
  ]),
  multi('allow-bill-reprint', 'Allow Bill Reprint', 'bill-mods', [
    'Yes',
    'With Password',
  ]),
  multi(
    'after-save-bill-modification',
    'After Save Bill Modification',
    'bill-mods',
    ['Add item', 'Modify quantity & delete item'],
  ),
  multi(
    'after-settle-save-modification',
    'After Settle & Save Modification',
    'bill-mods',
    ['Add item', 'Modify quantity & delete item'],
  ),
  yes(
    'require-bill-modification-reason',
    'Require Bill Modification Reason',
    'bill-mods',
    false,
  ),
  multi(
    'ask-reason-edit-delete-items',
    'Ask Reason when edit/delete items from edit bill/kot',
    'bill-mods',
    ['Yes', 'With Password'],
    [],
  ),
  yes('logout-after-bill-print', 'Logout after Bill print', 'bill-mods', false),
  yes(
    'allow-edit-auto-charges',
    'Allow editing of charges that are set to be calculated automatically',
    'bill-mods',
    false,
  ),
  multi('discount-configuration', 'Discount Configuration', 'bill-mods', [
    'Read',
    'Write',
  ]),
  yes('allow-special-discount', 'Allow Special Discount', 'bill-mods'),
  multi(
    'allow-discount',
    'Allow Discount',
    'bill-mods',
    ['Yes', 'After Print', 'After Settle & Save'],
  ),
  multi(
    'complimentary-bill',
    'Complimentary Bill',
    'bill-mods',
    ['Yes', 'With Password'],
    [],
  ),
  multi(
    'nc-items',
    'NC Items (No Charge Items)',
    'bill-mods',
    ['Yes', 'With Password'],
    [],
  ),
  multi(
    'sales-return-bill',
    'Sales Return Bill',
    'bill-mods',
    ['Yes', 'With Password'],
    [],
  ),
  yes(
    'show-only-my-created-bill-kot',
    'Show only my created Bill/KOT',
    'bill-mods',
    false,
  ),
  yes(
    'restrict-customer-payment-due',
    'Restrict changes to customer details/payment type for orders with due payment',
    'bill-mods',
    false,
  ),
  yes(
    'allow-return-cash-advance',
    'Allow return cash option in advance orders (offline billing)',
    'bill-mods',
    false,
  ),

  // Inventory & Stock Management
  multi(
    'menu-item-stock-mgmt',
    'Menu Item Stock Management [Inventory]',
    'inventory',
    ['Read', 'Write'],
    [],
  ),
  multi('purchase-inventory', 'Purchase [Inventory]', 'inventory', [
    'Read',
    'Write',
  ]),
  yes('indent-management', 'Indent Management', 'inventory'),
  multi('stock-management-inventory', 'Stock Management [Inventory]', 'inventory', [
    'Read',
    'Write',
  ]),
  multi(
    'internal-transfer-sales',
    'Internal Transfer/Sales [Inventory]',
    'inventory',
    ['Read', 'Write'],
  ),
  multi(
    'request-for-purchase',
    'Request For Purchase [Inventory]',
    'inventory',
    ['Read', 'Write'],
  ),
  multi(
    'realtime-stock-management',
    'Real-Time stock management [Inventory]',
    'inventory',
    ['Read', 'Write'],
  ),
  multi(
    'raw-material-master',
    'Raw Material Master [Inventory]',
    'inventory',
    ['Read', 'Write'],
  ),
  multi('wastage-inventory', 'Wastage [Inventory]', 'inventory', [
    'Read',
    'Write',
  ]),
  multi('rate-card-inventory', 'Rate Card [Inventory]', 'inventory', [
    'Read',
    'Write',
  ], []),
  yes('grocery-inventory', 'Grocery Inventory', 'inventory', false),
  multi(
    'manual-stock-available',
    'Manual stock (available stock) [inventory]',
    'inventory',
    ['Read', 'Write'],
    [],
  ),
  yes(
    'paid-unpaid-inventory',
    'Is this user allowed to use paid/unpaid functionality in inventory?',
    'inventory',
  ),
  yes('inventory-report', 'Inventory Report', 'inventory'),
  multi('supplier-inventory', 'Supplier [Inventory]', 'inventory', [
    'Read',
    'Write',
  ]),
  multi(
    'production-master-module',
    'Production Master Module [Inventory]',
    'inventory',
    ['Read', 'Write'],
  ),

  // Configuration, Reports & System
  yes('reports-access', 'Reports', 'config'),
  yes(
    'allow-graphical-analytics',
    'Allow Graphical Analytics in Reports',
    'config',
    false,
  ),
  yes('finance-dashboard', 'Finance Dashboard', 'config', false),
  yes('configure-profit-loss', 'Configure profit and loss', 'config', false),
  multi('tax-configuration', 'Tax Configuration', 'config', ['Read', 'Write']),
  multi('category-wise-taxes', 'Category wise taxes', 'config', [
    'Read',
    'Write',
  ]),
  multi(
    'pos-configuration-details',
    'Point of Sale Configuration Details',
    'config',
    ['Read', 'Write'],
  ),
  multi('area-table-management', 'Area, Table Management', 'config', [
    'Read',
    'Write',
  ]),
  multi('customer-management', 'Customer Management', 'config', [
    'Read',
    'Write',
  ]),
  multi('delivery-boy-management', 'Delivery Boy Management', 'config', [
    'Read',
    'Write',
  ]),
  yes('show-customer-complaints-pos', 'Show customer complaint(s) POS', 'config'),
  multi('allow-complaint-actions', 'Allow Complaint Actions', 'config', [
    'Read',
    'Write',
  ]),
  yes('hsn-mandatory-item-level', 'Hsn Mandatory Item level', 'config', false),
  multi(
    'allow-biller-create-order-for',
    'Allow biller to create order for',
    'config',
    ['Delivery', 'Pick Up', 'Dine In'],
  ),

  // Reports — Desktop Report Rights
  report('rpt-category-summary', 'Category Summary', {
    defaultDisplayValues: true,
  }),
  report('rpt-item-summary', 'Item Summary', {
    defaultDisplayValues: true,
  }),
  report('rpt-sales-summary', 'Sales Summary', {
    defaultDisplayValues: true,
  }),
  report('rpt-order-summary', 'Order Summary'),
  report('rpt-executive-sales-summary', 'Executive Sales Summary'),
  report('rpt-employee-summary', 'Employee Summary', {
    hasDisplayValues: false,
  }),
  report('rpt-group-summary', 'Group Summary', { hasDisplayValues: false }),
  report('rpt-variation-summary', 'Variation Summary', {
    hasDisplayValues: false,
  }),
  report('rpt-coversize-summary', 'Coversize Summary', {
    hasDisplayValues: false,
  }),
  report('rpt-tip-summary', 'Tip Summary', { hasDisplayValues: false }),
  report('rpt-counter-summary', 'Counter Summary', { hasDisplayValues: false }),
  report('rpt-locality-wise-summary', 'Locality Wise Summary', {
    hasDisplayValues: false,
  }),
  report('rpt-captain-wise-summary', 'Captain Wise Summary', {
    hasDisplayValues: false,
  }),
  report('rpt-settlement-summary', 'Settlement Summary', {
    hasDisplayValues: false,
  }),
  report(
    'rpt-nc-item-summary',
    'NC Item Summary (Non-Chargeable Item Summary)',
    { hasDisplayValues: false },
  ),
  report('rpt-assignee-wise-summary', 'Assignee Wise Summary', {
    hasDisplayValues: false,
  }),
]

type YesState = Record<string, boolean>
type MultiState = Record<string, string[]>
type RadioState = Record<string, string>
type ReportState = Record<
  string,
  { show: boolean; displayValues: boolean; days: string }
>

function buildDefaultYes(): YesState {
  const state: YesState = {}
  for (const item of BILLER_PERMISSIONS) {
    if (item.type === 'yes') state[item.id] = item.defaultChecked
  }
  return state
}

function buildDefaultMulti(): MultiState {
  const state: MultiState = {}
  for (const item of BILLER_PERMISSIONS) {
    if (item.type === 'multi') state[item.id] = [...item.defaultSelected]
  }
  return state
}

function buildDefaultRadio(): RadioState {
  const state: RadioState = {}
  for (const item of BILLER_PERMISSIONS) {
    if (item.type === 'radio') state[item.id] = item.defaultValue
  }
  return state
}

function buildDefaultReport(): ReportState {
  const state: ReportState = {}
  for (const item of BILLER_PERMISSIONS) {
    if (item.type === 'report') {
      state[item.id] = {
        show: item.defaultShow,
        displayValues: item.defaultDisplayValues,
        days: item.defaultDays,
      }
    }
  }
  return state
}

function isPermissionEnabled(
  item: PermissionDef,
  yesState: YesState,
  multiState: MultiState,
  reportState: ReportState,
): boolean {
  if (item.type === 'yes') return Boolean(yesState[item.id])
  if (item.type === 'multi') return (multiState[item.id] ?? []).length > 0
  if (item.type === 'report') return Boolean(reportState[item.id]?.show)
  return true
}

export function BillerPermissionsPanel() {
  const [group, setGroup] = useState(GROUP_OPTIONS[0])
  const [category, setCategory] = useState<PermissionCategoryId>('pos')
  const [search, setSearch] = useState('')
  const [yesState, setYesState] = useState<YesState>(buildDefaultYes)
  const [multiState, setMultiState] = useState<MultiState>(buildDefaultMulti)
  const [radioState, setRadioState] = useState<RadioState>(buildDefaultRadio)
  const [reportState, setReportState] = useState<ReportState>(buildDefaultReport)

  const TABLE_NUMBERS = ['1', '2']

  const [selectedTables, setSelectedTables] = useState<string[]>(TABLE_NUMBERS)

  const isAllTablesSelected =
    selectedTables.length === TABLE_NUMBERS.length

  function toggleAllTables() {
    if (isAllTablesSelected) {
      setSelectedTables([])
    } else {
      setSelectedTables([...TABLE_NUMBERS])
    }
  }

  function toggleTable(tableNo: string) {
    setSelectedTables((prev) =>
      prev.includes(tableNo)
        ? prev.filter((item) => item !== tableNo)
        : [...prev, tableNo],
    )
  }

  const enabledCount = useMemo(
    () =>
      BILLER_PERMISSIONS.filter((item) =>
        isPermissionEnabled(item, yesState, multiState, reportState),
      ).length + (selectedTables.length > 0 ? 1 : 0),
    [yesState, multiState, reportState, selectedTables],
  )

  const totalCount = BILLER_PERMISSIONS.length + 1

  const visiblePermissions = useMemo(() => {
    const q = search.trim().toLowerCase()
    return BILLER_PERMISSIONS.filter((item) => {
      const categoryOk = category === 'all' || item.category === category
      const searchOk = !q || item.label.toLowerCase().includes(q)
      return categoryOk && searchOk
    })
  }, [category, search])

  const showingReportsOnly =
    category === 'reports' ||
    (visiblePermissions.length > 0 &&
      visiblePermissions.every((item) => item.type === 'report'))

  const listTitle = showingReportsOnly
    ? 'Desktop Report Rights'
    : (PERMISSION_CATEGORIES.find((item) => item.id === category)?.label ??
      'Permissions')

  function toggleYes(id: string) {
    setYesState((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleMulti(id: string, option: string) {
    setMultiState((prev) => {
      const current = prev[id] ?? []
      const next = current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option]
      return { ...prev, [id]: next }
    })
  }

  function setRadio(id: string, value: string) {
    setRadioState((prev) => ({ ...prev, [id]: value }))
  }

  function patchReport(
    id: string,
    patch: Partial<{ show: boolean; displayValues: boolean; days: string }>,
  ) {
    setReportState((prev) => ({
      ...prev,
      [id]: {
        show: prev[id]?.show ?? true,
        displayValues: prev[id]?.displayValues ?? false,
        days: prev[id]?.days ?? 'No Restriction',
        ...patch,
      },
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full min-w-[200px] sm:max-w-xs">
          <SearchableSelect
            label=""
            value={group}
            options={GROUP_OPTIONS}
            onChange={setGroup}
          />
        </div>
        <label className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search rights"
            className="h-10 w-full rounded-md border border-line bg-card py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
        </label>
      </div>

      <p className="text-sm font-semibold text-ink">
        Permissions ({enabledCount} / {totalCount})
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex min-h-[480px] flex-col lg:flex-row">
          <aside className="w-full shrink-0 border-b border-line bg-page/40 lg:w-64 lg:border-b-0 lg:border-r">
            <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
              {PERMISSION_CATEGORIES.map((item) => {
                const active = category === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`relative whitespace-nowrap rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? 'border-l-4 border-primary bg-primary/10 font-semibold text-primary pl-3'
                        : 'text-ink hover:bg-page'
                    }`}
                  >
                    {item.label}
                    {item.required ? (
                      <span className="text-danger font-bold"> *</span>
                    ) : null}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 overflow-x-auto">
            {category === 'tables' ? (
              <div className="p-6 md:p-8 space-y-6">
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink select-none">
                  <input
                    type="checkbox"
                    checked={isAllTablesSelected}
                    onChange={toggleAllTables}
                    className="size-4 cursor-pointer accent-primary rounded"
                  />
                  <span>All Tables</span>
                </label>

                <div className="flex items-center gap-12 pt-1">
                  {TABLE_NUMBERS.map((tableNo) => {
                    const checked = selectedTables.includes(tableNo)
                    return (
                      <label
                        key={tableNo}
                        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTable(tableNo)}
                          className="size-4 cursor-pointer accent-primary rounded"
                        />
                        <span>{tableNo}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ) : showingReportsOnly ? (
              <div className="grid min-w-[640px] grid-cols-[minmax(0,1.4fr)_120px_130px_160px] gap-3 border-b border-line bg-page px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                <span>{listTitle}</span>
                <span>Action</span>
                <span>Display Values</span>
                <span>Days</span>
              </div>
            ) : (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-line bg-page px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                <span>{listTitle}</span>
                <span className="pr-2 text-right">Action</span>
              </div>
            )}

            {visiblePermissions.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                <Search size={36} strokeWidth={1.5} className="mb-3 text-muted/40" />
                <p className="text-sm font-semibold text-ink">No rights found</p>
                <p className="mt-1 text-xs text-muted">
                  Try another category or search term.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {visiblePermissions.map((item) =>
                  item.type === 'report' ? (
                    <li
                      key={item.id}
                      className="grid min-w-[640px] grid-cols-[minmax(0,1.4fr)_120px_130px_160px] items-center gap-3 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                        <input
                          type="checkbox"
                          checked={Boolean(reportState[item.id]?.show)}
                          onChange={() =>
                            patchReport(item.id, {
                              show: !reportState[item.id]?.show,
                            })
                          }
                          className="size-4 cursor-pointer accent-primary"
                        />
                        Show
                      </label>
                      <div>
                        {item.hasDisplayValues ? (
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                            <input
                              type="checkbox"
                              checked={Boolean(
                                reportState[item.id]?.displayValues,
                              )}
                              onChange={() =>
                                patchReport(item.id, {
                                  displayValues:
                                    !reportState[item.id]?.displayValues,
                                })
                              }
                              className="size-4 cursor-pointer accent-primary"
                            />
                          </label>
                        ) : null}
                      </div>
                      <select
                        value={reportState[item.id]?.days ?? 'No Restriction'}
                        onChange={(event) =>
                          patchReport(item.id, { days: event.target.value })
                        }
                        className="h-9 w-full rounded-md border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
                      >
                        {REPORT_DAYS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,auto)] sm:items-center sm:gap-4"
                    >
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                        {item.label}
                        {item.info ? (
                          <span className="group relative inline-flex">
                            <button
                              type="button"
                              aria-label={`About ${item.label}`}
                              className="inline-flex size-4 items-center justify-center rounded-full text-muted hover:text-primary"
                            >
                              <Info size={13} aria-hidden />
                            </button>
                            <span
                              role="tooltip"
                              className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-left text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                            >
                              {item.info}
                            </span>
                          </span>
                        ) : null}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
                        {item.type === 'yes' ? (
                          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                            <input
                              type="checkbox"
                              checked={Boolean(yesState[item.id])}
                              onChange={() => toggleYes(item.id)}
                              className="size-4 cursor-pointer accent-primary"
                            />
                            Yes
                          </label>
                        ) : null}

                        {item.type === 'multi'
                          ? item.options.map((option) => {
                              const selected = (
                                multiState[item.id] ?? []
                              ).includes(option)
                              return (
                                <label
                                  key={option}
                                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() =>
                                      toggleMulti(item.id, option)
                                    }
                                    className="size-4 cursor-pointer accent-primary"
                                  />
                                  {option}
                                </label>
                              )
                            })
                          : null}

                        {item.type === 'radio'
                          ? item.options.map((option) => (
                              <label
                                key={option}
                                className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                              >
                                <input
                                  type="radio"
                                  name={item.id}
                                  checked={radioState[item.id] === option}
                                  onChange={() => setRadio(item.id, option)}
                                  className="size-4 cursor-pointer accent-primary"
                                />
                                {option}
                              </label>
                            ))
                          : null}
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
