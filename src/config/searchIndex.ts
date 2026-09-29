export interface SearchEntry {
  id: string
  label: string
  path: string
  group: string
  keywords?: string[]
}

interface SearchGroupDef {
  group: string
  entries: Array<[label: string, path: string, keywords?: string[]]>
}

const GROUPS: SearchGroupDef[] = [
  {
    group: 'Dashboard',
    entries: [
      ['Dashboard', '/dashboard', ['home', 'sales statistics']],
      ['Edit Profile', '/profile', ['account', 'user', 'profile settings']],
    ],
  },
  {
    group: 'Daily Operations',
    entries: [
      ['Live Orders', '/live-orders', ['live']],
      ['All Orders', '/all-orders', ['orders', 'order history']],
      ['Online Orders', '/online-orders', ['online', 'aggregator', 'portal']],
      ['KOT', '/kot', ['kitchen order ticket', 'cooking', 'kot tickets']],
      [
        'Due Payment Settlement',
        '/due-payments',
        ['due payments', 'credit', 'clients', 'dues'],
      ],
      ['Table View', '/table-view', ['tables', 'floor', 'dine in', 'table status']],
      ['Screens', '/screens', ['display', 'screen manager', 'customer display']],
    ],
  },
  {
    group: 'Billing',
    entries: [
      ['Billing', '/billing', ['billing', 'order taking', 'pos']],
      ['Billing – All Orders', '/billing/all-orders', ['billing orders']],
      ['Billing – Live Orders', '/billing/live-orders', ['billing live']],
      ['Billing – KOT', '/billing/kot', ['billing kot', 'kitchen']],
      ['Billing – Day End', '/billing/day-end', ['billing day end', 'settlement']],
    ],
  },
  {
    group: 'Captain Orders',
    entries: [
      ['Captain Orders', '/captain-orders', ['captain', 'waiter', 'orders']],
      [
        'Captain Orders – Live Orders',
        '/captain-orders/live-orders',
        ['captain live'],
      ],
      [
        'Captain Orders – All Orders',
        '/captain-orders/all-orders',
        ['captain all'],
      ],
      ['Captain Orders – KOT', '/captain-orders/kot', ['captain kot']],
      ['Captain Orders – Day End', '/captain-orders/day-end', ['captain day end']],
      ['Captain Orders – Logs', '/captain-orders/logs', ['captain logs', 'activity']],
    ],
  },
  {
    group: 'Menu',
    entries: [
      ['Menu & Discounts', '/menu', ['menu management', 'discounts', 'menu']],
      ['All-in-One Menu', '/menu/all-in-one', ['all in one', 'single menu']],
      ['Base Menu', '/menu/base-menu', ['base menu', 'item list']],
      ['Menu On/Off', '/menu/menu-on-off', ['on off', 'toggle', 'active']],
      ['Special Note', '/menu/special-note', ['special note', 'item note']],
      ['Item Commission', '/menu/item-commission', ['commission', 'item commission']],
      [
        'Schedule Changes',
        '/menu/schedule-changes',
        ['schedule', 'channel', 'changes'],
      ],
      ['Physical Menu', '/menu/physical-menu', ['physical', 'qr menu']],
      ['Add Outlet (Menu)', '/menu/add-outlet', ['outlet', 'location', 'add outlet']],
      ['Add Combo', '/menu/add-combo', ['combo', 'combo offer']],
      ['Add Menu Item', '/menu/add-item', ['add item', 'new item', 'menu item']],
      ['Add Commission', '/menu/add-commission', ['add commission']],
      [
        'Multi-Item Images Upload',
        '/menu/multi-item-images',
        ['image upload', 'photos', 'bulk upload'],
      ],
      ['Dine-In Menu', '/menu/dine-in', ['dine in', 'restaurant menu']],
      ['Parcel Menu', '/menu/parcel', ['parcel', 'takeaway']],
      ['Home Delivery Menu', '/menu/home-delivery', ['home delivery', 'hd']],
      ['Zomato Menu', '/menu/zomato', ['zomato', 'aggregator menu']],
      ['Swiggy Menu', '/menu/swiggy', ['swiggy', 'aggregator menu']],
      ['Categories', '/menu/categories', ['category', 'category management']],
      ['Add Category', '/menu/categories/new', ['add category', 'new category']],
      ['Variants', '/menu/variants', ['variant', 'variant management']],
      ['Addons', '/menu/addons', ['addon groups', 'addon']],
      ['Add Addon Group', '/menu/addons/new', ['add addon', 'new addon']],
      ['Tables & Areas', '/menu/tables', ['table management', 'areas', 'tables']],
      ['Add Table', '/menu/tables/new', ['add table', 'new table']],
      ['Add Area', '/menu/tables/areas/new', ['add area', 'new area']],
      ['Taxes', '/menu/taxes', ['tax management', 'gst', 'tax rates']],
      ['Add Tax', '/menu/taxes/new', ['add tax', 'new tax']],
      [
        'Backward Tax Printing Settings',
        '/menu/taxes/backward-printing',
        ['tax printing', 'backward'],
      ],
      [
        'Item & Order Wise Tax Settings',
        '/menu/taxes/item-order-wise',
        ['item tax', 'order tax'],
      ],
      ['Discounts', '/menu/discounts', ['discount management', 'offers']],
      ['Add Discount', '/menu/discounts/new', ['add discount', 'new discount']],
    ],
  },
  {
    group: 'Inventory',
    entries: [
      ['Inventory Dashboard', '/inventory', ['inventory', 'stock']],
      ['Inventory Dashboard (Legacy)', '/inventory/old', ['old dashboard']],
      ['Purchase', '/inventory/purchase', ['stock purchase', 'purchases']],
      ['Add Purchase', '/inventory/purchase/new', ['new purchase', 'add purchase']],
      ['Purchase Order', '/inventory/purchase-order', ['po', 'purchase orders']],
      [
        'Add Purchase Order',
        '/inventory/purchase-order/new',
        ['new po', 'add po'],
      ],
      ['Purchase Return', '/inventory/purchase-return', ['returns', 'purchase return']],
      [
        'Add Purchase Return',
        '/inventory/purchase-return/new',
        ['add return', 'new return'],
      ],
      ['Available Stock', '/inventory/available-stock', ['available', 'stock']],
      ['Closing Stock', '/inventory/closing-stock', ['closing']],
      ['Sales (Inventory)', '/inventory/sales', ['stock sales', 'inventory sales']],
      ['Add Sales', '/inventory/sales/new', ['new sales', 'add sales']],
      ['Transfer', '/inventory/transfer', ['stock transfer', 'material transfer']],
      ['Add Transfer', '/inventory/transfer/new', ['new transfer', 'add transfer']],
      ['Wastage', '/inventory/wastage', ['waste']],
      ['Add Wastage', '/inventory/wastage/new', ['new wastage', 'add wastage']],
      ['Sales Return', '/inventory/sales-return', ['sales return']],
      ['Add Sales Return', '/inventory/sales-return/new', ['add return']],
      [
        'Production Master',
        '/inventory/production-master',
        ['production', 'recipe', 'semi finished'],
      ],
      [
        'Add Production',
        '/inventory/production-master/new',
        ['new production', 'add production'],
      ],
      [
        'Production Execution',
        '/inventory/production-execution',
        ['production execution', 'execute'],
      ],
      ['Barcode Generation', '/inventory/barcode-generation', ['barcode', 'label']],
      [
        'Barcode Configuration',
        '/inventory/barcode-generation/configuration',
        ['barcode settings', 'label settings'],
      ],
      [
        'Current Stock Report',
        '/inventory/current-stock',
        ['current stock', 'stock report'],
      ],
      ['Stock Summary Report', '/inventory/stock-summary', ['stock summary']],
      [
        'Orderwise Consumption Report',
        '/inventory/orderwise-consumption',
        ['orderwise consumption'],
      ],
      ['Inventory Other Reports', '/inventory/other-reports', ['inventory reports']],
      [
        'Consumption Summary Report',
        '/inventory/other-reports/consumption-summary',
        ['consumption summary'],
      ],
      [
        'Opening & Closing Stock Report',
        '/inventory/other-reports/opening-closing',
        ['opening closing stock'],
      ],
      [
        'Food Costing Report',
        '/inventory/other-reports/food-costing',
        ['food costing'],
      ],
      [
        'Recipe Costing Report',
        '/inventory/other-reports/recipe-costing',
        ['recipe costing'],
      ],
      [
        'Material Purchase Report',
        '/inventory/other-reports/material-purchase',
        ['material purchase'],
      ],
      [
        'Supplier Payment Report',
        '/inventory/other-reports/supplier-payment',
        ['supplier payment'],
      ],
      [
        'Material Transfer Report',
        '/inventory/other-reports/material-transfer',
        ['material transfer'],
      ],
      [
        'Transfer Payment Report',
        '/inventory/other-reports/transfer-payment',
        ['transfer payment'],
      ],
      [
        'Purchase & Sales Return Report',
        '/inventory/other-reports/purchase-sales-return',
        ['purchase sales return'],
      ],
      [
        'Manual Stock Entry Report',
        '/inventory/other-reports/manual-stock-entry',
        ['manual stock entry'],
      ],
      [
        'Stock Report (Timewise)',
        '/inventory/other-reports/stock-report-timewise',
        ['timewise stock'],
      ],
      [
        'Sales Transfer Variance Report',
        '/inventory/other-reports/sales-transfer-variance',
        ['sales transfer variance'],
      ],
      [
        'Raised PO Variance Report',
        '/inventory/other-reports/raised-po-variance',
        ['raised po variance', 'po variance'],
      ],
      [
        'Purchase Order Received Report',
        '/inventory/other-reports/purchase-order-received',
        ['po received'],
      ],
      [
        'Semi-Finished Food Costing Report',
        '/inventory/other-reports/semi-finished-food-costing',
        ['semi finished food costing'],
      ],
      [
        'Payment Ledger Report',
        '/inventory/other-reports/payment-ledger',
        ['payment ledger'],
      ],
      [
        'Expiry Batchwise Insight Report',
        '/inventory/other-reports/expiry-batchwise',
        ['expiry batch', 'batchwise'],
      ],
      ['Raw Materials', '/inventory/raw-materials', ['raw material', 'ingredient']],
      ['Add Raw Material', '/inventory/raw-materials/new', ['add raw material']],
      ['Item Recipes', '/inventory/item-recipes', ['recipes', 'recipe']],
      ['Add Recipe', '/inventory/item-recipes/new', ['new recipe', 'add recipe']],
      [
        'Suppliers (Third Party)',
        '/inventory/suppliers',
        ['suppliers', 'third party', 'vendor'],
      ],
      ['Add Supplier', '/inventory/suppliers/new', ['add supplier', 'vendor']],
      [
        'Purchase Bill Payments',
        '/inventory/purchase-bill-payments',
        ['bill payments', 'purchase bills'],
      ],
      ['Units', '/inventory/units', ['unit', 'uom']],
      ['Add Unit', '/inventory/units/new', ['add unit', 'new unit']],
      ['Inventory Categories', '/inventory/categories', ['categories']],
      ['Invoice Templates', '/inventory/invoice-templates', ['invoice', 'template']],
    ],
  },
  {
    group: 'Finance',
    entries: [
      ['Finance Dashboard', '/finance', ['finance', 'money']],
      ['Transactions', '/finance/transactions', ['transactions', 'pos transactions']],
      ['Expenses', '/finance/expenses', ['expenses']],
      ['Finance Marketplace', '/finance/marketplace', ['marketplace', 'explore']],
      ['Marketing Automation', '/marketing', ['marketing', 'marketing automation']],
    ],
  },
  {
    group: 'Reports',
    entries: [
      ['Day End Summary', '/reports/day-end-summary', ['day end', 'closing', 'settlement']],
      ['Other Reports', '/reports/other-reports', ['reports']],
      [
        'All Restaurant Sales Report',
        '/reports/other-reports/all-restaurant-sales',
        ['all restaurant sales'],
      ],
      [
        'Outlet Item Wise Report',
        '/reports/other-reports/outlet-item-wise',
        ['outlet item wise'],
      ],
      [
        'Invoice Report',
        '/reports/other-reports/invoice-report',
        ['invoice report'],
      ],
      [
        'Pax Sales Report',
        '/reports/other-reports/pax-sales-report',
        ['pax', 'pax sales'],
      ],
      [
        'Order Sub-Order Wise Report',
        '/reports/other-reports/order-sub-order-wise',
        ['order sub order'],
      ],
      [
        'All Restaurant Day Wise Report',
        '/reports/other-reports/all-restaurant-day-wise',
        ['day wise'],
      ],
      [
        'Order Summary Corporate Customers',
        '/reports/other-reports/order-summary-corporate',
        ['corporate customers'],
      ],
      [
        'Cancel Order Report',
        '/reports/other-reports/cancel-order-report',
        ['cancel orders'],
      ],
      [
        'Locality Wise Report',
        '/reports/other-reports/locality-wise',
        ['locality wise'],
      ],
      [
        'Item Invoice Details Report',
        '/reports/other-reports/item-invoice-details',
        ['item invoice details'],
      ],
      [
        'Item Wise All Restaurants Report',
        '/reports/other-reports/item-wise-all-restaurants',
        ['item wise all'],
      ],
      [
        'Item Wise Brand Report',
        '/reports/other-reports/item-wise-brand',
        ['item wise brand'],
      ],
      [
        'Online Order Report',
        '/reports/other-reports/online-order-report',
        ['online order report'],
      ],
      [
        'Discounted Orders Report',
        '/reports/other-reports/discounted-orders',
        ['discounted orders'],
      ],
      ['Tag Wise Report', '/reports/other-reports/tag-wise', ['tag wise']],
      [
        'Advance Orders Summary Report',
        '/reports/other-reports/advance-orders-summary',
        ['advance orders'],
      ],
      [
        'Report Notification',
        '/reports/report-notification',
        ['notification', 'report alerts'],
      ],
      [
        'Add Report Notification',
        '/reports/report-notification/add',
        ['add notification', 'new alert'],
      ],
      ['Delivery Management', '/reports/delivery-management', ['delivery', 'rider']],
      ['Cover Size Summary', '/reports/cover-size-summary', ['cover size']],
      ['Category Summary', '/reports/category-summary', ['category summary']],
      ['Item Summary', '/reports/item-summary', ['item summary']],
      ['Sales Summary', '/reports/sales-summary', ['sales summary']],
      ['Order Summary', '/reports/order-summary', ['order summary']],
      [
        'Executive Sales Summary',
        '/reports/executive-sales-summary',
        ['executive sales'],
      ],
      ['Employee Summary', '/reports/employee-summary', ['employee summary']],
      ['Group Summary', '/reports/group-summary', ['group summary']],
      ['Variation Summary', '/reports/variation-summary', ['variation summary']],
      ['Tax Summary', '/reports/tax-summary', ['tax summary']],
      ['Counter Summary', '/reports/counter-summary', ['counter summary']],
      ['Logs', '/logs', ['logs', 'activity log']],
    ],
  },
  {
    group: 'Configuration',
    entries: [
      ['Configuration', '/configuration', ['settings', 'config']],
      ['Configuration – Orders', '/configuration/orders', ['current orders', 'config orders']],
      ['Customers', '/configuration/customers', ['customer screen', 'customer list']],
      ['Customer Display', '/customer-display', ['display board', 'customer display']],
    ],
  },
  {
    group: 'Management',
    entries: [
      ['Management – Configuration', '/management/configuration', ['management config']],
      [
        'Outlet Configuration',
        '/management/configuration/outlet',
        ['outlet settings'],
      ],
      ['Outlet Details', '/management/configuration/outlet/details', ['outlet details']],
      [
        'Outlet Contact Details',
        '/management/configuration/outlet/contact',
        ['contact details', 'outlet contact'],
      ],
      ['Outlet Timings', '/management/configuration/outlet/timings', ['timings', 'hours']],
      ['Outlet Payment', '/management/configuration/outlet/payment', ['payment settings']],
      [
        'Invoice Sequence',
        '/management/configuration/outlet/invoice-sequence',
        ['invoice sequence', 'invoice number'],
      ],
      [
        'Add Invoice Sequence',
        '/management/configuration/outlet/invoice-sequence/add',
        ['add invoice sequence'],
      ],
      [
        'Display Settings',
        '/management/configuration/outlet/display',
        ['display settings'],
      ],
      [
        'Print Logo Settings',
        '/management/configuration/outlet/print-logo',
        ['print logo', 'logo settings'],
      ],
      [
        'Calculation Settings',
        '/management/configuration/outlet/calculations',
        ['calculation settings', 'rounding'],
      ],
      [
        'Connected Services',
        '/management/configuration/outlet/connected-services',
        ['connected services', 'integrations'],
      ],
      [
        'Print Settings',
        '/management/configuration/outlet/print',
        ['print settings', 'printing'],
      ],
      [
        'Customer Settings',
        '/management/configuration/outlet/customer',
        ['customer settings'],
      ],
      [
        'Online Order Configuration',
        '/management/configuration/outlet/online-advance',
        ['online order', 'online advance'],
      ],
      [
        'Billing System Settings',
        '/management/configuration/outlet/billing-system',
        ['billing system'],
      ],
      [
        'SMS Configuration',
        '/management/configuration/outlet/sms',
        ['sms', 'message settings'],
      ],
      [
        'Outlet Documents',
        '/management/configuration/outlet/documents',
        ['documents', 'outlet docs'],
      ],
      ['Sub Order Type', '/management/configuration/sub-order-type', ['sub order type']],
      [
        'Add Sub Order Type',
        '/management/configuration/sub-order-type/add',
        ['add sub order type'],
      ],
      ['Delivery Distance', '/management/configuration/delivery-distance', ['delivery distance']],
      [
        'Add Delivery Distance',
        '/management/configuration/delivery-distance/add',
        ['add delivery distance'],
      ],
      [
        'Area/Locality Delivery Charges',
        '/management/configuration/area-locality-delivery',
        ['area locality', 'delivery charges'],
      ],
      [
        'Add Area/Locality Delivery Charge',
        '/management/configuration/area-locality-delivery/add',
        ['add area', 'add locality'],
      ],
      ['Floor Plan', '/management/configuration/floor-plan', ['floor plan', 'tables layout']],
      [
        'Email Template Settings',
        '/management/configuration/email-template',
        ['email template', 'email settings'],
      ],
      [
        'Payment Information',
        '/management/accounting/payment-information',
        ['accounting', 'payments', 'payment info'],
      ],
      [
        'Virtual Wallet',
        '/management/accounting/virtual-wallet',
        ['wallet', 'virtual wallet'],
      ],
      [
        'Online Order Reconciliation',
        '/management/accounting/online-order-reconciliation',
        ['reconciliation', 'online reconciliation'],
      ],
      ['GST Information', '/management/accounting/gst-information', ['gst', 'gst info']],
      ['Utility Bills', '/management/accounting/utility-bills', ['utility bills']],
      [
        'Add Utility Bill Operator',
        '/management/accounting/utility-bills/add',
        ['add utility bill', 'operator'],
      ],
      [
        'Expense & Withdrawal',
        '/management/accounting/expense-withdrawal',
        ['expense', 'withdrawal'],
      ],
      ['Add Expense', '/management/accounting/expense-withdrawal/add', ['add expense']],
      [
        'Service Payment History',
        '/management/accounting/service-payment-history',
        ['service payment'],
      ],
      ['Denomination', '/management/accounting/denomination', ['denomination']],
      [
        'Add Denomination',
        '/management/accounting/denomination/add',
        ['add denomination'],
      ],
      [
        'Biller App',
        '/management/user-management/biller-app',
        ['user management', 'biller', 'billers'],
      ],
      ['Add Biller', '/management/user-management/biller-app/add', ['add biller']],
      ['Roles', '/management/user-management/roles', ['roles', 'role management']],
      ['Add Role', '/management/user-management/roles/add', ['add role']],
      [
        'Online Store Logs',
        '/management/user-logs/online-store',
        ['online store', 'store logs'],
      ],
      [
        'Online Item On/Off Logs',
        '/management/user-logs/online-item-on-off',
        ['item on off logs'],
      ],
      [
        'Auto Accept Change Logs',
        '/management/user-logs/auto-accept-change',
        ['auto accept'],
      ],
      [
        'Support Management',
        '/management/user-logs/support-management',
        ['support', 'support tickets'],
      ],
      ['Notification Logs', '/management/user-logs/notification', ['notification logs']],
      ['Menu Trigger Logs', '/management/user-logs/menu-trigger', ['menu trigger']],
      ['Closing Hour Logs', '/management/user-logs/closing-hour', ['closing hour']],
      ['Expense Logs', '/management/user-logs/expense', ['expense logs']],
      ['Withdrawal Logs', '/management/user-logs/withdrawal', ['withdrawal logs']],
      ['Cash Top-Up Logs', '/management/user-logs/cash-top-up', ['cash top up']],
      [
        'Marketplace Settings',
        '/management/explore-products/marketplace-setting',
        ['marketplace settings'],
      ],
      ['Audit Trail', '/management/audit-trail', ['audit', 'audit trail']],
      [
        'Order Modification Audit',
        '/management/audit-trail/order-modification',
        ['order modification', 'order edit'],
      ],
      [
        'After Print Modification',
        '/management/audit-trail/after-print-modification',
        ['after print', 'post print'],
      ],
      [
        'After Print Payment Change',
        '/management/audit-trail/after-print-payment',
        ['payment change', 'payment history'],
      ],
      [
        'KOT Modification Report',
        '/management/audit-trail/kot-modification-report',
        ['kot modification', 'kot edit'],
      ],
      ['Device Mapping', '/management/device-mapping', ['device', 'device mapping']],
    ],
  },
]

export const searchIndex: SearchEntry[] = GROUPS.flatMap(({ group, entries }) =>
  entries.map(([label, path, keywords], index) => ({
    id: `${group}-${index}`,
    label,
    path,
    group,
    keywords,
  })),
)