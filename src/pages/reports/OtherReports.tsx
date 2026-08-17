import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgePercent,
  Boxes,
  CalendarDays,
  FolderOpen,
  GitBranch,
  List,
  Pencil,
  Search,
  Star,
  UtensilsCrossed,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  REPORT_CATEGORIES,
  RESTAURANT_REPORTS,
  type ReportCategoryId,
  type RestaurantReportItem,
} from '../../mocks/restaurantReportsData'

const REPORT_ROUTES: Record<string, string> = {
  'all-restaurant-sales': '/reports/other-reports/all-restaurant-sales',
  'outlet-item-wise-row': '/reports/other-reports/outlet-item-wise',
  'outlet-item-wise-column': '/reports/other-reports/outlet-item-wise',
  'invoice-report': '/reports/other-reports/invoice-report',
  'pax-sales-report': '/reports/other-reports/pax-sales-report',
  'order-master': '/reports/other-reports/order-sub-order-wise',
  'order-sub-order-wise': '/reports/other-reports/order-sub-order-wise',
  'all-restaurant-day-wise': '/reports/other-reports/all-restaurant-day-wise',
  'order-summary-corporate': '/reports/other-reports/order-summary-corporate',
  'cancelled-orders': '/reports/other-reports/cancel-order-report',
  'modified-orders': '/reports/other-reports/cancel-order-report',
  'locality-wise': '/reports/other-reports/locality-wise',
  'item-invoice-details': '/reports/other-reports/item-invoice-details',
  'item-wise-sales': '/reports/other-reports/item-wise-all-restaurants',
  'item-wise-brand': '/reports/other-reports/item-wise-brand',
  'item-wise-tax': '/reports/other-reports/item-invoice-details',
  'employee-item-summary': '/reports/other-reports/pax-sales-report',
  'category-sales': '/reports/other-reports/outlet-item-wise',
  'parent-category-sales': '/reports/other-reports/outlet-item-wise',
  'customer-sales-summary': '/reports/other-reports/order-summary-corporate',
  'new-vs-repeat': '/reports/other-reports/order-summary-corporate',
  'online-orders-summary': '/reports/other-reports/online-order-report',
  'discounted-orders': '/reports/other-reports/discounted-orders',
  'discount-summary': '/reports/other-reports/discounted-orders',
  'cash-drawer': '/reports/other-reports/invoice-report',
  'tag-wise-report': '/reports/other-reports/tag-wise',
  'tax-summary': '/reports/other-reports/invoice-report',
  'tip-summary': '/reports/other-reports/pax-sales-report',
  'advance-orders-summary': '/reports/other-reports/advance-orders-summary',
  'cover-size-summary': '/reports/cover-size-summary',
}

const CATEGORY_ICONS: Record<ReportCategoryId, LucideIcon> = {
  favourite: Star,
  'all-restaurant': UtensilsCrossed,
  order: CalendarDays,
  item: Boxes,
  category: GitBranch,
  customer: UserRound,
  discount: BadgePercent,
  others: List,
}

const CONTENT_CATEGORIES = REPORT_CATEGORIES.filter(
  (category) => category.id !== 'favourite',
)

function ReportCard({
  report,
  favourite,
  onToggleFavourite,
  onViewDetails,
}: {
  report: RestaurantReportItem
  favourite: boolean
  onToggleFavourite: () => void
  onViewDetails: () => void
}) {
  return (
    <article
      onClick={onViewDetails}
      className="group flex h-full cursor-pointer flex-col rounded-xl border border-line bg-card p-4 transition-all hover:border-primary/50 hover:bg-page/60 hover:shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink group-hover:text-primary">
          {report.title}
        </h3>
        <button
          type="button"
          title={favourite ? 'Remove from favourite' : 'Add to favourite'}
          aria-label={
            favourite
              ? `Remove ${report.title} from favourite`
              : `Add ${report.title} to favourite`
          }
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavourite()
          }}
          className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-page hover:text-secondary"
        >
          <Star
            size={16}
            className={
              favourite ? 'fill-secondary text-secondary' : 'text-muted'
            }
            strokeWidth={favourite ? 0 : 1.75}
          />
        </button>
      </div>
      <p className="flex-1 text-xs leading-relaxed text-muted">
        {report.description}
      </p>
      <div className="mt-3 flex justify-end border-t border-line pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails()
          }}
          className="inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          View details →
        </button>
      </div>
    </article>
  )
}

