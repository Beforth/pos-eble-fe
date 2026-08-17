import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowLeftRight,
  Barcode,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Factory,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Layers,
  Leaf,
  LineChart,
  Phone,
  Settings,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Truck,
  Undo2,
  X,
} from 'lucide-react'
import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'

type IconType = typeof ArrowLeft

interface NavLeaf {
  id: string
  label: string
  icon?: IconType
  path?: string
}

interface NavBranch {
  id: string
  label: string
  icon: IconType
  children?: NavLeaf[]
  expandable?: boolean
  moreChildren?: NavLeaf[]
}

const INVENTORY_ROUTES: Record<string, string> = {
  'back-billing': '/dashboard',
  dashboard: '/inventory',
  'stock-purchase': '/inventory/purchase',
  'purchase-order': '/inventory/purchase-order',
  'purchase-return': '/inventory/purchase-return',
  'available-stock': '/inventory/available-stock',
  'closing-stock': '/inventory/closing-stock',
  sales: '/inventory/sales',
  transfer: '/inventory/transfer',
  wastage: '/inventory/wastage',
  'sales-return': '/inventory/sales-return',
  'production-master': '/inventory/production-master',
  'production-execution': '/inventory/production-execution',
  'barcode-generation': '/inventory/barcode-generation',
  'current-stock': '/inventory/current-stock',
  'stock-summary': '/inventory/stock-summary',
  'orderwise-consumption': '/inventory/orderwise-consumption',
  'other-reports': '/inventory/other-reports',
  'raw-materials': '/inventory/raw-materials',
  'item-recipes': '/inventory/item-recipes',
  suppliers: '/inventory/suppliers',
  units: '/inventory/units',
  categories: '/inventory/categories',
  settings: '/inventory',
}

const TOP_NAV: NavBranch[] = [
  { id: 'back-billing', label: 'Back To Billing', icon: ArrowLeft },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'purchase',
    label: 'Purchase',
    icon: ShoppingCart,
    expandable: true,
    children: [
      { id: 'stock-purchase', label: 'Stock Purchase' },
      { id: 'purchase-order', label: 'Purchase Order' },
      { id: 'purchase-return', label: 'Purchase Return' },
    ],
  },
  {
    id: 'manage-stock',
    label: 'Manage Stock',
    icon: ClipboardList,
    expandable: true,
    children: [
      { id: 'available-stock', label: 'Available Stock' },
      { id: 'closing-stock', label: 'Closing stock' },
    ],
  },
]

