import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

export type MenuSectionTab =
  | 'items'
  | 'categories'
  | 'variants'
  | 'addons'
  | 'tables'
  | 'taxes'
  | 'discounts'

const TABS: { id: MenuSectionTab; label: string; chevron?: boolean }[] = [
  { id: 'items', label: 'Items', chevron: true },
  { id: 'categories', label: 'Categories' },
  { id: 'variants', label: 'Variants' },
  { id: 'addons', label: 'Addons' },
  { id: 'tables', label: 'Tables/Areas' },
  { id: 'taxes', label: 'Taxes' },
  { id: 'discounts', label: 'Discounts' },
]

const ITEM_OPTIONS = [
  { id: 'base-menu', label: 'Base Menu' },
  { id: 'home-delivery', label: 'Home Delivery' },
  { id: 'parcel', label: 'Parcel' },
  { id: 'dine-in', label: 'Dine In' },
  { id: 'zomato', label: 'Zomato' },
  { id: 'swiggy', label: 'Swiggy' },
] as const

const TAB_ROUTES: Partial<Record<MenuSectionTab, string>> = {
  items: '/menu/all-in-one',
  categories: '/menu/categories',
  variants: '/menu/variants',
  addons: '/menu/addons',
  tables: '/menu/tables',
  taxes: '/menu/taxes',
  discounts: '/menu/discounts',
}

interface MenuSectionNavProps {
  activeTab: MenuSectionTab
}

export function MenuSectionNav({ activeTab }: MenuSectionNavProps) {
  const navigate = useNavigate()
  const [itemsOpen, setItemsOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const itemsBtnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!itemsOpen) return

    const updatePosition = () => {
      const btn = itemsBtnRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 2, left: rect.left })
    }

    updatePosition()

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        itemsBtnRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setItemsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setItemsOpen(false)
    }

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [itemsOpen])

  function handleTabClick(tabId: MenuSectionTab) {
    if (tabId === 'items') {
      setItemsOpen((open) => !open)
      return
    }
    setItemsOpen(false)
    const path = TAB_ROUTES[tabId]
    if (path) navigate(path)
  }

  function handleItemSelect(id: string) {
    setItemsOpen(false)
    const paths: Record<string, string> = {
      'base-menu': '/menu/base-menu',
      'home-delivery': '/menu/home-delivery',
      parcel: '/menu/parcel',
      'dine-in': '/menu/dine-in',
      zomato: '/menu/zomato',
      swiggy: '/menu/swiggy',
    }
    navigate(paths[id] ?? '/menu/all-in-one')
  }

  return (
    <>
      <div className="relative z-20 mb-4 rounded-lg border border-line bg-primary/5">
        <div
          role="tablist"
          aria-label="Menu sections"
          className="flex w-full flex-wrap items-center justify-between gap-y-1 px-2 py-1 sm:px-4"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            const isItems = tab.id === 'items'

            if (isItems) {
              return (
                <button
                  key={tab.id}
                  ref={itemsBtnRef}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-expanded={itemsOpen}
                  aria-haspopup="menu"
                  onClick={() => handleTabClick('items')}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border border-primary bg-card text-ink shadow-sm'
                      : 'text-ink hover:bg-card/50'
                  }`}
                >
                  Items
                  <ChevronDown
                    size={14}
                    className={`text-muted transition-transform duration-200 ${
                      itemsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )
            }

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTabClick(tab.id)}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border border-primary bg-card text-ink shadow-sm'
                    : 'text-ink hover:bg-card/50'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {itemsOpen
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label="Items channels"
              style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed z-[100] min-w-[160px] rounded-lg border border-line bg-card py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              {ITEM_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleItemSelect(option.id)}
                  className="flex w-full cursor-pointer px-4 py-2 text-left text-sm text-ink transition-colors hover:bg-page"
                >
                  {option.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
