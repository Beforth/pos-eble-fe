import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, Sparkles, X } from 'lucide-react'
import { brand } from '../../theme/brand'

/**
 * One entry per working day, newest first. Each day gets the next version
 * number, so the number (not a date) is what people quote: add a new entry on
 * top for each day's changes and raise `brand.appVersion` to match it.
 */
export interface ChangelogEntry {
  version: string
  title: string
  items: string[]
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: '1.0.13',
    title: 'Finished goods, goods categories and billing-to-inventory stock',
    items: [
      'Finished Goods: keep a menu item in stock, then record batches of it from the item recipe; each batch has its own batch number, an optional expiry date, and can be edited or deleted',
      'Goods Category on Item Recipes: Semi Finished Good, Finished Good, or No Finished Goods (On the go)',
      'Billing now updates inventory: sending a KOT takes stock off (On the go uses the recipe raw materials, Finished uses the item stock, Semi Finished uses stock first and the recipe for the rest), and cancelling or deleting the KOT gives it back',
      'Short stock never blocks a sale: the KOT goes through and a Low stock warning is shown',
      'Stock counts accept zero, only the current period can be counted, and a count locks once stock has moved again',
      'Menu item dropdown on Finished Goods loads lazily as you scroll and can add a new menu item through the full menu item page',
      'Purchase, Purchase Order and Purchase Return lists redesigned with summary cards and payment status badges',
      'Negative stock shows in red on Raw Materials and the Current Stock report',
      'Dashboard: the Online orders and Expenses & Withdrawals panels now show real figures for the chosen date range instead of sample numbers',
      'Notifications are real: the bell shows new online orders, cancelled online orders and bills, low and negative stock, and batches about to expire, with an unread count, Mark all read, and a click that opens the related page',
      'Fixes: Add new was hidden in unit dropdowns, and stock in a bigger unit (bags) now converts to the consumption unit correctly',
    ],
  },
  {
    version: '1.0.12',
    title: 'Outlet setup stored per outlet',
    items: [
      'Payment Information lists the real payments',
      'Area / Locality Wise Delivery Charges and Delivery Distance are saved per outlet',
      'Sub Order Types are saved per outlet, and orders are checked against them',
      'Online Orders Activity loads from the server and can look back up to 90 days',
      'Outlet View / Edit covers every Add Outlet field including timings, outlets can be deleted, and the Menu Management outlet list is live',
    ],
  },
  {
    version: '1.0.11',
    title: 'Billing follows your settings',
    items: [
      'Billing offers the payment methods set in Outlet Configuration > Payment',
      'Billing honours the Display settings: price, item images, search box, tap-to-select with Add, add-on limits and auto-add from the popup',
      'On-screen keyboard in the touch layout',
    ],
  },
  {
    version: '1.0.10',
    title: 'Variations, advance orders and KOT numbering',
    items: [
      'Variants screen lists single variations; an item can have its own price and terms for each variation, and add-ons can be set per variation',
      'An advance order can be opened in Billing and settled',
      'Cancelling an order cancels its open kitchen tickets',
      'KOT numbers restart at Day End instead of midnight',
      'Split Bill prints one bill per share',
      'Counter summary report has the standard payment columns and Not Paid',
      'New command to give every item its default taxes',
    ],
  },
  {
    version: '1.0.9',
    title: 'Online order and menu import additions',
    items: [
      'Online orders: a Food Ready button tells the delivery partner the food is ready',
      'Menu sheet import gives each new item a short code (01, 02, ...) in the order of the sheet',
    ],
  },
  {
    version: '1.0.8',
    title: 'Cancelling an order asks why',
    items: [
      'Cancelling a bill from All Orders now asks for a reason, which is saved with who cancelled it and printed on the cancellation',
    ],
  },
  {
    version: '1.0.7',
    title: 'Many new reports and billing outlet settings',
    items: [
      'New reports: Group, Variation, Cover Size, Tip Summary, Employee, Counter, Captain Wise, Locality Wise, Settlement, NC Item and Assignee Wise summaries; Category Wise now has Orders, Items, Net Amount, Discount, Tax, Total Sales and Percentage',
      'Tips are saved with the bill (on top of the bill amount) and feed the Tip Summary',
      'Open or close your store at Swiggy and Zomato from the POS',
      'Billers land on the Billing screen after login',
      'Billing has its own Outlet Settings and its own inventory pages',
    ],
  },
  {
    version: '1.0.6',
    title: 'Printers, expenses, withdrawals and currency rates',
    items: [
      'Printers are saved once and shared across all devices',
      'Custom order statuses can be set up for the outlet',
      'Expenses and Withdrawals are recorded and listed with daily totals',
      'Currency rates can be saved for the outlet',
      'Fix: opening, editing or deleting a tax gave an error',
    ],
  },
  {
    version: '1.0.5',
    title: 'Live Orders, All Orders and KOT numbers',
    items: [
      'Live Orders: the Running Tables tab is back and lists the occupied tables',
      'All Orders has more filters and shows each order\'s table',
      'KOT numbers restart at 1 every day, and a KOT shows the number of the bill it belongs to',
    ],
  },
  {
    version: '1.0.4',
    title: 'Reports, menu import and variations in billing',
    items: [
      'Billing sidebar has 12 Reports',
      'Excel menu import keeps the sheet order, fills Online Display Name and treats "N/A" in a channel price column as not on that channel; Short Code 2, descriptions, SAP/FSN codes and Item Unit are no longer required, and the import closes by itself with the menu updating without a refresh',
      'Items can have a menu Category group; sheet prices follow what the sheet shows',
      'Live Orders cards are a uniform size with scrolling item lists, in plain words, and one page body for all three screens',
      'V+ and A tags on an item are clickable, and add-ons get a price per menu',
      'Billing and Captain Orders ask for the variation and add-ons when you add an item',
    ],
  },
  {
    version: '1.0.3',
    title: 'Online order acceptance and menu fixes',
    items: [
      'Accept Online Orders page with accept / reject, and a quiet counter instead of a pop-up; Accept Orders moved to the left sidebar',
      'Online orders appear on the billing Online Orders page instantly, without a page refresh',
      'Cancelling a KOT in Billing or Captain Orders now really cancels it',
      'Saving an item is all-or-nothing, a category can be deleted when it has no items, and Add Item no longer stays on "Loading menu data" when an outlet has no categories',
      'The Display preference for the Menu (On the Left / On the Right) now takes effect',
      'Outlet documents are private with a login-protected download, and a saved image shows in the preview instead of asking for a download',
      'Fixes: Wera error and a clearer reason when a live connection is refused',
    ],
  },
  {
    version: '1.0.2',
    title: 'Wera webhooks and pushing the menu to Swiggy and Zomato',
    items: [
      'Wera webhooks for place order, cancel order, auto-accept and delivery agent',
      'Swiggy and Zomato menu push with preview, push and request tracking, plus a Push button on the channel menu pages',
      'Add / Edit Addon Group screens rebuilt with group rules and an add-on table',
      'Toasts appear at the top right, just below the header',
    ],
  },
  {
    version: '1.0.1',
    title: 'Billing counter, KOT and Live Orders improvements',
    items: [
      'Billing: Dine In / Parcel order types, Split and Advance Order buttons, and a redesigned payment method bar',
      'Advance Order: book the current bill for a chosen date and time with an advance payment and customer note',
      'Save & eBill sends the KOT to the kitchen, prints the KOT slip and empties the cart; ticking Its Paid marks the bill as paid',
      'Customer name and mobile are optional; the Final Bill name popup is removed and details clear after each order',
      'Short code search now looks across the whole menu; item cards redesigned so full item names are visible',
      'KOT view: order note shown above the items, long item lists scroll inside the card, and New Order works from the KOT view',
      'Live Orders works like a restaurant POS: Running shows unpaid orders, kitchen tickets sit on the kitchen board, and Day End resets the boards',
      'Day End, the daily chart and date filters use the outlet\'s own day, and a Day End Excel report is available',
      'Favorite Items: a heart on every menu card, with best sellers filling the rail automatically',
      'A due taken from the KOT view reaches Due Payment Settlement and needs a 10-digit mobile number; paid tickets no longer show an amount in Billing',
      'Wera Foods integration started',
    ],
  },
  {
    version: '1.0.0',
    title: 'Initial release',
    items: [
      'Dashboard with sales overview, channel chart, and order mix',
      'Billing, captain orders, KOT, and table view',
      'Online orders, live orders, and due payment settlement',
      'Menu, inventory, finance, and reports',
      'User management, configuration, and print settings',
      'Support agent, notifications, and edit profile',
    ],
  },
]

interface ChangelogModalProps {
  open: boolean
  onClose: () => void
}

export function ChangelogModal({ open, onClose }: ChangelogModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close changelog"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(86vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line bg-card px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={22} />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-bold leading-tight text-ink">
                What&apos;s new
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {brand.shortName} · Release notes
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              v{brand.appVersion}
            </span>
            <button
              type="button"
              aria-label="Close"
              data-tooltip="Close"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-page px-6 py-5">
          <ol className="relative space-y-5 border-l-2 border-line pl-6">
            {changelogEntries.map((entry, index) => (
              <li key={entry.version} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[33px] top-5 size-4 rounded-full border-2 border-page ${
                    index === 0 ? 'bg-primary' : 'bg-line'
                  }`}
                />
                <article className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">
                      v{entry.version}
                    </span>
                    {index === 0 ? (
                      <span className="rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-success">
                        Latest
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-ink">
                    {entry.title}
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {entry.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-ink"
                      >
                        <CircleCheck
                          size={16}
                          className="mt-0.5 shrink-0 text-success"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>,
    document.body,
  )
}