const CONSUMPTION: NavLeaf[] = [
  { id: 'sales', label: 'Sales', icon: TrendingUp },
  { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { id: 'wastage', label: 'Wastage', icon: Trash2 },
]

const CONSUMPTION_MORE: NavLeaf[] = [
  { id: 'sales-return', label: 'Sales Return', icon: Undo2 },
]

const PRODUCTION_CHILDREN: NavLeaf[] = [
  { id: 'production-master', label: 'Production Master', icon: Leaf },
  { id: 'production-execution', label: 'Production Execution', icon: Layers },
  { id: 'barcode-generation', label: 'Barcode Generation', icon: Barcode },
]

const REPORTS_CHILDREN: NavLeaf[] = [
  { id: 'current-stock', label: 'Current Stock', icon: ClipboardCheck },
  { id: 'stock-summary', label: 'Stock Summary', icon: FileText },
  {
    id: 'orderwise-consumption',
    label: 'Orderwise Consumption',
    icon: LineChart,
  },
  { id: 'other-reports', label: 'Other Reports', icon: Clock },
]

const MASTERS_CHILDREN: NavLeaf[] = [
  { id: 'raw-materials', label: 'Raw Materials', icon: Building2 },
  { id: 'item-recipes', label: 'Item Recipes', icon: ClipboardList },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
]

const MASTERS_MORE: NavLeaf[] = [
  { id: 'units', label: 'Units', icon: Boxes },
  { id: 'categories', label: 'Categories', icon: FileBarChart },
]

const BOTTOM_NAV: NavBranch[] = [
  {
    id: 'production',
    label: 'Production',
    icon: Factory,
    expandable: true,
    children: PRODUCTION_CHILDREN,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileBarChart,
    expandable: true,
    children: REPORTS_CHILDREN,
  },
  {
    id: 'masters',
    label: 'Masters',
    icon: Boxes,
    expandable: true,
    children: MASTERS_CHILDREN,
    moreChildren: MASTERS_MORE,
  },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const PRODUCTION_IDS = PRODUCTION_CHILDREN.map((c) => c.id)
const REPORTS_IDS = REPORTS_CHILDREN.map((c) => c.id)
const MASTERS_IDS = [
  ...MASTERS_CHILDREN.map((c) => c.id),
  ...MASTERS_MORE.map((c) => c.id),
]

interface InventorySidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
  activeItem: string
}

export function InventorySidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  activeItem,
}: InventorySidebarProps) {
  const navigate = useNavigate()
  const [consumptionMore, setConsumptionMore] = useState(() =>
    CONSUMPTION_MORE.some((item) => item.id === activeItem),
  )
  const [mastersMore, setMastersMore] = useState(() =>
    MASTERS_MORE.some((item) => item.id === activeItem),
  )
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const purchaseChildIds = [
      'stock-purchase',
      'purchase-order',
      'purchase-return',
    ]
    const manageStockChildIds = ['available-stock', 'closing-stock']
    return {
      purchase: purchaseChildIds.includes(activeItem),
      'manage-stock': manageStockChildIds.includes(activeItem),
      production: PRODUCTION_IDS.includes(activeItem),
      reports: REPORTS_IDS.includes(activeItem),
      masters: MASTERS_IDS.includes(activeItem),
    }
  })

  useEffect(() => {
    const purchaseChildIds = [
      'stock-purchase',
      'purchase-order',
      'purchase-return',
    ]
    const manageStockChildIds = ['available-stock', 'closing-stock']
    setExpanded((prev) => ({
      ...prev,
      ...(purchaseChildIds.includes(activeItem) ? { purchase: true } : {}),
      ...(manageStockChildIds.includes(activeItem)
        ? { 'manage-stock': true }
        : {}),
      ...(PRODUCTION_IDS.includes(activeItem) ? { production: true } : {}),
      ...(REPORTS_IDS.includes(activeItem) ? { reports: true } : {}),
      ...(MASTERS_IDS.includes(activeItem) ? { masters: true } : {}),
    }))
  }, [activeItem])

  useEffect(() => {
    if (CONSUMPTION_MORE.some((item) => item.id === activeItem)) {
      setConsumptionMore(true)
    }
    if (MASTERS_MORE.some((item) => item.id === activeItem)) {
      setMastersMore(true)
    }
  }, [activeItem])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onCloseMobile])

  function go(id: string) {
    onCloseMobile()
    const path = INVENTORY_ROUTES[id]
    if (path) navigate(path)
  }

  function renderLeaf(item: NavLeaf, indented = false) {
    const Icon = item.icon
    const active = activeItem === item.id
    return (
      <li key={item.id}>
        <button
          type="button"
          title={collapsed ? item.label : undefined}
          aria-current={active ? 'page' : undefined}
          onClick={() => go(item.id)}
          className={`relative flex w-full items-center gap-2.5 text-sm transition-colors ${
            collapsed
              ? 'justify-center px-0 py-2.5'
              : indented
                ? 'px-4 py-2 pl-11 text-left'
                : 'px-4 py-2.5 text-left'
          } ${
            active
              ? 'bg-primary/10 font-semibold text-primary before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r before:bg-primary'
              : item.id === 'back-billing'
                ? 'font-medium text-ink hover:bg-page'
                : 'text-ink hover:bg-page'
          }`}
        >
          {Icon ? (
            <Icon
              size={18}
              strokeWidth={active ? 2.2 : 1.75}
              className={`shrink-0 ${active ? 'text-primary' : 'text-muted'}`}
            />
          ) : null}
          {!collapsed && <span className="truncate">{item.label}</span>}
        </button>
      </li>
    )
  }

  function renderBranch(item: NavBranch) {
    const Icon = item.icon
    const childList =
      item.id === 'masters'
        ? [
            ...(item.children ?? []),
            ...(mastersMore ? (item.moreChildren ?? []) : []),
          ]
        : (item.children ?? [])
    const childActive = [
      ...(item.children ?? []),
      ...(item.moreChildren ?? []),
    ].some((c) => c.id === activeItem)
    const active = activeItem === item.id || Boolean(childActive)
    const isOpen = Boolean(expanded[item.id])
    return (
      <li key={item.id}>
        <button
          type="button"
          title={collapsed ? item.label : undefined}
          aria-expanded={item.expandable ? isOpen : undefined}
          onClick={() => {
            if (item.expandable && !collapsed) {
              setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
              return
            }
            if (childList[0]) {
              go(childList[0].id)
              return
            }
            go(item.id)
          }}
          className={`relative flex w-full items-center gap-2.5 text-sm transition-colors ${
            collapsed
              ? 'justify-center px-0 py-2.5'
              : 'px-4 py-2.5 text-left'
          } ${
            active && !childActive
              ? 'bg-primary/10 font-semibold text-primary before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r before:bg-primary'
              : active && childActive
                ? 'font-semibold text-ink'
                : 'text-ink hover:bg-page'
          }`}
        >
          <Icon
            size={18}
            strokeWidth={active ? 2.2 : 1.75}
            className={`shrink-0 ${active ? 'text-primary' : 'text-muted'}`}
          />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
                {item.id === 'settings' ? (
                  <span className="mt-0.5 block text-[10px] font-normal text-muted">
                    (RestId - 133856)
                  </span>
                ) : null}
              </span>
              {item.expandable ? (
                isOpen ? (
                  <ChevronDown size={14} className="shrink-0 text-muted" />
                ) : (
                  <ChevronRight size={14} className="shrink-0 text-muted" />
                )
              ) : null}
            </>
          )}
        </button>
        {!collapsed && item.children && isOpen ? (
          <ul className="space-y-0.5">
            {childList.map((c) => renderLeaf(c, true))}
            {item.id === 'masters' ? (
              <li>
                <button
                  type="button"
                  onClick={() => setMastersMore((prev) => !prev)}
                  className="w-full px-4 py-2 pl-11 text-left text-sm font-medium text-primary hover:bg-page"
                >
                  {mastersMore ? 'View Less' : 'View More'}
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
      </li>
    )
  }

  const widthClass = collapsed ? 'lg:w-[76px]' : 'lg:w-[264px]'

  return (
    <>
      {mobileOpen ? (
        <div
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-card transition-all duration-300 lg:z-30 lg:translate-x-0 ${widthClass} w-[264px] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-2.5 px-3">
          {collapsed ? (
            <div className="flex w-full justify-center">
              <BrandLogo size={36} />
            </div>
          ) : (
            <>
              <BrandLogo size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold leading-tight text-ink">
                  {brand.shortName}
                </p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-primary">
                  POS
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-muted hover:bg-page lg:hidden"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>

        <div
          className={`hidden lg:flex ${collapsed ? 'justify-center' : 'justify-end'}`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="m-1.5 rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          <ul className="space-y-0.5">
            {TOP_NAV.map((item) =>
              item.id === 'back-billing' || item.id === 'dashboard'
                ? renderLeaf(item)
                : renderBranch(item),
            )}
          </ul>

          <div className="my-2 border-t border-line" />
          {!collapsed ? (
            <p className="mb-1 mt-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Consumption
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {CONSUMPTION.map((item) => renderLeaf(item))}
            {consumptionMore
              ? CONSUMPTION_MORE.map((item) => renderLeaf(item))
              : null}
            {!collapsed ? (
              <li>
                <button
                  type="button"
                  onClick={() => setConsumptionMore((prev) => !prev)}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-primary hover:bg-page"
                >
                  {consumptionMore ? 'View Less' : 'View More'}
                </button>
              </li>
            ) : null}
          </ul>

          <div className="my-2 border-t border-line" />
          <ul className="space-y-0.5">
            {BOTTOM_NAV.map((item, index) => {
              const showDividerAfter =
                item.id === 'production' ||
                item.id === 'reports' ||
                item.id === 'masters'
              return (
                <Fragment key={item.id}>
                  {renderBranch(item)}
                  {showDividerAfter && BOTTOM_NAV[index + 1] ? (
                    <li
                      aria-hidden="true"
                      className="my-2 list-none border-t border-line"
                    />
                  ) : null}
                </Fragment>
              )
            })}
          </ul>
        </nav>

        {!collapsed ? (
          <div className="m-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <Phone size={14} className="text-primary" />
              Need Assistance?
            </div>
            <button
              type="button"
              className="h-8 w-full rounded-lg border border-primary bg-card text-xs font-semibold text-primary hover:bg-primary/5"
            >
              Request a Callback
            </button>
          </div>
        ) : (
          <div className="flex justify-center p-2">
            <button
              type="button"
              title="Need Assistance?"
              className="rounded-lg p-2 text-primary hover:bg-primary/10"
            >
              <Phone size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
