export type ReportCategoryId =
  | 'favourite'
  | 'all-restaurant'
  | 'order'
  | 'item'
  | 'category'
  | 'customer'
  | 'discount'
  | 'others'

export interface RestaurantReportItem {
  id: string
  title: string
  description: string
  categoryId: Exclude<ReportCategoryId, 'favourite'>
}

export interface ReportCategoryDef {
  id: ReportCategoryId
  label: string
  title: string
  description: string
}

export const REPORT_CATEGORIES: ReportCategoryDef[] = [
  {
    id: 'favourite',
    label: 'Favourite',
    title: 'Favourite',
    description:
      'All reports which are marked as favorites to refer frequently',
  },
  {
    id: 'all-restaurant',
    label: 'All Restaurant Report',
    title: 'All Restaurant Report',
    description:
      'Get insights to all your restaurant & sales related activities',
  },
  {
    id: 'order',
    label: 'Order Related Reports',
    title: 'Order Related Reports',
    description: 'Track order activity, settlements, and operational changes',
  },
  {
    id: 'item',
    label: 'Item Related Reports',
    title: 'Item Related Reports',
    description: 'Understand item sales, mix, and performance across channels',
  },
  {
    id: 'category',
    label: 'Category Related Reports',
    title: 'Category Related Reports',
    description: 'Category-wise sales and contribution insights',
  },
  {
    id: 'customer',
    label: 'Customer Related Reports',
    title: 'Customer Related Reports',
    description: 'Customer visit patterns, sales, and loyalty insights',
  },
  {
    id: 'discount',
    label: 'Discount Related Reports',
    title: 'Discount Related Reports',
    description: 'Monitor discounts, reasons, and impact on sales',
  },
  {
    id: 'others',
    label: 'Others Reports',
    title: 'Others Reports',
    description: 'Additional operational and compliance reports',
  },
]

export const RESTAURANT_REPORTS: RestaurantReportItem[] = [
  {
    id: 'all-restaurant-sales',
    title: 'All Restaurant Sales Report',
    description: 'Total sales of all your restaurant',
    categoryId: 'all-restaurant',
  },
  {
    id: 'invoice-report',
    title: 'Invoice Report: All Restaurants',
    description: 'Bill start/end range with sales and cancel bill summary',
    categoryId: 'all-restaurant',
  },
  {
    id: 'pax-sales-report',
    title: 'Pax Sales Report: Biller Wise',
    description: 'Biller-wise total pax, sales, and average per customer',
    categoryId: 'all-restaurant',
  },
  {
    id: 'all-restaurant-day-wise',
    title: 'All Restaurant Report: Day Wise',
    description: 'Day-wise sales summary across restaurants with invoice ranges',
    categoryId: 'all-restaurant',
  },
  {
    id: 'outlet-item-wise-row',
    title: 'Outlet-Item Wise Report (Row)',
    description: 'Consolidated Summary of Item sales with outlets in row format',
    categoryId: 'all-restaurant',
  },
  {
    id: 'outlet-item-wise-column',
    title: 'Outlet-Item Wise Report (Column)',
    description:
      'Consolidated summary of item sales with outlets in column format',
    categoryId: 'all-restaurant',
  },
  {
    id: 'locality-wise',
    title: 'Locality Wise Report: All Restaurants',
    description: 'Compare sales performance across localities and outlets',
    categoryId: 'all-restaurant',
  },
  {
    id: 'order-master',
    title: 'Order Master Report',
    description: 'Complete list of orders with status, type, and settlement',
    categoryId: 'order',
  },
  {
    id: 'order-sub-order-wise',
    title: 'Order Report: Sub-Order Wise',
    description:
      'Sales summary by order type and sub-order type across restaurants',
    categoryId: 'order',
  },
  {
    id: 'advance-orders-summary',
    title: 'Advance Orders Summary Report',
    description: 'Generate and download advance order summary reports',
    categoryId: 'order',
  },
  {
    id: 'cancelled-orders',
    title: 'Cancel Order Report: All Restaurants',
    description: 'Day-wise cancelled order quantity and amount across restaurants',
    categoryId: 'order',
  },
  {
    id: 'modified-orders',
    title: 'Modified Orders Report',
    description: 'Track bill modifications after punch and print',
    categoryId: 'order',
  },
  {
    id: 'online-orders-summary',
    title: 'Online Order Report: All Restaurants',
    description: 'Export online order records across restaurants',
    categoryId: 'order',
  },
  {
    id: 'item-wise-sales',
    title: 'Item Wise Report: All Restaurants',
    description:
      'Export item-wise sales summary across restaurants as a ZIP',
    categoryId: 'item',
  },
  {
    id: 'item-wise-brand',
    title: 'Item Wise Report (Brand wise): All Restaurants',
    description:
      'Export brand-wise item sales summary across restaurants as a ZIP',
    categoryId: 'item',
  },
  {
    id: 'item-invoice-details',
    title: 'Item report: Invoice Details',
    description:
      'Export item-wise invoice details as a ZIP for the selected date',
    categoryId: 'item',
  },
  {
    id: 'item-wise-tax',
    title: 'Item Wise Tax Report',
    description: 'Tax collected against each menu item sold',
    categoryId: 'item',
  },
  {
    id: 'employee-item-summary',
    title: 'Employee Wise Item Summary',
    description: 'Items punched by each captain, cashier, or biller',
    categoryId: 'item',
  },
  {
    id: 'category-sales',
    title: 'Category Sales Report',
    description: 'Sales contribution by menu category',
    categoryId: 'category',
  },
  {
    id: 'parent-category-sales',
    title: 'Parent Category Sales Report',
    description: 'Grouped sales by parent category',
    categoryId: 'category',
  },
  {
    id: 'customer-sales-summary',
    title: 'Customer Sales Summary',
    description: 'Customer-wise visit count, average ticket, and sales',
    categoryId: 'customer',
  },
  {
    id: 'order-summary-corporate',
    title: 'Order Summary: Corporate Customers',
    description: 'Corporate customer order summary across restaurants',
    categoryId: 'customer',
  },
  {
    id: 'new-vs-repeat',
    title: 'New vs Repeat Customers',
    description: 'Split of first-time and returning customer orders',
    categoryId: 'customer',
  },
  {
    id: 'discounted-orders',
    title: 'Discounted Orders: All Restaurants (With Reason)',
    description: 'Export discounted orders with reason across restaurants',
    categoryId: 'discount',
  },
  {
    id: 'discount-summary',
    title: 'Discount Summary Report',
    description: 'Total discount given by type across the selected period',
    categoryId: 'discount',
  },
  {
    id: 'cash-drawer',
    title: 'Cash Drawer Report',
    description: 'Cash drawer open, close, and variance activity',
    categoryId: 'others',
  },
  {
    id: 'tag-wise-report',
    title: 'Tag Wise Report: All Restaurants',
    description: 'Export tag-wise sales summary across restaurants',
    categoryId: 'others',
  },
  {
    id: 'tax-summary',
    title: 'Tax Summary Report',
    description: 'Tax collected across GST slabs for the period',
    categoryId: 'others',
  },
  {
    id: 'tip-summary',
    title: 'Tip Summary Report',
    description: 'Tips collected by payment mode and staff',
    categoryId: 'others',
  },
]