function FavouriteEmptyState() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-page/40 px-6 py-10 text-center">
      <span className="relative mb-3 text-muted">
        <FolderOpen size={52} strokeWidth={1.25} className="text-muted/45" />
        <Star
          size={18}
          className="absolute -right-1 bottom-0 fill-secondary text-secondary"
        />
      </span>
      <p className="max-w-md text-sm font-medium text-ink">
        There Are No Favorite Report. Add Reports to Favorite by selecting the
        star mark.
      </p>
    </div>
  )
}

export default function OtherReports() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] =
    useState<ReportCategoryId>('favourite')
  const [search, setSearch] = useState('')
  const [favourites, setFavourites] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<string | null>(null)
  const sectionRefs = useRef<Partial<Record<ReportCategoryId, HTMLElement | null>>>(
    {},
  )
  const listRef = useRef<HTMLDivElement>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function openReport(report: RestaurantReportItem) {
    const route = REPORT_ROUTES[report.id]
    if (route) {
      navigate(route)
      return
    }
    showToast(`Opening ${report.title}`)
  }

  const query = search.trim().toLowerCase()

  const favouriteReports = useMemo(
    () => RESTAURANT_REPORTS.filter((report) => favourites[report.id]),
    [favourites],
  )

  const sections = useMemo(() => {
    const matches = (report: RestaurantReportItem) =>
      !query ||
      report.title.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query)

    return {
      favourite: favouriteReports.filter(matches),
      ...Object.fromEntries(
        CONTENT_CATEGORIES.map((category) => [
          category.id,
          RESTAURANT_REPORTS.filter(
            (report) => report.categoryId === category.id && matches(report),
          ),
        ]),
      ),
    } as Record<ReportCategoryId, RestaurantReportItem[]>
  }, [favouriteReports, query])

  function scrollToCategory(id: ReportCategoryId) {
    setActiveCategory(id)
    const node = sectionRefs.current[id]
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    const root = listRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const id = visible?.target.getAttribute('data-category-id') as
          | ReportCategoryId
          | null
        if (id) setActiveCategory(id)
      },
      { root, rootMargin: '-10% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] },
    )

    REPORT_CATEGORIES.forEach((category) => {
      const node = sectionRefs.current[category.id]
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [])

  function toggleFavourite(report: RestaurantReportItem) {
    setFavourites((prev) => {
      const next = !prev[report.id]
      showToast(
        next
          ? `Added “${report.title}” to favourite`
          : `Removed “${report.title}” from favourite`,
      )
      return { ...prev, [report.id]: next }
    })
  }

  return (
    <ReportsPageShell title="Reports" activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex min-h-[calc(100vh-9rem)] overflow-hidden rounded-xl border border-line bg-card">
        <aside className="hidden w-[240px] shrink-0 border-r border-line bg-page/30 md:block">
          <nav className="sticky top-0 max-h-[calc(100vh-9rem)] space-y-0.5 overflow-y-auto p-2">
            {REPORT_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category.id]
              const active = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => scrollToCategory(category.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-ink hover:bg-page'
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.2 : 1.75}
                    className={active ? 'text-primary' : 'text-muted'}
                  />
                  <span className="min-w-0 flex-1 leading-snug">
                    {category.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-line p-3 sm:p-4">
            <label className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for reports here..."
                className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              />
            </label>
            <button
              type="button"
              title="Edit favourites"
              aria-label="Edit favourites"
              onClick={() => showToast('Edit mode coming soon')}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-primary transition-colors hover:bg-primary/5"
            >
              <Pencil size={16} />
            </button>
          </div>

          <div className="border-b border-line px-3 py-2 md:hidden">
            <div className="flex gap-1 overflow-x-auto">
              {REPORT_CATEGORIES.map((category) => {
                const active = activeCategory === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => scrollToCategory(category.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                      active
                        ? 'bg-primary text-white'
                        : 'bg-page text-muted hover:text-ink'
                    }`}
                  >
                    {category.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-8 overflow-y-auto p-4 sm:p-5"
          >
            {REPORT_CATEGORIES.map((category) => {
              const reports = sections[category.id] ?? []
              return (
                <section
                  key={category.id}
                  data-category-id={category.id}
                  ref={(node) => {
                    sectionRefs.current[category.id] = node
                  }}
                  className="scroll-mt-3"
                >
                  <div className="mb-3">
                    <h2 className="text-base font-bold text-ink">
                      {category.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted">
                      {category.description}
                    </p>
                  </div>

                  {category.id === 'favourite' && reports.length === 0 ? (
                    <FavouriteEmptyState />
                  ) : reports.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line bg-page/30 px-4 py-8 text-center text-sm text-muted">
                      No reports match your search in this section.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {reports.map((report) => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          favourite={Boolean(favourites[report.id])}
                          onToggleFavourite={() => toggleFavourite(report)}
                          onViewDetails={() => openReport(report)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
